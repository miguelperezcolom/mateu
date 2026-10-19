package io.mateu.core.application.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.authoring.AuthoringResources;
import io.mateu.core.application.authoring.ComponentSchemas;
import io.mateu.core.application.authoring.UidlValidator;
import io.mateu.core.application.mcp.McpService.HttpRequestFactory;
import io.mateu.core.application.runaction.ErrorBoundary;
import io.mateu.core.infra.dev.DevMode;
import io.mateu.uidl.UserFacingException;
import java.util.Map;

/**
 * Minimal Model Context Protocol handler (JSON-RPC 2.0) for the native endpoint. Framework-neutral:
 * an adapter reads a JSON-RPC message off an HTTP request and calls {@link #handle}. Mirrors the
 * sidecar's {@code index.mjs} exactly (same protocol version, same tools, same resources) so an
 * agent sees the same surface whether it talks to the sidecar or to a Mateu backend directly.
 *
 * <p>Protocol version: {@value #PROTOCOL_VERSION}. Kept rather than bumped to a 2025 revision:
 * those add Streamable-HTTP session semantics (the {@code Mcp-Session-Id} / {@code
 * MCP-Protocol-Version} headers, a GET event stream) that this stateless POST endpoint does not
 * implement, and clients negotiate down to it.
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
    if (message == null || !message.isObject()) {
      return error(om, om.nullNode(), -32600, "Invalid Request");
    }
    JsonNode idNode = message.get("id");
    boolean isNotification = idNode == null || idNode.isNull();
    String method = message.path("method").asText("");
    try {
      switch (method) {
        case "initialize":
          {
            ObjectNode result = om.createObjectNode();
            result.put("protocolVersion", PROTOCOL_VERSION);
            ObjectNode capabilities = result.putObject("capabilities");
            capabilities.putObject("tools");
            capabilities.putObject("resources");
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
            result.set(
                "tools",
                tools(
                    om,
                    DevMode.enabled(),
                    io.mateu.core.application.agentpush.AgentPush.enabled()));
            return response(om, idNode, result);
          }
        case "resources/list":
          {
            ObjectNode result = om.createObjectNode();
            ArrayNode list = result.putArray("resources");
            for (var r : AuthoringResources.RESOURCES) {
              ObjectNode entry = list.addObject();
              entry.put("uri", r.uri());
              entry.put("name", r.name());
              entry.put("description", r.description());
              entry.put("mimeType", r.mimeType());
            }
            return response(om, idNode, result);
          }
        case "resources/read":
          {
            String uri = message.path("params").path("uri").asText(null);
            if (uri == null) {
              return error(om, idNode, -32602, "Invalid params: uri is required");
            }
            var resource = AuthoringResources.byUri(uri);
            if (resource == null) {
              return error(om, idNode, -32002, "Resource not found: " + uri);
            }
            ObjectNode result = om.createObjectNode();
            ObjectNode content = result.putArray("contents").addObject();
            content.put("uri", resource.uri());
            content.put("mimeType", resource.mimeType());
            content.put("text", AuthoringResources.text(resource.file()));
            return response(om, idNode, result);
          }
        case "tools/call":
          {
            JsonNode params = message.path("params");
            String name = params.path("name").asText("");
            JsonNode args = params.path("arguments");
            JsonNode data = dispatch(svc, name, args, baseUrl, httpRequests, om);
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
      if (isNotification) return null;
      String text = errorText(e, "tools/call".equals(method) ? message : null);
      if ("tools/call".equals(method)) {
        // MCP convention: a tool error is a result with isError, not a protocol error.
        ObjectNode result = om.createObjectNode();
        result.put("isError", true);
        ObjectNode content = result.putArray("content").addObject();
        content.put("type", "text");
        content.put("text", "Error: " + text);
        return response(om, idNode, result);
      }
      return error(om, idNode, -32603, text);
    }
  }

  /**
   * What a failed call tells the agent — the request path's error boundary: a mistake of the caller
   * ({@link UserFacingException}: an unknown tool, a missing argument, a refused path) is shown as
   * written; anything else is a generic text with a reference id, logged at ERROR under that id
   * (the raw message only with {@code mateu.errors.detailed} / MATEU_ERRORS_DETAILED).
   */
  static String errorText(Exception e, JsonNode call) {
    if (e instanceof UserFacingException userFacing) {
      return userFacing.getMessage();
    }
    var tool = call != null ? call.path("params").path("name").asText("") : "";
    var toast = ErrorBoundary.toMessage(e, "mcp:" + tool);
    return toast.text();
  }

  private static JsonNode dispatch(
      McpService svc,
      String name,
      JsonNode args,
      String baseUrl,
      HttpRequestFactory httpRequests,
      ObjectMapper om)
      throws Exception {
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
      case "mateu_list_components":
        return ComponentSchemas.list(args.path("query").asText(""), om);
      case "mateu_get_component_schema":
        return ComponentSchemas.schemaOf(argument(args, "type"), om);
      case "mateu_validate_uidl":
        return svc.validate(argument(args, "yaml"), baseUrl, httpRequests);
      case "mateu_preview_uidl":
        return svc.preview(
            argument(args, "yaml"), args.path("route").asText(""), baseUrl, httpRequests);
      case "mateu_list_sessions":
      case "mateu_pair_session":
      case "mateu_push_ui":
      case "mateu_navigate":
      case "mateu_dispatch_event":
        if (!io.mateu.core.application.agentpush.AgentPush.enabled()) {
          throw new UserFacingException("Unknown tool: " + name);
        }
        return push(svc, name, args, baseUrl, httpRequests);
      case "mateu_save_spec":
        {
          if (!DevMode.enabled()) {
            throw new UserFacingException("Unknown tool: " + name);
          }
          var dirs = DevMode.specsDirs();
          if (dirs.isEmpty()) {
            throw new UserFacingException(
                "No specs directory found (set " + DevMode.SPECS_DIR_PROPERTY + ").");
          }
          return svc.saveSpec(
              argument(args, "path"), argument(args, "yaml"), dirs.get(0), baseUrl, httpRequests);
        }
      default:
        throw new UserFacingException("Unknown tool: " + name);
    }
  }

  private static JsonNode push(
      McpService svc, String name, JsonNode args, String baseUrl, HttpRequestFactory httpRequests) {
    switch (name) {
      case "mateu_list_sessions":
        return svc.listSessions(httpRequests);
      case "mateu_pair_session":
        return svc.pairSession(argument(args, "code"), httpRequests);
      case "mateu_push_ui":
        {
          var session = argument(args, "session");
          var yaml = argument(args, "yaml");
          return svc.pushUi(
              session,
              yaml,
              optional(args, "target"),
              optional(args, "title"),
              baseUrl,
              httpRequests);
        }
      case "mateu_navigate":
        {
          var session = argument(args, "session");
          var navigation = new java.util.LinkedHashMap<String, String>();
          navigation.put("route", argument(args, "route"));
          for (var key :
              java.util.List.of(
                  "consumedRoute", "actionId", "baseUrl", "serverSideType", "uriPrefix")) {
            var value = optional(args, key);
            if (value != null) navigation.put(key, value);
          }
          return svc.navigate(session, navigation, httpRequests);
        }
      default:
        {
          var session = argument(args, "session");
          var event = argument(args, "event");
          return svc.dispatchEvent(session, event, args.get("detail"), httpRequests);
        }
    }
  }

  /** An optional string argument (null when absent or not a string). */
  private static String optional(JsonNode args, String name) {
    var value = args.get(name);
    return value != null && value.isTextual() ? value.asText() : null;
  }

  /** A required string argument, or the caller's mistake. */
  private static String argument(JsonNode args, String name) {
    var value = args.get(name);
    if (value == null || !value.isTextual()) {
      throw new UserFacingException("Missing argument " + UidlValidator.quote(name) + ".");
    }
    return value.asText();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> asMap(JsonNode node) {
    if (node == null || !node.isObject()) return Map.of();
    return new com.fasterxml.jackson.databind.ObjectMapper().convertValue(node, Map.class);
  }

  /**
   * The tool list — identical (names, descriptions, schemas, order) in the Java, .NET and Python
   * backends and the sidecar; pinned by {@code conformance/mcp/authoring.json}. {@code
   * mateu_save_spec} is listed only in development mode.
   */
  static ArrayNode tools(ObjectMapper om, boolean devMode) {
    return tools(om, devMode, false);
  }

  /**
   * The tool list: the base tools, then — with live UI push on — the push tools ({@code
   * conformance/mcp/push.json}), then {@code mateu_save_spec} in development mode.
   */
  static ArrayNode tools(ObjectMapper om, boolean devMode, boolean push) {
    ArrayNode tools = om.createArrayNode();
    tools.add(
        tool(
            om,
            "mateu_list_routes",
            "List the navigable routes of the Mateu app (derived from its menu). Returns [{route,"
                + " caption}].",
            objSchema(om)));
    ObjectNode describe = objSchema(om);
    strProp(describe, "route", "route relative to the mount, \"\" = home");
    required(describe, "route");
    tools.add(
        tool(
            om,
            "mateu_describe_screen",
            "Load a screen by route and return a flat description an agent can act on: title,"
                + " fields (id, label, dataType, required, value, options), actions (id, label),"
                + " listing (if any), and the current state. Use route \"\" for the home screen.",
            describe));
    ObjectNode run = objSchema(om);
    strProp(run, "route", null);
    strProp(run, "actionId", null);
    objProp(run, "componentState", "field id -> value; seeds/overrides form state");
    required(run, "route", "actionId");
    tools.add(
        tool(
            om,
            "mateu_run_action",
            "Run an action on a screen (an action id from mateu_describe_screen), optionally"
                + " seeding field values via componentState. Returns the resulting screen"
                + " projection (messages, navigation, new state).",
            run));
    ObjectNode search = objSchema(om);
    strProp(search, "route", null);
    strProp(search, "searchText", null);
    objProp(search, "filters", null);
    required(search, "route");
    tools.add(
        tool(
            om,
            "mateu_search",
            "Search a listing screen with free text (and optional filter values). Returns the"
                + " listing.",
            search));
    ObjectNode list = objSchema(om);
    strProp(list, "query", "optional: only the types whose name or description contains it");
    tools.add(
        tool(
            om,
            "mateu_list_components",
            "List the component types a YAML definition can use, each with a one-line description"
                + " and the names of its main attributes. Read mateu://guide first if you have not"
                + " authored Mateu YAML before.",
            list));
    ObjectNode schema = objSchema(om);
    strProp(schema, "type", "a component type (e.g. FormField) or any other schema definition");
    required(schema, "type");
    tools.add(
        tool(
            om,
            "mateu_get_component_schema",
            "Return the JSON Schema of one component type: every key it accepts with its value"
                + " type, plus every definition it references (enums, nested records). A"
                + " #/$defs/Component reference means any component.",
            schema));
    ObjectNode validate = objSchema(om);
    strProp(validate, "yaml", "the definition's YAML text");
    required(validate, "yaml");
    tools.add(
        tool(
            om,
            "mateu_validate_uidl",
            "Validate a YAML definition (a page, an app shell or any specs/ui file kind) without"
                + " rendering it. Returns {valid, kind, errors, warnings}; each issue has a code, a"
                + " message, a JSONPath and its line/column. Errors make the definition fail to"
                + " load; warnings are ignored keys, undeclared actions and references that do not"
                + " resolve.",
            validate));
    ObjectNode preview = objSchema(om);
    strProp(preview, "yaml", "the page's YAML text");
    strProp(preview, "route", "optional: the route to render it under (its access rules apply)");
    required(preview, "yaml");
    tools.add(
        tool(
            om,
            "mateu_preview_uidl",
            "Render a YAML page as the app would — layout only: no view model is bound and nothing"
                + " is saved — and return {rendered, screen, validation}: the screen projection"
                + " (title, fields, actions…) plus the validation report.",
            preview));
    if (push) {
      pushTools(om, tools);
    }
    if (devMode) {
      ObjectNode save = objSchema(om);
      strProp(save, "path", "relative to the specs directory, e.g. customers.yaml");
      strProp(save, "yaml", "the definition's YAML text");
      required(save, "path", "yaml");
      tools.add(
          tool(
              om,
              "mateu_save_spec",
              "Development mode only: validate a YAML definition and, when it has no errors, write"
                  + " it into the app's specs directory (path relative to it, e.g. customers.yaml"
                  + " or partials/address.yaml); live reload shows it in the open browsers. Paths"
                  + " outside the specs directory are refused.",
              save));
    }
    return tools;
  }

  /** The live UI push tools — identical everywhere; pinned by {@code conformance/mcp/push.json}. */
  static void pushTools(ObjectMapper om, ArrayNode tools) {
    String sessionDescription = "a session from mateu_list_sessions or mateu_pair_session";
    tools.add(
        tool(
            om,
            "mateu_list_sessions",
            "List the live UI sessions (browser tabs, app windows) this caller may send UI to: its"
                + " own (same signed-in user) and the ones paired to it with mateu_pair_session."
                + " Returns {sessions: [{session, user, route, renderer, connectedAt, connected,"
                + " paired}]}.",
            objSchema(om)));
    ObjectNode pair = objSchema(om);
    strProp(pair, "code", "the pairing code shown in the app, e.g. K7QF-4MZP");
    required(pair, "code");
    tools.add(
        tool(
            om,
            "mateu_pair_session",
            "Pair a live UI session with this caller, using the one-time code the user sees after"
                + " clicking \"Connect AI\" in the app. Returns the session; it can then be addressed"
                + " by mateu_push_ui, mateu_navigate and mateu_dispatch_event. The code expires in"
                + " minutes and works once.",
            pair));
    ObjectNode pushUi = objSchema(om);
    strProp(pushUi, "session", sessionDescription);
    strProp(pushUi, "yaml", "the page's YAML text");
    ObjectNode target = pushUi.with("properties").putObject("target");
    target.put("type", "string");
    target.putArray("enum").add("content").add("drawer").add("dialog");
    target.put("description", "where to show it (default content)");
    strProp(pushUi, "title", "optional: the drawer's or dialog's header");
    required(pushUi, "session", "yaml");
    tools.add(
        tool(
            om,
            "mateu_push_ui",
            "Show a screen in a live UI session: validate the YAML page first (nothing is sent when"
                + " it has errors), then render it in that tab, in the content area (default), a"
                + " drawer or a dialog. Layout only: no view model is bound. Returns {delivered,"
                + " session, target, validation} or {delivered: false, reason, validation}.",
            pushUi));
    ObjectNode navigate = objSchema(om);
    strProp(navigate, "session", sessionDescription);
    strProp(navigate, "route", "the target route, e.g. /orders/42");
    strProp(
        navigate, "consumedRoute", "optional: the route consumed by the app shell (usually \"\")");
    strProp(navigate, "actionId", "optional: an action to run on arrival");
    strProp(navigate, "baseUrl", "optional: the base URL of the target micro-frontend");
    strProp(navigate, "serverSideType", "optional: the server-side type of the target UI");
    strProp(navigate, "uriPrefix", "optional: the URI prefix (usually \"\")");
    required(navigate, "session", "route");
    tools.add(
        tool(
            om,
            "mateu_navigate",
            "Navigate a live UI session to a route of the app, like a click on the menu entry"
                + " carrying these fields. Returns {delivered, session}.",
            navigate));
    ObjectNode dispatch = objSchema(om);
    strProp(dispatch, "session", sessionDescription);
    strProp(dispatch, "event", "the event name, e.g. highlight-row");
    objProp(dispatch, "detail", "optional: the event's detail");
    required(dispatch, "session", "event");
    tools.add(
        tool(
            om,
            "mateu_dispatch_event",
            "Dispatch a named UI event in a live UI session, for the components that subscribe to"
                + " it (@SubscribeTo). The built-in events are reserved: use mateu_push_ui and"
                + " mateu_navigate for them. Returns {delivered, session}.",
            dispatch));
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
    s.put("additionalProperties", false);
    return s;
  }

  private static void objProp(ObjectNode schema, String name, String description) {
    ObjectNode p = schema.with("properties").putObject(name);
    p.put("type", "object");
    if (description != null) p.put("description", description);
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
