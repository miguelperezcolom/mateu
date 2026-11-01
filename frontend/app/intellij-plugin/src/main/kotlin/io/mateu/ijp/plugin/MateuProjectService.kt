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
        val s = AppSession(baseUrl, config, io.mateu.ijp.auth.MateuAuthService.getInstance(project))
        session = s
        val viewManager = MateuViewManager(project, s)
        s.openViewHandler = viewManager::openView
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
                        ctx.initialLoad(route)
                        viewManager.reloadAll()
                    },
                )
                .notify(project)
        }
        ctx.appShell = true
        val root = ctx.newSlot()
        ctx.contentPane = root
        navigatorRoot.removeAll()
        navigatorRoot.add(root, BorderLayout.CENTER)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
        // Loads the App fragment → renderApp publishes the menu (toolbar widget, IDE actions)
        // and draws the navigator into navigatorRoot.
        ctx.initialLoad(route)
        // @AppContext selector changed → rebuild the shell against the new context; open views
        // pick the new appState up on their next request (it travels with every call).
        s.onAppContextChanged = { ctx.initialLoad(route) }
        // The idle warning signed out: back to the app's root, as a fresh start.
        s.onSignedOut = { ctx.initialLoad(route) }
    }

    /** Standalone landing: open the app's @HomeRoute (like the web shells) — falling back to the
     *  first navigable menu leaf when the app declares none. Routed through the STANDARD opener,
     *  so the content decides its own placement exactly like a navigator click: a page/wizard
     *  fills a central editor tab, a Crud listing lands in the bottom results panel. */
    private fun openHomeView(s: AppSession) {
        val home = s.homeRoute
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

    /** Back to "My UIs": the open UI's session, views and results close. */
    fun showHub() {
        session?.dispose()
        session = null
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
            SwingUtilities.invokeLater {
                val manifest = (fetched as? io.mateu.ijp.hub.HubManifest.Fetch.Ok)?.takeUnless { it.missing }?.manifest
                val refusal = manifest?.let { io.mateu.ijp.hub.HubManifest.refusal(it) }
                if (refusal != null) {
                    showHub()
                    showBootProblem("Can't open ${entry.name}", refusal, NotificationType.WARNING)
                    return@invokeLater
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
                    val auth = current.auth
                    if (auth != null) {
                        authMode = MateuSettings.AuthMode.OIDC
                        oidcIssuer = auth.issuer
                        oidcClientId = auth.clientId
                        oidcScope = auth.scopes.joinToString(" ")
                        oidcDeviceEndpoint = ""
                        oidcTokenEndpoint = ""
                    } else {
                        authMode = MateuSettings.AuthMode.NONE
                    }
                }
                hubEntryId = current.id
                // no forgetSession: the auth service reads THIS UI's session (backend + issuer + client)
                session?.dispose()
                session = null
                project.putUserData(MATEU_SESSION, null)
                homeOpened = false
                closeViews()
                ensureBooted()
            }
        }
    }

    /** A `mateu://` link the OS handed to the app: the add flow, then the UI opens. */
    fun handleHubLink(link: String) {
        if (!loadMateuConfig(project).hub) return
        io.mateu.ijp.hub.HubAdd.fromLink(project, link, io.mateu.ijp.hub.HubStore.getInstance(), ::openHubEntry)
    }

    /** Closes the previous UI's screens: its editor tabs and its results panel tabs. */
    private fun closeViews() {
        val editors = com.intellij.openapi.fileEditor.FileEditorManager.getInstance(project)
        editors.openFiles.forEach(editors::closeFile)
        com.intellij.openapi.wm.ToolWindowManager.getInstance(project).getToolWindow("Mateu Results")
            ?.contentManager?.removeAllContents(true)
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
}
