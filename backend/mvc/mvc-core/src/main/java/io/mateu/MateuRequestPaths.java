package io.mateu;

import io.mateu.core.infra.ForwardedPrefix;
import jakarta.servlet.http.HttpServletRequest;

/**
 * The two paths of a servlet request Mateu needs under a context path ({@code
 * server.servlet.context-path}): the path WITHIN the application (what the handler mappings and
 * Mateu's base urls see) and the public prefix the served page must use ({@link ForwardedPrefix}).
 */
public final class MateuRequestPaths {

  private MateuRequestPaths() {}

  /**
   * The request URI without the context path: {@code /ctx/admin/orders} → {@code /admin/orders}.
   */
  public static String withinApp(HttpServletRequest request) {
    var uri = request.getRequestURI();
    var context = request.getContextPath();
    if (uri == null) {
      return "/";
    }
    if (context != null && !context.isEmpty() && uri.startsWith(context)) {
      var rest = uri.substring(context.length());
      return rest.isEmpty() ? "/" : rest;
    }
    return uri;
  }

  /**
   * The public prefix of the page: the servlet context path — which Spring's {@code
   * ForwardedHeaderFilter} ({@code server.forward-headers-strategy=framework}) sets from {@code
   * X-Forwarded-Prefix} — or a trusted {@code X-Forwarded-Prefix} ({@value
   * ForwardedPrefix#TRUSTED_PROPERTY}).
   */
  public static String prefixOf(HttpServletRequest request) {
    return io.mateu.core.infra.PublicBase.of(
        request.getContextPath(), request.getHeader(ForwardedPrefix.HEADER));
  }
}
