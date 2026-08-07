package io.mateu.core.infra;

import java.util.Map;
import java.util.function.Function;
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
      matcher.appendReplacement(sb, Matcher.quoteReplacement(value));
    }
    matcher.appendTail(sb);
    return sb.toString();
  }
}
