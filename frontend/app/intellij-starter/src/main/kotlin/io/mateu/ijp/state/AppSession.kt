package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.MateuApiClient
import java.util.UUID
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import javax.swing.JFrame
import javax.swing.SwingUtilities

/**
 * App-wide shared services/state (one per running app) — the Swing counterpart of the JavaFX
 * `AppShell`. Holds the HTTP client, the Jackson mapper, the mutable `appState` bag, the background
 * executor for network calls, and the top-level window (for `SetWindowTitle`).
 */
class AppSession(
    val baseUrl: String,
    config: Map<String, Any?> = emptyMap(),
) {
    val mapper: ObjectMapper = ObjectMapper()
    val sessionId: String = UUID.randomUUID().toString().replace("-", "")
    val apiClient: MateuApiClient = MateuApiClient(baseUrl, sessionId, mapper)

    /** Control/context data echoed back on every request; seeded from the launch config. */
    val appState: MutableMap<String, Any?> = HashMap(config)

    /** Off-EDT work (HTTP). UI mutations always hop back onto the EDT via [SwingUtilities.invokeLater]. */
    val executor: ExecutorService = Executors.newCachedThreadPool { r ->
        Thread(r, "mateu-net").apply { isDaemon = true }
    }

    var frame: JFrame? = null

    /** Set by the tabbed shell so menu entries (and tooling) can open a tab: (label, route, consumedRoute, sst, actionId). */
    var openTabHandler: ((String, String?, String?, String?, String?) -> Unit)? = null

    fun setWindowTitle(title: String) {
        SwingUtilities.invokeLater { frame?.title = title }
    }
}
