package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.WindowManager
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import java.awt.FlowLayout
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JPanel
import javax.swing.SwingConstants
import javax.swing.SwingUtilities
import io.mateu.ijp.ui.plain

/**
 * Boots the Mateu app for the project at STARTUP (see MateuFocusedModeActivity), not when the
 * navigator tool window is first opened — so the app-menu toolbar widget and the Search
 * Everywhere actions are available right away, without having to reveal the panel first.
 * The tool window just adopts [navigatorRoot] when (and if) it is opened.
 *
 * When the installable carries app-registry coordinates (`mateu.registryUrl` + `mateu.appId`),
 * boot goes through the registry first: the entry supplies the backend baseUrl and the launch
 * parameters, and its `intellij` block may demand a minimum plugin version and IDE build — an
 * unmet requirement blocks the app behind an "Update required" panel whose Update button runs
 * the IDE's own Check-for-Updates flow (which installs plugin AND platform updates).
 */
@Service(Service.Level.PROJECT)
class MateuProjectService(private val project: Project) : com.intellij.openapi.Disposable {
    init {
        // the status-bar progress while a request waits for its server: from the start, not only once a
        // UI is open (the hub's own requests — adding a UI, reading a manifest — wait for servers too)
        MateuServerProgress.install()
    }


    /** The project closes: the live-updates stream and the idle watcher stop with the session. */
    override fun dispose() {
        session?.dispose()
    }

    /** Stable container the navigator tool window shows; the app shell renders into it. */
    val navigatorRoot: JPanel = JPanel(BorderLayout())

    var session: AppSession? = null
        private set

    private var booting = false
    private var homeOpened = false

    /** (Re)loads the app root of the current session (set by [boot]). */
    private var loadRoot: () -> Unit = {}

    /** Opens the UI's home again (set by [boot]) — the Home button: closing the home tab must not
     *  leave the UI with no way back to it. */
    private var reopenHome: (() -> Unit)? = null

    /** The open UI's home: the shell's home route / first menu leaf, or the root of a UI with no
     *  shell — in its central tab (re-focused when still open, reopened when it was closed). */
    fun openHome() {
        reopenHome?.invoke()
    }

    fun hasHome(): Boolean = session != null && reopenHome != null

    /** Whether a root answer carries an app shell (an `App` component anywhere in it). */
    private fun hasAppShell(node: JsonNode): Boolean {
        if (node.path("metadata").text("type") == "App") return true
        return node.any { it.isContainerNode && hasAppShell(it) }
    }

    /**
     * Drops the current session and boots again from the settings (call on the EDT) — what a Mateu App
     * run configuration does when it opens the app it just started on the desktop: the backend may
     * not have been up when the project opened, or the settings pointed elsewhere.
     */
    fun reconnect() {
        if (booting) return
        session?.dispose()
        session = null
        project.putUserData(MATEU_SESSION, null)
        homeOpened = false
        ensureBooted()
    }

    /** Boot the session + app shell (idempotent; call on the EDT). */
    fun ensureBooted() {
        if (session != null || booting) return
        val cfg = loadMateuConfig(project)
        // A project with no Mateu backend configured is left alone: no HTTP, no title, no panels.
        if (!cfg.configured) {
            showStatus("No Mateu backend configured for this project — Settings | Tools | Mateu.")
            return
        }
        // The desktop hub: the user's list of UIs until they open one (io.mateu.ijp.hub).
        if (cfg.hub && hubEntryId == null) {
            showHub()
            openLinkFromEnvironmentOnce()
            return
        }
        if (cfg.registryUrl == null || cfg.appId == null) {
            boot(cfg.baseUrl, cfg.config, cfg.route)
            return
        }
        booting = true
        showStatus("Contacting app registry…")
        ApplicationManager.getApplication().executeOnPooledThread {
            val result = runCatching { AppRegistry.fetch(cfg.registryUrl, cfg.appId, ObjectMapper()) }
            SwingUtilities.invokeLater {
                booting = false
                result.fold(
                    onSuccess = { entry ->
                        val block = AppRegistry.versionBlock(entry)
                        if (block == null) {
                            boot(entry.baseUrl, cfg.config + entry.parameters, cfg.route)
                        } else {
                            showUpdateRequired(block)
                        }
                    },
                    onFailure = { e ->
                        showBootProblem(
                            "Could not reach the app registry",
                            e.message ?: e.toString(),
                            NotificationType.ERROR,
                        )
                    },
                )
            }
        }
    }

    private fun boot(baseUrl: String, config: Map<String, Any?>, route: String) {
        if (session != null) return
        // the running tasks remembered by the previous IDE run, before any session asks for its ledger
        io.mateu.ijp.state.TaskLedgers.attach(MateuTaskStore.getInstance())
        val s = AppSession(baseUrl, config, io.mateu.ijp.auth.MateuAuthService.getInstance(project).forCurrentUi())
        s.contextSelectorsInToolbar = loadMateuConfig(project).focused
        if (s.contextSelectorsInToolbar) s.onAssistant = { assistant -> MateuAssistantToolWindow.show(project, s, assistant) }
        // route loads from the UI's static bundle, when it ships one (hub entries only)
        if (hubEntryId != null) s.apiClient.bundle = hubBundle
        session = s
        val viewManager = MateuViewManager(project, s)
        s.openViewHandler = viewManager::openView
        s.openRemoteViewHandler = viewManager::openRemoteView
        s.openDetailHandler = viewManager::openDetail
        // an assistant-rendered screen (render-screen, target content) → a transient preview tab
        s.contentPreviewHandler = viewManager::showPreview
        // The toolbar widget and the menu-derived IDE actions find the session via the project.
        project.putUserData(MATEU_SESSION, s)
        // Standalone-app window title: app-level SetWindowTitle lands on the real IDE frame, and the
        // app title feeds the frame-title builder so no "workspace"/IDE tell shows in the title bar.
        // Only the STANDALONE distribution owns the IDE frame; inside a developer's IDE the platform
        // keeps its own title and the app's title goes to the Mateu tool window instead.
        val standalone = loadMateuConfig(project).standalone
        if (standalone) {
            s.frame = WindowManager.getInstance().getFrame(project)
            MateuFrameTitle.set(project, loadMateuConfig(project).productName)
        }
        s.onAppMenuChanged = {
            MateuMenuActions.sync(s)
            if (standalone) s.appTitle?.let { MateuFrameTitle.set(project, it) }
            // Standalone landing: open the first menu entry once, so the app lands on content
            // (listing in the bottom panel / page in an editor tab) instead of an empty editor.
            if (standalone && !homeOpened) {
                homeOpened = true
                openHomeView(s)
            }
        }
        // Backend messages (toasts on the web) surface as IDE notifications. Undoable toasts
        // (MessageDto.undoActionId) carry an expiring action link dispatching the reverse action.
        s.notifier = { title, text, variant, undo ->
            val type = when (variant) {
                "error" -> NotificationType.ERROR
                "warning" -> NotificationType.WARNING
                else -> NotificationType.INFORMATION
            }
            val notification = NotificationGroupManager.getInstance()
                .getNotificationGroup(MessageGroups.groupFor(variant))
                // notification content is HTML: a backend message is sanitised, its title escaped
                .createNotification(io.mateu.ijp.ui.SafeHtml.escape(title ?: "Mateu"), io.mateu.ijp.ui.SafeHtml.sanitize(text), type)
            if (undo != null) {
                notification.addAction(
                    com.intellij.notification.NotificationAction.createSimpleExpiring(undo.first) { undo.second() },
                )
            }
            notification.notify(project)
        }
        // Backend messages with their persistence/actions/key, long-running tasks as platform
        // tasks, and the notification inbox in the Notifications tool window.
        MateuPlatformNotices.install(project, s)

        val ctx = AppContext(s)
        // Version skew (io.mateu.ijp.api.BuildSkew): the backend was redeployed, or a refusal came
        // from a stale screen → a STICKY notification (the errors group) with a Reload action that
        // reloads the shell and every open Mateu view.
        s.onBuildNotice = { kind ->
            val texts = io.mateu.ijp.api.BuildSkew.texts(io.mateu.ijp.ui.MoneyValues.uiLocale())
            val stale = kind == io.mateu.ijp.api.BuildSkew.Notice.STALE
            NotificationGroupManager.getInstance()
                .getNotificationGroup(MessageGroups.ERRORS)
                .createNotification(
                    "Mateu",
                    io.mateu.ijp.ui.SafeHtml.escape(if (stale) texts.stale else texts.updated),
                    if (stale) NotificationType.ERROR else NotificationType.WARNING,
                )
                .addAction(
                    com.intellij.notification.NotificationAction.createSimpleExpiring(texts.reload) {
                        loadRoot()
                        viewManager.reloadAll()
                    },
                )
                .notify(project)
        }
        ctx.appShell = true
        // The root of a UI with NO app shell (the counter demo: a plain page) is content, not a
        // navigator: in the desktop app it opens like any page — in a central editor tab — and the
        // side panel folds away. It used to paint inside the "Mateu" tool window, beside an empty
        // editor area.
        var shellLess = false
        val openRootView = { viewManager.openView(hubEntryName ?: "Home", route, null, null, null) }
        reopenHome = { if (shellLess) openRootView() else openHomeView(s) }
        loadRoot = {
            ctx.initialLoad(route) { increment ->
                if (!standalone || hasAppShell(increment)) return@initialLoad false
                shellLess = true
                if (!homeOpened) {
                    homeOpened = true
                    openRootView()
                    com.intellij.openapi.wm.ToolWindowManager.getInstance(project).getToolWindow("Mateu")?.hide()
                }
                true
            }
        }
        val root = ctx.newSlot()
        ctx.contentPane = root
        navigatorRoot.removeAll()
        navigatorRoot.add(io.mateu.ijp.ui.blockable(ctx, root), BorderLayout.CENTER)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
        // Loads the App fragment → renderApp publishes the menu (toolbar widget, IDE actions)
        // and draws the navigator into navigatorRoot.
        loadRoot()
        // @AppContext selector changed → rebuild the shell against the new context; open views
        // pick the new appState up on their next request (it travels with every call).
        s.onAppContextChanged = { loadRoot() }
        // The idle warning signed out: back to the app's root, as a fresh start.
        s.onSignedOut = { loadRoot() }
        // The user menu's Sign out (AppDto.user): this UI's session only — the other UIs keep theirs.
        val auth = io.mateu.ijp.auth.MateuAuthService.getInstance(project)
        s.signOutAvailable = { auth.isSignedIn() }
        s.signOutHandler = { auth.signOut() }
        // Development mode ("Run Mateu App (Live)"): the backend's manifest names its live-reload
        // events — a YAML edit, a HotSwap's reload or a restart re-renders the shell and every open
        // view, like the browser. A production backend names none: nothing is followed.
        s.liveReload = io.mateu.ijp.live.LiveReload.follow(baseUrl) {
            SwingUtilities.invokeLater {
                if (session === s) {
                    loadRoot()
                    viewManager.reloadAll()
                }
            }
        }
    }

    /** Standalone landing: open the app's @HomeRoute (like the web shells) — falling back to the
     *  first navigable menu leaf when the app declares none. Routed through the STANDARD opener,
     *  so the content decides its own placement exactly like a navigator click: a page/wizard
     *  fills a central editor tab, a Crud listing lands in the bottom results panel. */
    private fun openHomeView(s: AppSession) {
        val home = s.homeRoute
        val homeBase = io.mateu.ijp.state.ContentTarget.homeBase(s.homeBaseUrl, s.baseUrl)
        val remote = s.openRemoteViewHandler
        if (!home.isNullOrBlank() && remote != null && io.mateu.ijp.state.ContentTarget.isForeign(homeBase, s.baseUrl)) {
            // a remote screen mounted as the home: loaded from ITS backend, not the shell's
            remote(s.appTitle ?: "Home", home, s.homeConsumedRoute, s.homeServerSideType, null, homeBase)
            return
        }
        if (!home.isNullOrBlank()) {
            s.openViewHandler?.invoke(
                s.appTitle ?: "Home",
                home,
                s.homeConsumedRoute,
                s.homeServerSideType,
                null,
            )
            return
        }
        val menu = s.appMenu ?: return
        val leaf = firstLeaf(menu) ?: return
        s.openMenuEntry(leaf)
    }

    private fun firstLeaf(items: JsonNode): JsonNode? {
        if (!items.isArray) return null
        for (item in items) {
            if (item.bool("separator") || item.text("label").isBlank()) continue
            val submenus = item.path("submenus")
            if (submenus.isArray && !submenus.isEmpty) {
                firstLeaf(submenus)?.let { return it }
            } else if (!io.mateu.ijp.state.ShellFlows.isRuleLeaf(item)) {
                // a leaf that RUNS a flow is not a landing page
                return item
            }
        }
        return null
    }

    // ── the desktop hub (variant `hub`): a list of UIs, one open at a time ───────────────────

    /** The hub entry the session belongs to (null = the list is showing, or this is no hub). */
    var hubEntryId: String? = null
        private set

    /** The open hub entry's static bundle, when its manifest names one (see [boot]). */
    private var hubBundle: io.mateu.ijp.api.StaticBundle? = null

    /** The open hub entry's name (the tab title of a UI with no shell, until its own title arrives). */
    private var hubEntryName: String? = null

    /** Back to "My UIs": the open UI's session, views and results close. */
    fun showHub() {
        session?.dispose()
        session = null
        reopenHome = null
        hubBundle = null
        project.putUserData(MATEU_SESSION, null)
        hubEntryId = null
        homeOpened = false
        // the UI's sign-in stays (per-UI sessions, OidcSessions): opening it again finds you signed in
        closeViews()
        MateuFrameTitle.set(project, loadMateuConfig(project).productName)
        val store = io.mateu.ijp.hub.HubStore.getInstance()
        store.seedOnce()
        navigatorRoot.removeAll()
        navigatorRoot.add(io.mateu.ijp.hub.HubPanel(project, store, ::openHubEntry), BorderLayout.CENTER)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
        // read by the desktop smoke test (scripts/desktop-smoke.sh): the hub really came up
        com.intellij.openapi.diagnostic.Logger.getInstance(MateuProjectService::class.java)
            .info("$HUB_SHOWN (${store.list.entries.size} UIs)")
        // a shell-less UI folded the panel away: the list must be visible again
        if (loadMateuConfig(project).standalone) {
            com.intellij.openapi.wm.ToolWindowManager.getInstance(project).getToolWindow("Mateu")?.show()
        }
    }

    /**
     * Opens a hub entry: its manifest is fetched again (name, icon and sign-in may have changed; a UI
     * this build cannot render is refused), the project points at it — base URL, route and the sign-in
     * its manifest declares (tokens stay per base URL in PasswordSafe) — and the session boots.
     */
    fun openHubEntry(entry: io.mateu.ijp.hub.HubEntry, route: String?) {
        val store = io.mateu.ijp.hub.HubStore.getInstance()
        showStatus("Opening ${entry.name}…")
        ApplicationManager.getApplication().executeOnPooledThread {
            val fetched = io.mateu.ijp.hub.HubManifest.fetch(entry.baseUrl, allowInsecure = io.mateu.ijp.hub.hubOptions().allowInsecure)
            val shipped = (fetched as? io.mateu.ijp.hub.HubManifest.Fetch.Ok)?.takeUnless { it.missing }?.manifest?.bundle
            // a static/hybrid site: its screens come from the bundle (loads), its actions from the server
            val bundle = shipped?.let { io.mateu.ijp.hub.HubManifest.fetchBundle(entry.baseUrl, it) }
            SwingUtilities.invokeLater {
                hubBundle = bundle
                val manifest = (fetched as? io.mateu.ijp.hub.HubManifest.Fetch.Ok)?.takeUnless { it.missing }?.manifest
                val refusal = manifest?.let { io.mateu.ijp.hub.HubManifest.refusal(it) }
                if (refusal != null) {
                    showHub()
                    // a newer Mateu app would open it ([AppCompat] newer wire): offer the update
                    val updatable = manifest.bundle == null &&
                        io.mateu.ijp.hub.HubManifest.compat(manifest).reason == io.mateu.ijp.hub.AppCompat.Reason.NEWER_WIRE
                    io.mateu.ijp.hub.HubUpdate.notifyCompat(project, "Can't open ${entry.name}", refusal, NotificationType.WARNING, updatable)
                    return@invokeLater
                }
                // ahead of this app: it opens, with a suggestion to update
                manifest?.let { m ->
                    val compat = io.mateu.ijp.hub.HubManifest.compat(m)
                    if (compat.status == io.mateu.ijp.hub.AppCompat.Status.RECOMMENDED) {
                        io.mateu.ijp.hub.HubUpdate.notifyCompat(
                            project, "${entry.name} runs a newer Mateu",
                            io.mateu.ijp.hub.HubManifest.compatMessage(m, compat).orEmpty(), NotificationType.INFORMATION, true,
                        )
                    }
                }
                // offline: the stored copy of the manifest still says how to sign in
                val current = store.edit { list ->
                    manifest?.let { list.refresh(entry.id, it) }
                    list.touch(entry.id)
                    list.get(entry.id)
                } ?: entry
                MateuSettings.getInstance(project).state.apply {
                    baseUrl = current.baseUrl
                    this.route = route ?: "/"
                    registryUrl = ""
                    appId = ""
                }
                // which of its sign-in providers: the one holding a session, the one used last, the only one
                // — else the first for now, and the sign-in below asks (SignInChooserDialog)
                val providers = current.providers
                val sessions = io.mateu.ijp.auth.MateuCredentials.sessions
                val chosen = io.mateu.ijp.hub.SignInProviders.preselected(
                    providers,
                    { sessions.isSignedIn(io.mateu.ijp.auth.OidcSessions.SessionKey.of(current.baseUrl, it.issuer, it.clientId)) },
                    current.signInProvider,
                )
                applySignInProvider(chosen ?: providers.firstOrNull())
                hubEntryId = current.id
                hubEntryName = current.name
                // no forgetSession: the auth service reads THIS UI's session (backend + issuer + client)
                session?.dispose()
                session = null
                project.putUserData(MATEU_SESSION, null)
                homeOpened = false
                closeViews()
                // sign in before the first screen (the manifest's loginOnStart, default true): a UI
                // booted signed out would answer its first screen with a 401
                val auth = io.mateu.ijp.auth.MateuAuthService.getInstance(project)
                if (providers.isNotEmpty() && (manifest?.loginOnStart ?: true) && !auth.isSignedIn()) {
                    auth.signIn { ensureBooted() }
                } else {
                    ensureBooted()
                }
            }
        }
    }

    // ── sign-in providers of the open hub UI (manifest `auth.providers`) ─────────────────────

    private fun openEntry(): io.mateu.ijp.hub.HubEntry? =
        hubEntryId?.let { io.mateu.ijp.hub.HubStore.getInstance().list.get(it) }

    /** The open hub UI's sign-in providers for the desktop; empty outside the hub. */
    fun signInProviders(): List<io.mateu.ijp.hub.HubManifest.Auth> = openEntry()?.providers.orEmpty()

    fun signInUiName(): String = openEntry()?.name ?: loadMateuConfig(project).productName

    fun lastSignInProvider(): String? = openEntry()?.signInProvider

    /** Points the project's OIDC settings at [auth] (null = no sign-in): its session is the one used. */
    fun useSignInProvider(auth: io.mateu.ijp.hub.HubManifest.Auth?) = applySignInProvider(auth)

    /** Remembers, on the hub entry, the provider just signed in with. */
    fun signedInWith(providerId: String) {
        val id = hubEntryId ?: return
        if (providerId.isBlank()) return
        io.mateu.ijp.hub.HubStore.getInstance().edit { it.rememberProvider(id, providerId) }
    }

    private fun applySignInProvider(auth: io.mateu.ijp.hub.HubManifest.Auth?) {
        MateuSettings.getInstance(project).state.apply {
            if (auth != null) {
                authMode = MateuSettings.AuthMode.OIDC
                oidcIssuer = auth.issuer
                oidcClientId = auth.clientId
                oidcScope = auth.scopes.joinToString(" ")
                oidcAudience = auth.audience.orEmpty()
                oidcProviderId = auth.id
                oidcDeviceEndpoint = ""
                oidcTokenEndpoint = ""
            } else {
                authMode = MateuSettings.AuthMode.NONE
                oidcProviderId = ""
            }
        }
    }

    /** A `mateu://` link the OS handed to the app: the add flow, then the UI opens. */
    fun handleHubLink(link: String) {
        if (!loadMateuConfig(project).hub) return
        io.mateu.ijp.hub.HubAdd.fromLink(project, link, io.mateu.ijp.hub.HubStore.getInstance(), ::openHubEntry)
    }

    /** Closes the previous UI's screens: its editor tabs and its assistant. */
    private fun closeViews() {
        val editors = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
        editors.openFiles.forEach(editors::closeFile)
        MateuAssistantToolWindow.show(project, null, null)
    }

    // ── registry boot screens (shown inside the navigator panel) ────────────────────────────

    private fun showStatus(text: String) {
        navigatorRoot.removeAll()
        navigatorRoot.add(JBLabel(plain(text), SwingConstants.CENTER), BorderLayout.CENTER)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
    }

    private fun showUpdateRequired(block: AppRegistry.Block) {
        showBlockingPanel("Update required", block.message) {
            add(JButton("Update now").apply {
                addActionListener {
                    if (io.mateu.ijp.update.MateuUpdater.isEnabled()) {
                        // The desktop app updates itself (io.mateu.ijp.update): the IDE's own check is off
                        // there, so CheckForUpdate would do nothing useful.
                        io.mateu.ijp.update.MateuUpdater.checkNow { r ->
                            when (r) {
                                is io.mateu.ijp.update.UpdateResult.ReadyToRestart -> io.mateu.ijp.update.MateuUpdater.restart()
                                is io.mateu.ijp.update.UpdateResult.ReinstallNeeded -> io.mateu.ijp.ui.SafeHtml.browse(r.installerUrl ?: block.downloadUrl)
                                else -> block.downloadUrl?.let { io.mateu.ijp.ui.SafeHtml.browse(it) }
                            }
                        }
                        return@addActionListener
                    }
                    // A developer's IDE: the IDE's own update flow (plugin AND platform updates).
                    // (Every ActionUtil.invokeAction/performAction overload is deprecated on the 2025.2
                    // baseline the plugin targets; keeping the simplest form until the since-build rises.)
                    val action = ActionManager.getInstance().getAction("CheckForUpdate")
                    if (action != null) {
                        ActionManager.getInstance().tryToExecute(action, null, navigatorRoot, ActionPlaces.UNKNOWN, true)
                    }
                    block.downloadUrl?.let { io.mateu.ijp.ui.SafeHtml.browse(it) }
                }
            })
            add(JButton("Check again").apply { addActionListener { ensureBooted() } })
        }
        showBootProblem("Update required", block.message, NotificationType.WARNING)
    }

    private fun showBootProblem(title: String, message: String, type: NotificationType) {
        if (type == NotificationType.ERROR) {
            showBlockingPanel(title, message) {
                add(JButton("Retry").apply { addActionListener { ensureBooted() } })
            }
        }
        NotificationGroupManager.getInstance()
            .getNotificationGroup("Mateu")
            .createNotification(io.mateu.ijp.ui.SafeHtml.escape(title), io.mateu.ijp.ui.SafeHtml.escape(message), type)
            .notify(project)
    }

    private fun showBlockingPanel(title: String, message: String, buttons: JPanel.() -> Unit) {
        navigatorRoot.removeAll()
        val panel = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            border = JBUI.Borders.empty(24)
        }
        panel.add(JBLabel("<html><b>${io.mateu.ijp.ui.SafeHtml.escape(title)}</b></html>").apply { alignmentX = 0.5f })
        panel.add(Box.createVerticalStrut(8))
        panel.add(JBLabel("<html><div style='text-align:center'>${io.mateu.ijp.ui.SafeHtml.escape(message)}</div></html>").apply { alignmentX = 0.5f })
        panel.add(Box.createVerticalStrut(12))
        panel.add(JPanel(FlowLayout(FlowLayout.CENTER, 8, 0)).apply(buttons).apply { alignmentX = 0.5f })
        navigatorRoot.add(panel, BorderLayout.NORTH)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
    }

    /**
     * `MATEU_OPEN_LINK=mateu://add?u=…` in the app's environment: the hub handles that link once it is
     * up, exactly like one the OS handed over (it still ASKS before calling the address). What the
     * desktop smoke test launches the app with, so the hub's link path runs on every OS — a link from
     * the OS arrives through the platform's protocol handling, which a CI runner cannot trigger alike.
     */
    private fun openLinkFromEnvironmentOnce() {
        val link = System.getenv(OPEN_LINK_ENV)?.trim()?.ifBlank { null } ?: return
        if (!linkFromEnvironmentOpened.compareAndSet(false, true)) return
        handleHubLink(io.mateu.ijp.hub.MateuProtocolHandler.asLink(link))
    }

    companion object {
        /** The log line the desktop smoke test waits for once the hub ("My UIs") is on screen. */
        const val HUB_SHOWN = "Mateu hub: showing My UIs"
        const val OPEN_LINK_ENV = "MATEU_OPEN_LINK"
        private val linkFromEnvironmentOpened = java.util.concurrent.atomic.AtomicBoolean()
    }
}
