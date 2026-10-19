package io.mateu.core.application.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * The native (in-process) host of the agent-operability plane: turns Model Context Protocol tool
 * calls into {@link MateuService} sync requests and projects the resulting wire with the SAME
 * {@link McpProjection} the sidecar uses. RBAC is enforced by {@code MateuService} over the passed
 * {@link HttpRequest} (the JWT), so an action a caller may not run never reaches the projection.
 *
 * <p>Plain class (constructed by the adapter controller and by tests), so it adds nothing to the
 * bean graph. See {@code design/riu-agent-operability-plan.md} (P3).
 */
public class McpService {

  /** The request attribute that marks a run as an MCP tool call. */
  public static final String MCP_REQUEST = "mateu.mcp.request";

  /**
   * Builds the concrete {@link HttpRequest} for a request from the (framework-specific) adapter —
   * the mvc controller wraps the servlet request (carrying the JWT for RBAC), a test wraps a fake.
   * Kept as a factory so core stays framework-neutral and the rq stored on the request matches the
   * rq passed to {@code runAction}.
   */
  public interface HttpRequestFactory {
    HttpRequest create(RunActionRqDto rq);
  }

  private final MateuService service;
  private final ObjectMapper objectMapper;

  public McpService(MateuService service, ObjectMapper objectMapper) {
    this.service = service;
    this.objectMapper = objectMapper;
  }

  /**
   * Load a screen (route) → flat projection. The load is dispatched as actionId "". Under an app
   * shell the route's first answer is the SHELL (aimed at the route); the screen is the content the
   * shell then loads — followed here exactly like the browser does.
   */
  public ObjectNode describeScreen(String route, String baseUrl, HttpRequestFactory httpRequests) {
    return project(content(route, baseUrl, httpRequests).increment());
  }

  /** Run an action on a screen → resulting projection. */
  public ObjectNode runAction(
      String route,
      String actionId,
      Map<String, Object> componentState,
      String baseUrl,
      HttpRequestFactory httpRequests) {
    return project(
        sync(
            content(route, baseUrl, httpRequests).action(actionId, componentState, null),
            baseUrl,
            httpRequests));
  }

  /** Run the standard {@code search} action of a listing. */
  public ObjectNode search(
      String route,
      String searchText,
      Map<String, Object> filters,
      String baseUrl,
      HttpRequestFactory httpRequests) {
    // The listing reads its search text from the COMPONENT STATE (where the search box writes it),
    // not from the parameters: sent only as a parameter, the agent's search came back unfiltered.
    Map<String, Object> state = new java.util.LinkedHashMap<>();
    if (filters != null) state.putAll(filters);
    if (searchText != null && !searchText.isEmpty()) state.put("searchText", searchText);
    Map<String, Object> params = searchText == null ? Map.of() : Map.of("searchText", searchText);
    return project(
        sync(
            content(route, baseUrl, httpRequests).action("search", state, params),
            baseUrl,
            httpRequests));
  }

  /** Navigable routes from the app menu on the root response → [{route, caption}]. */
  public ArrayNode listRoutes(String baseUrl, HttpRequestFactory httpRequests) {
    JsonNode increment = sync(rq("", "", null, null), baseUrl, httpRequests);
    java.util.LinkedHashMap<String, String> routes = new java.util.LinkedHashMap<>();
    collectRoutes(increment.path("fragments"), routes);
    routes.putIfAbsent("", "Home");
    ArrayNode out = objectMapper.createArrayNode();
    routes.forEach(
        (route, caption) -> {
          ObjectNode o = out.addObject();
          o.put("route", route);
          o.put("caption", caption);
        });
    return out;
  }

  /**
   * Where a screen lives and what its load answered. {@code request} is the load that answered the
   * screen itself — the route's own load, or (under an app shell) the content load the shell points
   * at — so an action on the screen is sent where the browser's content component sends it.
   */
  record Content(RunActionRqDto request, String serverSideType, JsonNode increment) {

    RunActionRqDto action(
        String actionId, Map<String, Object> componentState, Map<String, Object> parameters) {
      return RunActionRqDto.builder()
          .route(request.route())
          .consumedRoute(request.consumedRoute())
          .appState(Map.of())
          .actionId(actionId == null ? "" : actionId)
          .serverSideType(serverSideType != null ? serverSideType : request.serverSideType())
          .componentState(componentState == null ? Map.of() : componentState)
          .parameters(parameters == null ? Map.of() : parameters)
          .build();
    }
  }

  /** Bounds the shell → content (→ crud mediator → listing) chain; the browser nests no deeper. */
  private static final int MAX_SHELL_HOPS = 4;

  /**
   * Loads a route and follows any app shell it answers to the content that shell loads: its {@code
   * homeRoute} / {@code homeConsumedRoute} / {@code homeServerSideType}, the same request the
   * shell's inner {@code mateu-ux} sends. Without it an agent asking for {@code orders} under a
   * root {@code @UI("")} app was described — and its actions run against — the shell itself.
   */
  private Content content(String route, String baseUrl, HttpRequestFactory httpRequests) {
    RunActionRqDto request = rq(route, "", null, null);
    JsonNode increment = sync(request, baseUrl, httpRequests);
    var visited = new java.util.HashSet<String>();
    for (int hop = 0; hop < MAX_SHELL_HOPS; hop++) {
      JsonNode app = appOf(increment);
      if (app == null) break;
      String homeRoute = app.path("homeRoute").asText(null);
      String homeBaseUrl = app.path("homeBaseUrl").asText("");
      if (homeRoute == null || (!homeBaseUrl.isBlank() && !homeBaseUrl.equals(baseUrl))) break;
      RunActionRqDto next =
          RunActionRqDto.builder()
              .route(homeRoute)
              .consumedRoute(app.path("homeConsumedRoute").asText(""))
              .serverSideType(
                  app.hasNonNull("homeServerSideType")
                      ? app.get("homeServerSideType").asText()
                      : app.path("serverSideType").asText(null))
              .actionId("")
              .componentState(Map.of())
              .appState(Map.of())
              .parameters(Map.of())
              .build();
      if (!visited.add(next.route() + "|" + next.consumedRoute() + "|" + next.serverSideType()))
        break;
      request = next;
      increment = sync(request, baseUrl, httpRequests);
    }
    return new Content(request, serverSideTypeOf(increment), increment);
  }

  /** The metadata of an App (shell) component in the answer, or null. */
  private static JsonNode appOf(JsonNode increment) {
    JsonNode[] found = {null};
    for (JsonNode fragment : increment.path("fragments")) {
      visit(
          fragment.path("component"),
          node -> {
            JsonNode md = node.path("metadata");
            if (found[0] == null && md.isObject() && "App".equals(md.path("type").asText(null)))
              found[0] = md;
          });
    }
    return found[0];
  }

  /** The serverSideType of the screen the answer renders (its first ServerSide node), or null. */
  private static String serverSideTypeOf(JsonNode increment) {
    String[] found = {null};
    for (JsonNode fragment : increment.path("fragments")) {
      visit(
          fragment.path("component"),
          node -> {
            if (found[0] == null
                && "ServerSide".equals(node.path("type").asText(null))
                && node.hasNonNull("serverSideType"))
              found[0] = node.get("serverSideType").asText();
          });
    }
    return found[0];
  }

  private static void visit(JsonNode node, java.util.function.Consumer<JsonNode> fn) {
    if (node == null || node.isNull()) return;
    if (node.isObject()) {
      fn.accept(node);
      for (JsonNode child : node) visit(child, fn);
    } else if (node.isArray()) {
      for (JsonNode child : node) visit(child, fn);
    }
  }

  private void collectRoutes(JsonNode node, Map<String, String> out) {
    if (node == null) return;
    if (node.isObject()) {
      JsonNode md = node.path("metadata");
      if (md.isObject() && "App".equals(md.path("type").asText(null)))
        walkMenu(md.path("menu"), out);
      if (node.hasNonNull("route") && !node.get("route").asText().isEmpty()) {
        String r = McpProjection.normalizeRoute(node.get("route").asText());
        out.putIfAbsent(r, captionOf(node, r));
      }
      for (JsonNode child : node) collectRoutes(child, out);
    } else if (node.isArray()) {
      for (JsonNode child : node) collectRoutes(child, out);
    }
  }

  private void walkMenu(JsonNode menu, Map<String, String> out) {
    if (!menu.isArray()) return;
    for (JsonNode item : menu) {
      JsonNode routeNode = item.hasNonNull("route") ? item.get("route") : item.path("path");
      if (routeNode != null && routeNode.isTextual() && !routeNode.asText().isEmpty()) {
        String r = McpProjection.normalizeRoute(routeNode.asText());
        out.putIfAbsent(r, captionOf(item, r));
      }
      walkMenu(item.path("submenus"), out);
      walkMenu(item.path("menu"), out);
    }
  }

  /** A menu option names its caption {@code label} on the wire ({@code caption} kept as well). */
  private static String captionOf(JsonNode item, String route) {
    if (item.hasNonNull("caption")) return item.get("caption").asText();
    if (item.hasNonNull("label") && !item.get("label").asText().isBlank())
      return item.get("label").asText();
    return route.isEmpty() ? "Home" : route;
  }

  private RunActionRqDto rq(
      String route,
      String actionId,
      Map<String, Object> componentState,
      Map<String, Object> parameters) {
    // MateuService resolves a mount route in leading-slash form ("/mcp-demo"); the root stays "".
    String normalized = McpProjection.normalizeRoute(route);
    String rqRoute = normalized.isEmpty() ? "" : "/" + normalized;
    return RunActionRqDto.builder()
        .route(rqRoute)
        .actionId(actionId == null ? "" : actionId)
        .componentState(componentState == null ? Map.of() : componentState)
        .appState(Map.of())
        .parameters(parameters == null ? Map.of() : parameters)
        .build();
  }

  private JsonNode sync(RunActionRqDto rq, String baseUrl, HttpRequestFactory httpRequests) {
    try {
      var httpRequest = httpRequests.create(rq);
      // marks the request as an MCP tool call (a server-side attribute, never client-settable):
      // the reserved __validate__ action is served to MCP callers only (RunActionUseCase)
      httpRequest.setAttribute(MCP_REQUEST, Boolean.TRUE);
      UIIncrementDto increment =
          service.runAction(baseUrl, rq, baseUrl, httpRequest).next().block();
      return objectMapper.valueToTree(increment);
    } catch (Throwable t) {
      // The sync endpoint's error boundary, applied here too: a refused request is the tool
      // error "Forbidden" (never the guard's own wording, which names roles and annotations);
      // anything else answers the generic message + reference as a screen message — never the
      // raw exception text, which may carry SQL, paths or other users' data.
      if (findCause(t, io.mateu.core.application.security.MateuForbiddenException.class)) {
        throw new io.mateu.uidl.UserFacingException("Forbidden");
      }
      var increment = objectMapper.createObjectNode();
      var message = increment.putArray("messages").addObject();
      message.put("variant", "error");
      var toast =
          io.mateu.core.application.runaction.ErrorBoundary.toMessage(t, rq.actionId(), null);
      message.put("title", toast.title());
      message.put("text", toast.text());
      return increment;
    }
  }

  private static boolean findCause(Throwable t, Class<? extends Throwable> type) {
    for (var c = t; c != null; c = c.getCause() == c ? null : c.getCause()) {
      if (type.isInstance(c)) {
        return true;
      }
    }
    return false;
  }

  // ── authoring (phase B): validate, preview, save ──────────────────────────────────────────

  /** {@code mateu_validate_uidl}: the app's {@code __validate__} answer for {@code yaml}. */
  public ObjectNode validate(String yaml, String baseUrl, HttpRequestFactory httpRequests) {
    return validation("", yaml, baseUrl, httpRequests);
  }

  /**
   * {@code mateu_preview_uidl}: validate, then — when the definition is a page with no error —
   * render it through {@code __preview__} (layout only: no view model, nothing saved) and project
   * the answer: {@code {rendered, validation, screen | reason}}.
   */
  public ObjectNode preview(
      String yaml, String route, String baseUrl, HttpRequestFactory httpRequests) {
    var out = objectMapper.createObjectNode();
    var validation = validation(route, yaml, baseUrl, httpRequests);
    var kind = validation.path("kind").asText("");
    if (!validation.path("valid").asBoolean()) {
      out.put("rendered", false);
      out.put("reason", "The definition has errors; fix them first.");
    } else if (!"component".equals(kind) && !"envelope".equals(kind)) {
      out.put("rendered", false);
      out.put("reason", "Only a page (a component, or a layout: envelope) can be previewed.");
    } else {
      var increment =
          sync(
              rq(
                  route,
                  io.mateu.core.application.runaction.RunActionUseCase.PREVIEW_ACTION,
                  null,
                  Map.of(
                      io.mateu.core.application.runaction.RunActionUseCase.PREVIEW_YAML_KEY, yaml)),
              baseUrl,
              httpRequests);
      out.put("rendered", true);
      out.set("screen", project(increment));
    }
    out.set("validation", validation);
    return out;
  }

  /**
   * {@code mateu_save_spec} (development mode only): validate and, with no error, write the file
   * into the first specs directory — the dev-mode watcher then reloads the open browsers.
   */
  public ObjectNode saveSpec(
      String path,
      String yaml,
      java.nio.file.Path specsDir,
      String baseUrl,
      HttpRequestFactory httpRequests)
      throws java.io.IOException {
    if (!io.mateu.core.application.authoring.SpecWriter.isAcceptable(path)) {
      throw new io.mateu.uidl.UserFacingException(
          io.mateu.core.application.authoring.SpecWriter.refusal(path));
    }
    if (io.mateu.core.application.authoring.SpecWriter.isCatalogueFile(path)) {
      throw new io.mateu.uidl.UserFacingException(
          io.mateu.core.application.authoring.SpecWriter.catalogueRefusal(path));
    }
    var out = objectMapper.createObjectNode();
    var validation = validation("", yaml, baseUrl, httpRequests);
    var kind = validation.path("kind");
    var refusal =
        io.mateu.core.application.authoring.SpecWriter.agentRefusal(
            kind.isTextual() ? kind.asText() : null, yaml);
    if (refusal != null) {
      // never written, and said loudly: an agent tried to author what decides a request
      org.slf4j.LoggerFactory.getLogger(McpService.class)
          .warn(
              "mateu_save_spec refused {}: {}",
              io.mateu.core.application.logging.LogSafe.of(path),
              refusal);
      out.put("saved", false);
      out.put("reason", refusal);
    } else if (!validation.path("valid").asBoolean()) {
      out.put("saved", false);
      out.put("reason", "The definition has errors; nothing was written.");
    } else {
      var bytes = io.mateu.core.application.authoring.SpecWriter.write(specsDir, path, yaml);
      out.put("saved", true);
      out.put("path", path);
      out.put("bytes", bytes);
    }
    out.set("validation", validation);
    return out;
  }

  private ObjectNode validation(
      String route, String yaml, String baseUrl, HttpRequestFactory httpRequests) {
    var increment =
        sync(
            rq(
                route,
                io.mateu.core.application.runaction.RunActionUseCase.VALIDATE_ACTION,
                null,
                Map.of(
                    io.mateu.core.application.runaction.RunActionUseCase.PREVIEW_YAML_KEY,
                    yaml == null ? "" : yaml)),
            baseUrl,
            httpRequests);
    var report =
        increment
            .path("appData")
            .path(io.mateu.core.application.runaction.RunActionUseCase.VALIDATION_KEY);
    if (!report.isObject()) {
      // refused, or failed: the increment's message says why
      var text = increment.path("messages").path(0).path("text").asText("validation failed");
      throw new io.mateu.uidl.UserFacingException(text);
    }
    return (ObjectNode) report;
  }

  // ── live UI push (phase C): list, pair, push, navigate, dispatch ────────────────────────────

  /** The caller of the tool call, as live UI push identifies it. */
  public io.mateu.core.application.agentpush.AgentCaller caller(HttpRequestFactory httpRequests) {
    return io.mateu.core.application.agentpush.AgentCaller.of(
        httpRequests.create(rq("", "", null, null)));
  }

  private static io.mateu.core.application.agentpush.AgentSessions sessions() {
    return io.mateu.core.application.agentpush.AgentSessions.shared();
  }

  /** {@code mateu_list_sessions}. */
  public ObjectNode listSessions(HttpRequestFactory httpRequests) {
    var out = objectMapper.createObjectNode();
    var list = out.putArray("sessions");
    for (var entry : sessions().visible(caller(httpRequests))) {
      list.add(entryNode(entry));
    }
    return out;
  }

  /** {@code mateu_pair_session}. */
  public ObjectNode pairSession(String code, HttpRequestFactory httpRequests) {
    var httpRequest = httpRequests.create(rq("", "", null, null));
    String address;
    try {
      address = httpRequest.getRemoteAddress();
    } catch (RuntimeException e) {
      address = null;
    }
    // failed attempts count per caller AND per client address (a rotated agent key is one address)
    return entryNode(
        sessions()
            .pair(io.mateu.core.application.agentpush.AgentCaller.of(httpRequest), code, address));
  }

  /** {@code mateu_push_ui}: validate first, then deliver a render-screen message. */
  public ObjectNode pushUi(
      String session,
      String yaml,
      String target,
      String title,
      String baseUrl,
      HttpRequestFactory httpRequests) {
    var where = target == null ? "content" : target;
    if (!java.util.List.of("content", "drawer", "dialog").contains(where)) {
      throw new io.mateu.uidl.UserFacingException(
          String.format(io.mateu.core.application.agentpush.AgentPush.INVALID_TARGET, where));
    }
    var caller = caller(httpRequests);
    sessions().requireReachable(caller, session);
    var validation = validation("", yaml, baseUrl, httpRequests);
    var kind = validation.path("kind").asText("");
    var out = objectMapper.createObjectNode();
    if (!validation.path("valid").asBoolean()) {
      out.put("delivered", false);
      out.put("reason", io.mateu.core.application.agentpush.AgentPush.HAS_ERRORS);
      out.set("validation", validation);
      return out;
    }
    if (!"component".equals(kind) && !"envelope".equals(kind)) {
      out.put("delivered", false);
      out.put("reason", io.mateu.core.application.agentpush.AgentPush.NOT_A_PAGE);
      out.set("validation", validation);
      return out;
    }
    var detail = new java.util.LinkedHashMap<String, Object>();
    detail.put("yaml", yaml);
    detail.put("target", where);
    if (title != null && !title.isBlank()) detail.put("title", title);
    deliver(
        caller,
        session,
        "render",
        io.mateu.core.application.agentpush.AgentPush.RENDER_EVENT,
        detail,
        "target=" + where);
    out.put("delivered", true);
    out.put("session", session);
    out.put("target", where);
    out.set("validation", validation);
    return out;
  }

  /** {@code mateu_navigate}. */
  public ObjectNode navigate(
      String session, Map<String, String> navigation, HttpRequestFactory httpRequests) {
    var detail = new java.util.LinkedHashMap<String, Object>();
    detail.put("route", navigation.get("route"));
    detail.put("consumedRoute", navigation.getOrDefault("consumedRoute", ""));
    for (var key : java.util.List.of("actionId", "baseUrl", "serverSideType", "uriPrefix")) {
      if (navigation.get(key) != null) detail.put(key, navigation.get(key));
    }
    deliver(
        caller(httpRequests),
        session,
        "navigate",
        io.mateu.core.application.agentpush.AgentPush.NAVIGATE_EVENT,
        detail,
        "route=" + navigation.get("route"));
    return delivered(session);
  }

  private static final java.util.regex.Pattern EVENT_NAME =
      java.util.regex.Pattern.compile("^[A-Za-z][A-Za-z0-9_.:-]{0,63}$");

  private static final java.util.Set<String> RESERVED_EVENTS =
      java.util.Set.of(
          io.mateu.core.application.agentpush.AgentPush.RENDER_EVENT,
          io.mateu.core.application.agentpush.AgentPush.NAVIGATE_EVENT,
          io.mateu.core.application.agentpush.AgentPush.CLOSE_EVENT,
          io.mateu.core.application.agentpush.AgentPush.STATUS_EVENT);

  /** {@code mateu_dispatch_event}. */
  public ObjectNode dispatchEvent(
      String session, String event, JsonNode detail, HttpRequestFactory httpRequests) {
    if (RESERVED_EVENTS.contains(event)) {
      throw new io.mateu.uidl.UserFacingException(
          String.format(io.mateu.core.application.agentpush.AgentPush.RESERVED_EVENT, event));
    }
    if (!EVENT_NAME.matcher(event).matches()) {
      throw new io.mateu.uidl.UserFacingException(
          String.format(io.mateu.core.application.agentpush.AgentPush.INVALID_EVENT, event));
    }
    if (io.mateu.core.application.agentpush.AgentPush.isFrameworkEvent(event)) {
      throw new io.mateu.uidl.UserFacingException(
          String.format(io.mateu.core.application.agentpush.AgentPush.FRAMEWORK_EVENT, event));
    }
    Map<String, Object> map =
        detail != null && detail.isObject()
            ? objectMapper.convertValue(
                detail, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {})
            : new java.util.LinkedHashMap<>();
    if (bytes(map) > io.mateu.core.application.agentpush.AgentPush.MAX_DETAIL_BYTES) {
      throw new io.mateu.uidl.UserFacingException(
          io.mateu.core.application.agentpush.AgentPush.DETAIL_TOO_LARGE);
    }
    deliver(caller(httpRequests), session, "event", event, map, "event=" + event);
    return delivered(session);
  }

  private void deliver(
      io.mateu.core.application.agentpush.AgentCaller caller,
      String session,
      String kind,
      String event,
      Map<String, Object> detail,
      String what) {
    var message =
        new io.mateu.core.application.agentpush.AgentSessions.Message(kind, event, detail);
    sessions().deliver(caller, session, message, what, bytes(message));
  }

  private int bytes(Object value) {
    try {
      return objectMapper.writeValueAsBytes(value).length;
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      return Integer.MAX_VALUE;
    }
  }

  private ObjectNode delivered(String session) {
    var out = objectMapper.createObjectNode();
    out.put("delivered", true);
    out.put("session", session);
    return out;
  }

  private ObjectNode entryNode(io.mateu.core.application.agentpush.AgentSessions.Entry entry) {
    var node = objectMapper.createObjectNode();
    node.put("session", entry.session());
    node.put("user", entry.user());
    node.put("route", entry.route());
    node.put("renderer", entry.renderer());
    node.put("connectedAt", entry.connectedAt());
    node.put("connected", entry.connected());
    node.put("paired", entry.paired());
    return node;
  }

  private ObjectNode project(JsonNode increment) {
    return McpProjection.project(increment, objectMapper);
  }
}
