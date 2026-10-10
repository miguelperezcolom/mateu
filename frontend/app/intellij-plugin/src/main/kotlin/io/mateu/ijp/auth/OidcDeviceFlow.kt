package io.mateu.ijp.auth

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.time.Duration

/**
 * OAuth 2.0 Device Authorization Grant (RFC 8628) against an OpenID Connect provider — the sign-in
 * flow that suits an IDE: no redirect URI to register, the user approves in their own browser.
 *
 * Platform-free on purpose (plain `java.net.http` + Jackson), so it is unit-tested against a local
 * HTTP server; [io.mateu.ijp.auth.MateuAuthService] adds the IDE pieces (browser, progress, PasswordSafe).
 */
class OidcDeviceFlow(
    private val config: OidcConfig,
    private val http: HttpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build(),
    private val mapper: ObjectMapper = ObjectMapper(),
    /** Injectable for tests: how to wait between polls. */
    private val sleeper: (Long) -> Unit = { Thread.sleep(it) },
) {

    data class Endpoints(val deviceAuthorization: String, val token: String)

    data class DeviceCode(
        val deviceCode: String,
        val userCode: String,
        val verificationUri: String,
        val verificationUriComplete: String?,
        val intervalSeconds: Long,
        val expiresInSeconds: Long,
    ) {
        /** The page to open: the "complete" URI pre-fills the user code when the provider offers it. */
        val browseUri: String get() = verificationUriComplete ?: verificationUri
    }

    data class Tokens(val accessToken: String, val refreshToken: String?, val expiresInSeconds: Long?)

    class OidcException(message: String) : RuntimeException(message)

    /** Explicit endpoints win; otherwise they come from `{issuer}/.well-known/openid-configuration`. */
    fun endpoints(): Endpoints {
        val device = config.deviceAuthorizationEndpoint?.ifBlank { null }
        val token = config.tokenEndpoint?.ifBlank { null }
        if (device != null && token != null) return Endpoints(device, token)
        val issuer = config.issuer?.trimEnd('/')?.ifBlank { null }
            ?: throw OidcException("Configure an OIDC issuer (or both the device and token endpoints).")
        val discovery = getJson("$issuer/.well-known/openid-configuration")
        return Endpoints(
            device ?: discovery.path("device_authorization_endpoint").textOrNull()
                ?: throw OidcException("The provider at $issuer does not advertise a device_authorization_endpoint."),
            token ?: discovery.path("token_endpoint").textOrNull()
                ?: throw OidcException("The provider at $issuer does not advertise a token_endpoint."),
        )
    }

    /** Step 1: ask for a device code + the user code the user confirms in the browser. */
    fun start(endpoints: Endpoints = endpoints()): DeviceCode {
        val form = mutableMapOf("client_id" to config.clientId)
        config.scope?.ifBlank { null }?.let { form["scope"] = it }
        val (status, body) = postForm(endpoints.deviceAuthorization, form)
        if (status !in 200..299) throw OidcException(errorOf(body) ?: "Device authorization failed (HTTP $status).")
        return DeviceCode(
            deviceCode = body.path("device_code").textOrNull() ?: throw OidcException("No device_code in the response."),
            userCode = body.path("user_code").asText(""),
            verificationUri = body.path("verification_uri").textOrNull()
                ?: body.path("verification_url").textOrNull() // Google's legacy spelling
                ?: throw OidcException("No verification_uri in the response."),
            verificationUriComplete = body.path("verification_uri_complete").textOrNull(),
            intervalSeconds = body.path("interval").asLong(5).coerceAtLeast(1),
            expiresInSeconds = body.path("expires_in").asLong(600),
        )
    }

    /**
     * Step 2: poll the token endpoint until the user approves (or denies / the code expires).
     * Honours `authorization_pending` and `slow_down` (+5s per RFC 8628 §3.5). [cancelled] is checked
     * before every poll so an IDE progress indicator can abort it.
     */
    fun poll(endpoints: Endpoints, code: DeviceCode, cancelled: () -> Boolean = { false }): Tokens {
        var interval = code.intervalSeconds
        var waited = 0L
        while (true) {
            if (cancelled()) throw OidcException("Sign-in cancelled.")
            if (waited >= code.expiresInSeconds) throw OidcException("The sign-in code expired. Try again.")
            sleeper(interval * 1000)
            waited += interval
            if (cancelled()) throw OidcException("Sign-in cancelled.")
            val (status, body) = postForm(
                endpoints.token,
                mapOf(
                    "grant_type" to DEVICE_GRANT,
                    "device_code" to code.deviceCode,
                    "client_id" to config.clientId,
                ),
            )
            if (status in 200..299) return tokensOf(body)
            when (body.path("error").asText("")) {
                "authorization_pending" -> continue
                "slow_down" -> interval += 5
                "access_denied" -> throw OidcException("Sign-in was denied.")
                "expired_token" -> throw OidcException("The sign-in code expired. Try again.")
                else -> throw OidcException(errorOf(body) ?: "Token request failed (HTTP $status).")
            }
        }
    }

    /** Exchange a refresh token for a fresh access token; null when the provider refuses it. */
    fun refresh(refreshToken: String, endpoints: Endpoints = endpoints()): Tokens? {
        val form = mutableMapOf(
            "grant_type" to "refresh_token",
            "refresh_token" to refreshToken,
            "client_id" to config.clientId,
        )
        val (status, body) = postForm(endpoints.token, form)
        if (status !in 200..299) return null
        return tokensOf(body).let { if (it.refreshToken == null) it.copy(refreshToken = refreshToken) else it }
    }

    private fun tokensOf(body: JsonNode) = Tokens(
        // Mateu backends validate a JWT bearer; prefer the access token, fall back to the id token
        // (some providers issue opaque access tokens for clients without an API audience).
        accessToken = body.path("access_token").textOrNull() ?: body.path("id_token").textOrNull()
            ?: throw OidcException("No access_token in the token response."),
        refreshToken = body.path("refresh_token").textOrNull(),
        expiresInSeconds = body.path("expires_in").takeIf { it.isNumber }?.asLong(),
    )

    private fun errorOf(body: JsonNode): String? =
        body.path("error_description").textOrNull() ?: body.path("error").textOrNull()

    private fun getJson(url: String): JsonNode {
        val req = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(20))
            .header("Accept", "application/json").GET().build()
        val res = http.send(req, HttpResponse.BodyHandlers.ofString())
        if (res.statusCode() !in 200..299) throw OidcException("OIDC discovery failed (HTTP ${res.statusCode()}) at $url")
        return mapper.readTree(res.body())
    }

    private fun postForm(url: String, form: Map<String, String>): Pair<Int, JsonNode> {
        val encoded = form.entries.joinToString("&") { (k, v) ->
            URLEncoder.encode(k, StandardCharsets.UTF_8) + "=" + URLEncoder.encode(v, StandardCharsets.UTF_8)
        }
        val req = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(20))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(encoded)).build()
        val res = http.send(req, HttpResponse.BodyHandlers.ofString())
        val body = runCatching { mapper.readTree(res.body()) }.getOrNull() ?: mapper.createObjectNode()
        return res.statusCode() to body
    }

    companion object {
        const val DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code"
    }
}

/** What the device flow needs; read from the project's Mateu settings. */
data class OidcConfig(
    val issuer: String?,
    val clientId: String,
    val scope: String? = "openid profile offline_access",
    val deviceAuthorizationEndpoint: String? = null,
    val tokenEndpoint: String? = null,
)

private fun JsonNode.textOrNull(): String? = if (isTextual && asText().isNotBlank()) asText() else null
