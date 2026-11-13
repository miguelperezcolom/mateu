package io.mateu.ijp.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.net.ServerSocket

/**
 * GA-5.9: "This UI has no server" is for a host that ANSWERS with nothing at /mateu (404/405/501).
 * A request with no answer at all (offline, the server down) is a connection failure — a hybrid site
 * (bundle + /mateu proxied to a backend) has a server, and the user must read that, not "no server".
 */
class StaticBundleNoServerTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun bundle() = StaticBundle(mapper.readTree("""{"entries":[],"routes":{"routes":[]}}"""), locales = { listOf("en") })

    private fun client(base: String) = MateuApiClient(base, "s1", tokenProvider = TokenProvider.NONE).also { it.bundle = bundle() }

    private fun act(c: MateuApiClient, actionId: String) =
        c.runAction("/people", "/people", actionId, "T", "c", emptyMap(), emptyMap(), emptyMap())

    fun testANetworkFailureIsNotNoServer() {
        // a port nobody listens on: the request gets no answer
        val port = ServerSocket(0).use { it.localPort }
        val error = runCatching { act(client("http://127.0.0.1:$port"), "save") }.exceptionOrNull()
        assertNotNull(error)
        assertFalse(error!!.message.orEmpty(), error.message.orEmpty().contains("no server"))
        assertTrue(error is java.io.IOException)
    }

    fun testAHostWithNothingAtMateuIsNoServer() {
        for (status in listOf(404, 405, 501)) {
            val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
            server.createContext("/") { ex ->
                ex.sendResponseHeaders(status, -1)
                ex.close()
            }
            server.start()
            try {
                val error = runCatching { act(client("http://127.0.0.1:${server.address.port}"), "save") }.exceptionOrNull()
                assertEquals("This UI has no server: \"save\" cannot run here.", error?.message)
            } finally {
                server.stop(0)
            }
        }
    }
}
