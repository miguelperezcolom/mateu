package io.mateu.ijp.state

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import javax.swing.SwingUtilities

/**
 * The APP EVENT STREAM of `@App(liveUpdates)` on the desktop: one background thread holds
 * `POST {base}/mateu/v3/sse/<route>` running the app-level `_live-updates` action and applies every
 * `UpdateHeaderValue` it carries to the session's header values (on the EDT). The server ends the
 * stream every few minutes on purpose; it reconnects at once, with a back-off after errors
 * ([HeaderValues.reconnectDelayMillis]). One per app session (the desktop has no tabs to share it
 * with); [stop] — called when the session is disposed — ends it.
 */
class LiveUpdatesStream(private val session: AppSession) {

    @Volatile private var running = false
    private var thread: Thread? = null
    private val http: HttpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build()

    fun start() {
        if (running) return
        running = true
        thread = Thread({ loop() }, "mateu-live-updates").apply { isDaemon = true; start() }
    }

    fun stop() {
        running = false
        thread?.interrupt()
        thread = null
    }

    private fun loop() {
        var failures = 0
        while (running) {
            val ok = runCatching { streamOnce() }.isSuccess
            failures = if (ok) 0 else failures + 1
            if (!running) break
            try {
                Thread.sleep(HeaderValues.reconnectDelayMillis(failures))
            } catch (_: InterruptedException) {
                break
            }
        }
    }

    private fun streamOnce() {
        val route = session.appRootRoute.trim('/').ifBlank { "_no_route" }
        val body = session.mapper.writeValueAsString(
            linkedMapOf(
                "route" to "/$route",
                "consumedRoute" to "",
                "actionId" to "_live-updates",
                "serverSideType" to session.appServerSideType,
                "initiatorComponentId" to "mateu-live-updates",
                "componentState" to emptyMap<String, Any?>(),
                "appState" to session.appState,
                "parameters" to emptyMap<String, Any?>(),
            ).filterValues { it != null },
        )
        val builder = HttpRequest.newBuilder(URI.create("${session.baseUrl}/mateu/v3/sse/$route"))
            .header("Content-Type", "application/json")
            .header("Accept", "text/event-stream")
            .header("X-Session-Id", session.sessionId)
            .POST(HttpRequest.BodyPublishers.ofString(body))
        io.mateu.ijp.api.bearer(session.apiClient.tokenProvider.accessToken())?.let { builder.header("Authorization", it) }
        val response = http.send(builder.build(), HttpResponse.BodyHandlers.ofLines())
        if (response.statusCode() >= 400) throw IllegalStateException("live updates: HTTP ${response.statusCode()}")
        response.body().use { lines ->
            val it = lines.iterator()
            while (running && it.hasNext()) {
                val line = it.next().trim()
                if (!line.startsWith("data:")) continue
                val changes = runCatching { HeaderValues.changesOf(session.mapper.readTree(line.removePrefix("data:").trim())) }
                    .getOrDefault(emptyList())
                if (changes.isNotEmpty()) {
                    SwingUtilities.invokeLater { changes.forEach { (id, value) -> session.updateHeaderValue(id, value) } }
                }
            }
        }
    }
}
