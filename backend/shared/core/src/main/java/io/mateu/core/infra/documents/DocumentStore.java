package io.mateu.core.infra.documents;

import io.mateu.uidl.data.Document;
import io.mateu.uidl.data.DocumentDisposition;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

/**
 * Where an action's {@link Document} waits until the browser fetches it from {@code
 * <baseUrl>/mateu/v3/documents/<token>} ({@link DocumentDownloads}).
 *
 * <p>The token is the capability: 256 random bits, minted only inside the response to an action the
 * user was allowed to run, valid ONCE and for a short time ({@value #DEFAULT_TTL_SECONDS}s unless
 * {@value #TTL_PROPERTY} says otherwise). That is why the endpoint needs no session: a plain {@code
 * <a href>} or a new tab cannot carry the bearer token the API calls carry.
 *
 * <p>Bounded: at most {@value #MAX_ENTRIES} documents and {@value #MAX_PARKED_BYTES} bytes of eager
 * content are kept; beyond that the OLDEST are dropped (their link answers 404). It is in memory
 * and per JVM — a deployment of several instances needs sticky sessions, or a shared store
 * installed with {@link #useShared(DocumentStore)}.
 */
public class DocumentStore {

  /** System property: seconds a parked document stays fetchable. */
  public static final String TTL_PROPERTY = "mateu.documents.ttl-seconds";

  /**
   * System property: documents up to this many bytes travel inline (base64) in the action response;
   * larger ones are parked here.
   */
  public static final String INLINE_MAX_PROPERTY = "mateu.documents.inline-max-bytes";

  public static final long DEFAULT_TTL_SECONDS = 300;
  public static final int DEFAULT_INLINE_MAX_BYTES = 256 * 1024;
  public static final int MAX_ENTRIES = 500;
  public static final long MAX_PARKED_BYTES = 256L * 1024 * 1024;

  private static final SecureRandom RANDOM = new SecureRandom();

  private static volatile DocumentStore shared =
      new DocumentStore(Duration.ofSeconds(longProperty(TTL_PROPERTY, DEFAULT_TTL_SECONDS)));

  /** A document waiting to be fetched. */
  public record Parked(
      String filename,
      String mediaType,
      DocumentDisposition disposition,
      Supplier<byte[]> content,
      long eagerBytes,
      Instant expiresAt) {}

  private final Duration ttl;
  private final Clock clock;
  private final Map<String, Parked> parked = new LinkedHashMap<>();
  private long parkedBytes;

  public DocumentStore(Duration ttl) {
    this(ttl, Clock.systemUTC());
  }

  public DocumentStore(Duration ttl, Clock clock) {
    this.ttl = ttl;
    this.clock = clock;
  }

  /** The store every adapter serves from. */
  public static DocumentStore shared() {
    return shared;
  }

  /** Replaces the shared store (a store shared by several instances, or a test's own clock). */
  public static void useShared(DocumentStore store) {
    shared = store;
  }

  /** Documents up to this size travel inline in the action response. */
  public static int inlineMaxBytes() {
    return (int) longProperty(INLINE_MAX_PROPERTY, DEFAULT_INLINE_MAX_BYTES);
  }

  /** Parks {@code document} and answers the single-use token that fetches it. */
  public String park(Document document) {
    long eager = document.producedOnDemand() ? 0 : document.content().length;
    Supplier<byte[]> content =
        document.producedOnDemand() ? document.lazyContent() : document::content;
    String token = newToken();
    synchronized (this) {
      purgeExpired();
      parked.put(
          token,
          new Parked(
              document.filename(),
              document.mediaType(),
              document.disposition(),
              content,
              eager,
              clock.instant().plus(ttl)));
      parkedBytes += eager;
      evictBeyondBounds();
    }
    return token;
  }

  /**
   * Takes the document parked under {@code token} — once: the token is spent whether or not it is
   * still valid. Empty when unknown, already taken or expired.
   */
  public Optional<Parked> take(String token) {
    if (token == null) {
      return Optional.empty();
    }
    synchronized (this) {
      Parked found = parked.remove(token);
      if (found == null) {
        return Optional.empty();
      }
      parkedBytes -= found.eagerBytes();
      if (!clock.instant().isBefore(found.expiresAt())) {
        return Optional.empty();
      }
      return Optional.of(found);
    }
  }

  /** How many documents are waiting (for tests and metrics). */
  public synchronized int size() {
    purgeExpired();
    return parked.size();
  }

  private void purgeExpired() {
    Instant now = clock.instant();
    Iterator<Map.Entry<String, Parked>> it = parked.entrySet().iterator();
    while (it.hasNext()) {
      Parked p = it.next().getValue();
      if (!now.isBefore(p.expiresAt())) {
        parkedBytes -= p.eagerBytes();
        it.remove();
      }
    }
  }

  private void evictBeyondBounds() {
    Iterator<Map.Entry<String, Parked>> it = parked.entrySet().iterator();
    while ((parked.size() > MAX_ENTRIES || parkedBytes > MAX_PARKED_BYTES) && it.hasNext()) {
      parkedBytes -= it.next().getValue().eagerBytes();
      it.remove();
    }
  }

  private static String newToken() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private static long longProperty(String name, long fallback) {
    String value = System.getProperty(name);
    if (value == null || value.isBlank()) {
      return fallback;
    }
    try {
      return Long.parseLong(value.trim());
    } catch (NumberFormatException e) {
      return fallback;
    }
  }
}
