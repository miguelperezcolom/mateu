package io.mateu.core.infra;

import java.util.Map;
import java.util.function.Function;
import java.util.function.UnaryOperator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Server-side {@code ${...}} interpolation for the PROXY mode of the external-REST features — the
 * backend counterpart of the frontend's client-side interpolate. Resolves {@code ${state.field}}
 * from the component state and {@code ${secret.KEY}} from a {@link
 * io.mateu.uidl.interfaces.SecretsProvider} (so auth secrets are injected on the server, never on
 * the client). An unresolvable placeholder becomes the empty string; a template without {@code ${}
 * } is returned untouched.
 */
public final class TemplateInterpolator {

  private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

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
      var expr = matcher.group(1).trim();
      String value = "";
      if (expr.startsWith("state.")) {
        var v = state != null ? state.get(expr.substring("state.".length())) : null;
        value = v == null ? "" : String.valueOf(v);
      } else if (expr.startsWith("secret.")) {
        var v = secrets != null ? secrets.apply(expr.substring("secret.".length())) : null;
        value = v == null ? "" : v;
      }
      matcher.appendReplacement(sb, Matcher.quoteReplacement(escape.apply(value)));
    }
    matcher.appendTail(sb);
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
