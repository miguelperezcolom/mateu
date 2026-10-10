package io.mateu.core.infra.documents;

import io.mateu.uidl.data.DocumentDisposition;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * {@code GET <baseUrl>/mateu/v3/documents/<token>}: hands out a document parked by an action — the
 * single source for every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP), which only adapt
 * the request and write back the {@link Response}.
 *
 * <p>Single use, short-lived (see {@link DocumentStore}); an unknown, spent or expired token
 * answers 404 with no body. The response is never cached ({@code no-store}), never sniffed ({@code
 * nosniff}), and an active type (HTML, SVG, XML) shown inline is sandboxed, so a document built
 * from user data cannot run script on the application's origin. The filename reaches {@code
 * Content-Disposition} only through {@link #contentDisposition}: no CR/LF, no quotes, no path.
 */
public final class DocumentDownloads {

  /** Every UI's base URL followed by this and a token is the endpoint. */
  public static final String PATH_MARKER = "/mateu/v3/documents/";

  public static final int OK = 200;
  public static final int NOT_FOUND = 404;
  public static final int SERVER_ERROR = 500;

  private static final Logger log = LoggerFactory.getLogger(DocumentDownloads.class);

  private static final Pattern TOKEN = Pattern.compile("[A-Za-z0-9_-]{16,128}");
  private static final String TOKEN_CHARS = "[!#$&^_.+A-Za-z0-9-]";
  private static final Pattern MEDIA_TYPE =
      Pattern.compile(
          TOKEN_CHARS
              + "{1,127}/"
              + TOKEN_CHARS
              + "{1,127}(\\s*;\\s*"
              + TOKEN_CHARS
              + "{1,127}=("
              + TOKEN_CHARS
              + "{1,127}|\"[^\"\\\\\\p{Cntrl}]{0,127}\"))*");

  private DocumentDownloads() {}

  /** What the adapter writes back. */
  public record Response(int status, Map<String, String> headers, byte[] body) {}

  /** Whether {@code path} (the request path, no query) is a document download. */
  public static boolean isEndpoint(String path) {
    return tokenOf(path) != null;
  }

  /** The token in {@code path}, or null when the path is not a well-formed download URL. */
  public static String tokenOf(String path) {
    if (path == null) {
      return null;
    }
    int at = path.lastIndexOf(PATH_MARKER);
    if (at < 0) {
      return null;
    }
    String token = path.substring(at + PATH_MARKER.length());
    return TOKEN.matcher(token).matches() ? token : null;
  }

  /** Serves {@code path} from the shared store. */
  public static Response serve(String path) {
    return serve(path, DocumentStore.shared());
  }

  public static Response serve(String path, DocumentStore store) {
    var parked = store.take(tokenOf(path));
    if (parked.isEmpty()) {
      return new Response(NOT_FOUND, Map.of("Cache-Control", "no-store"), new byte[0]);
    }
    var doc = parked.get();
    byte[] body;
    try {
      body = doc.content().get();
    } catch (RuntimeException e) {
      log.error("Producing the document {} failed", safeFilename(doc.filename()), e);
      return new Response(SERVER_ERROR, Map.of("Cache-Control", "no-store"), new byte[0]);
    }
    if (body == null) {
      body = new byte[0];
    }
    String mediaType = safeMediaType(doc.mediaType());
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("Content-Type", mediaType);
    headers.put("Content-Disposition", contentDisposition(doc.disposition(), doc.filename()));
    headers.put("Content-Length", Integer.toString(body.length));
    headers.put("Cache-Control", "no-store");
    headers.put("X-Content-Type-Options", "nosniff");
    headers.put("Referrer-Policy", "no-referrer");
    if (isActive(mediaType)) {
      headers.put("Content-Security-Policy", "sandbox");
    }
    return new Response(OK, headers, body);
  }

  /**
   * The {@code Content-Disposition} value: an ASCII {@code filename} (quoted, with every unsafe
   * character replaced) for old clients, and the exact name as RFC 5987 {@code filename*}.
   */
  public static String contentDisposition(DocumentDisposition disposition, String filename) {
    String clean = safeFilename(filename);
    StringBuilder ascii = new StringBuilder();
    for (char c : clean.toCharArray()) {
      ascii.append(c >= 0x20 && c < 0x7f && c != '"' && c != '\\' && c != '%' ? c : '_');
    }
    return (disposition == DocumentDisposition.inline ? "inline" : "attachment")
        + "; filename=\""
        + ascii
        + "\"; filename*=UTF-8''"
        + rfc5987(clean);
  }

  /** The name without control characters, path separators or surrounding dots and spaces. */
  public static String safeFilename(String filename) {
    if (filename == null) {
      return "document";
    }
    StringBuilder out = new StringBuilder();
    filename
        .codePoints()
        .forEach(
            cp -> {
              if (Character.isISOControl(cp)
                  || cp == '/'
                  || cp == '\\'
                  || Character.getType(cp) == Character.FORMAT
                  || cp == 0x2028
                  || cp == 0x2029) {
                out.append('_');
              } else {
                out.appendCodePoint(cp);
              }
            });
    String clean = out.toString().strip();
    while (clean.startsWith(".")) {
      clean = clean.substring(1);
    }
    if (clean.length() > 200) {
      clean = clean.substring(0, 200);
    }
    return clean.isBlank() ? "document" : clean;
  }

  /** The media type when it is a well-formed one, else {@code application/octet-stream}. */
  public static String safeMediaType(String mediaType) {
    if (mediaType == null) {
      return "application/octet-stream";
    }
    String trimmed = mediaType.trim();
    return MEDIA_TYPE.matcher(trimmed).matches() ? trimmed : "application/octet-stream";
  }

  private static boolean isActive(String mediaType) {
    String base = mediaType.toLowerCase(Locale.ROOT);
    int semi = base.indexOf(';');
    if (semi >= 0) {
      base = base.substring(0, semi).trim();
    }
    return base.equals("text/html")
        || base.contains("xml")
        || base.contains("svg")
        || base.contains("javascript")
        || base.equals("text/xsl");
  }

  private static String rfc5987(String value) {
    StringBuilder out = new StringBuilder();
    for (byte b : value.getBytes(StandardCharsets.UTF_8)) {
      int c = b & 0xff;
      if ((c >= 'a' && c <= 'z')
          || (c >= 'A' && c <= 'Z')
          || (c >= '0' && c <= '9')
          || "!#$&+-.^_`|~".indexOf(c) >= 0) {
        out.append((char) c);
      } else {
        out.append('%').append(String.format("%02X", c));
      }
    }
    return out.toString();
  }
}
