package io.mateu.core.application.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Projects a serialized {@code UIIncrementDto} (the wire) into a flat, agent-friendly screen.
 *
 * <p>This is the native (Java) twin of the sidecar's {@code projection.mjs}. Both walk the SAME
 * serialized wire, so they produce the SAME projection — parity by construction. The derivation
 * rules are normative and specified in {@code doc/.../reference/wire-specification.md} (§ Agent
 * operability). Part of the agent-operability plane ({@code design/riu-agent-operability-plan.md}).
 *
 * <p>Pure: no I/O, so it is fully unit-testable against the conformance corpus.
 */
public final class McpProjection {

  private McpProjection() {}

  /** The server encodes the root/empty route as "_empty" on the wire; treat it as "". */
  public static String normalizeRoute(String route) {
    if (route == null) return "";
    String r = route.replaceFirst("^/+", "");
    return "_empty".equals(r) ? "" : r;
  }

  public static ObjectNode project(JsonNode increment, ObjectMapper om) {
    ObjectNode out = om.createObjectNode();
    JsonNode inc = increment == null ? om.createObjectNode() : increment;

    JsonNode commands = inc.path("commands");
    JsonNode messages = inc.path("messages");
    JsonNode fragments = inc.path("fragments");

    JsonNode[] serverSide = {null};
    JsonNode[] page = {null};
    JsonNode[] crudl = {null};
    java.util.List<JsonNode> fieldNodes = new java.util.ArrayList<>();
    Map<String, String> buttonsByAction = new LinkedHashMap<>();
    JsonNode[] state = {null};

    if (fragments.isArray()) {
      for (JsonNode fragment : fragments) {
        if (state[0] == null && fragment.path("state").isObject()) state[0] = fragment.get("state");
        JsonNode root = fragment.has("component") ? fragment.get("component") : fragment;
        deepVisit(
            root,
            node -> {
              if ("ServerSide".equals(node.path("type").asText(null)) && serverSide[0] == null) {
                serverSide[0] = node;
              }
              String t = mdType(node);
              if ("FormField".equals(t) && node.path("metadata").hasNonNull("fieldId")) {
                fieldNodes.add(node.get("metadata"));
              } else if ("Page".equals(t) && page[0] == null) {
                page[0] = node.get("metadata");
              } else if ("Crudl".equals(t) && crudl[0] == null) {
                crudl[0] = node.get("metadata");
              } else if ("Button".equals(t) && node.path("metadata").hasNonNull("actionId")) {
                String actionId = node.get("metadata").get("actionId").asText();
                buttonsByAction.putIfAbsent(
                    actionId, node.get("metadata").path("label").asText(null));
              }
            });
      }
    }

    JsonNode values =
        state[0] != null
            ? state[0]
            : (serverSide[0] != null && serverSide[0].path("initialData").isObject()
                ? serverSide[0].get("initialData")
                : om.createObjectNode());

    // Fields (deduped by id, declaration order).
    ArrayNode fields = out.putArray("fields");
    java.util.Set<String> seenField = new java.util.HashSet<>();
    for (JsonNode md : fieldNodes) {
      String id = md.get("fieldId").asText();
      if (!seenField.add(id)) continue;
      ObjectNode f = fields.addObject();
      f.put("id", id);
      f.put("label", md.path("label").asText(id));
      f.put("dataType", md.path("dataType").asText("string"));
      f.put("stereotype", md.path("stereotype").asText("regular"));
      f.put("required", md.path("required").asBoolean(false));
      f.put("readOnly", md.path("readOnly").asBoolean(false));
      if (values.has(id)) f.set("value", values.get(id));
      if (md.path("options").isArray() && md.get("options").size() > 0) {
        ArrayNode opts = f.putArray("options");
        for (JsonNode o : md.get("options")) {
          ObjectNode oo = opts.addObject();
          oo.set("value", o.get("value"));
          oo.put("label", o.path("label").asText(o.path("value").asText("")));
        }
      }
    }

    // Actions: ids the component claims (RBAC already applied server-side), labels from buttons.
    ArrayNode actions = out.putArray("actions");
    java.util.Set<String> seenAction = new java.util.HashSet<>();
    if (serverSide[0] != null && serverSide[0].path("actions").isArray()) {
      for (JsonNode a : serverSide[0].get("actions")) {
        String id = a.path("id").asText(null);
        if (id == null || !seenAction.add(id)) continue;
        ObjectNode ao = actions.addObject();
        ao.put("id", id);
        ao.put(
            "label",
            buttonsByAction.getOrDefault(id, id) != null
                ? buttonsByAction.getOrDefault(id, id)
                : id);
        if (a.hasNonNull("shortcut") && !a.get("shortcut").asText().isEmpty())
          ao.put("shortcut", a.get("shortcut").asText());
        if (a.path("confirmationRequired").asBoolean(false)) ao.put("confirmationRequired", true);
        if (a.hasNonNull("href") && !a.get("href").asText().isEmpty())
          ao.put("href", a.get("href").asText());
      }
    }
    for (Map.Entry<String, String> e : buttonsByAction.entrySet()) {
      if (seenAction.add(e.getKey())) {
        ObjectNode ao = actions.addObject();
        ao.put("id", e.getKey());
        ao.put("label", e.getValue() != null ? e.getValue() : e.getKey());
      }
    }

    // Title / subtitle.
    String title = commandData(commands, "SetWindowTitle");
    if (title == null && page[0] != null) {
      title =
          page[0].hasNonNull("pageTitle")
              ? page[0].get("pageTitle").asText()
              : page[0].path("title").asText(null);
    }
    if (title == null && crudl[0] != null) title = crudl[0].path("title").asText(null);

    out.put(
        "route",
        serverSide[0] != null ? normalizeRoute(serverSide[0].path("route").asText(null)) : null);
    out.put(
        "serverSideType",
        serverSide[0] != null ? serverSide[0].path("serverSideType").asText(null) : null);
    String pageType =
        serverSide[0] != null && serverSide[0].hasNonNull("pageType")
            ? serverSide[0].get("pageType").asText()
            : (page[0] != null ? page[0].path("pageType").asText(null) : null);
    out.put("pageType", pageType);
    out.put("wireVersion", inc.path("wireVersion").asText(null));
    out.put("title", title);
    out.put(
        "subtitle",
        page[0] != null && page[0].hasNonNull("subtitle")
            ? page[0].get("subtitle").asText()
            : (crudl[0] != null ? crudl[0].path("subtitle").asText(null) : null));
    out.set("state", values);

    if (crudl[0] != null) {
      ObjectNode listing = out.putObject("listing");
      listing.put("title", crudl[0].path("title").asText(null));
      listing.put("searchable", crudl[0].path("searchable").asBoolean(false));
      ArrayNode columns = listing.putArray("columns");
      if (crudl[0].path("columns").isArray()) {
        for (JsonNode c : crudl[0].get("columns")) {
          JsonNode md = c.has("metadata") ? c.get("metadata") : c;
          String id = md.hasNonNull("id") ? md.get("id").asText() : md.path("fieldId").asText(null);
          String label =
              md.hasNonNull("caption") ? md.get("caption").asText() : md.path("label").asText(null);
          if (id != null || label != null) {
            ObjectNode co = columns.addObject();
            co.put("id", id);
            co.put("label", label);
          }
        }
      }
      ArrayNode filters = listing.putArray("filters");
      if (crudl[0].path("filters").isArray()) {
        for (JsonNode fnode : crudl[0].get("filters")) {
          ObjectNode fo = filters.addObject();
          fo.put("id", fnode.path("fieldId").asText(null));
          fo.put("label", fnode.path("label").asText(fnode.path("fieldId").asText(null)));
          fo.put("dataType", fnode.path("dataType").asText("string"));
        }
      }
    }

    if (messages.isArray() && messages.size() > 0) {
      ArrayNode ms = out.putArray("messages");
      for (JsonNode m : messages) {
        ObjectNode mo = ms.addObject();
        mo.put(
            "text", m.hasNonNull("text") ? m.get("text").asText() : m.path("message").asText(""));
        mo.put("type", m.path("type").asText("info"));
      }
    }
    if (commands.isArray()) {
      ArrayNode cs = om.createArrayNode();
      for (JsonNode c : commands) {
        String type = c.path("type").asText(null);
        if (type != null && !"SetWindowTitle".equals(type)) {
          ObjectNode co = cs.addObject();
          co.put("type", type);
          co.set("data", c.get("data"));
        }
      }
      if (cs.size() > 0) out.set("commands", cs);
    }

    return out;
  }

  private static String commandData(JsonNode commands, String type) {
    if (!commands.isArray()) return null;
    for (JsonNode c : commands) {
      if (type.equals(c.path("type").asText(null))) {
        return c.hasNonNull("data") ? c.get("data").asText() : null;
      }
    }
    return null;
  }

  private static String mdType(JsonNode node) {
    JsonNode md = node.path("metadata");
    return md.isObject() && md.hasNonNull("type") ? md.get("type").asText() : null;
  }

  private interface NodeVisitor {
    void visit(JsonNode node);
  }

  private static void deepVisit(JsonNode node, NodeVisitor fn) {
    if (node == null || node.isNull()) return;
    if (node.isObject()) {
      fn.visit(node);
      for (JsonNode child : node) deepVisit(child, fn);
    } else if (node.isArray()) {
      for (JsonNode child : node) deepVisit(child, fn);
    }
  }
}
