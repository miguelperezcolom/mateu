package io.mateu.core.infra;

import java.util.regex.Pattern;

/**
 * The public path prefix a Mateu page is served under: a servlet context path ({@code
 * server.servlet.context-path}, {@code spring.webflux.base-path}) or the prefix a reverse proxy
 * strips and announces in {@value #HEADER}.
 *
 * <p>The header is a claim the CLIENT can make, so it is honoured only when the application says a
 * proxy it trusts sets it — {@value #TRUSTED_PROPERTY}{@code =true}, the same opt-in as Spring's
 * {@code server.forward-headers-strategy}. A framework that already applied it (Spring's {@code
 * ForwardedHeaderFilter} turns it into the context path) needs nothing: its context path is used.
 *
 * <p>What the prefix changes is decided by {@link PublicBase}, which serves the page: {@value
 * #TRUSTED_PROPERTY} is the other spelling of {@link PublicBase#TRUST_FORWARDED_PREFIX}, and either
 * one turns the header on.
 */
public final class ForwardedPrefix {

  /** Whether {@value #HEADER} is honoured (default false). */
  public static final String TRUSTED_PROPERTY = "mateu.forwarded-prefix.trusted";

  /** The header a prefix-stripping proxy sets. */
  public static final String HEADER = "X-Forwarded-Prefix";

  // a path: segments of unreserved / sub-delim / percent-encoded characters — never a quote, an
  // angle bracket or a backslash (the value is written into the page)
  private static final Pattern SAFE = Pattern.compile("(/[A-Za-z0-9._~!$&'()*+,;=:@%-]+)+");

  private ForwardedPrefix() {}

  /** Whether the application trusts the proxy's {@value #HEADER}. */
  public static boolean trusted() {
    return PublicBase.trustsForwardedPrefix();
  }

  /**
   * The prefix of a request: the trusted {@value #HEADER} when there is one, else the framework's
   * context path; {@code ""} for none.
   *
   * @param contextPath what the framework strips before routing (may be null)
   * @param forwardedPrefix the request's {@value #HEADER} (may be null)
   */
  public static String of(String contextPath, String forwardedPrefix) {
    return of(contextPath, forwardedPrefix, trusted());
  }

  /** As {@link #of(String, String)}, with the trust decided by the caller (tests, the ports). */
  public static String of(String contextPath, String forwardedPrefix, boolean trusted) {
    if (trusted) {
      var forwarded = normalize(forwardedPrefix);
      if (!forwarded.isEmpty()) {
        return forwarded;
      }
    }
    return normalize(contextPath);
  }

  /**
   * {@code ""} or {@code /a/b}: a leading slash, no trailing one; the first value of a list
   * (several proxies), and {@code ""} for anything that is not a plain path.
   */
  public static String normalize(String prefix) {
    if (prefix == null) {
      return "";
    }
    var value = prefix;
    int comma = value.indexOf(',');
    if (comma >= 0) {
      value = value.substring(0, comma);
    }
    value = value.trim();
    while (value.endsWith("/")) {
      value = value.substring(0, value.length() - 1);
    }
    if (value.isEmpty()) {
      return "";
    }
    if (!value.startsWith("/")) {
      value = "/" + value;
    }
    return SAFE.matcher(value).matches() && !value.contains("/../") && !value.endsWith("/..")
        ? value
        : "";
  }
}
