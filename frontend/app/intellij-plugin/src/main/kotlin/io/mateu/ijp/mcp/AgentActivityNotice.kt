package io.mateu.ijp.mcp

import com.intellij.notification.Notification
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.project.ProjectManager
import io.mateu.ijp.plugin.loadMateuConfig
import io.mateu.ijp.ui.MoneyValues
import java.util.concurrent.atomic.AtomicBoolean

/**
 * "An AI agent is operating <product>" — a sticky, non-modal notice in the app window while an agent
 * is calling the desktop MCP server (a call in the last [DesktopMcpService.ACTIVE_WINDOW_MS]), with
 * Stop: the server is turned off at once (and stays off until the user turns it on again). The
 * notice goes away by itself once the agent has been quiet for that long.
 */
object AgentActivityNotice {

    private const val GROUP = "Mateu agent"
    private val installed = AtomicBoolean(false)

    @Volatile private var shown: Notification? = null
    private var sweeper: javax.swing.Timer? = null

    fun install(service: DesktopMcpService = DesktopMcpService.getInstance()) {
        if (!installed.compareAndSet(false, true)) return
        service.subscribe { ApplicationManager.getApplication().invokeLater { sync(service) } }
    }

    private fun sync(service: DesktopMcpService) {
        val active = service.agentActive()
        val current = shown
        if (active && (current == null || current.isExpired)) show(service)
        if (!active && current != null) { current.expire(); shown = null }
        if (active && sweeper == null) {
            sweeper = javax.swing.Timer(15_000) { sync(service) }.apply { start() }
        } else if (!active) {
            sweeper?.stop(); sweeper = null
        }
    }

    private fun show(service: DesktopMcpService) {
        val texts = McpTexts.of(MoneyValues.uiLocale())
        val project = ProjectManager.getInstance().openProjects.firstOrNull { !it.isDisposed }
        val product = loadMateuConfig(project).productName
        val notification = NotificationGroupManager.getInstance().getNotificationGroup(GROUP)
            .createNotification(texts.operating.format(product), NotificationType.WARNING)
            .addAction(NotificationAction.createSimpleExpiring(texts.stop) {
                service.stopByUser()
                shown = null
                NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
                    .createNotification(texts.stopped, NotificationType.INFORMATION)
                    .notify(project)
            })
        shown = notification
        notification.notify(project)
        // a screen reader user hears it too, not only sees a balloon
        project?.let { p ->
            com.intellij.openapi.wm.WindowManager.getInstance().getFrame(p)?.rootPane?.let {
                io.mateu.ijp.ui.announce(it, texts.operating.format(product))
            }
        }
    }
}
