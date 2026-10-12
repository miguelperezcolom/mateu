package io.mateu.ijp.api

import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress

/** A LongTask answers on the SSE endpoint with one increment per step, each handed over as it arrives. */
class MateuApiClientStreamTest : TestCase() {

    private lateinit var server: HttpServer
    private var seenPath = ""
    private var seenAccept: String? = null

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            seenPath = ex.requestURI.path
            seenAccept = ex.requestHeaders.getFirst("Accept")
            ex.responseHeaders.add("Content-Type", "text/event-stream")
            ex.sendResponseHeaders(200, 0)
            ex.responseBody.use { out ->
                for (step in 1..3) {
                    out.write("data:{\"fragments\":[{\"state\":{\"step\":$step}}]}\n\n".toByteArray())
                    out.flush()
                }
                out.write(":heartbeat\n\n".toByteArray())
            }
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    fun testEachStreamedIncrementIsHandedOver() {
        val steps = ArrayList<Int>()
        MateuApiClient("http://127.0.0.1:${server.address.port}", "s1", tokenProvider = TokenProvider.NONE)
            .runActionStream("/long-task", "", "runLongTask", "T", "c", emptyMap(), emptyMap(), emptyMap()) {
                steps.add(it.path("fragments").path(0).path("state").path("step").asInt())
            }
        assertEquals(listOf(1, 2, 3), steps)
        assertEquals("/mateu/v3/sse/long-task", seenPath)
        assertEquals("text/event-stream", seenAccept)
    }
}
