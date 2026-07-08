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

    /** Optional top-level window (standalone). In the plugin the host is a ToolWindow, so this is null. */
    var frame: JFrame? = null

    /** The app shell's menu JSON + title, published by the navigator's renderApp — the plugin also
     *  surfaces this as a top-level menu in the IDE menu bar (like the VCS menu). */
    var appMenu: com.fasterxml.jackson.databind.JsonNode? = null
    var appTitle: String? = null

    /** Where `SetWindowTitle` goes when there is no [frame] (e.g. the ToolWindow content title). */
    var titleConsumer: ((String) -> Unit)? = null

    /** Set by the host so **menu entries** open a view: (label, route, consumedRoute, sst, actionId).
     *  A Crud listing is placed in the bottom tool window; anything else in a central editor tab. */
    var openViewHandler: ((String, String?, String?, String?, String?) -> Unit)? = null

    /** Like [openViewHandler] but for a **row detail** — always opens in a central editor tab, even
     *  when the detail form contains nested grids (which would otherwise look like a Crud listing). */
    var openDetailHandler: ((String, String?, String?, String?, String?) -> Unit)? = null

    fun setWindowTitle(title: String) {
        SwingUtilities.invokeLater {
            frame?.title = title
            titleConsumer?.invoke(title)
        }
    }
}
