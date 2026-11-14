package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.net.Socket

/** The HTTP leg end to end, over a real loopback socket (raw, so Host and Origin can be forged). */
class McpHttpServerTest : TestCase() {

    private val mapper = ObjectMapper()
    private var token = "the-token-0123456789-0123456789-0123456789"
    private var requests = 0

    private val host = object : McpHost {
        override fun callTool(name: String, args: JsonNode): JsonNode = mapper.createObjectNode().put("ok", true)
        override val resources = emptyList<McpResource>()
        override fun readResource(uri: String): String? = null
    }
    private val server = McpHttpServer(McpProtocol(host, mapper), token = { token }, onRequest = { requests++ })
    private var port = 0

    override fun setUp() {
        port = server.start(McpHttpServer.DEFAULT_PORT + 1000)
    }

    override fun tearDown() = server.stop()

    private data class Answer(val status: Int, val body: String)

    private fun send(
        body: String = """{"jsonrpc":"2.0","id":1,"method":"ping"}""",
        hostHeader: String = "127.0.0.1:$port",
        origin: String? = null,
        auth: String? = "Bearer $token",
        method: String = "POST",
        path: String = "/mcp",
    ): Answer {
        Socket("127.0.0.1", port).use { s ->
            val bytes = body.toByteArray()
            val head = buildString {
                append("$method $path HTTP/1.1\r\n")
                append("Host: $hostHeader\r\n")
                origin?.let { append("Origin: $it\r\n") }
                auth?.let { append("Authorization: $it\r\n") }
                append("Content-Type: application/json\r\n")
                append("Content-Length: ${bytes.size}\r\n")
                append("Connection: close\r\n\r\n")
            }
            s.getOutputStream().apply { write(head.toByteArray()); write(bytes); flush() }
            val raw = s.getInputStream().readBytes().toString(Charsets.UTF_8)
            val status = raw.substringAfter(' ').substringBefore(' ').toInt()
            return Answer(status, raw.substringAfter("\r\n\r\n"))
        }
    }

    fun testItListensOnTheLoopbackOnly() {
        assertTrue(server.running)
        assertEquals("http://127.0.0.1:$port/mcp", McpHttpServer.urlOf(port))
        // not reachable on another interface: the socket is bound to 127.0.0.1
        val nonLoopback = java.net.NetworkInterface.getNetworkInterfaces().asSequence()
            .flatMap { it.inetAddresses.asSequence() }
            .firstOrNull { !it.isLoopbackAddress && it is java.net.Inet4Address }
        if (nonLoopback != null) {
            val refused = runCatching { Socket(nonLoopback, port).close() }.isFailure
            assertTrue("reachable on $nonLoopback", refused)
        }
    }

    fun testAnAuthorizedCallIsAnswered() {
        val a = send()
        assertEquals(200, a.status)
        assertEquals(1, mapper.readTree(a.body).path("id").asInt())
        assertEquals(1, requests)
    }

    fun testANotificationIsAccepted() {
        assertEquals(202, send("""{"jsonrpc":"2.0","method":"notifications/initialized"}""").status)
    }

    fun testRefusals() {
        assertEquals(401, send(auth = null).status)
        assertEquals(401, send(auth = "Bearer nope").status)
        assertEquals(403, send(hostHeader = "attacker.example:$port").status)
        assertEquals(403, send(origin = "https://attacker.example").status)
        assertEquals(405, send(method = "GET", body = "").status)
        assertEquals(404, send(path = "/mcpx").status)
        // nothing refused reached the protocol
        assertEquals(0, requests)
    }

    fun testARegeneratedTokenDisconnectsTheOldOne() {
        val old = token
        token = "a-new-token-0123456789-0123456789-01234567"
        assertEquals(401, send(auth = "Bearer $old").status)
        assertEquals(200, send().status)
    }

    fun testABusyPortFallsBackToAnother() {
        val other = McpHttpServer(McpProtocol(host, mapper), token = { token })
        try {
            val second = other.start(port)
            assertTrue(second != port && second > 0)
        } finally {
            other.stop()
        }
    }

    fun testTheSnippetsNameTheServer() {
        val claude = McpHttpServer.claudeCodeSnippet(port, "TKN")
        assertEquals("claude mcp add --transport http mateu-desktop http://127.0.0.1:$port/mcp --header \"Authorization: Bearer TKN\"", claude)
        val json = mapper.readTree(McpHttpServer.jsonSnippet(port, "TKN"))
        assertEquals("Bearer TKN", json.path("mcpServers").path("mateu-desktop").path("headers").path("Authorization").asText())
    }
}
