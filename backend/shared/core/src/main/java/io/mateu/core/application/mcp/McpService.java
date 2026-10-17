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
      UIIncrementDto increment =
          service.runAction(baseUrl, rq, baseUrl, httpRequests.create(rq)).next().block();
      return objectMapper.valueToTree(increment);
    } catch (Throwable t) {
      throw new RuntimeException(
          "MCP sync failed for route '" + rq.route() + "': " + t.getMessage(), t);
    }
  }

  private ObjectNode project(JsonNode increment) {
    return McpProjection.project(increment, objectMapper);
  }
}
