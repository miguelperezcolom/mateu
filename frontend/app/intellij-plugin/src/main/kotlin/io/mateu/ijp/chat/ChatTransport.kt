package io.mateu.ijp.chat

import io.mateu.ijp.api.MateuApiClient
import java.io.InputStreamReader
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * The chat's HTTP leg: POSTs a message and feeds the SSE parser AS THE BYTES ARRIVE (not the whole
 * body at the end), handing each event's data to [onPayload] on the caller's (background) thread.
 *
 * Credentials ride only when the url is trusted with them ([MateuApiClient.credentialHeaders]); a
 * 401 gets ONE re-authentication through the client's session-expiry hooks and one retry, with the
 * headers rebuilt so the retry carries the new token.
 */
class ChatTransport(
    private val api: MateuApiClient,
    private val http: HttpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build(),
) {
    /** A non-2xx answer from the chat or upload endpoint. */
    class HttpFailure(val status: Int, val body: String) : RuntimeException("The server answered $status: $body")

    /** Streams one turn. Returns when the stream ends; throws [HttpFailure] / IO errors. */
    fun stream(url: String, json: String, onPayload: (String) -> Unit) {
        val response = sendWithReauth(url) { headers ->
            val b = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "text/event-stream")
                .header("Content-Type", "application/json")
            headers.forEach { (k, v) -> b.header(k, v) }
            b.POST(HttpRequest.BodyPublishers.ofString(json)).build()
        }
        if (response.statusCode() !in 200..299) {
            val text = response.body().use { String(it.readAllBytes(), Charsets.UTF_8) }
            throw HttpFailure(response.statusCode(), text)
        }
        val parser = SseParser()
        InputStreamReader(response.body(), Charsets.UTF_8).use { reader ->
            val buf = CharArray(4096)
            while (true) {
                val n = reader.read(buf)
                if (n < 0) break
                if (n > 0) parser.push(String(buf, 0, n)).forEach(onPayload)
            }
        }
        parser.end().forEach(onPayload)
    }

    /** Uploads [files] (multipart "files" + "sessionId") and returns what the endpoint saved. */
    fun upload(url: String, sessionId: String, files: List<Pair<String, ByteArray>>): List<ChatAttachment> {
        val boundary = "----mateu-chat-" + java.util.UUID.randomUUID().toString().replace("-", "")
        val body = ChatRequests.multipart(boundary, sessionId, files)
        val response = sendWithReauth(url) { headers ->
            val b = HttpRequest.newBuilder(URI.create(url))
                .header("Content-Type", "multipart/form-data; boundary=$boundary")
                .header("Accept", "application/json")
            headers.forEach { (k, v) -> b.header(k, v) }
            b.POST(HttpRequest.BodyPublishers.ofByteArray(body)).build()
        }
        val text = response.body().use { String(it.readAllBytes(), Charsets.UTF_8) }
        if (response.statusCode() !in 200..299) throw HttpFailure(response.statusCode(), text)
        return ChatRequests.uploadedFiles(text)
    }

    private fun sendWithReauth(url: String, build: (Map<String, String>) -> HttpRequest): HttpResponse<java.io.InputStream> {
        val token = if (api.carriesCredentials(url)) api.tokenProvider.accessToken() else null
        var response = http.send(build(api.credentialHeaders(url, token)), HttpResponse.BodyHandlers.ofInputStream())
        if (response.statusCode() == 401 && api.reauthenticate(url, token)) {
            response.body().close()
            response = http.send(build(api.credentialHeaders(url)), HttpResponse.BodyHandlers.ofInputStream())
        }
        return response
    }
}
