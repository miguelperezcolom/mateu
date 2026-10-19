package io.mateu.core.application.authoring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Locale;
import java.util.TreeSet;

/**
 * The agent-sized views of the schema behind {@code mateu_list_components} and {@code
 * mateu_get_component_schema}. Normative like {@link UidlValidator} (same output in .NET and
 * Python, pinned by {@code conformance/mcp/authoring.json}).
 */
public final class ComponentSchemas {

  private ComponentSchemas() {}

  /**
   * The catalogue's components whose type or description contains {@code query} (ignoring case; all
   * of them for a blank query): {@code {components: [{type, description, attributes: [name…]}],
   * count}}.
   */
  public static ObjectNode list(String query, ObjectMapper om) {
    var needle = query == null ? "" : query.strip().toLowerCase(Locale.ROOT);
    var out = om.createObjectNode();
    var components = out.putArray("components");
    for (var c : AuthoringResources.catalog(om).path("components")) {
      var type = c.path("type").asText();
      var description = c.path("description").asText();
      if (!needle.isEmpty()
          && !type.toLowerCase(Locale.ROOT).contains(needle)
          && !description.toLowerCase(Locale.ROOT).contains(needle)) {
        continue;
      }
      var entry = components.addObject();
      entry.put("type", type);
      entry.put("description", description);
      var attributes = entry.putArray("attributes");
      c.path("attributes").forEach(a -> attributes.add(a.path("name").asText()));
    }
    out.put("count", components.size());
    return out;
  }

  /**
   * The {@code $def} of {@code type} with every definition it references, transitively — except
   * that a polymorphic family ({@code Component}, {@code Trigger}, a def with {@code oneOf}) is
   * included as its list of members and not walked into: {@code {type, schema, definitions}}, the
   * definitions sorted by name.
   *
   * @throws io.mateu.uidl.UserFacingException when there is no such def
   */
  public static ObjectNode schemaOf(String type, ObjectMapper om) {
    var defs = AuthoringResources.specsSchema(om).path("$defs");
    var def = defs.get(type);
    if (def == null) {
      var names = new ArrayList<String>();
      defs.fieldNames().forEachRemaining(names::add);
      var suggestion = UidlValidator.suggest(type, names);
      throw new io.mateu.uidl.UserFacingException(
          "Unknown type "
              + UidlValidator.quote(type)
              + "."
              + (suggestion != null ? " Did you mean " + UidlValidator.quote(suggestion) + "?" : "")
              + " See mateu_list_components.");
    }
    var included = new TreeSet<String>();
    var pending = new ArrayDeque<String>();
    if (!def.has("oneOf")) {
      refs(def, pending);
    }
    while (!pending.isEmpty()) {
      var name = pending.pop();
      if (name.equals(type) || !included.add(name)) {
        continue;
      }
      var referenced = defs.path(name);
      if (!referenced.has("oneOf")) {
        refs(referenced, pending);
      }
    }
    var out = om.createObjectNode();
    out.put("type", type);
    out.set("schema", def);
    var definitions = out.putObject("definitions");
    included.forEach(name -> definitions.set(name, defs.get(name)));
    return out;
  }

  private static void refs(JsonNode node, ArrayDeque<String> into) {
    if (node.isObject()) {
      var ref = node.get("$ref");
      if (ref != null && ref.isTextual() && ref.asText().startsWith("#/$defs/")) {
        into.add(ref.asText().substring("#/$defs/".length()));
      }
      node.forEach(child -> refs(child, into));
    } else if (node.isArray()) {
      node.forEach(child -> refs(child, into));
    }
  }
}
