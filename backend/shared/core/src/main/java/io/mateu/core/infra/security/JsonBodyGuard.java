package io.mateu.core.infra.security;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Locale;

/**
 * The one rule every adapter applies before a request reaches Mateu's action endpoints: a {@code
 * POST} to {@code <baseUrl>/mateu/v3/**} (sync, SSE, a YAML mount's API) or to {@code /mateu/mcp}
 * must declare a JSON body ({@code application/json} or {@code application/*+json}); anything else
 * — {@code text/plain}, a form encoding, or no Content-Type at all — answers {@value
 * #UNSUPPORTED_MEDIA_TYPE}.
 *
 * <p>Why: those are exactly the bodies a cross-site page can make the browser send WITHOUT a CORS
 * preflight, with the user's cookies attached. Refusing them is what makes a cookie-authenticated
 * Mateu app safe from cross-site request forgery on every adapter — {@link CsrfExemption} relies on
 * it — and not only where a framework's JSON binding happens to refuse them (Spring's
 * {@code @RequestBody}). The renderers, the native apps and the MCP sidecar all send JSON already.
 *
 * <p>Out of scope: {@code …/mateu/v3/client-log} (a log line, rate-limited, may arrive as a beacon)
 * and the development endpoints {@code /mateu/dev/**}.
 */
public final class JsonBodyGuard {

  /** HTTP 415, the answer to a refused body. */
  public static final int UNSUPPORTED_MEDIA_TYPE = 415;

  /** The (plain text) body of the refusal. */
  public static final String MESSAGE = "Mateu endpoints accept only application/json bodies";

  private JsonBodyGuard() {}

  /** Whether a request with this method, path and Content-Type header must be answered 415. */
  public static boolean refuses(String method, String path, String contentType) {
    return "POST".equalsIgnoreCase(method) && guards(path) && !CsrfExemption.isJson(contentType);
  }

  /**
   * Whether {@code path} is one of the endpoints the guard covers (any method). The decision is
   * taken on the {@link #canonicalPath canonical form} of the path — percent-decoded, without
   * segment parameters, dot segments or empty segments, case-folded — because that is (at most)
   * what the frameworks route on: MVC/WebFlux/Quarkus hand the filter the RAW request URI, and
   * {@code /%6Dateu/mcp} or {@code /mateu/mcp;x=1} still reach the MCP handler. Guarding a spelling
   * no framework routes is harmless (it only asks a POST to be JSON); missing one is a bypass.
   */
  public static boolean guards(String path) {
    if (path == null) {
      return false;
    }
    var clean = canonicalPath(path).toLowerCase(Locale.ROOT);
    if (clean.endsWith("/mateu/mcp")) {
      return true;
    }
    return clean.contains("/mateu/v3/") && !clean.endsWith("/mateu/v3/client-log");
  }

  /**
   * The path as a router sees it at most: query and fragment dropped, percent-decoded (repeatedly,
   * so a double encoding cannot hide a segment either; malformed escapes are kept literally), a
   * backslash read as a separator, {@code ;parameters} removed from every segment, empty and {@code
   * .} segments dropped and {@code ..} resolved (never above the root). Never ends with a slash
   * except for the root itself.
   */
  public static String canonicalPath(String path) {
    if (path == null) {
      return "/";
    }
    var clean = path;
    int cut = indexOfAny(clean, '?', '#');
    if (cut >= 0) {
      clean = clean.substring(0, cut);
    }
    for (int i = 0; i < 3 && clean.indexOf('%') >= 0; i++) {
      var decoded = percentDecode(clean);
      if (decoded.equals(clean)) {
        break;
      }
      clean = decoded;
    }
    clean = clean.replace('\\', '/');
    var segments = new ArrayDeque<String>();
    for (String segment : clean.split("/")) {
      int semi = segment.indexOf(';');
      var name = semi >= 0 ? segment.substring(0, semi) : segment;
      if (name.isEmpty() || name.equals(".")) {
        continue;
      }
      if (name.equals("..")) {
        segments.pollLast();
        continue;
      }
      segments.addLast(name);
    }
    return "/" + String.join("/", segments);
  }

  private static int indexOfAny(String text, char a, char b) {
    int ia = text.indexOf(a);
    int ib = text.indexOf(b);
    if (ia < 0) {
      return ib;
    }
    return ib < 0 ? ia : Math.min(ia, ib);
  }

  /** Decodes every well-formed {@code %XX} (UTF-8); anything else is kept as it is. */
  private static String percentDecode(String text) {
    var bytes = new ByteArrayOutputStream(text.length());
    for (int i = 0; i < text.length(); i++) {
      char c = text.charAt(i);
      if (c == '%' && i + 2 < text.length()) {
        int hi = Character.digit(text.charAt(i + 1), 16);
        int lo = Character.digit(text.charAt(i + 2), 16);
        if (hi >= 0 && lo >= 0) {
          bytes.write(hi * 16 + lo);
          i += 2;
          continue;
        }
      }
      var encoded = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
      bytes.write(encoded, 0, encoded.length);
    }
    return bytes.toString(StandardCharsets.UTF_8);
  }
}
