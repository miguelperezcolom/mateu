package io.mateu.core.infra.idempotency;

import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
 * <p>Remembered in memory, per process: bounded (2000 entries by default, {@code
 * mateu.idempotency.max-entries}; least recently used first out) and for a bounded time (24 h by
 * default, {@code mateu.idempotency.ttl-seconds}). A run that FAILS is forgotten, so the key can be
 * sent again. A deployment of several instances needs the retries of one client to reach the same
 * instance (sticky sessions) for the guarantee to hold across instances.
 *
 * <p>The key is scoped to the CALLER (every grant of the identity the host framework authenticated,
 * hashed) and the action id, so one user's key never answers for another's request.
 */
@Slf4j
public final class IdempotencyKeys {

  /** The request header carrying the key (the IETF httpapi draft's name). */
  public static final String HEADER = "Idempotency-Key";

  static final int DEFAULT_MAX_ENTRIES = 2000;
  static final long DEFAULT_TTL_SECONDS = 24 * 60 * 60;

  /** What a key may look like: a UUID, or any opaque token of 8–128 url-safe characters. */
  private static final Pattern VALID = Pattern.compile("[A-Za-z0-9_\\-:.]{8,128}");

  private record Entry(Flux<UIIncrementDto> answer, long createdAt) {}

  private static final Map<String, Entry> ANSWERS =
      new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Entry> eldest) {
          return size() > maxEntries();
        }
      };

  private IdempotencyKeys() {}

  /**
   * Runs {@code run} unless this caller already sent the request's key for {@code actionId}, in
   * which case the first run's answer is replayed. Without a (valid) key, simply runs it.
   */
  public static Flux<UIIncrementDto> once(
      HttpRequest httpRequest, String actionId, Supplier<Flux<UIIncrementDto>> run) {
    var key = keyOf(httpRequest);
    if (key == null) {
      return run.get();
    }
    var scoped = scope(httpRequest, actionId, key);
    synchronized (ANSWERS) {
      var known = ANSWERS.get(scoped);
      if (known != null && System.currentTimeMillis() - known.createdAt() <= ttlMillis()) {
        log.info("Idempotency key replayed for action {}: answering with the first run", actionId);
        return known.answer();
      }
      // cache() makes every subscriber (the first one and any repeat) share ONE run; an answer
      // that failed or carries an error message (the error boundary's, a refusal) is forgotten
      Runnable forget =
          () -> {
            synchronized (ANSWERS) {
              ANSWERS.remove(scoped);
            }
          };
      var answer =
          Flux.defer(run)
              .collectList()
              .doOnSuccess(
                  increments -> {
                    if (refused(increments)) {
                      forget.run();
                    }
                  })
              .doOnError(failure -> forget.run())
              .cache()
              .flatMapMany(Flux::fromIterable);
      ANSWERS.put(scoped, new Entry(answer, System.currentTimeMillis()));
      return answer;
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
    var identity = IdentityResolver.resolve(httpRequest);
    var caller =
        String.join(
            "\u0001",
            String.valueOf(identity.name()),
            String.join(",", new TreeSet<>(identity.roles())),
            String.join(",", new TreeSet<>(identity.groups())),
            String.join(",", new TreeSet<>(identity.scopes())),
            String.join(",", new TreeSet<>(identity.permissions())));
    return sha256(caller + "\u0002" + actionId + "\u0002" + key);
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
    synchronized (ANSWERS) {
      ANSWERS.clear();
    }
  }
}
