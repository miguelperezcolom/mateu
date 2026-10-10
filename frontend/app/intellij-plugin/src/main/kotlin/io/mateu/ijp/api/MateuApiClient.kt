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
 * parameters}` and header `X-Session-Id` (+ `Authorization: Bearer …` when [tokenProvider] has a token).
 *
 * A 401 is answered ONCE: first the [tokenProvider] (refresh / sign in), then the legacy
 * [SessionGuard] hook; when either produces new credentials the request is REBUILT (so it carries the
 * new token) and retried a single time.
 */
class MateuApiClient(
    private val baseUrl: String,
    private val sessionId: String,
    private val mapper: ObjectMapper = ObjectMapper(),
    /** Credentials: a Bearer token is sent on every Mateu call when the provider has one. */
    var tokenProvider: TokenProvider = TokenProvider.NONE,
) {
    /** Host hook: told ONCE when the server's `wireVersion` is another major (see [WireVersion]). */
    var onWireMismatch: ((String) -> Unit)? = null

    @Volatile private var wireReported = false

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
        log("[Mateu] --> POST $url")
        log("[Mateu]     body: $json")

        fun request(token: String?): HttpRequest {
            val b = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("X-Session-Id", sessionId)
            bearer(token)?.let { b.header("Authorization", it) }
            return b.POST(HttpRequest.BodyPublishers.ofString(json)).build()
        }

        val token = tokenProvider.accessToken()
        var response = http.send(request(token), HttpResponse.BodyHandlers.ofString())
        // Session expiry / missing credentials: one chance to re-authenticate, then retry once.
        if (response.statusCode() == 401 &&
            (tokenProvider.onUnauthorized(token) || SessionGuard.handleSessionExpired())
        ) {
            response = http.send(request(tokenProvider.accessToken()), HttpResponse.BodyHandlers.ofString())
        }
        if (response.statusCode() == 401) throw UnauthorizedException(url)
        val responseBody = response.body()
        log("[Mateu] <-- ${response.statusCode()}")
        log(
            "[Mateu]     response (first 3000 chars): " +
                if (responseBody.length > 3000) responseBody.substring(0, 3000) + "..." else responseBody,
        )
        if (response.statusCode() >= 400) {
            throw RuntimeException("HTTP ${response.statusCode()}: $responseBody")
        }
        val tree = mapper.readTree(responseBody)
        observeWireVersion(tree)
        return tree
    }

    /** The first response of another wire major is reported (once); rendering goes on regardless. */
    internal fun observeWireVersion(tree: JsonNode?) {
        if (wireReported || tree == null || !tree.isObject) return
        val message = WireVersion.mismatch(tree.path("wireVersion").takeIf { it.isTextual }?.asText()) ?: return
        wireReported = true
        System.err.println("[Mateu] $message")
        onWireMismatch?.invoke(message)
    }

    /**
     * Fetch an arbitrary (non-Mateu) REST endpoint — the client-side leg of @RestAction/@RestData.
     * No Mateu session headers; returns the parsed JSON body. Throws on a non-2xx response.
     */
    fun fetchExternal(url: String, method: String, headers: Map<String, String>, body: String?): JsonNode {
        val builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(60))
            .header("Accept", "application/json")
        headers.forEach { (k, v) -> builder.header(k, v) }
        val publisher =
            if (method == "GET" || method == "HEAD") HttpRequest.BodyPublishers.noBody()
            else HttpRequest.BodyPublishers.ofString(body ?: "")
        if (method != "GET" && method != "HEAD" && !body.isNullOrBlank()) builder.header("Content-Type", "application/json")
        val request = builder.method(method, publisher).build()
        val response = http.send(request, HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() >= 400) throw RuntimeException("HTTP ${response.statusCode()}")
        return mapper.readTree(response.body())
    }

    private fun log(line: String) {
        if (VERBOSE) println(line)
    }

    fun initialLoad(route: String?, appState: Map<String, Any?>): JsonNode =
        runAction(route, "_empty", "", null, "ux_main", emptyMap(), appState, emptyMap())

    fun navigate(route: String?, consumedRoute: String?, serverSideType: String?, appState: Map<String, Any?>): JsonNode =
        runAction(route, consumedRoute ?: "_empty", "", serverSideType, "ux_main", emptyMap(), appState, emptyMap())

    companion object {
        /** Wire logging to stdout (the bodies can carry personal data and tokens' effects): opt-in
         *  with `-Dmateu.debug=true`. */
        val VERBOSE: Boolean = System.getProperty("mateu.debug").toBoolean()
    }
}

/** The backend kept answering 401 after the one re-authentication attempt. */
class UnauthorizedException(url: String) :
    RuntimeException("Not authorized by the Mateu backend ($url). Sign in from Settings | Tools | Mateu.")
