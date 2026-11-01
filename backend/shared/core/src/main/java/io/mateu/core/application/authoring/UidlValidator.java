package io.mateu.core.application.authoring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import org.yaml.snakeyaml.error.Mark;
import org.yaml.snakeyaml.error.MarkedYAMLException;
import org.yaml.snakeyaml.nodes.MappingNode;
import org.yaml.snakeyaml.nodes.Node;
import org.yaml.snakeyaml.nodes.NodeTuple;
import org.yaml.snakeyaml.nodes.ScalarNode;
import org.yaml.snakeyaml.nodes.SequenceNode;

/**
 * Validates a YAML definition against the generated {@code specs-schema.json} and reports EVERY
 * problem with where it is — the authoring half of the MCP plane ({@code mateu_validate_uidl}).
 *
 * <p>The loader is Jackson, and Jackson tells you one thing at a time with no line (the tree is
 * converted after parsing); an invalid page then answers "Not found." This walks the composed YAML
 * node tree (which keeps positions) next to the schema instead, so a single pass reports all the
 * errors and warnings, each with a code, a message, a JSONPath and a 1-based line/column.
 *
 * <p>The rules are NORMATIVE: the .NET and Python backends implement the same walk and the shared
 * corpus {@code conformance/mcp/authoring.json} pins identical reports. They are specified in
 * {@code conformance/mcp/README.md}; keep the three in step:
 *
 * <ul>
 *   <li>scalars are typed by their raw text, not by a YAML resolver (resolvers differ between
 *       languages): a quoted scalar is a string; a plain one is null ({@code ~}, {@code null},
 *       empty), a boolean ({@code true}/{@code false} in any case), a number, or a string;
 *   <li>a string property accepts any scalar, a boolean also the strings "true"/"false", an integer
 *       or a number also their text — the coercions the loader applies; null fits anything;
 *   <li>an unknown key is a WARNING (the loader ignores it), everything that makes the loader fail
 *       is an ERROR; semantic findings (undeclared actions, references that do not resolve) are
 *       warnings.
 * </ul>
 *
 * <p>Pure: no I/O and no app state beyond the {@link ValidationContext} it is handed.
 */
public final class UidlValidator {

  /** Largest definition accepted (UTF-8 bytes); the same limit in every implementation. */
  public static final int MAX_YAML_BYTES = 262_144;

  /** Most nodes walked (an alias-bomb guard: aliases share nodes, the walk would not). */
  public static final int MAX_NODES = 100_000;

  private static final Pattern INT = Pattern.compile("[-+]?[0-9]+");
  private static final Pattern FLOAT =
      Pattern.compile("[-+]?(\\.[0-9]+|[0-9]+(\\.[0-9]*)?)([eE][-+]?[0-9]+)?");
  private static final Pattern IDENTIFIER = Pattern.compile("[A-Za-z_][A-Za-z0-9_]*");

  private static final Map<String, String> TYPED_KINDS = new LinkedHashMap<>();

  static {
    TYPED_KINDS.put("UI", "mount");
    TYPED_KINDS.put("Routes", "routes");
    TYPED_KINDS.put("Sources", "sources");
    TYPED_KINDS.put("Actions", "actions");
    TYPED_KINDS.put("Translations", "translations");
    TYPED_KINDS.put("Environment", "environment");
    TYPED_KINDS.put("Types", "types");
    TYPED_KINDS.put("Project", "project");
  }

  private final JsonNode specs;
  private final JsonNode defs;
  private final ObjectMapper om;

  public UidlValidator(JsonNode specsSchema, ObjectMapper objectMapper) {
    this.specs = specsSchema;
    this.defs = specsSchema.path("$defs");
    this.om = objectMapper;
  }

  /** Validates {@code yaml}; never throws. */
  public ObjectNode validate(String yaml, ValidationContext context) {
    return new Run(context == null ? ValidationContext.none() : context).validate(yaml);
  }

  // ── one validation ─────────────────────────────────────────────────────────────────────────

  private final class Run {

    private final ValidationContext context;
    private final ArrayNode errors = om.createArrayNode();
    private final ArrayNode warnings = om.createArrayNode();
    private String kind;
    private Set<String> declaredActions;
    private int visited;
    private boolean aborted;

    Run(ValidationContext context) {
      this.context = context;
    }

    ObjectNode validate(String yaml) {
      if (yaml == null || yaml.isBlank()) {
        issue(errors, "empty", "The YAML is empty.", "$", null);
        return report();
      }
      if (yaml.getBytes(StandardCharsets.UTF_8).length > MAX_YAML_BYTES) {
        issue(
            errors,
            "too_large",
            "The YAML is larger than the " + MAX_YAML_BYTES + "-byte limit.",
            "$",
            null);
        return report();
      }
      Node root;
      try {
        var options = new LoaderOptions();
        options.setMaxAliasesForCollections(MAX_NODES);
        options.setNestingDepthLimit(1000);
        root = new Yaml(new SafeConstructor(options)).compose(new StringReader(yaml));
      } catch (MarkedYAMLException e) {
        var mark = e.getProblemMark() != null ? e.getProblemMark() : e.getContextMark();
        var problem = e.getProblem() != null ? e.getProblem() : e.getMessage();
        issue(errors, "yaml_syntax", capitalize(problem.strip()) + ".", "$", mark);
        return report();
      } catch (RuntimeException e) {
        issue(errors, "yaml_syntax", String.valueOf(e.getMessage()), "$", null);
        return report();
      }
      if (root == null || isNull(root)) {
        issue(errors, "empty", "The YAML is empty.", "$", null);
        return report();
      }
      validateRoot(root);
      return report();
    }

    private ObjectNode report() {
      var out = om.createObjectNode();
      out.put("valid", errors.isEmpty());
      if (kind == null) {
        out.putNull("kind");
      } else {
        out.put("kind", kind);
      }
      out.set("errors", errors);
      out.set("warnings", warnings);
      return out;
    }

    // ── root classification ──────────────────────────────────────────────────────────────────

    private void validateRoot(Node root) {
      if (root instanceof SequenceNode) {
        kind = "routes";
        validateNode(root, branch(b -> "array".equals(b.path("type").asText())), "$", null);
        return;
      }
      if (!(root instanceof MappingNode mapping)) {
        unknownKind(root);
        return;
      }
      var type = scalarText(get(mapping, "type"));
      if (type != null && TYPED_KINDS.containsKey(type)) {
        kind = TYPED_KINDS.get(type);
        validateObject(mapping, branch(b -> type.equals(constOf(b))), "$", null, Map.of());
        return;
      }
      if (type != null || get(mapping, "type") != null) {
        // a component at the root: a page (or an app shell), with the page-level keys beside it
        kind = "component";
        var pageBranch = branch(b -> b.has("allOf"));
        var pageKeys = pageBranch.get("allOf").get(1).path("properties");
        prepareActionCheck(mapping, !"AppShell".equals(type));
        validateDiscriminated(mapping, defs.get("Component"), "Component", "$", pageKeys);
        return;
      }
      if (has(mapping, "layout") || has(mapping, "layoutDelta")) {
        kind = "envelope";
        prepareActionCheck(mapping, true);
        validateObject(
            mapping, branch(b -> b.path("properties").has("layout")), "$", null, Map.of());
        return;
      }
      String typeless = null;
      Predicate<JsonNode> which = null;
      if (has(mapping, "content")) {
        typeless = "partial";
        which = b -> b.path("required").toString().equals("[\"content\"]");
      } else if (has(mapping, "components")) {
        typeless = "components";
        which = b -> b.path("properties").has("components");
      } else if (has(mapping, "routes")) {
        typeless = "routes";
        which = b -> "Routes".equals(constOf(b));
      } else if (has(mapping, "actions")) {
        typeless = "actions";
        which = b -> "Actions".equals(constOf(b));
      } else if (has(mapping, "types")) {
        typeless = "types";
        which = b -> "Types".equals(constOf(b));
      } else if (has(mapping, "messages")) {
        typeless = "translations";
        which = b -> "Translations".equals(constOf(b));
      } else if (get(mapping, "sources") instanceof SequenceNode) {
        typeless = "sources";
        which = b -> "Sources".equals(constOf(b));
      } else if (get(mapping, "sources") instanceof MappingNode) {
        typeless = "environment";
        which = b -> "Environment".equals(constOf(b));
      }
      if (typeless == null) {
        unknownKind(root);
        return;
      }
      kind = typeless;
      validateObject(mapping, branch(which), "$", null, Map.of());
    }

    private void unknownKind(Node root) {
      issue(
          errors,
          "unknown_kind",
          "Cannot tell what kind of definition this is: give it a `type:` (a component such as"
              + " VerticalLayout, or a file kind such as UI, Routes or Sources), or a `layout:`,"
              + " `content:` or `components:` key.",
          "$",
          root.getStartMark());
    }

    private JsonNode branch(Predicate<JsonNode> predicate) {
      for (var branch : specs.path("oneOf")) {
        if (predicate.test(branch)) {
          return branch;
        }
      }
      throw new IllegalStateException("specs-schema.json lacks an expected root branch");
    }

    private String constOf(JsonNode branch) {
      var c = branch.path("properties").path("type").path("const");
      return c.isTextual() ? c.asText() : null;
    }

    /** The page's own declared action ids, unless a view model is named (it owns the actions). */
    private void prepareActionCheck(MappingNode root, boolean applies) {
      if (!applies
          || !blank(scalarText(get(root, "viewModel")))
          || !blank(scalarText(get(root, "modelView")))) {
        return;
      }
      declaredActions = new HashSet<>();
      if (get(root, "actions") instanceof SequenceNode list) {
        for (var item : list.getValue()) {
          if (item instanceof MappingNode action) {
            var id = scalarText(get(action, "id"));
            if (id != null) {
              declaredActions.add(id);
            }
          }
        }
      }
    }

    // ── the walk ─────────────────────────────────────────────────────────────────────────────

    private void validateNode(Node node, JsonNode schema, String path, String key) {
      if (!count(node)) {
        return;
      }
      String defName = null;
      while (schema.has("$ref")) {
        defName = schema.get("$ref").asText().substring("#/$defs/".length());
        schema = defs.path(defName);
      }
      if (isNull(node)) {
        return;
      }
      if (schema.has("oneOf")) {
        validateDiscriminated(node, schema, defName, path, null);
        return;
      }
      if (schema.has("enum")) {
        if (!(node instanceof ScalarNode scalar)) {
          wrongType(node, "a string", path);
          return;
        }
        var allowed = new ArrayList<String>();
        schema.get("enum").forEach(v -> allowed.add(v.asText()));
        if (!allowed.contains(scalar.getValue())) {
          issue(
              errors,
              "invalid_value",
              quote(scalar.getValue())
                  + " is not a valid "
                  + (key != null ? key : "value")
                  + " — use one of: "
                  + String.join(", ", allowed)
                  + ".",
              path,
              node.getStartMark());
        }
        return;
      }
      var types = typesOf(schema);
      if (!types.isEmpty() && !fits(node, types)) {
        wrongType(node, expected(types), path);
        return;
      }
      if (node instanceof MappingNode mapping
          && (schema.has("properties") || schema.has("additionalProperties"))) {
        validateObject(mapping, schema, path, defName, Map.of());
      } else if (node instanceof SequenceNode list && schema.has("items")) {
        var items = schema.get("items");
        var i = 0;
        for (var item : list.getValue()) {
          validateNode(item, items, path + "[" + i++ + "]", key);
        }
      }
    }

    private void validateDiscriminated(
        Node node, JsonNode family, String familyName, String path, JsonNode extraKeys) {
      if (!(node instanceof MappingNode mapping)) {
        wrongType(node, "a mapping", path);
        return;
      }
      var typeNode = get(mapping, "type");
      if (typeNode == null || isNull(typeNode)) {
        issue(
            errors,
            "missing_type",
            "Missing \"type\": a " + familyName + " must say which one it is.",
            path,
            mapping.getStartMark());
        return;
      }
      if (!(typeNode instanceof ScalarNode typeScalar)) {
        wrongType(typeNode, "a string", path + ".type");
        return;
      }
      var type = typeScalar.getValue();
      var candidates = new ArrayList<String>();
      String member = null;
      for (var ref : family.path("oneOf")) {
        var name = ref.path("$ref").asText().substring("#/$defs/".length());
        var c = defs.path(name).path("properties").path("type").path("const").asText(name);
        candidates.add(c);
        if (c.equals(type)) {
          member = name;
        }
      }
      if (member == null) {
        var suggestion = suggest(type, candidates);
        issue(
            errors,
            "unknown_type",
            "Unknown "
                + familyName
                + " type "
                + quote(type)
                + "."
                + (suggestion != null ? " Did you mean " + quote(suggestion) + "?" : ""),
            path + ".type",
            typeNode.getStartMark());
        return;
      }
      var extra = new LinkedHashMap<String, JsonNode>();
      if (extraKeys != null) {
        extraKeys.fields().forEachRemaining(e -> extra.put(e.getKey(), e.getValue()));
      }
      validateObject(mapping, defs.get(member), path, member, extra);
    }

    private void validateObject(
        MappingNode mapping,
        JsonNode schema,
        String path,
        String defName,
        Map<String, JsonNode> extraKeys) {
      var properties = schema.path("properties");
      for (var required : schema.path("required")) {
        if (get(mapping, required.asText()) == null) {
          issue(
              errors,
              "missing_required",
              "Missing required key " + quote(required.asText()) + ".",
              path,
              mapping.getStartMark());
        }
      }
      var additional = schema.get("additionalProperties");
      for (NodeTuple tuple : mapping.getValue()) {
        if (aborted) {
          return;
        }
        if (!(tuple.getKeyNode() instanceof ScalarNode keyNode)) {
          continue;
        }
        var key = keyNode.getValue();
        var childPath = path + segment(key);
        var value = tuple.getValueNode();
        JsonNode propertySchema = properties.get(key);
        if (propertySchema == null) {
          propertySchema = extraKeys.get(key);
        }
        if (propertySchema != null) {
          semantic(defName, key, value, childPath);
          validateNode(value, propertySchema, childPath, key);
        } else if (additional != null && additional.isObject()) {
          validateNode(value, additional, childPath, key);
        } else if (schema.has("properties")) {
          var known = new ArrayList<String>();
          properties.fieldNames().forEachRemaining(known::add);
          known.addAll(extraKeys.keySet());
          var suggestion = suggest(key, known);
          issue(
              warnings,
              "unknown_property",
              "Unknown key "
                  + quote(key)
                  + " (ignored)."
                  + (suggestion != null
                      ? " Did you mean " + quote(suggestion) + "?"
                      : " Known keys here: " + String.join(", ", known) + "."),
              childPath,
              keyNode.getStartMark());
        }
      }
    }

    // ── semantic checks ──────────────────────────────────────────────────────────────────────

    private void semantic(String defName, String key, Node value, String path) {
      var text = scalarText(value);
      if (blank(text)) {
        return;
      }
      if ("ref".equals(key) && "RestDataSource".equals(defName)) {
        resolves(
            context.source(),
            text,
            "unresolved_source",
            "Source " + quote(text) + " is not in the source catalogue (sources.yaml).",
            path,
            value);
      } else if ("ref".equals(key) && "Partial".equals(defName)) {
        resolves(
            context.partial(),
            text,
            "unresolved_partial",
            "Partial " + quote(text) + " does not exist (specs/ui/partials/).",
            path,
            value);
      } else if ("ref".equals(key) && "ComponentRef".equals(defName)) {
        resolves(
            context.component(),
            text,
            "unresolved_component",
            "Component "
                + quote(text)
                + " is not in the business component catalogue (components.yaml).",
            path,
            value);
      } else if (("url".equals(key) || "body".equals(key)) && "RestDataSource".equals(defName)) {
        proxySafe(text, path, value);
      } else if ("fieldType".equals(key)) {
        resolves(
            context.fieldType(),
            text,
            "unresolved_field_type",
            "Field type " + quote(text) + " is not in the field type catalogue (types.yaml).",
            path,
            value);
      } else if (declaredActions != null
          && ("actionId".equals(key) || key.endsWith("ActionId"))
          && !declaredActions.contains(text)
          && (context.action() == null || !context.action().test(text))) {
        issue(
            warnings,
            "undeclared_action",
            "Action "
                + quote(text)
                + " is not declared in this page's actions: (or the action catalogue); it only"
                + " runs if the view model bound to the page has an action of that name.",
            path,
            value.getStartMark());
      }
    }

    /**
     * A source template the SERVER cannot evaluate the way the browser does: on a proxied source
     * (proxy: true, or an environment overlay that flips it) such a placeholder renders empty —
     * paging, filters or ids silently missing. The server evaluates the subset of {@link
     * io.mateu.core.infra.ProxyExpression}; {@code data}/{@code appState}/{@code appData} exist
     * only in the browser.
     */
    private void proxySafe(String template, String path, Node at) {
      var matcher = PLACEHOLDER.matcher(template);
      while (matcher.find()) {
        var expr = matcher.group(1).trim();
        String why = null;
        if (CLIENT_ONLY_ROOT.matcher(expr).find()) {
          why = "reads data/appState/appData, which only the browser has";
        } else if (!io.mateu.core.infra.ProxyExpression.isSupported(expr)) {
          why = "uses syntax outside what the server evaluates";
        }
        if (why != null) {
          issue(
              warnings,
              "proxy_unsafe_template",
              "${"
                  + expr
                  + "} "
                  + why
                  + ": if this source is proxied (proxy: true, or an environment flips it) it is"
                  + " sent empty.",
              path,
              at.getStartMark());
        }
      }
    }

    private static final java.util.regex.Pattern PLACEHOLDER =
        java.util.regex.Pattern.compile("\\$\\{([^}]+)}");
    private static final java.util.regex.Pattern CLIENT_ONLY_ROOT =
        java.util.regex.Pattern.compile("(?<![\\w$.])(data|appState|appData)\\s*(\\.|\\?\\.|\\[)");

    private void resolves(
        Predicate<String> known, String name, String code, String message, String path, Node at) {
      if (known != null && !known.test(name)) {
        issue(warnings, code, message, path, at.getStartMark());
      }
    }

    // ── helpers ──────────────────────────────────────────────────────────────────────────────

    private boolean count(Node node) {
      if (aborted) {
        return false;
      }
      if (++visited > MAX_NODES) {
        aborted = true;
        issue(
            errors,
            "too_complex",
            "The YAML is too complex to validate (more than " + MAX_NODES + " nodes).",
            "$",
            null);
        return false;
      }
      return true;
    }

    private void wrongType(Node node, String expected, String path) {
      issue(
          errors,
          "wrong_type",
          "Expected " + expected + ", found " + found(node) + ".",
          path,
          node.getStartMark());
    }

    private void issue(ArrayNode into, String code, String message, String path, Mark mark) {
      var issue = into.addObject();
      issue.put("code", code);
      issue.put("message", message);
      issue.put("path", path);
      if (mark != null) {
        issue.put("line", mark.getLine() + 1);
        issue.put("column", mark.getColumn() + 1);
      }
    }
  }

  // ── scalar typing (normative, see the class javadoc) ───────────────────────────────────────

  private static boolean isNull(Node node) {
    if (!(node instanceof ScalarNode scalar) || !isPlain(scalar)) {
      return false;
    }
    var v = scalar.getValue();
    return v.isEmpty() || v.equals("~") || v.equalsIgnoreCase("null");
  }

  private static boolean isPlain(ScalarNode scalar) {
    return scalar.getScalarStyle() == DumperOptions.ScalarStyle.PLAIN;
  }

  private static List<String> typesOf(JsonNode schema) {
    var type = schema.get("type");
    var out = new ArrayList<String>();
    if (type == null) {
      return out;
    }
    if (type.isArray()) {
      type.forEach(t -> out.add(t.asText()));
    } else {
      out.add(type.asText());
    }
    return out;
  }

  private static boolean fits(Node node, List<String> types) {
    for (var type : types) {
      var ok =
          switch (type) {
            case "object" -> node instanceof MappingNode;
            case "array" -> node instanceof SequenceNode;
            case "string" -> node instanceof ScalarNode;
            case "boolean" ->
                node instanceof ScalarNode s
                    && (s.getValue().equalsIgnoreCase("true")
                        || s.getValue().equalsIgnoreCase("false"));
            case "integer" ->
                node instanceof ScalarNode s && INT.matcher(s.getValue().strip()).matches();
            case "number" ->
                node instanceof ScalarNode s
                    && (INT.matcher(s.getValue().strip()).matches()
                        || FLOAT.matcher(s.getValue().strip()).matches());
            default -> true;
          };
      if (ok) {
        return true;
      }
    }
    return false;
  }

  private static String expected(List<String> types) {
    var words = new ArrayList<String>();
    for (var type : types) {
      words.add(
          switch (type) {
            case "string" -> "a string";
            case "boolean" -> "a boolean";
            case "integer" -> "an integer";
            case "number" -> "a number";
            case "object" -> "a mapping";
            case "array" -> "a list";
            default -> type;
          });
    }
    if (words.size() == 1) {
      return words.get(0);
    }
    return String.join(", ", words.subList(0, words.size() - 1))
        + " or "
        + words.get(words.size() - 1);
  }

  private static String found(Node node) {
    if (node instanceof MappingNode) {
      return "a mapping";
    }
    if (node instanceof SequenceNode) {
      return "a list";
    }
    return quote(((ScalarNode) node).getValue());
  }

  /** A value in a message: double-quoted, with {@code \} and {@code "} escaped. */
  public static String quote(String value) {
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  /** A JSONPath segment for a mapping key. */
  static String segment(String key) {
    return IDENTIFIER.matcher(key).matches()
        ? "." + key
        : "['" + key.replace("\\", "\\\\").replace("'", "\\'") + "']";
  }

  /**
   * The closest candidate (case-insensitive; equal ignoring case first, else the smallest edit
   * distance ≤ 2 that is also shorter than the value; ties go to the earlier candidate), or null.
   */
  public static String suggest(String value, List<String> candidates) {
    var lower = value.toLowerCase(java.util.Locale.ROOT);
    for (var c : candidates) {
      if (c.toLowerCase(java.util.Locale.ROOT).equals(lower)) {
        return c;
      }
    }
    String best = null;
    var bestDistance = Integer.MAX_VALUE;
    for (var c : candidates) {
      var d = levenshtein(lower, c.toLowerCase(java.util.Locale.ROOT));
      if (d < bestDistance) {
        bestDistance = d;
        best = c;
      }
    }
    return best != null && bestDistance <= 2 && bestDistance < value.length() ? best : null;
  }

  static int levenshtein(String a, String b) {
    var previous = new int[b.length() + 1];
    var current = new int[b.length() + 1];
    for (var j = 0; j <= b.length(); j++) {
      previous[j] = j;
    }
    for (var i = 1; i <= a.length(); i++) {
      current[0] = i;
      for (var j = 1; j <= b.length(); j++) {
        var cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
        current[j] =
            Math.min(Math.min(current[j - 1] + 1, previous[j] + 1), previous[j - 1] + cost);
      }
      var swap = previous;
      previous = current;
      current = swap;
    }
    return previous[b.length()];
  }

  private static Node get(MappingNode mapping, String key) {
    for (var tuple : mapping.getValue()) {
      if (tuple.getKeyNode() instanceof ScalarNode k && k.getValue().equals(key)) {
        return tuple.getValueNode();
      }
    }
    return null;
  }

  private static boolean has(MappingNode mapping, String key) {
    return get(mapping, key) != null;
  }

  private static String scalarText(Node node) {
    return node instanceof ScalarNode scalar && !isNull(scalar) ? scalar.getValue() : null;
  }

  private static boolean blank(String s) {
    return s == null || s.isBlank();
  }

  private static String capitalize(String s) {
    return s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
  }
}
