package io.mateu.core.infra.security;

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

  /** Whether {@code path} is one of the endpoints the guard covers (any method). */
  public static boolean guards(String path) {
    if (path == null) {
      return false;
    }
    int query = path.indexOf('?');
    var clean = query >= 0 ? path.substring(0, query) : path;
    while (clean.endsWith("/") && clean.length() > 1) {
      clean = clean.substring(0, clean.length() - 1);
    }
    if (clean.endsWith("/mateu/mcp")) {
      return true;
    }
    return clean.contains("/mateu/v3/") && !clean.endsWith("/mateu/v3/client-log");
  }
}
