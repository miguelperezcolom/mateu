package io.mateu.compose.api

import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/** Each platform provides its Ktor engine (desktop: CIO; later Android: OkHttp, iOS: Darwin, web: Js). */
expect fun createHttpClient(): HttpClient

/**
 * Multiplatform HTTP client for the Mateu sync endpoint (Ktor + kotlinx.serialization).
 * Wire contract unchanged: `POST /{baseUrl}/mateu/v3/sync/{route}` → `UIIncrementDto` JSON.
 */
class MateuApiClient(
    private val baseUrl: String,
    private val sessionId: String,
    private val http: HttpClient = createHttpClient(),
) {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    suspend fun runAction(
        route: String?,
        consumedRoute: String?,
        actionId: String?,
        serverSideType: String?,
        initiatorComponentId: String?,
        componentState: Map<String, Any?>,
        appState: Map<String, Any?>,
        parameters: Map<String, Any?>,
    ): JsonElement {
        val routeStripped = when {
            route != null && route.startsWith("/") -> route.substring(1)
            route != null -> route
            else -> ""
        }
        val urlSegment = if (routeStripped.isEmpty()) "_no_route" else routeStripped
        val bodyRoute = if (routeStripped.isEmpty()) "" else "/$routeStripped"

        val body = buildJsonObject {
            put("route", bodyRoute)
            put("consumedRoute", consumedRoute ?: "")
            put("actionId", actionId ?: "")
            // Omit null values so the JSON matches the web frontend's behaviour
            if (serverSideType != null) put("serverSideType", serverSideType)
            if (initiatorComponentId != null) put("initiatorComponentId", initiatorComponentId)
            put("componentState", anyToJson(componentState))
            put("appState", anyToJson(appState))
            put("parameters", anyToJson(parameters))
        }

        val url = "$baseUrl/mateu/v3/sync/$urlSegment"
        val payload = body.toString()
        println("[Mateu] --> POST $url")
        println("[Mateu]     body: $payload")

        val response = http.post(url) {
            contentType(ContentType.Application.Json)
            header("Accept", "application/json")
            header("X-Session-Id", sessionId)
            setBody(payload)
        }
        val text = response.bodyAsText()
        println("[Mateu] <-- ${response.status.value}")
        println(
            "[Mateu]     response (first 3000 chars): " +
                if (text.length > 3000) text.substring(0, 3000) + "..." else text,
        )
        if (response.status.value >= 400) {
            throw RuntimeException("HTTP ${response.status.value}: $text")
        }
        return json.parseToJsonElement(text)
    }

    suspend fun initialLoad(route: String?, appState: Map<String, Any?>): JsonElement =
        runAction(route, "_empty", "", null, "ux_main", emptyMap(), appState, emptyMap())

    suspend fun navigate(
        route: String?,
        consumedRoute: String?,
        serverSideType: String?,
        appState: Map<String, Any?>,
    ): JsonElement =
        runAction(route, consumedRoute ?: "_empty", "", serverSideType, "ux_main", emptyMap(), appState, emptyMap())
}

/** Converts the loosely-typed values held in componentState/parameters into JSON. */
private fun anyToJson(value: Any?): JsonElement = when (value) {
    null -> JsonNull
    is JsonElement -> value
    is String -> JsonPrimitive(value)
    is Boolean -> JsonPrimitive(value)
    is Int -> JsonPrimitive(value)
    is Long -> JsonPrimitive(value)
    is Double -> JsonPrimitive(value)
    is Float -> JsonPrimitive(value)
    is Map<*, *> -> buildJsonObject { value.forEach { (k, v) -> put(k.toString(), anyToJson(v)) } }
    is List<*> -> buildJsonArray { value.forEach { add(anyToJson(it)) } }
    else -> JsonPrimitive(value.toString())
}
