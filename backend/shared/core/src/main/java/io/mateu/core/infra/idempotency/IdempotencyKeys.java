package io.mateu.core.infra.idempotency;

import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

/**
 * The server half of the offline send queue: an action request carrying an {@value #HEADER} header
 * runs ONCE per caller, action and key; a repeat of the same key gets the first answer back.
 *
 * <p>The mobile app queues a write made without connection ({@code @Action(offline = QUEUE)}) and
 * sends it again when the connection is back. When the first attempt timed out, the app does not
 * know whether the server processed it, so it sends the SAME key again: this is what keeps that
 * second attempt from applying the change twice. A repeat arriving while the first run is still in
 * flight joins it rather than starting another.
 *
 * <p>Remembered in memory, per process — lost on a restart and never shared between instances (a
 * deployment of several instances needs the retries of one client to reach the same instance,
 * sticky sessions, for the guarantee to hold). Two separate tables:
 *
 * <ul>
 *   <li><b>in flight</b>: runs that have not finished. One is NEVER evicted — dropping it would let
 *       a retry of its key start a second run while the first is still working. When the table is
 *       full ({@code mateu.idempotency.max-entries}, 2000 by default) a NEW key is refused with a
 *       {@link UserFacingException} ({@value #BUSY_TITLE}): an error answer, which the client keeps
 *       queued and sends again later. A repeat of a key already in flight always joins its run.
 *   <li><b>finished</b>: the answers of completed runs, replayed to a repeat of the key; bounded
 *       (the same {@code mateu.idempotency.max-entries}; least recently used first out) and for a
 *       bounded time ({@code mateu.idempotency.ttl-seconds}, 24 h by default).
 * </ul>
 *
 * A run that FAILS, or answers with an error message, is forgotten, so the key can be sent again.
 * Entries are removed by identity, never by key alone: a run that ends late never deletes a newer
 * run of the same key.
 *
 * <p>The key is scoped to the CALLER — the complete identity {@link IdentityResolver} resolves, the
 * one every access check reads (name, roles, groups, scopes, permissions; each sorted; hashed) —
 * and the action id, so one user's key never answers for another's request, and a caller whose
 * grants changed is not served an answer remembered for the old ones. The key is looked up only at
 * a {@link #checkpoint}, where the action is about to run after every check it is subject to (see
 * {@link #guarded}), so a request refused by any rule is never answered from memory.
 */
@Slf4j
public final class IdempotencyKeys {

  /** The request header carrying the key (the IETF httpapi draft's name). */
  public static final String HEADER = "Idempotency-Key";

  /** Title of the refusal when too many keyed requests are in flight. */
  public static final String BUSY_TITLE = "Too many pending requests";

  /** Text of the refusal when too many keyed requests are in flight. */
  public static final String BUSY_MESSAGE =
      "The server is still processing too many requests. Try again in a moment.";

  static final int DEFAULT_MAX_ENTRIES = 2000;
  static final long DEFAULT_TTL_SECONDS = 24 * 60 * 60;

  /** What a key may look like: a UUID, or any opaque token of 8–128 url-safe characters. */
  private static final Pattern VALID = Pattern.compile("[A-Za-z0-9_\\-:.]{8,128}");

  /** One run of a key. Compared by identity: a late completion only ever touches its own. */
  private static final class Run {
    final Mono<List<UIIncrementDto>> answer;
    final long createdAt;

    Run(Mono<List<UIIncrementDto>> answer, long createdAt) {
      this.answer = answer;
      this.createdAt = createdAt;
    }
  }

  /**
   * A keyed request going through the handler: not claimed until the handler reaches a {@link
   * #checkpoint}, i.e. until the request passed the checks its action would pass.
   */
  private static final class Pending {
    final String scoped;
    final String actionId;
    boolean claimed;
    Run mine;
    Sinks.One<List<UIIncrementDto>> sink;

    Pending(String scoped, String actionId) {
      this.scoped = scoped;
      this.actionId = actionId;
    }

    /** The claimed run ended: settled (only if still its own), then handed to its joiners. */
    void finish(List<UIIncrementDto> increments, Throwable failure) {
      Run run;
      Sinks.One<List<UIIncrementDto>> out;
      synchronized (LOCK) {
        run = mine;
        out = sink;
        mine = null;
        sink = null;
      }
      if (run == null) {
        return;
      }
      settle(scoped, run, failure == null && !refused(increments));
      if (failure != null) {
        out.tryEmitError(failure);
      } else {
        out.tryEmitValue(increments);
      }
    }
  }

  /**
   * Unwinds the handler to {@link #guarded}, which answers with the remembered run. Carried as an
   * error so it crosses every layer between the checkpoint and the endpoint; {@link #find} spots it
   * however wrapped, and the error boundaries on the way let it through.
   */
  public static final class Replay extends RuntimeException {
    private final transient Mono<List<UIIncrementDto>> answer;

    Replay(Mono<List<UIIncrementDto>> answer) {
      super("idempotency replay", null, false, false);
      this.answer = answer;
    }

    /** The replay carried by {@code error} or one of its causes; null when there is none. */
    public static Replay find(Throwable error) {
      for (var e = error; e != null; e = e.getCause() == e ? null : e.getCause()) {
        if (e instanceof Replay replay) {
          return replay;
        }
      }
      return null;
    }
  }

  private static final String PENDING = "mateu.idempotency.pending";

  private static final Object LOCK = new Object();

  /** Runs that have not finished: never evicted, admission bounded. */
  private static final Map<String, Run> IN_FLIGHT = new HashMap<>();

  /** Answers of finished runs: LRU + TTL. */
  private static final Map<String, Run> FINISHED =
      new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Run> eldest) {
          return size() > maxEntries();
        }
      };

  private IdempotencyKeys() {}

  /**
   * Runs {@code run} (the request's handling) with the request's key PENDING: it is looked up only
   * when the handling reaches a {@link #checkpoint} — right where the action is about to run, after
   * every check it is subject to (the strict / advertised-action check, {@code @EyesOnly} / {@code
   * DisabledUnless}, the CRUD write gates, an editable view's read-only gate, the capability
   * gates). A request refused before that is never answered from memory, whatever rule refused it;
   * one that passed them and repeats a known key gets the first answer back (joining it while in
   * flight); a request that never reaches a checkpoint (a load, a search) simply runs. Without a
   * (valid) key, simply runs it. Nothing is registered until the answer is subscribed to.
   */
  public static Flux<UIIncrementDto> guarded(
      HttpRequest httpRequest, String actionId, Supplier<Flux<UIIncrementDto>> run) {
    var key = keyOf(httpRequest);
    if (key == null) {
      return run.get();
    }
    var scoped = scope(httpRequest, actionId, key);
    return Flux.defer(
        () -> {
          var pending = new Pending(scoped, actionId);
          try {
            httpRequest.setAttribute(PENDING, pending);
          } catch (RuntimeException noAttributes) {
            return run.get();
          }
          return Flux.defer(run)
              .collectList()
              .doOnSuccess(increments -> pending.finish(increments, null))
              .doOnError(
                  failure -> {
                    if (Replay.find(failure) == null) {
                      pending.finish(null, failure);
                    }
                  })
              .doOnCancel(
                  () ->
                      pending.finish(
                          null, new java.util.concurrent.CancellationException("cancelled")))
              // a known key: the run stopped at its checkpoint — answer with the remembered one
              .onErrorResume(
                  failure -> {
                    var replay = Replay.find(failure);
                    return replay != null ? replay.answer : Mono.error(failure);
                  })
              .doFinally(signal -> forget(httpRequest, pending))
              .flatMapMany(Flux::fromIterable);
        });
  }

  /**
   * As {@link #guarded}, claiming the key at once: for a caller whose checks all ran before {@code
   * run} is called.
   */
  public static Flux<UIIncrementDto> once(
      HttpRequest httpRequest, String actionId, Supplier<Flux<UIIncrementDto>> run) {
    return guarded(
        httpRequest,
        actionId,
        () -> {
          checkpoint(httpRequest);
          return run.get();
        });
  }

  /**
   * The request passed its checks and its action is about to run: claims the request's pending key.
   * Returns when the key is new (the action runs, its answer is remembered); throws a {@link
   * Replay} — answered by {@link #guarded} with the remembered run — when the key is known; throws
   * the admission refusal ({@value #BUSY_TITLE}) when too many keyed runs are in flight. A no-op
   * without a pending key, or once claimed.
   */
  public static void checkpoint(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return;
    }
    Object attribute;
    try {
      attribute = httpRequest.getAttribute(PENDING);
    } catch (RuntimeException noAttributes) {
      return;
    }
    if (!(attribute instanceof Pending pending)) {
      return;
    }
    synchronized (LOCK) {
      if (pending.claimed) {
        return;
      }
      pending.claimed = true;
      var now = System.currentTimeMillis();
      var finished = FINISHED.get(pending.scoped);
      if (finished != null) {
        if (now - finished.createdAt <= ttlMillis()) {
          log.info(
              "Idempotency key replayed for action {}: answering with the first run",
              pending.actionId);
          throw new Replay(finished.answer);
        }
        FINISHED.remove(pending.scoped, finished);
      }
      var running = IN_FLIGHT.get(pending.scoped);
      if (running != null) {
        log.info(
            "Idempotency key repeated for action {}: joining the run in flight", pending.actionId);
        throw new Replay(running.answer);
      }
      if (IN_FLIGHT.size() >= maxEntries()) {
        log.warn(
            "Idempotency: {} keyed requests already in flight, refusing a new one for action {}",
            IN_FLIGHT.size(),
            pending.actionId);
        throw new UserFacingException(BUSY_TITLE, BUSY_MESSAGE);
      }
      // a sink replays its one value (or error) to every joiner, late ones included
      pending.sink = Sinks.one();
      pending.mine = new Run(pending.sink.asMono(), now);
      IN_FLIGHT.put(pending.scoped, pending.mine);
    }
  }

  private static void forget(HttpRequest httpRequest, Pending pending) {
    try {
      if (httpRequest.getAttribute(PENDING) == pending) {
        httpRequest.setAttribute(PENDING, null);
      }
    } catch (RuntimeException ignored) {
      // a request with no attribute storage
    }
  }

  /**
   * A run ended: out of the in-flight table (only if still its own), its answer kept if worth it.
   */
  private static void settle(String scoped, Run run, boolean remember) {
    if (run == null) {
      return;
    }
    synchronized (LOCK) {
      if (!IN_FLIGHT.remove(scoped, run)) {
        return;
      }
      if (remember) {
        FINISHED.put(scoped, new Run(run.answer, System.currentTimeMillis()));
      }
    }
  }

  /** How many keyed runs are in flight (tests). */
  static int inFlight() {
    synchronized (LOCK) {
      return IN_FLIGHT.size();
    }
  }

  /** Whether an answer refused the request: nothing to remember, the client may send it again. */
  static boolean refused(java.util.List<UIIncrementDto> increments) {
    if (increments == null) {
      return false;
    }
    return increments.stream()
        .filter(java.util.Objects::nonNull)
        .flatMap(increment -> increment.messages().stream())
        .anyMatch(message -> message != null && message.variant() == NotificationVariantDto.error);
  }

  /** The request's key, or null when it sent none or one that does not look like a key. */
  static String keyOf(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    String value;
    try {
      value = httpRequest.getHeaderValue(HEADER);
    } catch (RuntimeException noHeaders) {
      return null;
    }
    if (value == null || value.isBlank()) {
      return null;
    }
    var trimmed = value.trim();
    if (!VALID.matcher(trimmed).matches()) {
      log.warn("Ignoring a malformed {} header (8-128 url-safe characters expected)", HEADER);
      return null;
    }
    return trimmed;
  }

  private static String scope(HttpRequest httpRequest, String actionId, String key) {
    var rq = runActionRq(httpRequest);
    return sha256(
        caller(IdentityResolver.resolve(httpRequest))
            + "\u0002"
            + view(rq != null ? rq.serverSideType() : null, rq != null ? rq.route() : null)
            + "\u0002"
            + actionId
            + "\u0002"
            + key);
  }

  private static io.mateu.dtos.RunActionRqDto runActionRq(HttpRequest httpRequest) {
    try {
      return httpRequest.runActionRq();
    } catch (RuntimeException none) {
      return null;
    }
  }

  /**
   * The view a key belongs to, normalised the same way in the three backends: the request's server
   * side type (trimmed) and its route (trimmed, without leading or trailing slashes) — the same
   * caller, key and action id on another view is another entry.
   */
  static String view(String serverSideType, String route) {
    var type = serverSideType == null ? "" : serverSideType.trim();
    var path = route == null ? "" : route.trim().replaceAll("^/+|/+$", "");
    return "type=" + type + "\u0001route=" + path;
  }

  /**
   * The caller's identity, canonical and complete: every dimension an access check may read, each
   * list sorted, so the same grants always give the same text and any change of grants another.
   */
  static String caller(CallerIdentity identity) {
    return String.join(
        "\u0001",
        "name=" + (identity.name() == null ? "" : identity.name()),
        "roles=" + sorted(identity.roles()),
        "groups=" + sorted(identity.groups()),
        "scopes=" + sorted(identity.scopes()),
        "permissions=" + sorted(identity.permissions()));
  }

  private static String sorted(Collection<String> values) {
    var set = new TreeSet<String>();
    if (values != null) {
      values.stream().filter(java.util.Objects::nonNull).forEach(set::add);
    }
    return String.join("\u0003", set);
  }

  private static String sha256(String text) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      return Integer.toHexString(text.hashCode());
    }
  }

  private static int maxEntries() {
    return (int) number("mateu.idempotency.max-entries", DEFAULT_MAX_ENTRIES);
  }

  private static long ttlMillis() {
    return number("mateu.idempotency.ttl-seconds", DEFAULT_TTL_SECONDS) * 1000L;
  }

  private static long number(String key, long fallback) {
    var value = MateuSettings.get(key);
    if (value == null || value.isBlank()) {
      return fallback;
    }
    try {
      var parsed = Long.parseLong(value.trim());
      return parsed > 0 ? parsed : fallback;
    } catch (NumberFormatException e) {
      return fallback;
    }
  }

  /** Forgets every key (tests). */
  public static void clear() {
    synchronized (LOCK) {
      IN_FLIGHT.clear();
      FINISHED.clear();
    }
  }
}
