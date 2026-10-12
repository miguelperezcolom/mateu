package io.mateu.ijp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.util.concurrent.CopyOnWriteArrayList

/**
 * A stand-in Mateu server for renderer tests: records every sync POST body and answers each with
 * [answer]; GETs under [json] paths answer that JSON (an external REST source).
 */
class StubMateuServer : AutoCloseable {
    private val mapper = ObjectMapper()
    private val server: HttpServer = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)

    /** Each action request body received, in order. */
    val requests = CopyOnWriteArrayList<JsonNode>()

    /** What every action answers. */
    @Volatile var answer: String = """{"fragments":[],"messages":[],"commands":[]}"""

    /** Path → JSON answered to a GET (external REST sources). */
    val json = HashMap<String, String>()

    val baseUrl: String get() = "http://127.0.0.1:${server.address.port}"

    init {
        server.createContext("/") { ex ->
            val path = ex.requestURI.path
            val body = if (ex.requestMethod == "GET") {
                json[path] ?: "{}"
            } else {
                requests.add(mapper.readTree(ex.requestBody.readAllBytes()))
                answer
            }
            val bytes = body.toByteArray()
            ex.responseHeaders.add("Content-Type", "application/json")
            ex.sendResponseHeaders(200, bytes.size.toLong())
            ex.responseBody.use { it.write(bytes) }
        }
        server.start()
    }

    /** The action ids requested so far. */
    fun actionIds(): List<String> = requests.map { it.path("actionId").asText() }

    override fun close() = server.stop(0)
}
