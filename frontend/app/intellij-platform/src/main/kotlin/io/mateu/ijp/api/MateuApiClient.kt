package io.mateu.ijp.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * HTTP client for the Mateu sync endpoint. Framework-neutral port of the JavaFX renderer's client
 * (`frontend/app/javafx/.../api/MateuApiClient.java`): plain `java.net.http.HttpClient` + Jackson,
 * parsing the `UIIncrementDto` as an untyped [JsonNode] tree.
 *
 * Wire contract: `POST {baseUrl}/mateu/v3/sync/{route|_no_route}` with a JSON body of
 * `{route, consumedRoute, actionId, serverSideType, initiatorComponentId, componentState, appState,
 * parameters}` and header `X-Session-Id`.
 */
class MateuApiClient(
    private val baseUrl: String,
    private val sessionId: String,
    private val mapper: ObjectMapper = ObjectMapper(),
) {
    private val http: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30))
        .build()

    fun runAction(
        route: String?,
        consumedRoute: String?,
        actionId: String?,
        serverSideType: String?,
        initiatorComponentId: String?,
        componentState: Map<String, Any?>,
        appState: Map<String, Any?>,
        parameters: Map<String, Any?>,
    ): JsonNode {
        val routeStripped = when {
            route == null -> ""
            route.startsWith("/") -> route.substring(1)
            else -> route
        }
        val urlSegment = if (routeStripped.isEmpty()) "_no_route" else routeStripped
        val bodyRoute = if (routeStripped.isEmpty()) "" else "/$routeStripped"

        val body = LinkedHashMap<String, Any?>()
        body["route"] = bodyRoute
        body["consumedRoute"] = consumedRoute ?: ""
        body["actionId"] = actionId ?: ""
        body["serverSideType"] = serverSideType
        body["initiatorComponentId"] = initiatorComponentId
        body["componentState"] = componentState
        body["appState"] = appState
        body["parameters"] = parameters
        // Omit null values so the JSON matches the web frontend's behaviour.
        body.values.removeIf { it == null }

        val json = mapper.writeValueAsString(body)
        val url = "$baseUrl/mateu/v3/sync/$urlSegment"
        println("[Mateu] --> POST $url")
        println("[Mateu]     body: $json")

        val request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(60))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .header("X-Session-Id", sessionId)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build()

        val response = http.send(request, HttpResponse.BodyHandlers.ofString())
        val responseBody = response.body()
        println("[Mateu] <-- ${response.statusCode()}")
        println(
            "[Mateu]     response (first 3000 chars): " +
                if (responseBody.length > 3000) responseBody.substring(0, 3000) + "..." else responseBody,
        )
        if (response.statusCode() >= 400) {
            throw RuntimeException("HTTP ${response.statusCode()}: $responseBody")
        }
        return mapper.readTree(responseBody)
    }

    fun initialLoad(route: String?, appState: Map<String, Any?>): JsonNode =
        runAction(route, "_empty", "", null, "ux_main", emptyMap(), appState, emptyMap())

    fun navigate(route: String?, consumedRoute: String?, serverSideType: String?, appState: Map<String, Any?>): JsonNode =
        runAction(route, consumedRoute ?: "_empty", "", serverSideType, "ux_main", emptyMap(), appState, emptyMap())
}
