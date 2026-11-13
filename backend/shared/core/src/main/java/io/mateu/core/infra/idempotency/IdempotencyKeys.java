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
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

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
 * grants changed is not served an answer remembered for the old ones. {@code RunActionUseCase}
 * consults it only AFTER the request-level checks (exposed type, YAML route/action access), so a
 * refused request is never answered from memory.
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
    final Flux<UIIncrementDto> answer;
    final long createdAt;

    Run(Flux<UIIncrementDto> answer, long createdAt) {
      this.answer = answer;
      this.createdAt = createdAt;
    }
  }

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
   * Runs {@code run} unless this caller already sent the request's key for {@code actionId}, in
   * which case the first run's answer is replayed (or, while it is still running, joined). Without
   * a (valid) key, simply runs it. Nothing is registered until the answer is subscribed to.
   */
  public static Flux<UIIncrementDto> once(
      HttpRequest httpRequest, String actionId, Supplier<Flux<UIIncrementDto>> run) {
    var key = keyOf(httpRequest);
    if (key == null) {
      return run.get();
    }
    var scoped = scope(httpRequest, actionId, key);
    return Flux.defer(() -> admit(scoped, actionId, run));
  }

  private static Flux<UIIncrementDto> admit(
      String scoped, String actionId, Supplier<Flux<UIIncrementDto>> run) {
    synchronized (LOCK) {
      var now = System.currentTimeMillis();
      var finished = FINISHED.get(scoped);
      if (finished != null) {
        if (now - finished.createdAt <= ttlMillis()) {
          log.info(
              "Idempotency key replayed for action {}: answering with the first run", actionId);
          return finished.answer;
        }
        FINISHED.remove(scoped, finished);
      }
      var running = IN_FLIGHT.get(scoped);
      if (running != null) {
        log.info("Idempotency key repeated for action {}: joining the run in flight", actionId);
        return running.answer;
      }
      if (IN_FLIGHT.size() >= maxEntries()) {
        log.warn(
            "Idempotency: {} keyed requests already in flight, refusing a new one for action {}",
            IN_FLIGHT.size(),
            actionId);
        return Flux.error(new UserFacingException(BUSY_TITLE, BUSY_MESSAGE));
      }
      var self = new Run[1];
      // cache() makes every subscriber (the first one and any repeat) share ONE run; an answer
      // that failed or carries an error message (the error boundary's, a refusal) is forgotten
      var answer =
          Flux.defer(run)
              .collectList()
              .doOnSuccess(increments -> settle(scoped, self[0], !refused(increments)))
              .doOnError(failure -> settle(scoped, self[0], false))
              .doOnCancel(() -> settle(scoped, self[0], false))
              .cache()
              .flatMapMany(Flux::fromIterable);
      self[0] = new Run(answer, now);
      IN_FLIGHT.put(scoped, self[0]);
      return answer;
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
    return sha256(
        caller(IdentityResolver.resolve(httpRequest)) + "\u0002" + actionId + "\u0002" + key);
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
