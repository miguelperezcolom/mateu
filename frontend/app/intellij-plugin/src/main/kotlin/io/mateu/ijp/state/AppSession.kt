package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.MateuApiClient
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
    tokenProvider: io.mateu.ijp.api.TokenProvider = io.mateu.ijp.api.TokenProvider.NONE,
    /** The app's REST source catalogue (+ references, sample mode). Its own unless given — an island
     *  over another base url passes its host's, so what it registers stays in that app. */
    val sources: io.mateu.ijp.ui.RestSourceCatalogue = io.mateu.ijp.ui.RestSourceCatalogue(),
    /** Where the app's credentials may go: its backend + the islands it names. Its own unless given
     *  — an island passes its host's. */
    val credentials: io.mateu.ijp.api.CredentialScope = io.mateu.ijp.api.CredentialScope(baseUrl),
) {
    val mapper: ObjectMapper = ObjectMapper()
    /** The UI SESSION id: the `X-Session-Id` of every request, the chat's `sessionId` and the live UI
     *  push channel's session (one id, as the web's per-tab id) — unguessable (CSPRNG). */
    val sessionId: String = io.mateu.ijp.chat.ChatRequests.newSessionId()
    val apiClient: MateuApiClient = MateuApiClient(baseUrl, sessionId, mapper, tokenProvider, credentials::mayCarryCredentials)

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

    // The app's @HomeRoute coordinates (from the App metadata): the standalone landing opens
    // THIS route — like the web shells — instead of guessing the first menu leaf.
    var homeRoute: String? = null
    var homeConsumedRoute: String? = null
    var homeServerSideType: String? = null

    /** `@App(accessKeys = true)` (App metadata `accessKeys`): every view gives its showing buttons
     *  and tabs Alt+letter mnemonics (see `io.mateu.ijp.ui.AccessKeys`). */
    var accessKeys: Boolean = false

    /** Fired after [appMenu]/[appTitle] are (re)published, so the host syncs menu-derived actions. */
    var onAppMenuChanged: (() -> Unit)? = null

    // ── overlays (Drawer/Dialog) — close callbacks, topmost last (CloseModal unwinds one) ──
    private val overlays = ArrayDeque<() -> Unit>()

    /**
     * Open overlays by their own id → refresh-in-place callback (component, state, data); it answers
     * false when its window is already gone, so the caller opens a new one instead.
     */
    val openOverlays = HashMap<String, (com.fasterxml.jackson.databind.JsonNode, com.fasterxml.jackson.databind.JsonNode, com.fasterxml.jackson.databind.JsonNode) -> Boolean>()

    /** Open overlays by id that take a STATE update aimed at them (a LongTask's progress steps). */
    val overlayStateUpdaters = HashMap<String, (com.fasterxml.jackson.databind.JsonNode) -> Unit>()

    fun pushOverlay(close: () -> Unit) = overlays.addLast(close)
    fun removeOverlay(close: () -> Unit) = overlays.remove(close)
    fun closeTopOverlay() {
        overlays.removeLastOrNull()?.invoke()
    }

    /** Fired when an @AppContext selector changes — the host reloads the app shell. */
    var onAppContextChanged: (() -> Unit)? = null

    // ── in-app event bus (@SubscribeTo / UICommand.dispatchEvent / closeModal(eventName)) ──
    private data class Subscription(val owner: Any, val eventName: String, val handler: (com.fasterxml.jackson.databind.JsonNode?) -> Unit)
    private val subscriptions = java.util.concurrent.CopyOnWriteArrayList<Subscription>()

    fun subscribe(owner: Any, eventName: String, handler: (com.fasterxml.jackson.databind.JsonNode?) -> Unit) {
        subscriptions.add(Subscription(owner, eventName, handler))
    }

    fun unsubscribeAll(owner: Any) {
        subscriptions.removeIf { it.owner === owner }
    }

    /** Fires [eventName] on the bus; true when a subscriber took it (the assistant's render-screen
     *  falls back to the shell when nobody did). */
    fun dispatchEvent(eventName: String, payload: com.fasterxml.jackson.databind.JsonNode?): Boolean {
        var taken = false
        for (s in subscriptions) if (s.eventName == eventName) { s.handler(payload); taken = true }
        return taken
    }

    /** Whether some component on screen subscribes to [eventName]. */
    fun hasSubscriber(eventName: String): Boolean = subscriptions.any { it.eventName == eventName }

    // ── the assistant (App.sseUrl / mcpUrl / uploadUrl) ──
    /** The view the user last navigated in — the screen the assistant is told about. */
    @Volatile var activeView: AppContext? = null

    /** The app's MCP endpoint (`App.mcpUrl`), forwarded (absolute) with every chat message. */
    var appMcpUrl: String? = null

    /** The app's upload endpoint (`App.uploadUrl`): the assistant's attach button posts there. */
    var appUploadUrl: String? = null

    /**
     * Where an assistant-rendered screen (render-screen, target content) is shown: (title, the
     * rendered panel, its context). The plugin opens it in a transient "preview" editor tab, which the
     * next navigation closes; unset → the chat shows it in a window of its own.
     */
    var contentPreviewHandler: ((String, javax.swing.JComponent, AppContext) -> Unit)? = null

    /** Where `SetWindowTitle` goes when there is no [frame] (e.g. the ToolWindow content title). */
    var titleConsumer: ((String) -> Unit)? = null

    /** Host notification channel (title, text, variant info|warning|error, optional undo
     *  action label+callback for undoable toasts) — the plugin routes it to the IDE's
     *  Notifications system (balloons + event log); unset → dialog fallback. */
    var notifier: ((String?, String, String, Pair<String, () -> Unit>?) -> Unit)? = null

    /**
     * Host hook: a version-skew notice ([io.mateu.ijp.api.BuildSkew]) — the backend was redeployed,
     * or a refusal came from a stale screen. The plugin shows a sticky notification with a Reload
     * action; unset → the [notifier] (no reload). Called on the EDT.
     */
    var onBuildNotice: ((io.mateu.ijp.api.BuildSkew.Notice) -> Unit)? = null

    init {
        apiClient.onBuildNotice = { kind ->
            SwingUtilities.invokeLater {
                val host = onBuildNotice
                if (host != null) {
                    host(kind)
                } else {
                    val texts = io.mateu.ijp.api.BuildSkew.texts(io.mateu.ijp.ui.MoneyValues.uiLocale())
                    val stale = kind == io.mateu.ijp.api.BuildSkew.Notice.STALE
                    notifier?.invoke("Mateu", if (stale) texts.stale else texts.updated, if (stale) "error" else "warning", null)
                }
            }
        }
        // Another wire MAJOR: an IDE balloon (once) instead of a half-rendered screen; read lazily, so
        // the host can install the notifier after the session is created.
        apiClient.onWireMismatch = { message ->
            SwingUtilities.invokeLater {
                val host = notifier
                when {
                    host != null -> host("Mateu", message, "error", null)
                    !java.awt.GraphicsEnvironment.isHeadless() ->
                        javax.swing.JOptionPane.showMessageDialog(frame, message, "Mateu", javax.swing.JOptionPane.ERROR_MESSAGE)
                }
            }
        }
    }

    /** Set by the host so **menu entries** open a view: (label, route, consumedRoute, sst, actionId).
     *  A Crud listing is placed in the bottom tool window; anything else in a central editor tab. */
    var openViewHandler: ((String, String?, String?, String?, String?) -> Unit)? = null

    /** Like [openViewHandler] but for a **row detail** — always opens in a central editor tab, even
     *  when the detail form contains nested grids (which would otherwise look like a Crud listing). */
    var openDetailHandler: ((String, String?, String?, String?, String?) -> Unit)? = null

    /** The shell's declared actions (`App.actions`): a flow carries its steps lowered to `commands`. */
    var appActions: com.fasterxml.jackson.databind.JsonNode? = null

    /** The app's ACTION catalogue (`App.actionCatalogue`): resolved after the owner's own actions. */
    var actionCatalogue: com.fasterxml.jackson.databind.JsonNode? = null

    /** Runs a catalogue REST action reached from the menu (no view state); set by the host view. */
    var restActionRunner: ((String, com.fasterxml.jackson.databind.JsonNode) -> Unit)? = null

    /** The app's root route (`App.rootRoute`): shell-flow routes are relative to the mount. */
    var appRootRoute: String = ""

    /** The app class (`App.serverSideType`), the target of an app-level action. */
    var appServerSideType: String? = null

    /**
     * Opens a menu leaf — the one entry point every menu surface (navigator, IDE menu, toolbar
     * widget) goes through. A leaf with rules RUNS them ([ShellFlows]): a RunAction naming a flow
     * the shell declares applies its lowered commands here, with no server round-trip; any other
     * id is dispatched to the server against the app's home route (opening its answer as a view).
     */
    fun openMenuEntry(item: com.fasterxml.jackson.databind.JsonNode) {
        fun t(f: String) = item.path(f).takeIf { it.isTextual }?.asText() ?: ""
        if (!ShellFlows.isRuleLeaf(item)) {
            openViewHandler?.invoke(t("label"), t("route"), t("consumedRoute"), t("serverSideType"), t("actionId"))
            return
        }
        for (effect in ShellFlows.effects(item, appActions, actionCatalogue)) {
            when (effect) {
                is ShellFlows.Effect.Navigate -> {
                    val root = appRootRoute.trimEnd('/')
                    openViewHandler?.invoke(effect.route, "$root/${effect.route}", appRootRoute, null, null)
                }
                is ShellFlows.Effect.Url -> io.mateu.ijp.ui.SafeHtml.browse(effect.url) { java.awt.Desktop.getDesktop().browse(java.net.URI(it)) }
                is ShellFlows.Effect.RunAction -> openViewHandler?.invoke(
                    t("label").ifBlank { effect.actionId },
                    homeRoute ?: appRootRoute,
                    homeConsumedRoute ?: "",
                    appServerSideType ?: homeServerSideType,
                    effect.actionId,
                )
                is ShellFlows.Effect.RestAction -> restActionRunner?.invoke(effect.actionId, effect.restAction)
                    ?: openViewHandler?.invoke(
                        t("label").ifBlank { effect.actionId },
                        homeRoute ?: appRootRoute,
                        homeConsumedRoute ?: "",
                        appServerSideType ?: homeServerSideType,
                        effect.actionId,
                    )
                is ShellFlows.Effect.Event -> dispatchEvent(effect.eventName, effect.payload)
                is ShellFlows.Effect.CloseOverlay -> {
                    closeTopOverlay()
                    effect.eventName?.let { dispatchEvent(it, effect.payload) }
                }
            }
        }
    }

    // ── E2 patterns: app shortcuts, live header values, idle-session warning ──────────────────

    /** App-wide shortcuts / quick-launch codes (`AppDto.shortcuts`), published by renderApp. */
    var appShortcuts: List<AppShortcuts.Shortcut> = emptyList()

    /** Live header values by id, in the app's order; changed by UpdateHeaderValue and the stream. */
    val headerValues = LinkedHashMap<String, HeaderValues.Value>()
    private val headerValueListeners = java.util.concurrent.CopyOnWriteArrayList<(String?) -> Unit>()

    /** Repaint on change; the callback receives the id that changed (null = reseeded). */
    fun onHeaderValuesChanged(listener: (String?) -> Unit): () -> Unit {
        headerValueListeners.add(listener)
        return { headerValueListeners.remove(listener) }
    }

    /** What the shell declares — authoritative when it is (re)built. */
    fun seedHeaderValues(values: List<HeaderValues.Value>) {
        if (values == headerValues.values.toList()) return
        headerValues.clear()
        values.forEach { headerValues[it.id] = it }
        headerValueListeners.forEach { it(null) }
    }

    /** One value changes (an action's UpdateHeaderValue, or the live stream). EDT. */
    fun updateHeaderValue(id: String, value: String) {
        val current = headerValues[id]
        if (current?.value == value) return
        headerValues[id] = HeaderValues.Value(id, current?.label, value)
        headerValueListeners.forEach { it(id) }
    }

    /** The `@App(liveUpdates)` event stream, when the app asks for it. */
    private var liveStream: LiveUpdatesStream? = null

    fun syncLiveUpdates(wanted: Boolean) {
        if (wanted && liveStream == null) liveStream = LiveUpdatesStream(this).also { it.start() }
        if (!wanted) { liveStream?.stop(); liveStream = null }
    }

    // ── live UI push (phase C): an agent sends UI to this window through MCP ─────────────────

    /** The channel secret: random, kept here, sent only on `_agent-channel/-pair/-unpair`. */
    val agentSecret: String = AgentPush.newSecret()

    /** Whether the app has push on (`AppDto.agentPush`): the channel is open and "Connect AI" shows. */
    @Volatile var agentPush: Boolean = false
        private set

    /** Who is paired + the code being shown; what "Connect AI" renders. EDT. */
    val agentPairing = AgentPairingState()

    private var agentChannel: AgentChannelStream? = null

    /** Fired (EDT) when [agentPush] flips, so the host shows/hides its "Connect AI" action. */
    var onAgentPushChanged: (() -> Unit)? = null

    /** Opens the channel when the app has push on (and closes it when it has not). */
    fun syncAgentPush(wanted: Boolean) {
        if (wanted && agentChannel == null) agentChannel = AgentChannelStream(this).also { it.start() }
        if (!wanted && agentChannel != null) {
            agentChannel?.stop()
            agentChannel = null
            agentPairing.reset()
        }
        if (agentPush != wanted) {
            agentPush = wanted
            onAgentPushChanged?.invoke()
        }
    }

    /** The route the UI shows, as the channel reports it (the view last navigated in, else home). */
    fun currentUiRoute(): String = activeView?.currentRoute?.ifBlank { null } ?: homeRoute ?: appRootRoute

    /**
     * One pushed message, applied EXACTLY like the chat's event of the same name (the shared
     * [io.mateu.ijp.ui.AgentEvents]) — a `status` updates [agentPairing] instead. EDT.
     */
    fun applyAgentPush(message: AgentPush.Message) {
        when (val effect = AgentPush.decide(message)) {
            is AgentPush.Effect.Status -> agentPairing.status(effect.paired, effect.agents)
            is AgentPush.Effect.UiEvent -> io.mateu.ijp.ui.AgentEvents.apply(this, effect.event, effect.detail)
            AgentPush.Effect.Ignore -> Unit
        }
    }

    /** Asks for a new one-time pairing code (`_agent-pair`); the answer lands in [agentPairing]. */
    fun requestAgentPairing(now: () -> Long = System::currentTimeMillis) {
        agentPairing.requesting()
        runAgentAction(AgentPush.PAIR_ACTION) { answer ->
            when (answer) {
                is AgentPush.PairAnswer.Code -> agentPairing.codeReceived(answer.pairing, now())
                AgentPush.PairAnswer.Cleared -> agentPairing.failed(AgentPush.NO_CODE)
                is AgentPush.PairAnswer.Failed -> agentPairing.failed(answer.message)
            }
        }
    }

    /** Disconnects every paired agent (`_agent-unpair`); [onDone] gets the error, null when it worked. */
    fun disconnectAgents(onDone: (String?) -> Unit = {}) {
        runAgentAction(AgentPush.UNPAIR_ACTION) { answer ->
            if (answer is AgentPush.PairAnswer.Failed) {
                onDone(answer.message)
            } else {
                agentPairing.forgetCode()
                agentPairing.unpaired()
                onDone(null)
            }
        }
    }

    /** An app-level pairing action on the APP class (route = the app's root route), answered on the EDT. */
    private fun runAgentAction(actionId: String, onAnswer: (AgentPush.PairAnswer) -> Unit) {
        val parameters = AgentPush.credentials(sessionId, agentSecret)
        val state = HashMap(appState)
        executor.submit {
            val answer = runCatching {
                AgentPush.pairAnswerOf(
                    apiClient.runAction(appRootRoute, "", actionId, appServerSideType, "mateu-agent-pairing", emptyMap(), state, parameters),
                )
            }.getOrElse { AgentPush.PairAnswer.Failed(AgentPush.failureText(it)) }
            SwingUtilities.invokeLater { onAnswer(answer) }
        }
    }

    /** The idle-session watcher (Swing side), installed by renderApp; stopped on dispose. */
    var idleWatcher: AutoCloseable? = null

    /** Fired when the idle warning signs out — the host resets the app to its root. */
    var onSignedOut: (() -> Unit)? = null

    /** Opens an app route (an app shortcut, quick launch) through the host's normal navigation. */
    fun openAppRoute(label: String, route: String) {
        openViewHandler?.invoke(label, route, "", null, null)
    }

    /**
     * Runs an app-level action (an action shortcut, the idle keep-alive) on the APP class — the same
     * rail as the notification bell. Its messages surface through [notifier]; header-value changes apply.
     */
    fun runAppAction(actionId: String, initiator: String = "app-shortcut", quiet: Boolean = false) {
        executor.submit {
            val increment = runCatching {
                apiClient.runAction(appRootRoute, "", actionId, appServerSideType, initiator, emptyMap(), appState, emptyMap())
            }.getOrNull() ?: return@submit
            SwingUtilities.invokeLater {
                HeaderValues.changesOf(increment).forEach { (id, v) -> updateHeaderValue(id, v) }
                if (!quiet) {
                    val messages = increment.path("messages")
                    if (messages.isArray) for (m in messages) {
                        val text = m.path("text").asText("")
                        if (text.isNotBlank()) notifier?.invoke(m.path("title").asText(null), text, m.path("variant").asText("info"), null)
                    }
                }
            }
        }
    }

    /** The development-mode live reload follower (io.mateu.ijp.live.LiveReload), stopped with the session. */
    var liveReload: io.mateu.ijp.live.LiveReload.Follower? = null

    /** The session ends (project closed): the stream and the idle watcher stop, the pool too. */
    fun dispose() {
        liveReload?.stop()
        liveReload = null
        syncLiveUpdates(false)
        agentChannel?.stop()
        agentChannel = null
        runCatching { idleWatcher?.close() }
        idleWatcher = null
        executor.shutdownNow()
    }

    fun setWindowTitle(title: String) {
        SwingUtilities.invokeLater {
            frame?.title = title
            titleConsumer?.invoke(title)
        }
    }
}
