package io.mateu.core.infra.uploads;

import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.TreeSet;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;

/**
 * The signed ticket an upload field carries ({@code uploadTicket} attribute): what the upload
 * endpoint accepts a file for. Issued only for a field the caller was SHOWN editable, so the
 * endpoint needs no view to instantiate: the ticket says which store, which limits, which caller
 * and until when.
 *
 * <p>Format (design/uploads/file-uploads-contract.md §3): {@code base64url(payload) "."
 * base64url(HMAC-SHA256(secret, base64url(payload)))}, payload {@code
 * v1|storage|fieldId|maxBytes|accept|multiple|callerHash|expires}. The secret is {@value
 * #SECRET_PROPERTY} ({@code MATEU_UPLOADS_SECRET}), else random per process — which is fine for one
 * instance; behind a load balancer every instance must share it.
 */
@Slf4j
public final class UploadTickets {

  /** The setting holding the HMAC secret shared by every instance. */
  public static final String SECRET_PROPERTY = "mateu.uploads.secret";

  /** How long a ticket stays valid: a working day, like the issued action ids. */
  public static final long TTL_SECONDS = 8 * 3600;

  private static final byte[] RANDOM_SECRET = randomSecret();
  private static volatile boolean warned;

  static Clock clock = Clock.systemUTC();

  private UploadTickets() {}

  /** The setting capping the files one ticket of a MULTIPLE upload field may send. */
  public static final String MAX_FILES_PROPERTY = "mateu.uploads.max-files-per-ticket";

  /** Files a ticket of a multiple field may send by default. */
  public static final int DEFAULT_MAX_FILES = 100;

  /** Files a ticket of a SINGLE-file field may send: the file and a few replacements of it. */
  public static final int SINGLE_FILE_USES = 10;

  /** Tickets seen, by the hash of the ticket: how many files each has sent. Bounded LRU. */
  private static final java.util.Map<String, int[]> USES =
      java.util.Collections.synchronizedMap(
          new java.util.LinkedHashMap<>(64, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(java.util.Map.Entry<String, int[]> eldest) {
              return size() > 10_000;
            }
          });

  /**
   * Counts one file against {@code ticket}: false once it sent its share — a single-file field's
   * ticket allows {@value #SINGLE_FILE_USES} (the file and its replacements before the form is
   * saved), a multiple field's {@value #MAX_FILES_PROPERTY} (default {@value #DEFAULT_MAX_FILES}).
   * A ticket is valid for hours and an anonymous one is the same for every anonymous caller:
   * without a count it allowed unlimited storage use (GA review S11).
   */
  public static boolean consume(String ticket, Ticket granted) {
    var cap = granted.multiple() ? maxFiles() : Math.min(SINGLE_FILE_USES, maxFiles());
    var key = base64(hmac("uses|" + ticket));
    synchronized (USES) {
      var count = USES.computeIfAbsent(key, k -> new int[1]);
      if (count[0] >= cap) {
        return false;
      }
      count[0]++;
      return true;
    }
  }

  private static int maxFiles() {
    try {
      var value = io.mateu.core.infra.MateuSettings.get(MAX_FILES_PROPERTY);
      if (value != null && !value.isBlank() && Integer.parseInt(value.trim()) > 0) {
        return Integer.parseInt(value.trim());
      }
    } catch (RuntimeException e) {
      // unreadable: the default
    }
    return DEFAULT_MAX_FILES;
  }

  /** Forgets every count (tests). */
  static void clearUses() {
    USES.clear();
  }

  /** What a ticket grants. */
  public record Ticket(
      String storage,
      String fieldId,
      long maxBytes,
      String accept,
      boolean multiple,
      String callerHash,
      long expiresEpochSeconds) {}

  /** A ticket for {@code fieldId}, bound to the caller of {@code httpRequest}. */
  public static String issue(
      String storage,
      String fieldId,
      long maxBytes,
      String accept,
      boolean multiple,
      HttpRequest rq) {
    var payload =
        String.join(
            "|",
            "v1",
            encode(storage),
            encode(fieldId),
            String.valueOf(maxBytes),
            encode(accept),
            multiple ? "1" : "0",
            callerHash(rq),
            String.valueOf(clock.instant().getEpochSecond() + TTL_SECONDS));
    var body = base64(payload.getBytes(StandardCharsets.UTF_8));
    return body + "." + base64(hmac(body));
  }

  /**
   * The ticket, when it is well formed, signed by this server, not expired and issued to the caller
   * of {@code httpRequest}; null otherwise (the endpoint answers 403 without saying which).
   */
  public static Ticket verify(String ticket, HttpRequest httpRequest) {
    if (ticket == null || ticket.isBlank()) {
      return null;
    }
    int dot = ticket.indexOf('.');
    if (dot <= 0 || dot != ticket.lastIndexOf('.')) {
      return null;
    }
    var body = ticket.substring(0, dot);
    byte[] signature;
    String payload;
    try {
      signature = Base64.getUrlDecoder().decode(ticket.substring(dot + 1));
      payload = new String(Base64.getUrlDecoder().decode(body), StandardCharsets.UTF_8);
    } catch (IllegalArgumentException malformed) {
      return null;
    }
    if (!MessageDigest.isEqual(signature, hmac(body))) {
      return null;
    }
    var parts = payload.split("\\|", -1);
    if (parts.length != 8 || !"v1".equals(parts[0])) {
      return null;
    }
    try {
      var parsed =
          new Ticket(
              decode(parts[1]),
              decode(parts[2]),
              Long.parseLong(parts[3]),
              decode(parts[4]),
              "1".equals(parts[5]),
              parts[6],
              Long.parseLong(parts[7]));
      if (parsed.expiresEpochSeconds() < clock.instant().getEpochSecond()) {
        return null;
      }
      if (!parsed.callerHash().equals(callerHash(httpRequest))) {
        return null;
      }
      return parsed;
    } catch (NumberFormatException malformed) {
      return null;
    }
  }

  /**
   * The caller as the host framework authenticated it — name and every grant — hashed: the same
   * user with another role is another caller, and the ticket never carries the identity itself.
   */
  static String callerHash(HttpRequest httpRequest) {
    var identity = IdentityResolver.resolve(httpRequest);
    var caller =
        String.join(
            "\u0001",
            String.valueOf(identity.name()),
            sorted(identity.roles()),
            sorted(identity.groups()),
            sorted(identity.scopes()),
            sorted(identity.permissions()));
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(caller.getBytes(StandardCharsets.UTF_8)));
    } catch (java.security.NoSuchAlgorithmException impossible) {
      throw new IllegalStateException(impossible);
    }
  }

  private static String sorted(List<String> values) {
    return values == null ? "" : String.join(",", new TreeSet<>(values));
  }

  private static byte[] hmac(String body) {
    try {
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret(), "HmacSHA256"));
      return mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
    } catch (java.security.GeneralSecurityException impossible) {
      throw new IllegalStateException(impossible);
    }
  }

  private static byte[] secret() {
    var configured = MateuSettings.get(SECRET_PROPERTY);
    if (configured != null && !configured.isBlank()) {
      return configured.getBytes(StandardCharsets.UTF_8);
    }
    if (!warned) {
      warned = true;
      log.info(
          "Upload tickets are signed with a per-process secret: set {} (MATEU_UPLOADS_SECRET) when"
              + " the app runs on more than one instance",
          SECRET_PROPERTY);
    }
    return RANDOM_SECRET;
  }

  private static byte[] randomSecret() {
    var bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    return bytes;
  }

  private static String base64(byte[] bytes) {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  static String encode(String text) {
    return java.net.URLEncoder.encode(text == null ? "" : text, StandardCharsets.UTF_8)
        .replace("+", "%20");
  }

  static String decode(String text) {
    return java.net.URLDecoder.decode(text.replace("+", "%2B"), StandardCharsets.UTF_8);
  }
}
