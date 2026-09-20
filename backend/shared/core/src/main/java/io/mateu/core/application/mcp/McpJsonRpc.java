package io.mateu.core.application.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.mcp.McpService.HttpRequestFactory;
import java.util.Map;

/**
 * Minimal Model Context Protocol handler (JSON-RPC 2.0) for the native endpoint. Framework-neutral:
 * an adapter reads a JSON-RPC message off an HTTP request and calls {@link #handle}. Mirrors the
 * sidecar's {@code index.mjs} exactly (same protocol version + same 4 tools) so an agent sees the
 * same surface whether it talks to the sidecar or to a Mateu backend directly.
 */
public final class McpJsonRpc {

  public static final String PROTOCOL_VERSION = "2024-11-05";
  public static final String SERVER_NAME = "mateu-mcp";
  public static final String SERVER_VERSION = "0.1.0";

  private McpJsonRpc() {}

  /**
   * @return the response node, or {@code null} for a notification (no response).
   */
  public static JsonNode handle(
      JsonNode message,
      McpService svc,
      String baseUrl,
      HttpRequestFactory httpRequests,
      ObjectMapper om) {
    JsonNode idNode = message.get("id");
    boolean isNotification = idNode == null || idNode.isNull();
    String method = message.path("method").asText("");
    try {
      switch (method) {
        case "initialize":
          {
            ObjectNode result = om.createObjectNode();
            result.put("protocolVersion", PROTOCOL_VERSION);
            result.putObject("capabilities").putObject("tools");
            ObjectNode info = result.putObject("serverInfo");
            info.put("name", SERVER_NAME);
            info.put("version", SERVER_VERSION);
            return response(om, idNode, result);
          }
        case "notifications/initialized":
        case "initialized":
          return null;
        case "ping":
          return response(om, idNode, om.createObjectNode());
        case "tools/list":
          {
            ObjectNode result = om.createObjectNode();
            result.set("tools", tools(om));
            return response(om, idNode, result);
          }
        case "tools/call":
          {
            JsonNode params = message.path("params");
            String name = params.path("name").asText("");
            JsonNode args = params.path("arguments");
            JsonNode data = dispatch(svc, name, args, baseUrl, httpRequests);
            ObjectNode result = om.createObjectNode();
            ArrayNode content = result.putArray("content");
            ObjectNode text = content.addObject();
            text.put("type", "text");
            text.put("text", om.writerWithDefaultPrettyPrinter().writeValueAsString(data));
            return response(om, idNode, result);
          }
        default:
          if (isNotification) return null;
          return error(om, idNode, -32601, "Method not found: " + method);
      }
    } catch (Exception e) {
      String msg = e.getMessage() != null ? e.getMessage() : e.toString();
      if (isNotification) return null;
      if ("tools/call".equals(method)) {
        // MCP convention: a tool error is a result with isError, not a protocol error.
        ObjectNode result = om.createObjectNode();
        result.put("isError", true);
        ObjectNode text = result.putArray("content").addObject();
        text.put("type", "text");
        text.put("text", "Error: " + msg);
        return response(om, idNode, result);
      }
      return error(om, idNode, -32603, msg);
    }
  }

  private static JsonNode dispatch(
      McpService svc, String name, JsonNode args, String baseUrl, HttpRequestFactory httpRequests) {
    switch (name) {
      case "mateu_list_routes":
        return svc.listRoutes(baseUrl, httpRequests);
      case "mateu_describe_screen":
        return svc.describeScreen(args.path("route").asText(""), baseUrl, httpRequests);
      case "mateu_run_action":
        return svc.runAction(
            args.path("route").asText(""),
            args.path("actionId").asText(""),
            asMap(args.get("componentState")),
            baseUrl,
            httpRequests);
      case "mateu_search":
        return svc.search(
            args.path("route").asText(""),
            args.path("searchText").asText(""),
            asMap(args.get("filters")),
            baseUrl,
            httpRequests);
      default:
        throw new IllegalArgumentException("Unknown tool: " + name);
    }
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> asMap(JsonNode node) {
    if (node == null || !node.isObject()) return Map.of();
    return new com.fasterxml.jackson.databind.ObjectMapper().convertValue(node, Map.class);
  }

  private static ArrayNode tools(ObjectMapper om) {
    ArrayNode tools = om.createArrayNode();
    tools.add(
        tool(
            om,
            "mateu_list_routes",
            "List the navigable routes of the Mateu app (from its menu). Returns [{route, caption}].",
            objSchema(om)));
    ObjectNode describe = objSchema(om);
    strProp(describe, "route", "route relative to the mount, \"\" = home");
    required(describe, "route");
    tools.add(
        tool(
            om,
            "mateu_describe_screen",
            "Load a screen by route and return a flat description: title, fields (id, label, dataType, "
                + "required, value, options), actions (id, label), listing (if any), and current state.",
            describe));
    ObjectNode run = objSchema(om);
    strProp(run, "route", null);
    strProp(run, "actionId", null);
    run.with("properties").putObject("componentState").put("type", "object");
    required(run, "route", "actionId");
    tools.add(
        tool(
            om,
            "mateu_run_action",
            "Run an action (an action id from mateu_describe_screen), optionally seeding field values "
                + "via componentState. Returns the resulting screen projection.",
            run));
    ObjectNode search = objSchema(om);
    strProp(search, "route", null);
    strProp(search, "searchText", null);
    search.with("properties").putObject("filters").put("type", "object");
    required(search, "route");
    tools.add(
        tool(
            om,
            "mateu_search",
            "Search a listing screen with free text (and optional filter values). Returns the listing.",
            search));
    return tools;
  }

  private static ObjectNode tool(
      ObjectMapper om, String name, String description, ObjectNode schema) {
    ObjectNode t = om.createObjectNode();
    t.put("name", name);
    t.put("description", description);
    t.set("inputSchema", schema);
    return t;
  }

  private static ObjectNode objSchema(ObjectMapper om) {
    ObjectNode s = om.createObjectNode();
    s.put("type", "object");
    s.putObject("properties");
    return s;
  }

  private static void strProp(ObjectNode schema, String name, String description) {
    ObjectNode p = schema.with("properties").putObject(name);
    p.put("type", "string");
    if (description != null) p.put("description", description);
  }

  private static void required(ObjectNode schema, String... names) {
    ArrayNode req = schema.putArray("required");
    for (String n : names) req.add(n);
  }

  private static JsonNode response(ObjectMapper om, JsonNode id, JsonNode result) {
    if (id == null || id.isNull()) return null;
    ObjectNode r = om.createObjectNode();
    r.put("jsonrpc", "2.0");
    r.set("id", id);
    r.set("result", result);
    return r;
  }

  private static JsonNode error(ObjectMapper om, JsonNode id, int code, String message) {
    ObjectNode r = om.createObjectNode();
    r.put("jsonrpc", "2.0");
    r.set("id", id);
    ObjectNode err = r.putObject("error");
    err.put("code", code);
    err.put("message", message);
    return r;
  }
}
