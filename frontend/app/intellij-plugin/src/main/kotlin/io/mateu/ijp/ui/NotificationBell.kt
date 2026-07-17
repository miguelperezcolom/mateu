package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.icons.AllIcons
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.Cursor
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.SwingUtilities

/**
 * The notification inbox bell (App.notificationsEnabled — the app class implements
 * NotificationsSupplier). Port of the web's `mateu-notification-bell`: a bell button with an
 * unread-count badge at the top of the navigator, opening a popup listing the inbox. Data comes
 * from the app-level `_notifications-list` / `_notifications-read` actions, dispatched on the APP
 * (route = the app's root route, serverSideType = the app class — the same rail as the web bell);
 * response fragments carry `data._notifications: [{id, title, text, route, unread, when}]`.
 * Clicking an entry marks it read and opens its route through the plugin's normal navigation.
 */
fun notificationBell(ctx: AppContext, metadata: JsonNode): JComponent {
    val session = ctx.session
    val rootRoute = metadata.text("rootRoute", metadata.text("route"))
    val serverSideType = metadata.text("serverSideType")

    val bell = JButton("Notifications", AllIcons.Toolwindows.Notifications)
    bell.isOpaque = false
    bell.horizontalAlignment = javax.swing.SwingConstants.LEFT

    var notifications: List<JsonNode> = emptyList()

    fun refreshBadge() {
        val unread = notifications.count { it.bool("unread") }
        bell.text = if (unread > 0) "Notifications ($unread)" else "Notifications"
    }

    /** Dispatch an app-level notifications action off the EDT and hand the inbox list back on it. */
    fun runNotificationsAction(actionId: String, parameters: Map<String, Any?>, onDone: (List<JsonNode>?) -> Unit) {
        session.executor.submit {
            val list = runCatching {
                val increment = session.apiClient.runAction(
                    rootRoute, "", actionId, serverSideType.ifBlank { null },
                    "notification-bell", emptyMap(), session.appState, parameters,
                )
                increment.path("fragments").let { fragments ->
                    if (!fragments.isArray) null
                    else fragments.firstNotNullOfOrNull { f ->
                        f.path("data").path("_notifications").takeIf { it.isArray }?.toList()
                    }
                }
            }.getOrNull()
            SwingUtilities.invokeLater {
                if (list != null) {
                    notifications = list
                    refreshBadge()
                }
                onDone(list)
            }
        }
    }

    fun entryRow(n: JsonNode, closePopup: () -> Unit): JComponent {
        val unread = n.bool("unread")
        val row = JPanel(BorderLayout(JBUI.scale(6), 0))
        row.isOpaque = false
        row.border = JBUI.Borders.empty(4, 6)
        row.cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
        val title = JBLabel(n.text("title"))
        if (unread) title.font = title.font.deriveFont(Font.BOLD)
        val body = verticalPanel(0)
        body.addStacked(title, 0)
        val text = n.text("text")
        if (text.isNotBlank()) {
            body.addStacked(JBLabel(text).apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() }, 0)
        }
        row.add(body, BorderLayout.CENTER)
        val whenText = n.text("when")
        if (whenText.isNotBlank()) {
            row.add(
                JBLabel(whenText).apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() },
                BorderLayout.EAST,
            )
        }
        row.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                if (unread) runNotificationsAction("_notifications-read", mapOf("ids" to listOf(n.text("id")))) {}
                closePopup()
                val route = n.text("route")
                if (route.isNotBlank()) {
                    session.openViewHandler?.invoke(n.text("title", route), route, "", null, null)
                }
            }
        })
        return row
    }

    fun showPopup() {
        val panel = JPanel(BorderLayout())
        panel.border = JBUI.Borders.empty(4)
        val entries = verticalPanel(0)
        val scroll = JBScrollPane(entries)
        scroll.border = null
        scroll.preferredSize = java.awt.Dimension(JBUI.scale(320), JBUI.scale(260))
        panel.add(scroll, BorderLayout.CENTER)

        val popup = JBPopupFactory.getInstance()
            .createComponentPopupBuilder(panel, null)
            .setTitle("Notifications")
            .setResizable(true)
            .setRequestFocus(true)
            .setCancelOnClickOutside(true)
            .createPopup()

        fun fillEntries() {
            entries.removeAll()
            if (notifications.isEmpty()) {
                entries.addStacked(
                    JBLabel("No notifications").apply {
                        foreground = JBUI.CurrentTheme.Label.disabledForeground()
                        border = JBUI.Borders.empty(12)
                    },
                    0,
                )
            } else {
                for (n in notifications) entries.addStacked(entryRow(n) { popup.cancel() }, 2)
            }
            entries.revalidate()
            entries.repaint()
        }

        val footer = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(4), 0))
        footer.isOpaque = false
        footer.add(
            JButton("Mark all read").apply {
                addActionListener { runNotificationsAction("_notifications-read", mapOf("ids" to "all")) { fillEntries() } }
            },
        )
        panel.add(footer, BorderLayout.SOUTH)

        fillEntries()
        popup.showUnderneathOf(bell)
        // Refresh when the popup opens: the badge count from the last fetch may be stale.
        runNotificationsAction("_notifications-list", emptyMap()) { fillEntries() }
    }

    bell.addActionListener { showPopup() }
    // Initial fetch so the badge knows the unread count right away.
    runNotificationsAction("_notifications-list", emptyMap()) {}

    val row = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    row.isOpaque = false
    row.border = JBUI.Borders.empty(2, 4)
    row.add(bell)
    return row
}
