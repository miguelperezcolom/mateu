package io.mateu.core.infra;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The PUBLIC base path of the app — the path in front of everything it serves, as the BROWSER sees
 * it: {@code ""} at the root of a host, {@code "/crm"} when the app runs under a servlet context
 * path ({@code server.servlet.context-path=/crm}) or behind a reverse proxy that serves it at
 * {@code /crm/} and strips the prefix before forwarding.
 *
 * <p>The served page ({@link IndexPage}, {@link YamlMounts}) is the only thing that needs it: its
 * renderer assets ({@code /assets/…}, {@code /_redwood/…}, a Redwood page's {@code <base href>}),
 * its {@code <mateu-ui baseUrl>} (every API call and the address bar derive from it) and the
 * installable-app links ({@link Pwa}) are written under it. Everything else Mateu serves answers
 * the path it receives, so a stripped prefix costs nothing on the server side.
 *
 * <p>It is the {@linkplain #PREFIX proxy prefix} followed by the framework's context path:
 *
 * <ul>
 *   <li>the context path is what the framework itself mounts the app at — the servlet context path
 *       (read off the request: with Spring's {@code server.forward-headers-strategy=framework} it
 *       already carries {@code X-Forwarded-Prefix}), WebFlux's {@code spring.webflux.base-path},
 *       Micronaut's {@code micronaut.server.context-path}, Quarkus' {@code quarkus.http.root-path}
 *       ({@link #configuredContextPath()});
 *   <li>the proxy prefix is the part a reverse proxy strips: the setting {@value #PREFIX} when set,
 *       else the request's {@value #FORWARDED_PREFIX_HEADER} — but only when {@value
 *       #TRUST_FORWARDED_PREFIX}{@code =true}: the header comes from the client unless a proxy in
 *       front overwrites it, and a page built from a header a shared cache does not vary on would
 *       hand one caller's prefix to the next (the reason Spring ignores forwarded headers by
 *       default too).
 * </ul>
 *
 * A value that is not a plain path ({@code /seg/seg}, unreserved characters only) is ignored: it
 * ends up in the page's markup.
 */
public final class PublicBase {

  /** The prefix a reverse proxy strips in front of the app ({@code /crm}). */
  public static final String PREFIX = "mateu.public-base-path";

  /** Whether {@value #FORWARDED_PREFIX_HEADER} is honoured when {@value #PREFIX} is not set. */
  public static final String TRUST_FORWARDED_PREFIX = "mateu.trust-forwarded-prefix";

  public static final String FORWARDED_PREFIX_HEADER = "X-Forwarded-Prefix";

  /**
   * The framework settings that name a context path, read by {@link #configuredContextPath()} for
   * the adapters whose request does not carry it.
   */
  public static final List<String> CONTEXT_PATH_SETTINGS =
      List.of(
          "server.servlet.context-path",
          "spring.webflux.base-path",
          "micronaut.server.context-path",
          "quarkus.http.root-path");

  private static final Pattern PLAIN_PATH = Pattern.compile("(/[A-Za-z0-9._~-]+)+");

  private PublicBase() {}

  /**
   * {@code value} as a base path — {@code ""} or {@code "/a/b"}, no trailing slash — or {@code ""}
   * when it is blank, {@code "/"} or not a plain path (never markup, never another origin).
   */
  public static String normalize(String value) {
    if (value == null) {
      return "";
    }
    var v = value.trim();
    // a proxy that chains prefixes sends "a,b": the first one is the client-facing one
    int comma = v.indexOf(',');
    if (comma >= 0) {
      v = v.substring(0, comma).trim();
    }
    while (v.endsWith("/")) {
      v = v.substring(0, v.length() - 1);
    }
    if (v.isEmpty()) {
      return "";
    }
    if (!v.startsWith("/")) {
      v = "/" + v;
    }
    return PLAIN_PATH.matcher(v).matches() ? v : "";
  }

  /**
   * The public base of a request.
   *
   * @param contextPath what the framework mounts the app at (the servlet context path, the WebFlux
   *     base path…); null or {@code ""} for none
   * @param forwardedPrefix the request's {@value #FORWARDED_PREFIX_HEADER} header, null when absent
   */
  public static String of(String contextPath, String forwardedPrefix) {
    return proxyPrefix(forwardedPrefix) + normalize(contextPath);
  }

  /** The prefix a proxy strips: the setting, else the trusted header, else {@code ""}. */
  static String proxyPrefix(String forwardedPrefix) {
    var configured = MateuSettings.get(PREFIX);
    if (configured != null && !configured.isBlank()) {
      return normalize(configured);
    }
    if (forwardedPrefix != null && trustsForwardedPrefix()) {
      return normalize(forwardedPrefix);
    }
    return "";
  }

  /**
   * Whether {@value #FORWARDED_PREFIX_HEADER} is honoured: {@value #TRUST_FORWARDED_PREFIX}, or its
   * other spelling {@value ForwardedPrefix#TRUSTED_PROPERTY}.
   */
  public static boolean trustsForwardedPrefix() {
    return MateuSettings.isTrue(TRUST_FORWARDED_PREFIX)
        || MateuSettings.isTrue(ForwardedPrefix.TRUSTED_PROPERTY);
  }

  /**
   * The context path the framework configuration declares (the first of {@link
   * #CONTEXT_PATH_SETTINGS} that is set), {@code ""} for none — for an adapter whose request does
   * not tell it.
   */
  public static String configuredContextPath() {
    for (var key : CONTEXT_PATH_SETTINGS) {
      var value = MateuSettings.get(key);
      if (value != null && !value.isBlank()) {
        return normalize(value);
      }
    }
    return "";
  }

  // root-relative URLs in the attributes a page loads things from: "/x" but not "//host/x"
  private static final Pattern ROOT_RELATIVE_ATTR =
      Pattern.compile("(\\s(?:src|href|data-src)\\s*=\\s*)([\"'])/(?!/)", Pattern.CASE_INSENSITIVE);

  // the Visual Builder runtime's base (a Redwood page's vbInitConfig.BASE_URL: '/_redwood/'): the
  // runtime derives its module base from it, not from <base href>
  private static final Pattern VB_BASE_URL = Pattern.compile("(\\bBASE_URL\\s*:\\s*)([\"'])/(?!/)");

  /**
   * {@code html} with its root-relative URLs ({@code src}, {@code href}, {@code data-src}, a
   * Redwood page's {@code <base href="/">} and {@code BASE_URL}) under {@code base}. Applied to the
   * renderer's template BEFORE the parts that are already written for the base (the root element,
   * the installable-app head) are added; a no-op for {@code ""}.
   */
  public static String rewrite(String html, String base) {
    var b = normalize(base);
    if (b.isEmpty() || html == null) {
      return html;
    }
    var replacement = "$1$2" + Matcher.quoteReplacement(b) + "/";
    html = ROOT_RELATIVE_ATTR.matcher(html).replaceAll(replacement);
    return VB_BASE_URL.matcher(html).replaceAll(replacement);
  }
}
