package io.mateu.ijp.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.ui.microFrontendSession
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections

/** The Bearer and X-Session-Id go only to the app's backend and the islands it names (M-S5 parity). */
class CredentialScopeTest : TestCase() {

    private fun json(s: String) = ObjectMapper().readTree(s)

    fun testOriginsAreHttpOnlyAndARelativeUrlIsTheRootBackend() {
        assertEquals("https://a.example", CredentialScope.originOf("https://A.example:443/admin"))
        assertEquals("http://a.example:8080", CredentialScope.originOf("http://a.example:8080/x"))
        assertEquals("https://a.example", CredentialScope.originOf("/x", "https://a.example/admin"))
        assertNull(CredentialScope.originOf("javascript:alert(1)"))
        assertNull(CredentialScope.originOf("file:///etc/passwd"))
        assertNull(CredentialScope.originOf(null))
    }

    fun testTheBackendNamesARemoteThatRemoteCannotNameAnother() {
        val scope = CredentialScope("https://app.example/console")
        assertTrue(scope.mayCarryCredentials("https://app.example/other"))
        assertFalse(scope.mayCarryCredentials("https://inbox.example"))
        scope.declare("https://app.example/console", listOf("https://inbox.example/_inbox"))
        assertTrue(scope.mayCarryCredentials("https://inbox.example/_inbox/mateu/v3/sync/x"))
        scope.declare("https://inbox.example/_inbox", listOf("https://evil.example"))
        assertFalse(scope.mayCarryCredentials("https://evil.example"))
        scope.trustRoot("https://api.example")
        assertTrue(scope.mayCarryCredentials("https://api.example/x"))
    }

    fun testTheClientSendsNoCredentialToAnUntrustedUrl() {
        val api = MateuApiClient("https://app.example", "s1", tokenProvider = TokenProvider.of("tok"))
        assertEquals(mapOf("X-Session-Id" to "s1", "Authorization" to "Bearer tok"), api.credentialHeaders())
        assertEquals(emptyMap<String, String>(), api.credentialHeaders("https://chat.elsewhere.example/sse"))
    }

    fun testIslandsCarryTheTokenOnlyWhenTheAppsBackendNamedThem() {
        val host = AppSession("https://app.example", tokenProvider = TokenProvider.of("tok"))
        val island = microFrontendSession(host, json("""{"baseUrl":"https://inbox.example/_inbox"}"""))
        assertEquals("Bearer tok", island.apiClient.credentialHeaders()["Authorization"])
        val nested = microFrontendSession(island, json("""{"baseUrl":"https://evil.example"}"""))
        assertEquals(emptyMap<String, String>(), nested.apiClient.credentialHeaders())
        assertNull(nested.apiClient.tokenProvider.accessToken())
    }

    fun testAnUntrustedIslandIsCalledWithoutTheSessionIdAndTheBearer() {
        val seen = Collections.synchronizedList(ArrayList<Pair<String?, String?>>())
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            seen.add(ex.requestHeaders.getFirst("Authorization") to ex.requestHeaders.getFirst("X-Session-Id"))
            val body = "{}".toByteArray()
            ex.sendResponseHeaders(200, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.start()
        try {
            val remote = "http://127.0.0.1:${server.address.port}"
            // the scope of an app whose backend is elsewhere: this server was never named by it
            val api = MateuApiClient(remote, "s1", tokenProvider = TokenProvider.of("tok"),
                credentialsFor = CredentialScope("https://app.example")::mayCarryCredentials)
            api.initialLoad("/", emptyMap())
            assertEquals(listOf<Pair<String?, String?>>(null to null), seen)
            // and the same server as the app's own backend gets both
            MateuApiClient(remote, "s1", tokenProvider = TokenProvider.of("tok")).initialLoad("/", emptyMap())
            assertEquals("Bearer tok" to "s1", seen[1])
        } finally {
            server.stop(0)
        }
    }
}
