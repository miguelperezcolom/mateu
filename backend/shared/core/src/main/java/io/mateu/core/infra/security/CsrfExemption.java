package io.mateu.core.infra.security;

import java.util.Locale;

/**
 * Which requests a framework's CSRF protection can leave to Mateu: a JSON call to one of Mateu's
 * own endpoints ({@code <baseUrl>/mateu/v3/**}, {@code /mateu/mcp}, {@code /mateu/dev/**}).
 *
 * <p>Why that is safe: a cross-site forgery is a request the attacker's page makes the browser send
 * WITHOUT a CORS preflight, and the only bodies such a request can carry are {@code
 * application/x-www-form-urlencoded}, {@code multipart/form-data} and {@code text/plain}. A request
 * declaring {@code Content-Type: application/json} is not CORS-simple: the browser asks first, and
 * Mateu's CORS is off unless the application lists the origins ({@code mateu.cors.allowed-origins})
 * — so the forged request is never sent. A form-encoded or text/plain request to the same path is
 * NOT exempt: the framework's CSRF check still applies to it.
 *
 * <p>Without this the documented setup ("add your framework's security module") answered every
 * Mateu POST with 403 under Spring Security's default CSRF protection.
 */
public final class CsrfExemption {

  /** The property that turns the adapters' automatic exemption off (on unless set to false). */
  public static final String ENABLED_PROPERTY = "mateu.security.csrf-exemption.enabled";

  private CsrfExemption() {}

  /**
   * Whether a request to {@code path} with {@code contentType} may skip the framework's CSRF check:
   * a Mateu JSON call, or a call to the development endpoints ({@code /mateu/dev/**}, served only
   * with {@code mateu.dev=true}: a forged one can at most reload a developer's page).
   */
  public static boolean isMateuJsonCall(String path, String contentType) {
    return isMateuEndpoint(path) && (isJson(contentType) || isDevEndpoint(path));
  }

  private static boolean isDevEndpoint(String path) {
    return path.contains("/mateu/dev/");
  }

  /** {@code …/mateu/v3/…}, {@code …/mateu/mcp} or {@code …/mateu/dev/…}, under any base URL. */
  public static boolean isMateuEndpoint(String path) {
    if (path == null) {
      return false;
    }
    int query = path.indexOf('?');
    var clean = query >= 0 ? path.substring(0, query) : path;
    return clean.contains("/mateu/v3/")
        || clean.endsWith("/mateu/mcp")
        || clean.contains("/mateu/dev/");
  }

  /** {@code application/json} or any {@code application/*+json}, parameters ignored. */
  public static boolean isJson(String contentType) {
    if (contentType == null) {
      return false;
    }
    var base = contentType.toLowerCase(Locale.ROOT);
    int semi = base.indexOf(';');
    if (semi >= 0) {
      base = base.substring(0, semi);
    }
    base = base.trim();
    return base.equals("application/json")
        || (base.startsWith("application/") && base.endsWith("+json"));
  }
}
