package io.mateu.ijp.plugin

import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.BorderLayout
import javax.swing.JPanel

/**
 * Boots the Mateu app for the project at STARTUP (see MateuFocusedModeActivity), not when the
 * navigator tool window is first opened — so the app-menu toolbar widget and the Search
 * Everywhere actions are available right away, without having to reveal the panel first.
 * The tool window just adopts [navigatorRoot] when (and if) it is opened.
 */
@Service(Service.Level.PROJECT)
class MateuProjectService(private val project: Project) {

    /** Stable container the navigator tool window shows; the app shell renders into it. */
    val navigatorRoot: JPanel = JPanel(BorderLayout())

    var session: AppSession? = null
        private set

    /** Boot the session + app shell (idempotent; call on the EDT). */
    fun ensureBooted() {
        if (session != null) return
        val cfg = loadMateuConfig()
        val s = AppSession(cfg.baseUrl, cfg.config)
        session = s
        val viewManager = MateuViewManager(project, s)
        s.openViewHandler = viewManager::openView
        s.openDetailHandler = viewManager::openDetail
        // The toolbar widget and the menu-derived IDE actions find the session via the project.
        project.putUserData(MATEU_SESSION, s)
        s.onAppMenuChanged = { MateuMenuActions.sync(s) }
        // Backend messages (toasts on the web) surface as IDE notifications.
        s.notifier = { title, text, variant ->
            val type = when (variant) {
                "error" -> NotificationType.ERROR
                "warning" -> NotificationType.WARNING
                else -> NotificationType.INFORMATION
            }
            NotificationGroupManager.getInstance()
                .getNotificationGroup("Mateu")
                .createNotification(title ?: "Mateu", text, type)
                .notify(project)
        }

        val ctx = AppContext(s)
        ctx.appShell = true
        val root = ctx.newSlot()
        ctx.contentPane = root
        navigatorRoot.add(root, BorderLayout.CENTER)
        // Loads the App fragment → renderApp publishes the menu (toolbar widget, IDE actions)
        // and draws the navigator into navigatorRoot.
        ctx.initialLoad(cfg.route)
    }
}
