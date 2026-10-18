package io.mateu.ijp.chat

import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.api.MateuApiClient
import io.mateu.ijp.api.TokenProvider
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** The chat's HTTP leg: real streaming, the one re-auth on a 401, the upload. */
class ChatTransportTest : TestCase() {
    private lateinit var server: HttpServer
    private val firstSeen = CountDownLatch(1)
    private val auth: MutableList<String?> = Collections.synchronizedList(ArrayList())
    private var validToken: String? = null
    @Volatile private var streamedBeforeEnd = false

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/api/chat") { ex ->
            auth.add(ex.requestHeaders.getFirst("Authorization"))
            ex.requestBody.readAllBytes()
            if (validToken != null && ex.requestHeaders.getFirst("Authorization") != "Bearer $validToken") {
                ex.sendResponseHeaders(401, -1)
                ex.close()
                return@createContext
            }
            ex.responseHeaders.add("Content-Type", "text/event-stream")
            ex.sendResponseHeaders(200, 0)
            ex.responseBody.use { out ->
                out.write("data: {\"event\":\"agent-delta\",\"detail\":{\"text\":\"Hel\"}}\n\n".toByteArray())
                out.flush()
                // the rest is only written once the client has handled the first event: streaming
                streamedBeforeEnd = firstSeen.await(5, TimeUnit.SECONDS)
                out.write("data: line one\r\ndata: line two\r\n\r\ndata: tail".toByteArray())
            }
        }
        server.createContext("/api/fail") { ex ->
            val body = "nope".toByteArray()
            ex.sendResponseHeaders(500, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        server.createContext("/api/upload") { ex ->
            val body = String(ex.requestBody.readAllBytes())
            val ok = body.contains("name=\"sessionId\"") && body.contains("filename=\"a.txt\"") &&
                ex.requestHeaders.getFirst("Content-Type").startsWith("multipart/form-data; boundary=")
            val answer = (if (ok) """{"files":[{"name":"a.txt","path":"up/a.txt"}]}""" else "{}").toByteArray()
            ex.sendResponseHeaders(200, answer.size.toLong())
            ex.responseBody.use { it.write(answer) }
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private val base get() = "http://127.0.0.1:${server.address.port}"

    fun testEventsAreHandedOverAsTheyArrive() {
        val payloads = ArrayList<String>()
        ChatTransport(MateuApiClient(base, "s1")).stream("$base/api/chat", "{}") {
            payloads.add(it)
            firstSeen.countDown()
        }
        assertTrue("the first event reached us before the stream ended", streamedBeforeEnd)
        assertEquals(listOf("{\"event\":\"agent-delta\",\"detail\":{\"text\":\"Hel\"}}", "line one\nline two", "tail"), payloads)
    }

    fun testA401ReauthenticatesOnceAndRetriesWithTheNewToken() {
        validToken = "good"
        var current = "expired"
        val provider = object : TokenProvider {
            override fun accessToken() = current
            override fun onUnauthorized(rejected: String?): Boolean {
                current = "good"
                return rejected == "expired"
            }
        }
        firstSeen.countDown()
        val payloads = ArrayList<String>()
        ChatTransport(MateuApiClient(base, "s1", tokenProvider = provider)).stream("$base/api/chat", "{}") { payloads.add(it) }
        assertEquals(listOf<String?>("Bearer expired", "Bearer good"), auth)
        assertEquals(3, payloads.size)
    }

    fun testAnUntrustedUrlGetsNoCredentials() {
        firstSeen.countDown()
        // the chat lives on another origin than the client's backend: no Bearer, no session id
        ChatTransport(MateuApiClient("http://other.example:9", "s1", tokenProvider = TokenProvider.of("t")))
            .stream("$base/api/chat", "{}") {}
        assertEquals(listOf<String?>(null), auth)
    }

    fun testAnHttpFailureCarriesItsStatusAndBody() {
        try {
            ChatTransport(MateuApiClient(base, "s1")).stream("$base/api/fail", "{}") {}
            fail("expected a failure")
        } catch (e: ChatTransport.HttpFailure) {
            assertEquals(500, e.status)
            assertEquals("The server answered 500: nope", e.message)
        }
    }

    fun testUpload() {
        val saved = ChatTransport(MateuApiClient(base, "s1")).upload("$base/api/upload", "chat-1", listOf("a.txt" to "hi".toByteArray()))
        assertEquals(listOf(ChatAttachment("a.txt", "up/a.txt")), saved)
        try {
            ChatTransport(MateuApiClient(base, "s1")).upload("$base/api/fail", "chat-1", emptyList())
            fail("expected a failure")
        } catch (e: ChatTransport.HttpFailure) {
            assertEquals(500, e.status)
        }
    }
}
