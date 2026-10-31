package io.mateu.core.infra;

import java.util.Map;
import java.util.function.Function;
import java.util.function.UnaryOperator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Server-side {@code ${...}} interpolation for the PROXY mode of the external-REST features — the
 * backend counterpart of the frontend's client-side interpolate. Resolves {@code ${state.field}}
 * (and a nested {@code ${state.field.key}}) from the component state and {@code ${secret.KEY}} from
 * a {@link io.mateu.uidl.interfaces.SecretsProvider} (so auth secrets are injected on the server,
 * never on the client). An unresolvable placeholder becomes the empty string; a template without
 * {@code ${} } is returned untouched.
 *
 * <p>It is not a JavaScript evaluator, but it understands the few forms a source template uses
 * beside a plain path, so a proxied call means what the browser's would: a fallback {@code ${a ??
 * b}} (a literal or another path on the right), and {@code ${encodeURIComponent(x)}}.
 *
 * <p>A <b>money</b> value ({@code {value, currency, locale}}, what a {@code dataType: money} field
 * holds) is substituted as its AMOUNT: {@code ${state.price}} → {@code 12500000}; its currency is
 * {@code ${state.price.currency}}. It used to land as a Java map's {@code toString} ({@code
 * {value=12500000, currency=EUR, …}}) and the endpoint answered 400.
 */
public final class TemplateInterpolator {

  private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

  private static final String ENCODE_CALL = "encodeURIComponent";

  private static final Pattern NUMBER = Pattern.compile("-?\\d+(\\.\\d+)?");

  private TemplateInterpolator() {}

  public static String interpolate(
      String template, Map<String, Object> state, Function<String, String> secrets) {
    return interpolate(template, state, secrets, UnaryOperator.identity());
  }

  /**
   * The same, escaping every substituted VALUE before it lands in the template.
   *
   * <p>A template is a shape with holes, and the holes are filled with data the author does not
   * control. A JSON body like {@code {"name":"${state.name}"}} is broken by any value carrying a
   * quote, a backslash or a newline — and it breaks INVISIBLY: the endpoint answers 400 and all the
   * user sees is that saving does nothing. The template itself must never be escaped, only what
   * goes into it, which is why this cannot be done on the result.
   */
  public static String interpolate(
      String template,
      Map<String, Object> state,
      Function<String, String> secrets,
      UnaryOperator<String> escape) {
    if (template == null || !template.contains("${")) {
      return template == null ? "" : template;
    }
    var matcher = PLACEHOLDER.matcher(template);
    var sb = new StringBuilder();
    while (matcher.find()) {
      var value = valueOf(matcher.group(1).trim(), state, secrets);
      matcher.appendReplacement(sb, Matcher.quoteReplacement(escape.apply(value)));
    }
    matcher.appendTail(sb);
    return sb.toString();
  }

  /**
   * Interpolates a URL template, percent-encoding every substituted value by where it lands.
   *
   * <p>A value is DATA, and data must never change the shape of the request. Without encoding, an
   * id of {@code 1/../../admin?x=} turned {@code /people/${state.id}} into a request for {@code
   * /admin} — and on the proxied leg that is the SERVER fetching whatever the client asked for. So:
   *
   * <ul>
   *   <li>a placeholder in the <b>origin</b> (scheme + authority, or a template that starts with a
   *       placeholder — {@code ${secret.API_BASE}/people}) is substituted raw: the origin is
   *       configuration. A {@code ${state.x}} there is refused, because the client must not choose
   *       which host is called;
   *   <li>a placeholder in the <b>path</b> is encoded as a path segment (everything but the RFC
   *       3986 unreserved characters, so {@code /} becomes {@code %2F}), and a value that is a dot
   *       segment ({@code .} or {@code ..}) is refused — URL parsers resolve those even encoded;
   *   <li>a placeholder in the <b>query or fragment</b> (after a literal {@code ?} or {@code #}) is
   *       encoded as a query component ({@code &}, {@code =}, {@code #} and the rest escaped).
   * </ul>
   *
   * <p>The browser leg ({@code libs/mateu} {@code interpolateUrl}) and the .NET and Python ports
   * apply the same rules, byte for byte, so a direct and a proxied call reach the same URL.
   *
   * @throws IllegalArgumentException when a value is refused (client state in the origin, or a dot
   *     segment in the path)
   */
  public static String interpolateUrl(
      String template, Map<String, Object> state, Function<String, String> secrets) {
    if (template == null || !template.contains("${")) {
      return template == null ? "" : template;
    }
    int originEnd = originEnd(template);
    var matcher = PLACEHOLDER.matcher(template);
    var sb = new StringBuilder();
    while (matcher.find()) {
      // `${encodeURIComponent(x)}` — the way a value had to be written before Mateu encoded it —
      // means `${x}`: encoded ONCE, here. Encoding it again sent `a%252Cb` for `a,b`.
      var expr = matcher.group(1).trim();
      var explicitlyEncoded = encodeCallArgument(expr);
      var valueExpr = explicitlyEncoded != null ? explicitlyEncoded : expr;
      var resolved = resolve(valueExpr, state, secrets);
      var value = explicitlyEncoded != null ? jsText(resolved) : text(resolved);
      String replacement;
      if (matcher.start() < originEnd) {
        if (valueExpr.startsWith("state.")) {
          throw new IllegalArgumentException(
              "A client state value cannot choose the origin of a URL: " + template);
        }
        replacement = explicitlyEncoded != null ? urlEncode(value) : value;
      } else if (inQuery(template, matcher.start())) {
        replacement = urlEncode(value);
      } else {
        if (".".equals(value) || "..".equals(value)) {
          throw new IllegalArgumentException("A dot segment is not a valid path value: " + value);
        }
        replacement = urlEncode(value);
      }
      matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
    }
    matcher.appendTail(sb);
    return sb.toString();
  }

  private static String valueOf(
      String expr, Map<String, Object> state, Function<String, String> secrets) {
    return text(resolve(expr, state, secrets));
  }

  /**
   * The value an expression names, or null: {@code state.a} / {@code state.a.b}, {@code
   * secret.KEY}, a literal ({@code 'x'}, {@code "x"}, a number, {@code true}/{@code false}/{@code
   * null}), {@code a ?? b} (b when a is null or absent), or {@code encodeURIComponent(x)}.
   */
  private static Object resolve(
      String rawExpr, Map<String, Object> state, Function<String, String> secrets) {
    var expr = rawExpr.trim();
    int coalesce = topLevelIndexOf(expr, "??");
    if (coalesce >= 0) {
      var left = resolve(expr.substring(0, coalesce), state, secrets);
      return left != null ? left : resolve(expr.substring(coalesce + 2), state, secrets);
    }
    var encoded = encodeCallArgument(expr);
    if (encoded != null) {
      return urlEncode(jsText(resolve(encoded, state, secrets)));
    }
    if (expr.length() >= 2
        && (expr.charAt(0) == '\'' || expr.charAt(0) == '"')
        && expr.charAt(expr.length() - 1) == expr.charAt(0)) {
      return expr.substring(1, expr.length() - 1);
    }
    if (NUMBER.matcher(expr).matches() || "true".equals(expr) || "false".equals(expr)) {
      return expr;
    }
    if (expr.startsWith("state.")) {
      return path(state, expr.substring("state.".length()));
    }
    if (expr.startsWith("secret.")) {
      return secrets != null ? secrets.apply(expr.substring("secret.".length())) : null;
    }
    return null;
  }

  /** {@code a.b.c} in the state: a flat key first (as always), else a walk through nested maps. */
  private static Object path(Map<String, Object> state, String path) {
    if (state == null) {
      return null;
    }
    if (state.containsKey(path)) {
      return state.get(path);
    }
    Object current = state;
    for (var part : path.split("\\.")) {
      if (!(current instanceof Map<?, ?> map)) {
        return null;
      }
      current = map.get(part.trim());
    }
    return current;
  }

  /** A resolved value as the text that lands in the template. */
  private static String text(Object v) {
    if (v == null) {
      return "";
    }
    if (isMoney(v)) {
      var amount = ((Map<?, ?>) v).get("value");
      if (amount instanceof Double || amount instanceof Float) {
        // 1.25E7 → 12500000: a JSON number, not Java's scientific notation
        return new java.math.BigDecimal(amount.toString()).stripTrailingZeros().toPlainString();
      }
      return amount == null ? "" : String.valueOf(amount);
    }
    return String.valueOf(v);
  }

  /**
   * A value as JavaScript's {@code String(v)} converts it — what {@code encodeURIComponent(v)}
   * encodes in the browser: a list as {@code a,b} (a multi-select's values), a money value as its
   * amount.
   */
  private static String jsText(Object v) {
    if (v instanceof java.util.Collection<?> items) {
      return items.stream()
          .map(TemplateInterpolator::jsText)
          .collect(java.util.stream.Collectors.joining(","));
    }
    return text(v);
  }

  /** A money value: what a {@code dataType: money} field holds ({@code {value, currency, …}}). */
  static boolean isMoney(Object v) {
    return v instanceof Map<?, ?> map && map.containsKey("value") && map.containsKey("currency");
  }

  /**
   * The argument of an expression that is exactly ONE {@code encodeURIComponent(…)} call, or null —
   * {@code encodeURIComponent(a) + encodeURIComponent(b)} is not one.
   */
  static String encodeCallArgument(String expr) {
    var e = expr.trim();
    if (!e.startsWith(ENCODE_CALL)) {
      return null;
    }
    var rest = e.substring(ENCODE_CALL.length()).trim();
    if (!rest.startsWith("(") || !rest.endsWith(")")) {
      return null;
    }
    int depth = 0;
    char quote = 0;
    for (int i = 0; i < rest.length(); i++) {
      char c = rest.charAt(i);
      if (quote != 0) {
        if (c == '\\') {
          i++;
        } else if (c == quote) {
          quote = 0;
        }
        continue;
      }
      if (c == '\'' || c == '"' || c == '`') {
        quote = c;
      } else if (c == '(') {
        depth++;
      } else if (c == ')') {
        depth--;
        if (depth == 0 && i != rest.length() - 1) {
          return null; // the call closes before the end: something follows it
        }
      }
    }
    return depth == 0 ? rest.substring(1, rest.length() - 1) : null;
  }

  /** The index of {@code token} outside quotes and parentheses, or -1. */
  private static int topLevelIndexOf(String expr, String token) {
    int depth = 0;
    char quote = 0;
    for (int i = 0; i < expr.length(); i++) {
      char c = expr.charAt(i);
      if (quote != 0) {
        if (c == '\\') {
          i++;
        } else if (c == quote) {
          quote = 0;
        }
        continue;
      }
      if (c == '\'' || c == '"' || c == '`') {
        quote = c;
      } else if (c == '(' || c == '[') {
        depth++;
      } else if (c == ')' || c == ']') {
        depth--;
      } else if (depth == 0 && expr.startsWith(token, i)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Where the origin of a URL template ends: after the authority of an absolute url, after a
   * leading placeholder (a configured base), or 0 for a relative template.
   */
  static int originEnd(String template) {
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

  /** Whether a literal {@code ?} or {@code #} (outside placeholders) precedes {@code index}. */
  private static boolean inQuery(String template, int index) {
    int i = 0;
    while (i < index) {
      if (template.startsWith("${", i)) {
        int close = template.indexOf('}', i);
        i = close < 0 ? template.length() : close + 1;
        continue;
      }
      char c = template.charAt(i);
      if (c == '?' || c == '#') {
        return true;
      }
      i++;
    }
    return false;
  }

  /**
   * Percent-encodes everything but the RFC 3986 unreserved characters ({@code A-Z a-z 0-9 - . _
   * ~}), UTF-8, upper-case hex — the same output as JavaScript's {@code encodeURIComponent} with
   * {@code !'()*} also escaped, .NET's {@code Uri.EscapeDataString} and Python's {@code quote(v,
   * safe="")}.
   */
  public static String urlEncode(String value) {
    if (value == null || value.isEmpty()) {
      return "";
    }
    var bytes = value.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    var sb = new StringBuilder(bytes.length + 8);
    for (byte b : bytes) {
      int c = b & 0xff;
      if ((c >= 'A' && c <= 'Z')
          || (c >= 'a' && c <= 'z')
          || (c >= '0' && c <= '9')
          || c == '-'
          || c == '.'
          || c == '_'
          || c == '~') {
        sb.append((char) c);
      } else {
        sb.append('%')
            .append(Character.toUpperCase(Character.forDigit(c >> 4, 16)))
            .append(Character.toUpperCase(Character.forDigit(c & 0xf, 16)));
      }
    }
    return sb.toString();
  }

  /**
   * Escapes a value for the inside of a JSON string — the characters JSON does not allow raw, and
   * nothing else. It does NOT add the surrounding quotes: the template already wrote those, and
   * adding a second pair would break exactly what this is here to protect.
   */
  public static String jsonEscape(String value) {
    if (value == null || value.isEmpty()) {
      return "";
    }
    var sb = new StringBuilder(value.length() + 8);
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      switch (c) {
        case '"' -> sb.append("\\\"");
        case '\\' -> sb.append("\\\\");
        case '\n' -> sb.append("\\n");
        case '\r' -> sb.append("\\r");
        case '\t' -> sb.append("\\t");
        case '\b' -> sb.append("\\b");
        case '\f' -> sb.append("\\f");
        default -> {
          if (c < 0x20) {
            sb.append(String.format("\\u%04x", (int) c));
          } else {
            sb.append(c);
          }
        }
      }
    }
    return sb.toString();
  }

  /** Whether a request declares a JSON body, which is when its values need JSON escaping. */
  public static boolean declaresJson(Map<String, String> headers) {
    if (headers == null) {
      return false;
    }
    return headers.entrySet().stream()
        .anyMatch(
            e ->
                "content-type".equalsIgnoreCase(e.getKey())
                    && e.getValue() != null
                    && e.getValue().toLowerCase().contains("json"));
  }
}
