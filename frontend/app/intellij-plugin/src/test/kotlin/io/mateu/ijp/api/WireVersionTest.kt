package io.mateu.ijp.api

import com.sun.net.httpserver.HttpServer
import junit.framework.TestCase
import java.net.InetSocketAddress

/** Same wire major → silent; another major → one plain-language message; absent → accepted. */
class WireVersionTest : TestCase() {

    fun testSameMajorIsCompatibleWhateverTheMinor() {
        assertNull(WireVersion.mismatch("3.0"))
        assertNull(WireVersion.mismatch("3.9"))
    }

    fun testAnotherMajorNamesBothMajors() {
        val message = WireVersion.mismatch("4.0")!!
        assertTrue(message, message.contains("4.x"))
        assertTrue(message, message.contains("3.x"))
        assertNotNull(WireVersion.mismatch("2.1"))
    }

    fun testAbsentOrGarbageIsAccepted() {
        assertNull(WireVersion.mismatch(null))
        assertNull(WireVersion.mismatch(""))
        assertNull(WireVersion.mismatch("banana"))
    }

    fun testTheClientReportsAMismatchOnceAndStillReturnsTheResponse() {
        val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            val body = "{\"wireVersion\":\"4.0\",\"fragments\":[]}".toByteArray()
            ex.sendResponseHeaders(200, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.start()
        try {
            val client = MateuApiClient("http://127.0.0.1:${server.address.port}", "s1")
            val seen = mutableListOf<String>()
            client.onWireMismatch = { seen.add(it) }
            val first = client.initialLoad("/", emptyMap())
            client.initialLoad("/", emptyMap())
            assertTrue(first.path("fragments").isArray)
            assertEquals(1, seen.size)
        } finally {
            server.stop(0)
        }
    }
}
