package io.mateu.ijp.live

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.hub.HubManifest
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URI

/**
 * Live reload in the desktop app — the development loop the web and the phone follow.
 *
 * A backend in development mode (`mateu.dev=true`, "Run Mateu App (Live)") streams
 * `GET /mateu/dev/events` and names it in its manifest (`devEvents`, never outside development mode).
 * While the desktop app shows that backend, it follows the stream: a YAML edit (`specs-changed`), the
 * IDE's reload after a HotSwap (`reload`) or a restarted server (a `hello` with another boot id)
 * re-renders the open views. What each event means is pinned by conformance/client/live-reload.json
 * (libs/mateu liveReloadPolicy.ts is the reference).
 */
object LiveReload {

    enum class Action { NONE, PAGE, APP }

    data class Decision(val action: Action, val bootId: String?)

    fun decide(message: JsonNode?, knownBootId: String?): Decision {
        if (message == null || !message.isObject) return Decision(Action.NONE, knownBootId)
        val text = { f: String -> message.get(f)?.takeIf { it.isTextual }?.asText() }
        return when (text("type")) {
            "hello" -> {
                val bootId = text("bootId")
                val restarted = knownBootId != null && bootId != null && bootId != knownBootId
                Decision(if (restarted) Action.PAGE else Action.NONE, bootId ?: knownBootId)
            }
            "specs-changed", "reload" -> Decision(if (text("scope") == "app") Action.APP else Action.PAGE, knownBootId)
            else -> Decision(Action.NONE, knownBootId)
        }
    }

    /** Where the event stream of the app at [baseUrl] is, per its [manifest] — null outside development
     *  mode. The path is the server's (root-relative), like [MateuDevClient.RELOAD_PATH]. */
    fun eventsUrlOf(baseUrl: String, manifest: JsonNode?): String? {
        val path = manifest?.get("devEvents")?.takeIf { it.isTextual }?.asText() ?: return null
        if (!path.startsWith("/") || path.startsWith("//")) return null
        return runCatching {
            val uri = URI(baseUrl.trim())
            if (uri.scheme == null || uri.authority == null) null else "${uri.scheme}://${uri.authority}$path"
        }.getOrNull()
    }

    /** The wait before reconnecting after [failures] failed attempts: 1 s, doubling, capped at 30 s. */
    fun reconnectDelayMillis(failures: Int): Long = minOf(30_000L, 1000L shl (maxOf(1, failures) - 1).coerceAtMost(5))

    /** A running follower; [stop] ends it (idempotent). */
    class Follower internal constructor(private val thread: Thread, private val closer: () -> Unit) {
        @Volatile internal var stopped = false
        fun stop() {
            stopped = true
            closer()
            thread.interrupt()
        }
    }

    /**
     * Asks [baseUrl]'s manifest where the dev events are and, in development mode, follows them on a
     * daemon thread until stopped: each event meaning a re-render calls [onAction] (a burst within
     * [settleMillis] collapses into one, the strongest wins); a dropped stream reconnects with a back-off
     * and the boot id survives reconnections. Outside development mode the thread ends after the manifest.
     */
    fun follow(baseUrl: String, settleMillis: Long = 150, onAction: (Action) -> Unit): Follower {
        var connection: HttpURLConnection? = null
        lateinit var follower: Follower
        val thread = Thread({
            val url = runCatching {
                val (status, body) = HubManifest.HTTP.get(baseUrl.trimEnd('/') + HubManifest.PATH)
                if (status in 200..299) eventsUrlOf(baseUrl, ObjectMapper().readTree(body)) else null
            }.getOrNull() ?: return@Thread
            var bootId: String? = null
            var failures = 0
            val mapper = ObjectMapper()
            while (!follower.stopped) {
                try {
                    val c = URI(url).toURL().openConnection() as HttpURLConnection
                    connection = c
                    c.setRequestProperty("Accept", "text/event-stream")
                    c.connectTimeout = 5000
                    c.readTimeout = 0
                    if (c.responseCode !in 200..299) throw IllegalStateException("HTTP ${c.responseCode}")
                    failures = 0
                    var pending = Action.NONE
                    var deadline = 0L
                    BufferedReader(InputStreamReader(c.inputStream, Charsets.UTF_8)).use { reader ->
                        val data = StringBuilder()
                        while (!follower.stopped) {
                            val line = reader.readLine() ?: break
                            if (line.startsWith("data:")) {
                                if (data.isNotEmpty()) data.append('\n')
                                data.append(line.removePrefix("data:").trimStart())
                                continue
                            }
                            if (line.isNotEmpty() || data.isEmpty()) continue
                            val decision = decide(runCatching { mapper.readTree(data.toString()) }.getOrNull(), bootId)
                            data.setLength(0)
                            bootId = decision.bootId
                            if (decision.action == Action.NONE) continue
                            // the server sends events of one change together: collapse them
                            if (decision.action == Action.APP || pending == Action.NONE) pending = decision.action
                            if (deadline == 0L) deadline = System.currentTimeMillis() + settleMillis
                            if (!reader.ready()) {
                                val wait = deadline - System.currentTimeMillis()
                                if (wait > 0) Thread.sleep(wait)
                                if (!reader.ready()) {
                                    onAction(pending)
                                    pending = Action.NONE
                                    deadline = 0L
                                }
                            }
                        }
                    }
                    if (pending != Action.NONE && !follower.stopped) onAction(pending)
                } catch (_: InterruptedException) {
                    return@Thread
                } catch (_: Exception) {
                    failures++
                } finally {
                    connection?.disconnect()
                    connection = null
                }
                if (follower.stopped) return@Thread
                try {
                    Thread.sleep(reconnectDelayMillis(maxOf(1, failures)))
                } catch (_: InterruptedException) {
                    return@Thread
                }
            }
        }, "mateu-live-reload")
        thread.isDaemon = true
        follower = Follower(thread) { runCatching { connection?.disconnect() } }
        thread.start()
        return follower
    }
}
