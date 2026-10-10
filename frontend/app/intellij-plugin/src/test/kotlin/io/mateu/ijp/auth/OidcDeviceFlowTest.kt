package io.mateu.ijp.auth

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.net.URLDecoder

/** RFC 8628 device flow against a fake OIDC provider: discovery, pending/slow_down polling, refresh. */
class OidcDeviceFlowTest : TestCase() {

    private lateinit var server: HttpServer
    private val tokenAnswers = ArrayDeque<Pair<Int, String>>()
    private val tokenForms = ArrayList<Map<String, String>>()
    private val slept = ArrayList<Long>()
    private val base get() = "http://127.0.0.1:${server.address.port}"

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/.well-known/openid-configuration") {
            send(it, 200, """{"device_authorization_endpoint":"$base/device","token_endpoint":"$base/token"}""")
        }
        server.createContext("/device") {
            val form = form(it)
            assertEquals("ide", form["client_id"])
            send(it, 200, """{"device_code":"DC","user_code":"ABCD-EFGH","verification_uri":"$base/activate",
                "verification_uri_complete":"$base/activate?code=ABCD-EFGH","interval":2,"expires_in":60}""")
        }
        server.createContext("/token") {
            tokenForms.add(form(it))
            val (status, body) = tokenAnswers.removeFirst()
            send(it, status, body)
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private fun form(ex: HttpExchange): Map<String, String> =
        String(ex.requestBody.readBytes()).split('&').filter { it.isNotBlank() }.associate {
            val (k, v) = it.split('=', limit = 2)
            URLDecoder.decode(k, "UTF-8") to URLDecoder.decode(v, "UTF-8")
        }

    private fun send(ex: HttpExchange, status: Int, body: String) {
        val bytes = body.toByteArray()
        ex.responseHeaders.add("Content-Type", "application/json")
        ex.sendResponseHeaders(status, bytes.size.toLong())
        ex.responseBody.use { it.write(bytes) }
    }

    private fun flow() = OidcDeviceFlow(OidcConfig(issuer = base, clientId = "ide"), sleeper = { slept.add(it) })

    fun testDiscoveryStartAndPollUntilApproved() {
        tokenAnswers += 400 to """{"error":"authorization_pending"}"""
        tokenAnswers += 400 to """{"error":"slow_down"}"""
        tokenAnswers += 200 to """{"access_token":"AT","refresh_token":"RT","expires_in":300}"""
        val f = flow()
        val endpoints = f.endpoints()
        assertEquals("$base/token", endpoints.token)
        val code = f.start(endpoints)
        assertEquals("ABCD-EFGH", code.userCode)
        assertEquals("$base/activate?code=ABCD-EFGH", code.browseUri)
        val tokens = f.poll(endpoints, code)
        assertEquals("AT", tokens.accessToken)
        assertEquals("RT", tokens.refreshToken)
        // interval 2s, then 2s, then slow_down adds 5s
        assertEquals(listOf(2000L, 2000L, 7000L), slept)
        assertEquals(OidcDeviceFlow.DEVICE_GRANT, tokenForms.first()["grant_type"])
        assertEquals("DC", tokenForms.first()["device_code"])
    }

    fun testDeniedIsReported() {
        tokenAnswers += 400 to """{"error":"access_denied"}"""
        val f = flow()
        val e = f.endpoints()
        try {
            f.poll(e, f.start(e))
            fail()
        } catch (ex: OidcDeviceFlow.OidcException) {
            assertTrue(ex.message!!.contains("denied"))
        }
    }

    fun testCancellationStopsPolling() {
        val f = flow()
        val e = f.endpoints()
        try {
            f.poll(e, f.start(e)) { true }
            fail()
        } catch (ex: OidcDeviceFlow.OidcException) {
            assertTrue(ex.message!!.contains("cancelled"))
        }
        assertTrue(tokenForms.isEmpty())
    }

    fun testRefreshKeepsTheOldRefreshTokenWhenNotRotated() {
        tokenAnswers += 200 to """{"access_token":"AT2"}"""
        val t = flow().refresh("RT")!!
        assertEquals("AT2", t.accessToken)
        assertEquals("RT", t.refreshToken)
        assertEquals("refresh_token", tokenForms.single()["grant_type"])
    }

    fun testRefusedRefreshIsNull() {
        tokenAnswers += 400 to """{"error":"invalid_grant"}"""
        assertNull(flow().refresh("RT"))
    }

    fun testExplicitEndpointsSkipDiscovery() {
        val f = OidcDeviceFlow(
            OidcConfig(issuer = null, clientId = "ide", deviceAuthorizationEndpoint = "http://d", tokenEndpoint = "http://t"),
        )
        assertEquals(OidcDeviceFlow.Endpoints("http://d", "http://t"), f.endpoints())
    }

    fun testMissingIssuerIsExplained() {
        try {
            OidcDeviceFlow(OidcConfig(issuer = "", clientId = "ide")).endpoints()
            fail()
        } catch (ex: OidcDeviceFlow.OidcException) {
            assertTrue(ex.message!!.contains("issuer"))
        }
    }
}
