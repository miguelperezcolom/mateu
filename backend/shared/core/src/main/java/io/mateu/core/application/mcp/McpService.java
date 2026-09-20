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

  /** Load a screen (route) → flat projection. The load is dispatched as actionId "". */
  public ObjectNode describeScreen(String route, String baseUrl, HttpRequestFactory httpRequests) {
    return project(sync(rq(route, "", null, null), baseUrl, httpRequests));
  }

  /** Run an action on a screen → resulting projection. */
  public ObjectNode runAction(
      String route,
      String actionId,
      Map<String, Object> componentState,
      String baseUrl,
      HttpRequestFactory httpRequests) {
    return project(sync(rq(route, actionId, componentState, null), baseUrl, httpRequests));
  }

  /** Run the standard {@code search} action of a listing. */
  public ObjectNode search(
      String route,
      String searchText,
      Map<String, Object> filters,
      String baseUrl,
      HttpRequestFactory httpRequests) {
    Map<String, Object> params = searchText == null ? Map.of() : Map.of("searchText", searchText);
    return project(sync(rq(route, "search", filters, params), baseUrl, httpRequests));
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

  private void collectRoutes(JsonNode node, Map<String, String> out) {
    if (node == null) return;
    if (node.isObject()) {
      JsonNode md = node.path("metadata");
      if (md.isObject() && "App".equals(md.path("type").asText(null)))
        walkMenu(md.path("menu"), out);
      if (node.hasNonNull("route") && !node.get("route").asText().isEmpty()) {
        String r = McpProjection.normalizeRoute(node.get("route").asText());
        out.putIfAbsent(
            r,
            node.hasNonNull("caption") ? node.get("caption").asText() : (r.isEmpty() ? "Home" : r));
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
        out.putIfAbsent(
            r,
            item.hasNonNull("caption") ? item.get("caption").asText() : (r.isEmpty() ? "Home" : r));
      }
      walkMenu(item.path("submenus"), out);
      walkMenu(item.path("menu"), out);
    }
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
