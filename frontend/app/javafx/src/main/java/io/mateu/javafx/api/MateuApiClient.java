package io.mateu.javafx.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class MateuApiClient {

    private final String baseUrl;
    private final String sessionId;
    private final HttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public MateuApiClient(String baseUrl, String sessionId) {
        this.baseUrl = baseUrl;
        this.sessionId = sessionId;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    public JsonNode runAction(
            String route,
            String consumedRoute,
            String actionId,
            String serverSideType,
            String initiatorComponentId,
            Map<String, Object> componentState,
            Map<String, Object> appState,
            Map<String, Object> parameters) throws Exception {

        String routeStripped = (route != null && route.startsWith("/"))
                ? route.substring(1) : (route != null ? route : "");

        String urlSegment = routeStripped.isEmpty() ? "_no_route" : routeStripped;
        String bodyRoute = routeStripped.isEmpty() ? "" : "/" + routeStripped;

        Map<String, Object> body = new HashMap<>();
        body.put("route", bodyRoute);
        body.put("consumedRoute", consumedRoute != null ? consumedRoute : "");
        body.put("actionId", actionId != null ? actionId : "");
        body.put("serverSideType", serverSideType);
        body.put("initiatorComponentId", initiatorComponentId);
        body.put("componentState", componentState != null ? componentState : Map.of());
        body.put("appState", appState != null ? appState : Map.of());
        body.put("parameters", parameters != null ? parameters : Map.of());

        String json = mapper.writeValueAsString(body);
        String url = baseUrl + "/mateu/v3/sync/" + urlSegment;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("X-Session-Id", sessionId)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }

        return mapper.readTree(response.body());
    }

    public JsonNode initialLoad(String route) throws Exception {
        return runAction(route, "", "", null, "ux_main", Map.of(), Map.of(), Map.of());
    }

    public JsonNode navigate(String route, String consumedRoute, String serverSideType) throws Exception {
        return runAction(route, consumedRoute != null ? consumedRoute : "", "",
                serverSideType, "ux_main", Map.of(), Map.of(), Map.of());
    }
}
