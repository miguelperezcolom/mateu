package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import io.mateu.dtos.UIIncrementDto;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * What an UNTRUSTED definition may not do. A screen an agent authored — the chat's {@code
 * render-screen}, a live {@code AgentPush} of kind {@code render} — is written by an LLM, which can
 * be steered by the data it reads (prompt injection). Pairing an agent grants "drive my UI"
 * (navigate, fill, click: bounded by what the user can do anyway), never "run code in my signed-in
 * tab". So when a shell renders such a screen it calls {@code __preview__} with {@code _untrusted:
 * true}, and the increment it gets back has every script-capable construct taken out:
 *
 * <ul>
 *   <li>an {@code Element} keeps no event-handler attribute ({@code on…}), no {@code srcdoc}, no
 *       {@code import} and no unsafe url attribute (only relative / http(s) / mailto / tel); its
 *       content is TEXT ({@code html} false); an element that loads or runs code ({@code script},
 *       {@code iframe}, {@code object}, {@code style}, {@code base}, {@code link}, {@code meta}, …)
 *       or a framework element ({@code mateu-*}) becomes an empty {@code div};
 *   <li>{@code RunJS} rules, an action's {@code js}, {@code AddContentToHead}/{@code
 *       AddContentToBody} commands go;
 *   <li>a {@code javascript:}/{@code vbscript:} url anywhere is blanked;
 *   <li>a {@code MicroFrontend} does not load from another server (its absolute {@code baseUrl} is
 *       dropped).
 * </ul>
 *
 * <p>The same rules run in .NET, Python and in every web renderer (libs/mateu
 * untrustedDefinition.ts, Redwood poc/untrusted.mjs); the shared cases are {@code
 * conformance/untrusted/cases.json}. The visual editor's preview (the author's own YAML) does not
 * send the flag and renders as written.
 */
public final class UntrustedDefinition {

  /** The {@code __preview__} parameter marking the definition as untrusted. */
  public static final String UNTRUSTED_KEY = "_untrusted";

  private static final Set<String> BLOCKED_ELEMENTS =
      Set.of(
          "script",
          "style",
          "iframe",
          "frame",
          "frameset",
          "object",
          "embed",
          "applet",
          "base",
          "link",
          "meta",
          "template",
          "portal",
          "noscript");
  private static final Set<String> URL_ATTRIBUTES =
      Set.of(
          "href",
          "src",
          "xlink:href",
          "action",
          "formaction",
          "background",
          "poster",
          "data",
          "cite",
          "ping",
          "srcset",
          "manifest",
          "codebase",
          "longdesc",
          "usemap",
          "icon");
  private static final Set<String> SAFE_SCHEMES = Set.of("http", "https", "mailto", "tel");
  private static final Set<String> CODE_COMMANDS = Set.of("AddContentToHead", "AddContentToBody");
  private static final Pattern SCHEME = Pattern.compile("^([a-zA-Z][a-zA-Z0-9+.-]*):");

  private UntrustedDefinition() {}

  /** True when the {@code __preview__} parameters mark the definition as untrusted. */
  public static boolean requested(Map<String, Object> parameters) {
    if (parameters == null) return false;
    var flag = parameters.get(UNTRUSTED_KEY);
    return Boolean.TRUE.equals(flag) || "true".equalsIgnoreCase(String.valueOf(flag));
  }

  /**
   * The increment with every script-capable construct taken out ({@code wire}: the wire mapper).
   * Fails closed: an increment that cannot be re-read after the walk is refused rather than sent as
   * it was.
   */
  public static UIIncrementDto neutralize(UIIncrementDto increment, ObjectMapper wire) {
    if (increment == null) return null;
    JsonNode clean = neutralize((JsonNode) wire.valueToTree(increment));
    try {
      return wire.treeToValue(clean, UIIncrementDto.class);
    } catch (Exception e) {
      throw new IllegalStateException("The generated screen could not be rendered safely", e);
    }
  }

  /** A sanitised copy of any wire JSON (a fragment, a component, an increment). */
  public static JsonNode neutralize(JsonNode value) {
    if (value == null) return null;
    if (value.isTextual()) return isScriptUrl(value.asText()) ? TextNode.valueOf("") : value;
    if (value.isArray()) {
      ArrayNode out = JsonNodeFactory.instance.arrayNode();
      for (JsonNode item : value) {
        if (!isCode(item)) out.add(neutralize(item));
      }
      return out;
    }
    if (!value.isObject()) return value;
    ObjectNode node = ((ObjectNode) value).deepCopy();
    String type = node.path("type").isTextual() ? node.get("type").asText() : null;
    if ("Element".equals(type)) element(node);
    if ("MicroFrontend".equals(type)
        && node.path("baseUrl").isTextual()
        && isAbsoluteUrl(node.get("baseUrl").asText())) {
      node.put("baseUrl", "");
    }
    ObjectNode out = JsonNodeFactory.instance.objectNode();
    var fields = node.fields();
    while (fields.hasNext()) {
      var entry = fields.next();
      if ("js".equals(entry.getKey()) && entry.getValue().isTextual()) continue;
      out.set(entry.getKey(), neutralize(entry.getValue()));
    }
    return out;
  }

  private static void element(ObjectNode node) {
    String name =
        node.path("name").isTextual()
            ? node.get("name").asText().trim().toLowerCase(Locale.ROOT)
            : "";
    if (BLOCKED_ELEMENTS.contains(name) || name.startsWith("mateu-")) {
      node.put("name", "div");
      node.set("attributes", JsonNodeFactory.instance.objectNode());
      node.set("on", JsonNodeFactory.instance.objectNode());
      node.putNull("content");
      node.put("html", false);
      return;
    }
    if (node.path("attributes").isObject()) {
      ObjectNode attributes = JsonNodeFactory.instance.objectNode();
      var fields = node.get("attributes").fields();
      while (fields.hasNext()) {
        var entry = fields.next();
        String k = entry.getKey().toLowerCase(Locale.ROOT);
        if (k.equals("import") || k.equals("srcdoc") || k.startsWith("on")) continue;
        JsonNode v = entry.getValue();
        if (v.isTextual()
            && (isScriptUrl(v.asText()) || (URL_ATTRIBUTES.contains(k) && !isSafeUrl(v.asText()))))
          continue;
        attributes.set(entry.getKey(), v);
      }
      node.set("attributes", attributes);
    }
    node.put("html", false);
  }

  private static boolean isCode(JsonNode item) {
    if (item == null || !item.isObject()) return false;
    if ("RunJS".equals(item.path("action").asText(null))) return true;
    return item.path("type").isTextual() && CODE_COMMANDS.contains(item.get("type").asText());
  }

  /**
   * A url as a browser reads its scheme: tabs/newlines removed, leading controls/spaces dropped.
   */
  private static String cleaned(String value) {
    String s = value.replaceAll("[\\t\\n\\r]", "");
    int i = 0;
    while (i < s.length() && s.charAt(i) <= ' ') i++;
    return s.substring(i);
  }

  private static String schemeOf(String value) {
    var m = SCHEME.matcher(cleaned(value));
    return m.find() ? m.group(1).toLowerCase(Locale.ROOT) : null;
  }

  static boolean isScriptUrl(String value) {
    String scheme = schemeOf(value);
    return "javascript".equals(scheme) || "vbscript".equals(scheme);
  }

  private static boolean isSafeUrl(String value) {
    String scheme = schemeOf(value);
    return scheme == null || SAFE_SCHEMES.contains(scheme);
  }

  /**
   * Another server's url: a scheme, or {@code //host} — a browser reads a backslash as {@code /},
   * so {@code \\host}, {@code /\host} and {@code \/host} are {@code //host} too.
   */
  private static boolean isAbsoluteUrl(String value) {
    return schemeOf(value) != null || cleaned(value).replace('\\', '/').startsWith("//");
  }
}
