package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/**
 * RECORD PRESENCE (`@App(presence = true)`) on the desktop — the twin of libs/mateu's
 * `infra/presence/presence.ts`: a record view reports itself every [HEARTBEAT_SECONDS] with the
 * `_presence` app-level action (`viewing`, or `editing` while it holds unsaved changes) and `leave`
 * when it closes; the answer and the app event stream ([LiveUpdatesStream]) carry `PresenceChanged`
 * commands listing the OTHER people. The server forgets a copy not seen for 30 s; anonymous callers
 * take no part. Pure helpers first (tested), then the per-session [PresenceHub].
 */
object Presence {
    const val ACTION_ID = "_presence"
    const val HEARTBEAT_SECONDS = 10L

    data class Entry(val name: String, val editing: Boolean, val since: String? = null)
    data class Change(val key: String, val entries: List<Entry>)
    data class Summary(val text: String, val warning: Boolean)

    /** The presence changes an increment carries. */
    fun changesOf(increment: JsonNode?): List<Change> {
        val commands = increment?.path("commands") ?: return emptyList()
        if (!commands.isArray) return emptyList()
        return commands.filter { it.path("type").asText() == "PresenceChanged" && it.path("data").path("key").isTextual }
            .map { c ->
                val data = c.path("data")
                Change(
                    data.path("key").asText(),
                    data.path("entries").filter { it.isObject }.map {
                        Entry(it.path("name").asText(), it.path("editing").asBoolean(), it.path("since").textValue())
                    },
                )
            }
    }

    /** The route a view reports — without the app's own mount, query or surrounding slashes. */
    fun routeOf(route: String, rootRoute: String?): String {
        var path = route.substringBefore('?').substringBefore('#')
        val root = (rootRoute ?: "").trimEnd('/')
        if (root.isNotEmpty() && (path == root || path.startsWith("$root/"))) path = path.substring(root.length)
        return path.replace(Regex("/{2,}"), "/").trim('/')
    }

    /** A record view is two segments or more, or a view that edits — never a create page. */
    fun isRecordRoute(route: String, edits: Boolean = false): Boolean {
        val path = route.replace(Regex("/(edit|view)$"), "")
        if (path.isEmpty() || path == "new" || path.endsWith("/new")) return false
        return edits || path.split('/').count { it.isNotEmpty() } >= 2
    }

    private fun names(names: List<String>): String = when {
        names.size <= 1 -> names.firstOrNull() ?: ""
        names.size == 2 -> "${names[0]} and ${names[1]}"
        else -> "${names.take(2).joinToString(", ")} and ${names.size - 2} more"
    }

    /** What the header says — editors first (a warning), then viewers; null when nobody else is there. */
    fun summary(entries: List<Entry>): Summary? {
        if (entries.isEmpty()) return null
        val editors = entries.filter { it.editing }.map { it.name }
        val viewers = entries.filter { !it.editing }.map { it.name }
        val parts = buildList {
            if (editors.isNotEmpty()) add("${names(editors)} ${if (editors.size == 1) "is" else "are"} editing this record")
            if (viewers.isNotEmpty()) add("${names(viewers)} ${if (viewers.size == 1) "is" else "are"} viewing it")
        }
        return Summary(parts.joinToString(" · "), editors.isNotEmpty())
    }

    /** The people who START editing between two answers (announced once). */
    fun newEditors(before: List<Entry>, after: List<Entry>): List<String> {
        val were = before.filter { it.editing }.map { it.name }.toSet()
        return after.filter { it.editing && it.name !in were }.map { it.name }
    }
}

/**
 * The per-session hub: which views watch which record, their heartbeat and the stream's changes.
 * [post] sends one `_presence` report (its parameters) and answers the increment; it runs on a
 * background thread. Listeners are called on that thread or the stream's — hop to the EDT yourself.
 */
class PresenceHub(private val post: (Map<String, Any?>) -> JsonNode?) {

    @Volatile var enabled = false
        private set

    private val tab = java.util.UUID.randomUUID().toString().take(12)
    private val scheduler = Executors.newSingleThreadScheduledExecutor { r ->
        Thread(r, "mateu-presence").apply { isDaemon = true }
    }
    private val watches = java.util.concurrent.ConcurrentHashMap<String, Watch>()

    /**
     * One record watched by this session: every view showing it shares it (a header rebuilt on a
     * re-render takes it again before the previous one let go, so the others see no leave/join).
     */
    inner class Watch internal constructor(val route: String, val view: String) {
        @Volatile var key: String? = null
        @Volatile var entries: List<Presence.Entry> = emptyList()
        internal val holders = java.util.concurrent.CopyOnWriteArrayList<Holder>()
        internal var beat: ScheduledFuture<*>? = null
        internal var leaving: ScheduledFuture<*>? = null

        internal fun send(state: String) {
            // a leave always goes out: the others must not wait 30 s for a view that closed
            if (!enabled && state != "leave") return
            val increment = runCatching {
                post(mapOf("route" to route, "view" to view, "tab" to tab, "state" to state))
            }.getOrNull()
            if (state == "leave") return
            for (change in Presence.changesOf(increment)) {
                key = change.key
                hear(change.entries)
            }
        }

        internal fun state() = if (holders.any { it.editing() }) "editing" else "viewing"

        internal fun hear(next: List<Presence.Entry>) {
            entries = next
            holders.forEach { it.listener(next) }
        }
    }

    /** What a view holds while it shows a record; [stop] lets go. */
    inner class Holder internal constructor(
        private val watch: Watch,
        internal val editing: () -> Boolean,
        internal val listener: (List<Presence.Entry>) -> Unit,
    ) {
        fun stop() {
            if (!watch.holders.remove(this) || watch.holders.isNotEmpty()) return
            // the last view let go: say `leave` unless another view takes the record again at once
            watch.leaving = scheduler.schedule({
                if (watch.holders.isEmpty() && watches.remove(watch.route + "|" + watch.view, watch)) {
                    watch.beat?.cancel(false)
                    watch.send("leave")
                }
            }, LEAVE_GRACE_MILLIS, TimeUnit.MILLISECONDS)
        }
    }

    /** The app on show asks for presence (or stops asking). */
    fun configure(wanted: Boolean) {
        if (enabled == wanted) return
        enabled = wanted
        if (wanted) watches.values.forEach { start(it) } else watches.values.forEach { it.beat?.cancel(false) }
    }

    /** A record view watches its record; null when it is no record. */
    fun watch(route: String, view: String, edits: Boolean, editing: () -> Boolean, listener: (List<Presence.Entry>) -> Unit): Holder? {
        if (!Presence.isRecordRoute(route, edits)) return null
        val watch = watches.computeIfAbsent("$route|$view") { Watch(route, view) }
        watch.leaving?.cancel(false)
        val holder = Holder(watch, editing, listener)
        val first = watch.holders.isEmpty() && watch.beat == null
        watch.holders.add(holder)
        if (first) start(watch) else if (watch.key != null) listener(watch.entries)
        return holder
    }

    /** A change from the app event stream: the watch of that record follows. */
    fun apply(change: Presence.Change) {
        watches.values.filter { it.key == change.key }.forEach { it.hear(change.entries) }
    }

    private fun start(w: Watch) {
        if (!enabled) return
        w.beat?.cancel(false)
        w.beat = scheduler.scheduleWithFixedDelay({ w.send(w.state()) }, 0, Presence.HEARTBEAT_SECONDS, TimeUnit.SECONDS)
    }

    fun dispose() {
        watches.values.forEach { w ->
            w.beat?.cancel(false)
            scheduler.execute { w.send("leave") }
        }
        watches.clear()
        scheduler.shutdown()
    }

    companion object {
        const val LEAVE_GRACE_MILLIS = 1_500L
    }
}
