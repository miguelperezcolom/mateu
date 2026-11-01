package io.mateu.ijp.auth

import junit.framework.TestCase
import java.io.File
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

/**
 * Opt-in LIVE probe of the desktop sign-in against a real OpenID Connect provider (e.g. a local
 * Keycloak with the OAuth 2.0 Device Authorization Grant enabled on the client), the way
 * AgentPushLiveProbeTest probes a live backend. Skipped unless `-Pmateu.live.oidc` is set:
 *
 *   ./gradlew test --tests '*OidcLiveProbeTest' \
 *     -Pmateu.live.oidc=<issuerA>|<backendA>,<issuerB>|<backendB> \
 *     -Pmateu.live.oidc.handoff=/tmp/oidc-handoff   (where each user code is written for the approver)
 *
 * For each UI (issuer + backend) it runs the plugin's own [OidcDeviceFlow] — device code, wait for the
 * approval (someone, or a browser script, confirms the code at the verification page), token — calls
 * the backend with the access token, then refreshes it. With two UIs it then checks the per-UI
 * sessions ([OidcSessions]): switching keeps both signed in, and one UI's refresh token is refused by
 * the other's provider (why sessions are keyed by issuer too).
 */
class OidcLiveProbeTest : TestCase() {

    private val spec = System.getProperty("mateu.live.oidc")?.ifBlank { null }
    private val handoff = File(System.getProperty("mateu.live.oidc.handoff") ?: "/tmp/mateu-oidc-handoff")
    private val http = HttpClient.newHttpClient()

    private class MapStore : OidcSessions.SecretStore {
        val map = mutableMapOf<String, String>()
        override fun get(account: String) = map[account]
        override fun set(account: String, secret: String?) {
            if (secret == null) map.remove(account) else map[account] = secret
        }
    }

    private fun backendStatus(backend: String, token: String, route: String): Int {
        val rq = HttpRequest.newBuilder(URI.create("$backend/mateu/v3/sync/$route"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer $token")
            .POST(HttpRequest.BodyPublishers.ofString("""{"route":"/$route","actionId":"","componentState":{}}"""))
            .build()
        return http.send(rq, HttpResponse.BodyHandlers.discarding()).statusCode()
    }

    fun testDeviceSignInRefreshAndPerUiSessions() {
        if (spec == null) return // opt-in
        val uis = spec.split(',').map { it.split('|').let { (issuer, backend) -> issuer to backend } }
        val sessions = OidcSessions(MapStore())
        val keys = mutableListOf<OidcSessions.SessionKey>()
        for ((issuer, backend) in uis) {
            val flow = OidcDeviceFlow(OidcConfig(issuer = issuer, clientId = "mateu-app"))
            val endpoints = flow.endpoints()
            val code = flow.start(endpoints)
            handoff.writeText("${code.browseUri}\n${code.userCode}\n")
            println("LIVE device code for $issuer: ${code.userCode} at ${code.verificationUri}")
            val tokens = flow.poll(endpoints, code)
            java.nio.file.Files.deleteIfExists(handoff.toPath())
            assertNotNull("refresh token from $issuer", tokens.refreshToken)
            println("LIVE signed in at $issuer, access token expires in ${tokens.expiresInSeconds}s")
            assertEquals("the role-gated page with the token ($backend)", 200, backendStatus(backend, tokens.accessToken, "staff"))
            val key = OidcSessions.SessionKey.of(backend, issuer, "mateu-app")
            sessions.rememberAccessToken(key, tokens.accessToken)
            sessions.storeRefreshToken(key, tokens.refreshToken)
            keys += key

            val refreshed = flow.refresh(sessions.refreshToken(key)!!, endpoints)
            assertNotNull("refresh at $issuer", refreshed)
            assertFalse("a new access token", refreshed!!.accessToken == tokens.accessToken)
            assertEquals(200, backendStatus(backend, refreshed.accessToken, "staff"))
            sessions.rememberAccessToken(key, refreshed.accessToken)
            refreshed.refreshToken?.let { sessions.storeRefreshToken(key, it) }
            println("LIVE refreshed at $issuer")
        }
        if (keys.size >= 2) {
            val (a, b) = keys
            // switching UIs: both still signed in, each with its own token
            assertTrue(sessions.isSignedIn(a))
            assertTrue(sessions.isSignedIn(b))
            assertFalse(sessions.accessToken(a) == sessions.accessToken(b))
            // B's backend refuses A's token (another realm's signature/issuer)
            assertEquals(401, backendStatus(b.backend, sessions.accessToken(a)!!, "staff"))
            // B's provider refuses A's refresh token: a session must never be refreshed elsewhere
            val bFlow = OidcDeviceFlow(OidcConfig(issuer = b.issuer, clientId = "mateu-app"))
            assertNull("A's refresh token at B's provider", runCatching { bFlow.refresh(sessions.refreshToken(a)!!) }.getOrNull())
            // signing out of A leaves B signed in
            sessions.signOut(a)
            assertFalse(sessions.isSignedIn(a))
            assertTrue(sessions.isSignedIn(b))
            println("LIVE per-UI sessions: switch, isolation and sign-out OK")
        }
    }
}
