package io.mateu.ijp.auth

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.net.URI
import java.net.URLDecoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

/**
 * Authorization Code + PKCE with a loopback redirect (RFC 8252), for a provider with no device grant
 * (Google's web clients, Apple…): against a fake provider, with a fake "browser" that follows the
 * authorize URL back to the app's listener the way the provider's redirect would.
 */
class OidcLoopbackFlowTest : TestCase() {

    private lateinit var server: HttpServer
    private val tokenForms = ArrayList<Map<String, String>>()
    private val base get() = "http://127.0.0.1:${server.address.port}"

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/.well-known/openid-configuration") {
            send(it, 200, """{"authorization_endpoint":"$base/authorize","token_endpoint":"$base/token"}""")
        }
        server.createContext("/token") {
            tokenForms.add(parse(String(it.requestBody.readBytes())))
            send(it, 200, """{"access_token":"AT","refresh_token":"RT","expires_in":300}""")
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private fun parse(q: String?): Map<String, String> = q.orEmpty().split('&').filter { it.isNotBlank() }.associate {
        val (k, v) = it.split('=', limit = 2)
        URLDecoder.decode(k, "UTF-8") to URLDecoder.decode(v, "UTF-8")
    }

    private fun send(ex: HttpExchange, status: Int, body: String) {
        val bytes = body.toByteArray()
        ex.sendResponseHeaders(status, bytes.size.toLong())
        ex.responseBody.use { it.write(bytes) }
    }

    private fun get(url: String): Int =
        HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create(url)).GET().build(), HttpResponse.BodyHandlers.ofString()).statusCode()

    private fun flow() = OidcDeviceFlow(OidcConfig(issuer = base, clientId = "desk", scope = "openid profile", audience = "api"))

    fun testNoDeviceGrantMeansTheLoopbackFlow() {
        val d = flow().discovery()
        assertNull(d.device)
        assertEquals("$base/authorize", d.authorization)
    }

    fun testTheCodeComesBackToTheLoopbackListenerAndIsExchangedWithTheVerifier() {
        var authorize: Map<String, String> = emptyMap()
        val tokens = flow().loopback(browse = { url ->
            assertTrue(url.startsWith("$base/authorize?"))
            authorize = parse(URI.create(url).rawQuery)
            val redirect = authorize.getValue("redirect_uri")
            // a request that is not the provider's answer (wrong state) is refused and changes nothing
            assertEquals(400, get("$redirect?code=STOLEN&state=nope"))
            // the provider's redirect, in the user's browser
            assertEquals(200, get("$redirect?code=THE-CODE&state=${authorize.getValue("state")}"))
        })
        assertEquals("AT", tokens.accessToken)
        assertEquals("RT", tokens.refreshToken)
        assertEquals("code", authorize["response_type"])
        assertEquals("S256", authorize["code_challenge_method"])
        assertEquals("api", authorize["audience"])
        assertEquals("openid profile", authorize["scope"])
        assertTrue(authorize.getValue("redirect_uri").matches(Regex("^http://127\\.0\\.0\\.1:\\d+/callback$")))
        val form = tokenForms.single()
        assertEquals("authorization_code", form["grant_type"])
        assertEquals("THE-CODE", form["code"])
        assertEquals(authorize["redirect_uri"], form["redirect_uri"])
        assertEquals(authorize["code_challenge"], Pkce.challenge(form.getValue("code_verifier")))
    }

    fun testADeniedSignInIsReported() {
        try {
            flow().loopback(browse = { url ->
                val q = parse(URI.create(url).rawQuery)
                get("${q.getValue("redirect_uri")}?error=access_denied&state=${q.getValue("state")}")
            })
            fail("expected a refusal")
        } catch (e: OidcDeviceFlow.OidcException) {
            assertEquals("Sign-in was denied.", e.message)
        }
        assertTrue(tokenForms.isEmpty())
    }

    fun testCancellingStopsWaiting() {
        try {
            flow().loopback(browse = {}, cancelled = { true })
            fail("expected a cancellation")
        } catch (e: OidcDeviceFlow.OidcException) {
            assertEquals("Sign-in cancelled.", e.message)
        }
    }
}
