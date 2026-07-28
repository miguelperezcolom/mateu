package io.mateu.ijp.plugin

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.ide.BrowserUtil
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.actionSystem.ex.ActionUtil
import com.intellij.openapi.actionSystem.impl.SimpleDataContext
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
class MateuProjectService(private val project: Project) {

    /** Stable container the navigator tool window shows; the app shell renders into it. */
    val navigatorRoot: JPanel = JPanel(BorderLayout())

    var session: AppSession? = null
        private set

    private var booting = false
    private var homeOpened = false

    /** Boot the session + app shell (idempotent; call on the EDT). */
    fun ensureBooted() {
        if (session != null || booting) return
        val cfg = loadMateuConfig()
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
        val s = AppSession(baseUrl, config)
        session = s
        val viewManager = MateuViewManager(project, s)
        s.openViewHandler = viewManager::openView
        s.openDetailHandler = viewManager::openDetail
        // The toolbar widget and the menu-derived IDE actions find the session via the project.
        project.putUserData(MATEU_SESSION, s)
        // Standalone-app window title: app-level SetWindowTitle lands on the real IDE frame, and the
        // app title feeds the frame-title builder so no "workspace"/IDE tell shows in the title bar.
        s.frame = WindowManager.getInstance().getFrame(project)
        MateuFrameTitleBuilder.setFrameTitle(project, loadMateuConfig().productName)
        s.onAppMenuChanged = {
            MateuMenuActions.sync(s)
            s.appTitle?.let { MateuFrameTitleBuilder.setFrameTitle(project, it) }
            // Standalone landing: open the first menu entry once, so the app lands on content
            // (listing in the bottom panel / page in an editor tab) instead of an empty editor.
            if (!homeOpened) {
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
                .getNotificationGroup("Mateu")
                .createNotification(title ?: "Mateu", text, type)
            if (undo != null) {
                notification.addAction(
                    com.intellij.notification.NotificationAction.createSimpleExpiring(undo.first) { undo.second() },
                )
            }
            notification.notify(project)
        }

        val ctx = AppContext(s)
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
        s.openViewHandler?.invoke(
            leaf.text("label"),
            leaf.text("route"),
            leaf.text("consumedRoute"),
            leaf.text("serverSideType"),
            leaf.text("actionId"),
        )
    }

    private fun firstLeaf(items: JsonNode): JsonNode? {
        if (!items.isArray) return null
        for (item in items) {
            if (item.bool("separator") || item.text("label").isBlank()) continue
            val submenus = item.path("submenus")
            if (submenus.isArray && !submenus.isEmpty) {
                firstLeaf(submenus)?.let { return it }
            } else {
                return item
            }
        }
        return null
    }

    // ── registry boot screens (shown inside the navigator panel) ────────────────────────────

    private fun showStatus(text: String) {
        navigatorRoot.removeAll()
        navigatorRoot.add(JBLabel(text, SwingConstants.CENTER), BorderLayout.CENTER)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
    }

    private fun showUpdateRequired(block: AppRegistry.Block) {
        showBlockingPanel("Update required", block.message) {
            add(JButton("Update now").apply {
                addActionListener {
                    // The IDE's own update flow: checks (and installs) plugin AND platform updates.
                    val action = ActionManager.getInstance().getAction("CheckForUpdate")
                    if (action != null) {
                        ActionUtil.invokeAction(
                            action, SimpleDataContext.getProjectContext(project), ActionPlaces.UNKNOWN, null, null,
                        )
                    }
                    block.downloadUrl?.let(BrowserUtil::browse)
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
            .createNotification(title, message, type)
            .notify(project)
    }

    private fun showBlockingPanel(title: String, message: String, buttons: JPanel.() -> Unit) {
        navigatorRoot.removeAll()
        val panel = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            border = JBUI.Borders.empty(24)
        }
        panel.add(JBLabel("<html><b>$title</b></html>").apply { alignmentX = 0.5f })
        panel.add(Box.createVerticalStrut(8))
        panel.add(JBLabel("<html><div style='text-align:center'>$message</div></html>").apply { alignmentX = 0.5f })
        panel.add(Box.createVerticalStrut(12))
        panel.add(JPanel(FlowLayout(FlowLayout.CENTER, 8, 0)).apply(buttons).apply { alignmentX = 0.5f })
        navigatorRoot.add(panel, BorderLayout.NORTH)
        navigatorRoot.revalidate()
        navigatorRoot.repaint()
    }
}
