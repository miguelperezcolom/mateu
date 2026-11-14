package io.mateu.ijp.mcp

import junit.framework.TestCase

/** Who may call the desktop MCP server: loopback Host, no web Origin, the Bearer token. */
class McpRequestGuardTest : TestCase() {

    private val token = "s3cret-token-of-enough-length-000000000000"
    private val auth = "Bearer $token"

    private fun check(method: String = "POST", host: String? = "127.0.0.1:47821", origin: String? = null, authorization: String? = auth) =
        McpRequestGuard.check(method, host, origin, authorization, token, 47821)

    fun testAnAgentOnThisComputerWithTheTokenIsLetIn() {
        assertTrue(check().allowed)
        assertTrue(check(host = "localhost:47821").allowed)
        assertTrue(check(host = "LOCALHOST:47821").allowed)
        assertTrue(check(origin = "null").allowed)
        assertTrue(check(authorization = "bearer $token").allowed)
    }

    fun testOnlyPost() {
        assertEquals(405, check(method = "GET").status)
    }

    fun testAnotherHostIsRefusedDnsRebinding() {
        assertEquals(403, check(host = "evil.example:47821").status)
        assertEquals(403, check(host = "127.0.0.1:9999").status)
        assertEquals(403, check(host = "127.0.0.1").status)
        assertEquals(403, check(host = null).status)
        assertEquals(403, check(host = "0.0.0.0:47821").status)
    }

    fun testAWebPageOriginIsRefused() {
        assertEquals(403, check(origin = "https://evil.example").status)
        assertEquals(403, check(origin = "http://127.0.0.1:47821").status)
    }

    fun testTheTokenIsRequired() {
        assertEquals(401, check(authorization = null).status)
        assertEquals(401, check(authorization = "Bearer wrong").status)
        assertEquals(401, check(authorization = token).status)
        assertEquals(401, check(authorization = "Basic $token").status)
        assertEquals(401, McpRequestGuard.check("POST", "127.0.0.1:1", null, "Bearer ", "", 1).status)
        assertEquals(401, McpRequestGuard.check("POST", "127.0.0.1:1", null, "Bearer x", null, 1).status)
    }

    fun testATokenHas32RandomBytes() {
        val a = McpRequestGuard.newToken()
        val b = McpRequestGuard.newToken()
        assertEquals(43, a.length)
        assertFalse(a == b)
        assertTrue(a.matches(Regex("[A-Za-z0-9_-]+")))
    }
}
