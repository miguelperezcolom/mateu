package io.mateu.ijp.api

import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections

/** Bearer header on every sync call, and the single re-authenticate-and-retry on a 401. */
class MateuApiClientAuthTest : TestCase() {

    private lateinit var server: HttpServer
    private val seen: MutableList<String?> = Collections.synchronizedList(ArrayList())

    /** Accepts only [validToken]; everything else (incl. no header) is a 401. */
    private var validToken: String? = "good"

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            val auth = ex.requestHeaders.getFirst("Authorization")
            seen.add(auth)
            val ok = validToken == null || auth == "Bearer $validToken"
            val body = (if (ok) "{\"ok\":true}" else "{}").toByteArray()
            ex.sendResponseHeaders(if (ok) 200 else 401, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private fun client(tokens: TokenProvider) =
        MateuApiClient("http://127.0.0.1:${server.address.port}", "s1", tokenProvider = tokens)

    fun testNoProviderSendsNoAuthorization() {
        validToken = null
        client(TokenProvider.NONE).initialLoad("/", emptyMap())
        assertEquals(listOf<String?>(null), seen)
    }

    fun testBearerIsSent() {
        val res = client(TokenProvider.of("good")).initialLoad("/", emptyMap())
        assertTrue(res.path("ok").asBoolean())
        assertEquals(listOf<String?>("Bearer good"), seen)
    }

    fun testUnauthorizedRefreshesAndRetriesOnceWithTheNewToken() {
        var current = "expired"
        var asked: String? = null
        val provider = object : TokenProvider {
            override fun accessToken() = current
            override fun onUnauthorized(rejected: String?): Boolean {
                asked = rejected
                current = "good"
                return true
            }
        }
        val res = client(provider).initialLoad("/", emptyMap())
        assertTrue(res.path("ok").asBoolean())
        assertEquals("expired", asked)
        assertEquals(listOf<String?>("Bearer expired", "Bearer good"), seen)
    }

    fun testUnauthorizedWithoutNewCredentialsFailsWithoutLooping() {
        val provider = object : TokenProvider {
            override fun accessToken() = "bad"
            override fun onUnauthorized(rejected: String?) = false
        }
        try {
            client(provider).initialLoad("/", emptyMap())
            fail("expected UnauthorizedException")
        } catch (e: UnauthorizedException) {
            assertTrue(e.message!!.contains("Settings | Tools | Mateu"))
        }
        assertEquals(1, seen.size)
    }

    fun testStillUnauthorizedAfterRetryFails() {
        val provider = object : TokenProvider {
            override fun accessToken() = "bad"
            override fun onUnauthorized(rejected: String?) = true // claims a new token but it is still bad
        }
        try {
            client(provider).initialLoad("/", emptyMap())
            fail("expected UnauthorizedException")
        } catch (_: UnauthorizedException) {
        }
        assertEquals(2, seen.size)
    }
}
