package io.mateu.ijp.mcp

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import java.net.BindException
import java.net.InetAddress
import java.net.InetSocketAddress
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * The HTTP leg of the desktop MCP server: the JDK's HttpServer bound to the LOOPBACK address only
 * (127.0.0.1 — never 0.0.0.0), one path ([PATH]), every request checked by [McpRequestGuard] before
 * the JSON-RPC body is read. No platform API: unit-tested end to end with a fake [McpHost].
 *
 * @param token read on every request, so regenerating it disconnects the old one at once.
 */
class McpHttpServer(
    private val protocol: McpProtocol,
    private val token: () -> String?,
    private val onRequest: () -> Unit = {},
) {
    private var server: HttpServer? = null
    private var executor: ExecutorService? = null

    /** The port it listens on (0 when stopped). */
    @Volatile var port: Int = 0
        private set

    val running: Boolean get() = server != null

    /**
     * Listens on [preferredPort], else the next [fallbacks] ports, else one the OS picks.
     * @return the port it listens on.
     */
    @Synchronized
    fun start(preferredPort: Int, fallbacks: Int = 9): Int {
        stop()
        val candidates = (0..fallbacks).map { preferredPort + it }.filter { it in 1..65535 } + 0
        var bound: HttpServer? = null
        for (p in candidates) {
            bound = try {
                HttpServer.create(InetSocketAddress(InetAddress.getLoopbackAddress(), p), 16)
            } catch (_: BindException) {
                null
            }
            if (bound != null) break
        }
        val s = bound ?: throw BindException("No free loopback port")
        val pool = Executors.newFixedThreadPool(4) { r -> Thread(r, "mateu-mcp").apply { isDaemon = true } }
        s.executor = pool
        s.createContext(PATH) { exchange -> runCatching { serve(exchange) }; exchange.close() }
        s.start()
        server = s
        executor = pool
        port = s.address.port
        return port
    }

    @Synchronized
    fun stop() {
        server?.stop(0)
        server = null
        executor?.shutdownNow()
        executor = null
        port = 0
    }

    private fun serve(exchange: HttpExchange) {
        val headers = exchange.requestHeaders
        // exactly the context path: /mcp, never /mcp/whatever
        if (exchange.requestURI.path != PATH) return reply(exchange, 404, "Not found")
        val verdict = McpRequestGuard.check(
            exchange.requestMethod,
            headers.getFirst("Host"),
            headers.getFirst("Origin"),
            headers.getFirst("Authorization"),
            token(),
            port,
        )
        if (!verdict.allowed) return reply(exchange, verdict.status, verdict.message)
        val body = exchange.requestBody.use { input ->
            val bytes = input.readNBytes(MAX_BODY + 1)
            if (bytes.size > MAX_BODY) return reply(exchange, 413, "Request too large")
            bytes.toString(Charsets.UTF_8)
        }
        onRequest()
        val answer = protocol.handle(body)
        if (answer == null) {
            exchange.sendResponseHeaders(202, -1)
            return
        }
        val bytes = answer.toByteArray(Charsets.UTF_8)
        exchange.responseHeaders.add("Content-Type", "application/json")
        exchange.responseHeaders.add("Cache-Control", "no-store")
        exchange.sendResponseHeaders(200, bytes.size.toLong())
        exchange.responseBody.use { it.write(bytes) }
    }

    private fun reply(exchange: HttpExchange, status: Int, text: String) {
        val bytes = text.toByteArray(Charsets.UTF_8)
        exchange.responseHeaders.add("Content-Type", "text/plain; charset=utf-8")
        if (status == 401) exchange.responseHeaders.add("WWW-Authenticate", "Bearer")
        exchange.sendResponseHeaders(status, bytes.size.toLong())
        exchange.responseBody.use { it.write(bytes) }
    }

    companion object {
        const val PATH = "/mcp"
        const val DEFAULT_PORT = 47821
        const val MAX_BODY = 2 * 1024 * 1024

        fun urlOf(port: Int) = "http://127.0.0.1:$port$PATH"

        /** `claude mcp add …` for this server. */
        fun claudeCodeSnippet(port: Int, token: String) =
            "claude mcp add --transport http mateu-desktop ${urlOf(port)} --header \"Authorization: Bearer $token\""

        /** A generic MCP client configuration (the `mcpServers` shape most clients read). */
        fun jsonSnippet(port: Int, token: String) = """
            {
              "mcpServers": {
                "mateu-desktop": {
                  "type": "http",
                  "url": "${urlOf(port)}",
                  "headers": { "Authorization": "Bearer $token" }
                }
              }
            }
        """.trimIndent()
    }
}
