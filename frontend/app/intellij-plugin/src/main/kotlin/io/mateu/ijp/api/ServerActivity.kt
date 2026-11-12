package io.mateu.ijp.api

import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicInteger

/**
 * The requests in flight to a server — Mateu's own calls and the REST sources a screen fetches — so
 * the host can show that the app is waiting for one (the IDE's status-bar progress, see
 * `MateuServerProgress`). Process-wide: an island over another backend counts too.
 *
 * Pure (no platform API): [track] wraps a call, [busy] says whether any is pending, and listeners hear
 * the 0 → 1 transition ([Listener.started]) once per busy period.
 */
object ServerActivity {
    fun interface Listener {
        /** The first request of a busy period started: the host decides whether (and when) to show it. */
        fun started()
    }

    private val pending = AtomicInteger()
    private val listeners = CopyOnWriteArrayList<Listener>()

    @Volatile var lastLabel: String = ""
        private set

    /** Whether a request is still waiting for its answer. */
    val busy: Boolean get() = pending.get() > 0

    fun addListener(listener: Listener) { listeners.addIfAbsent(listener) }

    fun removeListener(listener: Listener) { listeners.remove(listener) }

    /** Runs [call] counted as a pending request described by [label] (what the progress shows). */
    fun <T> track(label: String, call: () -> T): T {
        lastLabel = label
        if (pending.incrementAndGet() == 1) listeners.forEach { runCatching { it.started() } }
        try {
            return call()
        } finally {
            pending.decrementAndGet()
        }
    }

    /** What a call to [url] reads as in the progress: its host and path, never its query (it may carry values). */
    fun labelOf(url: String): String = runCatching {
        val u = java.net.URI.create(url)
        (u.host ?: "") + (u.path ?: "")
    }.getOrDefault("").ifBlank { url.substringBefore('?') }
}
