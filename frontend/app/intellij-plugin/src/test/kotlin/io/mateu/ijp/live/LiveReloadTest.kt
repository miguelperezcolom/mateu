package io.mateu.ijp.live

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import java.io.File
import java.net.InetSocketAddress
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import junit.framework.TestCase

/**
 * The live-reload corpus (conformance/client/live-reload.json) — the same file the web and React
 * Native suites run — and the follower against a stand-in development backend.
 */
class LiveReloadTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/live-reload.json")
            if (f.isFile) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/live-reload.json not found above ${File("").absolutePath}")
    }

    fun testTheCorpus() {
        val failures = ArrayList<String>()
        for (c in corpus().path("cases")) {
            val known = c.get("known")?.takeUnless { it.isNull }?.asText()
            val d = LiveReload.decide(c.get("message")?.takeUnless { it.isNull }, known)
            val expected = c.path("expect")
            val actual = d.action.name.lowercase() to d.bootId
            val want = expected.path("action").asText() to expected.get("bootId")?.takeUnless { it.isNull }?.asText()
            if (actual != want) failures += "${c.path("name").asText()}: expected $want, got $actual"
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }

    fun testTheEventStreamIsWhereTheManifestSaysAtTheServerRoot() {
        val m = { s: String -> mapper.readTree(s) }
        assertEquals("http://localhost:8080/mateu/dev/events", LiveReload.eventsUrlOf("http://localhost:8080/app", m("""{"devEvents":"/mateu/dev/events"}""")))
        assertNull(LiveReload.eventsUrlOf("http://localhost:8080", m("{}")))
        assertNull(LiveReload.eventsUrlOf("http://localhost:8080", m("""{"devEvents":"https://evil.example/x"}""")))
        assertNull(LiveReload.eventsUrlOf("http://localhost:8080", m("""{"devEvents":"//evil.example/x"}""")))
        assertNull(LiveReload.eventsUrlOf("http://localhost:8080", null))
    }

    fun testReconnectsBackOffFrom1To30Seconds() {
        assertEquals(listOf(1000L, 2000L, 4000L, 30_000L, 30_000L), listOf(1, 2, 3, 6, 10).map(LiveReload::reconnectDelayMillis))
    }

    fun testItFollowsADevelopmentBackendAndReRendersOnASpecChange() {
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/mateu/v3/manifest") { ex ->
            val b = """{"name":"Dev","devEvents":"/mateu/dev/events"}""".toByteArray()
            ex.sendResponseHeaders(200, b.size.toLong()); ex.responseBody.use { it.write(b) }
        }
        server.createContext("/mateu/dev/events") { ex ->
            ex.responseHeaders.add("Content-Type", "text/event-stream")
            ex.sendResponseHeaders(200, 0)
            ex.responseBody.use { out ->
                out.write("data: {\"type\":\"hello\",\"bootId\":\"a\"}\n\n".toByteArray()); out.flush()
                out.write("data: {\"type\":\"specs-changed\",\"scope\":\"page\"}\n\ndata: {\"type\":\"reload\",\"scope\":\"app\"}\n\n".toByteArray()); out.flush()
                Thread.sleep(2000)
            }
        }
        server.start()
        val actions = CopyOnWriteArrayList<LiveReload.Action>()
        val latch = CountDownLatch(1)
        val follower = LiveReload.follow("http://127.0.0.1:${server.address.port}") { actions += it; latch.countDown() }
        try {
            assertTrue("a re-render arrived", latch.await(10, TimeUnit.SECONDS))
            assertEquals("one burst, one re-render: the strongest", listOf(LiveReload.Action.APP), actions.toList())
        } finally {
            follower.stop()
            server.stop(0)
        }
    }

    fun testAProductionBackendIsNotFollowed() {
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        val hits = CopyOnWriteArrayList<String>()
        server.createContext("/") { ex ->
            hits += ex.requestURI.path
            val b = """{"name":"Prod"}""".toByteArray()
            ex.sendResponseHeaders(200, b.size.toLong()); ex.responseBody.use { it.write(b) }
        }
        server.start()
        val follower = LiveReload.follow("http://127.0.0.1:${server.address.port}") { fail("no re-render expected") }
        try {
            Thread.sleep(1000)
            assertEquals(listOf("/mateu/v3/manifest"), hits.toList())
        } finally {
            follower.stop()
            server.stop(0)
        }
    }
}
