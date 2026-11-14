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

    /** The app shell's @AppContext selectors (AppDto.contextSelectors), published with the menu. */
    var contextSelectors: com.fasterxml.jackson.databind.JsonNode? = null

    /** The desktop app (focused mode) shows [contextSelectors] on the main toolbar — app-wide
     *  context, where the web shells put it (the header) — instead of at the top of the menu. */
    var contextSelectorsInToolbar: Boolean = false

    /** The app's AI chat (App.sseUrl) — published by the app shell, null when it has none. */
    data class Assistant(val sseUrl: String, val uploadUrl: String?, val label: String)

    /** The desktop app (focused mode) hosts the [Assistant] in a tool window on the right instead of
     *  a link in the menu panel: the host sets this, the app shell calls it on every (re)render. */
    var onAssistant: ((Assistant?) -> Unit)? = null

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

    // ── what the desktop MCP server (io.mateu.ijp.mcp) reads of what the user sees ──
    /** The app shell's metadata (`App`), as the navigator last rendered it. */
    @Volatile var appMetadata: com.fasterxml.jackson.databind.JsonNode? = null

    /** The last messages the screens showed (toasts, notices), newest last, bounded. */
    val recentMessages: java.util.concurrent.ConcurrentLinkedDeque<io.mateu.ijp.mcp.ScreenSummary.Message> =
        java.util.concurrent.ConcurrentLinkedDeque()

    fun rememberMessage(message: io.mateu.ijp.mcp.ScreenSummary.Message) {
        recentMessages.addLast(message)
        while (recentMessages.size > 10) recentMessages.pollFirst()
    }

    /** An open Drawer/Dialog window: the context its body renders in and the component it shows. */
    class OverlayView(@Volatile var context: AppContext, @Volatile var component: com.fasterxml.jackson.databind.JsonNode)

    /** The open overlays, oldest first (the last one is in front). */
    val overlayViews: java.util.concurrent.CopyOnWriteArrayList<OverlayView> = java.util.concurrent.CopyOnWriteArrayList()

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
     * Host hook: shows a backend message the platform's way — its persistence (toast / sticky /
     * inbox), its actions (the callback runs one) and its deduplication key. Unset → [notifier].
     */
    var messagePresenter: ((MessageSpec, (NoticeAction) -> Unit) -> Unit)? = null

    /** The session's long-running tasks (`Progress` commands), shown by the host as platform tasks. */
    val tasks = TaskRelay()

    /** The tasks this app's streams reported, kept across sessions and IDE restarts (see [TaskReattach]). */
    val taskLedger: TaskLedger = TaskLedgers.of(baseUrl, tokenProvider.sessionScope())

    /** `@App(osNotifications = true)` (App metadata `osNotifications`): see [OsNotices]. */
    @Volatile var osNotifications: Boolean = false

    /** Host hook: posts an OS-level notification (title, text — plain); unset → none. */
    var osNotifier: ((OsNotices.Notice) -> Unit)? = null

    /** Host hook: whether an IDE window has the focus (unset → assumed in front: nothing pops). */
    var ideActive: () -> Boolean = { true }

    private val osPosted = OsNotices.Posted()

    /** An event that may deserve an OS notification ([OsNotices]): posted once, when it does. */
    fun osNotice(event: OsNotices.Event) {
        val post = osNotifier ?: return
        if (!OsNotices.shouldNotify(osNotifications, ideActive(), event)) return
        if (!osPosted.first(OsNotices.keyOf(event))) return
        runCatching { post(OsNotices.noticeOf(event)) }
    }

    /** A stream reported these task updates (from [route]/[serverSideType]): the ledger follows them. */
    fun observeTasks(tasks: List<ProgressTask>, route: String?, serverSideType: String?) {
        for (task in tasks) taskLedger.observe(task, TaskOriginEntry(task.taskId, baseUrl, route, serverSideType))
    }

    /**
     * The stream that carried [taskIds] ended. A task it left running keeps going on the server for a
     * grace period: it is resumed (`_progress-resume`); one that cannot be stops being followed.
     */
    fun streamEnded(taskIds: Collection<String>) {
        val lost = tasks.unfinished(taskIds)
        val resumable = lost.mapNotNull { taskLedger.get(it) }.filter { it.taskId !in reattaching }
        tasks.streamEnded(taskIds.filterNot { id -> id in reattaching || resumable.any { it.taskId == id } })
        resumable.forEach { resume(it) }
    }

    /**
     * The app (re)loaded: the remembered tasks no stream feeds any more are asked for
     * (`_progress-tasks`); the server answers the caller's own ones — shown again — and each still
     * running is resumed. Ids not answered are forgotten.
     */
    fun reattachTasks() {
        // a task already being picked up (an earlier reload, a resume in flight) is not asked twice
        val asked = TaskReattach.lost(taskLedger) { tasks.isFollowing(it) || it in reattaching }
            .filter { reattaching.add(it.taskId) }
        if (asked.isEmpty()) return
        val first = asked.first()
        executor.submit {
            val answer = runCatching {
                apiClient.runAction(
                    first.route, "", ProgressTasks.TASKS_ACTION, first.serverSideType, "mateu-task-center",
                    emptyMap(), appState, ProgressTasks.tasksParameters(asked.map { it.taskId }),
                )
            }.onFailure { println("[Mateu] reattach failed: ${it.message}") }.getOrNull()
            if (answer == null) {
                asked.forEach { reattaching.remove(it.taskId) }
                return@submit
            }
            val plan = TaskReattach.plan(asked, ProgressTasks.commandsOf(answer))
            taskLedger.forget(plan.forget)
            plan.forget.forEach { reattaching.remove(it) }
            SwingUtilities.invokeLater {
                plan.report.forEach { reportReattached(it, answer) }
                plan.resume.forEach { resume(it) }
            }
        }
    }

    /** Streams one task again (`_progress-resume`): its page-level parts are applied as they come. */
    private fun resume(entry: TaskOriginEntry) {
        reattaching.add(entry.taskId)
        executor.submit {
            val seen = java.util.concurrent.ConcurrentHashMap.newKeySet<String>()
            seen.add(entry.taskId)
            runCatching {
                apiClient.runActionStream(
                    entry.route, "", ProgressTasks.RESUME_ACTION, entry.serverSideType, "mateu-task-center",
                    emptyMap(), appState, ProgressTasks.resumeParameters(entry.taskId),
                ) { increment ->
                    val reported = ProgressTasks.commandsOf(increment)
                    reported.forEach { seen.add(it.taskId) }
                    observeTasks(reported, entry.route, entry.serverSideType)
                    SwingUtilities.invokeLater { applyResumed(increment) }
                }
            }.onFailure { println("[Mateu] resume of task ${entry.taskId} failed: ${it.message}") }
            // a resume that ends before its task does is not resumed again (until the next reload)
            SwingUtilities.invokeLater {
                tasks.streamEnded(seen)
                reattaching.remove(entry.taskId)
            }
        }
    }

    /** Task ids a `_progress-tasks` / `_progress-resume` of this session is handling right now. */
    private val reattaching: MutableSet<String> = java.util.concurrent.ConcurrentHashMap.newKeySet()

    /** A resume stream's increment: only its page-level parts (tasks, messages, inbox changes). */
    private fun applyResumed(increment: com.fasterxml.jackson.databind.JsonNode) {
        for (task in TaskReattach.resumed(ProgressTasks.commandsOf(increment))) reportReattached(task, increment)
        for (spec in MessageSpecs.messagesOf(increment)) {
            if (spec.text.isBlank()) continue
            messagePresenter?.invoke(spec) { runReattachedAction(it) }
            osNotice(OsNotices.Event.InboxMessage(spec))
        }
        inbox.applyChanges(InboxItems.changesOf(increment))
    }

    private fun reportReattached(task: ProgressTask, increment: com.fasterxml.jackson.databind.JsonNode?) {
        tasks.report(
            task, increment,
            cancel = { cancelReattached(task) },
            runAction = { runReattachedAction(it) },
            retry = null,
        )
        if (task.state.terminal) taskLedger.forget(listOf(task.taskId))
    }

    /** A reattached task's actions: only a route (the screen that could run an action id is gone). */
    private fun runReattachedAction(action: NoticeAction) {
        val route = action.route ?: return
        openViewHandler?.invoke(action.label ?: route, route, "", null, null)
    }

    private fun cancelReattached(task: ProgressTask) {
        val entry = taskLedger.get(task.taskId)
        executor.submit {
            val answer = runCatching {
                apiClient.runAction(
                    entry?.route, "", ProgressTasks.CANCEL_ACTION, entry?.serverSideType, "mateu-task-center",
                    emptyMap(), appState, ProgressTasks.cancelParameters(task),
                )
            }.getOrNull() ?: return@submit
            SwingUtilities.invokeLater {
                ProgressTasks.commandsOf(answer).forEach { reportReattached(TaskReattach.reattached(it), answer) }
            }
        }
    }

    /** The app's notification inbox (`NotificationsSupplier`), posted by the host to the IDE. */
    val inbox = InboxSync(this)

    /** Host hook: brings up where the inbox lives (the IDE's Notifications tool window). */
    var openNotificationsView: (() -> Unit)? = null

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

    /** Like [openViewHandler] for content of ANOTHER backend: (label, route, consumedRoute, sst,
     *  actionId, baseUrl) — a remote menu option, or a remote screen mounted as the home. */
    var openRemoteViewHandler: ((String, String?, String?, String?, String?, String) -> Unit)? = null

    /** The app's `homeBaseUrl` (AppDto): absolute when the server mounted a REMOTE screen as the home. */
    var homeBaseUrl: String? = null

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
            // an option of another backend (a remote menu's leaf) loads from there, naming its own
            // view type or none — never the shell's (ContentTarget)
            val remote = openRemoteViewHandler
            if (remote != null && ContentTarget.isForeign(t("baseUrl"), baseUrl)) {
                remote(t("label"), t("route"), t("consumedRoute"),
                    ContentTarget.optionServerSideType(t("serverSideType"), t("baseUrl"), baseUrl, appServerSideType),
                    t("actionId"), ContentTarget.optionBase(t("baseUrl"), baseUrl))
                return
            }
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

    private var liveWanted = false
    private var presenceWanted = false

    fun syncLiveUpdates(wanted: Boolean) {
        liveWanted = wanted
        syncStream()
    }

    /** Record presence (`@App(presence)`): record views report themselves; the changes ride the stream. */
    val presence = PresenceHub { parameters ->
        apiClient.runAction(appRootRoute, "", Presence.ACTION_ID, appServerSideType, "mateu-presence", emptyMap(), emptyMap(), parameters)
    }

    fun syncPresence(wanted: Boolean) {
        presenceWanted = wanted
        presence.configure(wanted)
        syncStream()
    }

    private fun syncStream() {
        val wanted = liveWanted || presenceWanted
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
        if (wanted && agentChannel == null && !agentStopped) agentChannel = AgentChannelStream(this).also { it.start() }
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
            is AgentPush.Effect.Query -> {
                if (agentStopped) return
                agentOperatingTouched()
                agentScreen.submit(effect)
            }
            AgentPush.Effect.Ignore -> Unit
        }
    }

    // ── an agent reading and operating this window's screen (query messages) ──

    /** Answers the channel's `query` messages ([AgentScreenQueries]). */
    val agentScreen: AgentScreenQueries.Runner by lazy { AgentScreenQueries.Runner(this) }

    /** Since when an agent operates this window (the notice's clock). EDT. */
    val agentOperation = AgentScreenQueries.Operation()

    /**
     * Shows (true) or hides (false) the "An AI agent is operating this screen" notice, whose Stop
     * calls [stopAgent]. Set by the host (a sticky IDE notification); EDT.
     */
    var agentOperatingPresenter: ((Boolean) -> Unit)? = null

    /** The user pressed Stop: the channel stays closed until they connect an agent again. */
    @Volatile var agentStopped: Boolean = false
        private set

    private var agentOperatingTimer: javax.swing.Timer? = null

    private fun agentOperatingTouched(now: Long = System.currentTimeMillis()) {
        if (agentOperation.touch(now)) agentOperatingPresenter?.invoke(true)
        if (agentOperatingTimer == null) {
            agentOperatingTimer = javax.swing.Timer(15_000) {
                if (!agentOperation.active(System.currentTimeMillis())) {
                    agentOperatingTimer?.stop()
                    agentOperatingTimer = null
                    agentOperatingPresenter?.invoke(false)
                }
            }.apply { start() }
        }
    }

    /**
     * Stop (the notice's button): every pairing removed (`_agent-unpair`) and this window's channel
     * closed, so no agent — the user's own included — reaches it until "Connect AI" again. EDT.
     */
    fun stopAgent() {
        agentOperation.stop()
        agentOperatingTimer?.stop()
        agentOperatingTimer = null
        agentOperatingPresenter?.invoke(false)
        disconnectAgents()
        agentStopped = true
        agentChannel?.stop()
        agentChannel = null
    }

    /** A pairing asked for while the channel was stopped: sent once the channel opened again. */
    private var pairWhenOpen: (() -> Unit)? = null

    /** The channel delivered its first message (EDT): the problem clears, a waiting pairing goes. */
    fun agentChannelOpened() {
        agentPairing.channelOpened()
        pairWhenOpen?.let { pairWhenOpen = null; it() }
    }

    /** Asks for a new one-time pairing code (`_agent-pair`); the answer lands in [agentPairing]. */
    fun requestAgentPairing(now: () -> Long = System::currentTimeMillis) {
        if (agentStopped) {
            // connecting again after Stop: reopen the channel first (the server needs it registered)
            agentStopped = false
            agentPairing.requesting()
            pairWhenOpen = { requestAgentPairing(now) }
            if (agentPush && agentChannel == null) agentChannel = AgentChannelStream(this).also { it.start() }
            return
        }
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

    /** The signed-in user the app shell names (AppDto.user), published by renderApp; null = anonymous. */
    var appUser: io.mateu.ijp.ui.UserMenu.User? = null

    /** Whether the plugin holds a sign-in for this UI (the host reads its auth; blocking — call it off the EDT). */
    var signOutAvailable: () -> Boolean = { false }

    /** Ends this UI's sign-in (the host's auth) — the user menu's Sign out; null when the host has none. */
    var signOutHandler: (() -> Unit)? = null

    /** The user menu's Sign out: the host forgets the session, then the app restarts from its root. */
    fun requestSignOut() {
        signOutHandler?.invoke()
        onSignedOut?.invoke()
    }

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
                inbox.applyChanges(InboxItems.changesOf(increment))
                if (!quiet) {
                    for (spec in MessageSpecs.messagesOf(increment)) {
                        if (spec.text.isBlank()) continue
                        val presenter = messagePresenter
                        if (presenter != null) {
                            presenter(spec) { action ->
                                val route = action.route
                                if (route != null) openAppRoute(spec.title.ifBlank { route }, route)
                                else action.actionId?.let { runAppAction(it, initiator) }
                            }
                        } else {
                            notifier?.invoke(spec.title.ifBlank { null }, spec.text, spec.variant, null)
                        }
                    }
                }
            }
        }
    }

    /** The development-mode live reload follower (io.mateu.ijp.live.LiveReload), stopped with the session. */
    var liveReload: io.mateu.ijp.live.LiveReload.Follower? = null

    /** The islands (MicroFrontends, embedded orchestrators) this session's views have rendered. */
    private val islands = LinkedHashSet<AppContext>()

    @Synchronized fun rememberIsland(island: AppContext) { islands.add(island) }

    @Synchronized fun forgetIsland(island: AppContext) { islands.remove(island) }

    /** The session ends (project closed): the stream, the idle watcher, its islands and the pool stop. */
    fun dispose() {
        synchronized(this) { islands.toList() }.forEach { it.dispose() }
        liveReload?.stop()
        liveReload = null
        syncLiveUpdates(false)
        presence.dispose()
        syncPresence(false)
        tasks.closeAll()
        agentChannel?.stop()
        agentChannel = null
        agentOperatingTimer?.stop()
        agentOperatingTimer = null
        agentScreen.dispose()
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
