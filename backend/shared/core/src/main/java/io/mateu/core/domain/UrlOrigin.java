package io.mateu.core.domain;

import java.util.regex.Pattern;

/**
 * The origin (scheme + authority) of a REST source url template, and who may choose it: only
 * configuration — a {@code ${secret.X}} — never a value the client sends, or the proxied leg would
 * fetch whatever host the client picked. Shared by the interpolator (which refuses such a url) and
 * the validator (which says so before the source ever runs).
 */
public final class UrlOrigin {

  /** The only expression an origin placeholder may hold: a configured secret. */
  private static final Pattern SECRET_ORIGIN = Pattern.compile("secret\\.[A-Za-z0-9_.-]+");

  private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

  private static final Pattern ENCODE_CALL = Pattern.compile("encodeURIComponent\\((.*)\\)");

  private UrlOrigin() {}

  /**
   * Where the origin of a URL template ends: after the authority of an absolute url, after a
   * leading placeholder (a configured base), or 0 for a relative template.
   */
  public static int end(String template) {
    int scheme = template.indexOf("://");
    int firstPlaceholder = template.indexOf("${");
    if (scheme >= 0 && (firstPlaceholder < 0 || scheme < firstPlaceholder)) {
      int i = scheme + 3;
      while (i < template.length()) {
        if (template.startsWith("${", i)) {
          int close = template.indexOf('}', i);
          i = close < 0 ? template.length() : close + 1;
          continue;
        }
        char c = template.charAt(i);
        if (c == '/' || c == '?' || c == '#') {
          return i;
        }
        i++;
      }
      return template.length();
    }
    if (template.startsWith("${")) {
      int close = template.indexOf('}');
      return close < 0 ? template.length() : close + 1;
    }
    return 0;
  }

  /** Whether an origin placeholder's expression is configuration ({@code secret.X}). */
  public static boolean isConfigured(String expression) {
    return SECRET_ORIGIN.matcher(expression.trim()).matches();
  }

  /**
   * The first placeholder in the origin of {@code template} that is NOT configuration — a value the
   * client would choose the host with — or null when the origin is literal or configured.
   */
  public static String clientChosen(String template) {
    if (template == null || !template.contains("${")) {
      return null;
    }
    int end = end(template);
    var matcher = PLACEHOLDER.matcher(template);
    while (matcher.find() && matcher.start() < end) {
      var expression = matcher.group(1).trim();
      var encoded = ENCODE_CALL.matcher(expression);
      var value = encoded.matches() ? encoded.group(1) : expression;
      if (!isConfigured(value)) {
        return expression;
      }
    }
    return null;
  }
}
