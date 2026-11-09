package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.icons.AllIcons
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.FlowLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * The notification inbox (App.notificationsEnabled — the app class implements
 * NotificationsSupplier) on the desktop. The entries themselves live where the IDE keeps
 * notifications — the Notifications tool window, posted by the session's inbox
 * ([io.mateu.ijp.state.InboxSync] + the plugin's presenter), with their actions, Open / Details and
 * Dismiss. What stays here is a minimal unread BADGE: the platform's own tool-window badge counts
 * every IDE notification, not the app's unread entries (which the server owns, across devices), so
 * the app's count has nowhere else to show. Clicking it brings up the Notifications tool window.
 */
fun notificationBell(ctx: AppContext, metadata: JsonNode): JComponent {
    val session = ctx.session
    val inbox = session.inbox

    val bell = JButton("Notifications", AllIcons.Toolwindows.Notifications)
    bell.isOpaque = false
    bell.horizontalAlignment = javax.swing.SwingConstants.LEFT

    fun refreshBadge() {
        val unread = inbox.model.unreadCount()
        bell.text = if (unread > 0) "Notifications ($unread)" else "Notifications"
        bell.accessibleName("Notifications, $unread unread")
    }

    inbox.onChange { refreshBadge() }
    bell.addActionListener {
        val open = session.openNotificationsView
        if (open != null) open() else inbox.refetch()
    }
    // the first fetch posts the entries to the IDE and gives the badge its count
    inbox.start(ctx, metadata.text("rootRoute", metadata.text("route")), metadata.text("serverSideType"))
    refreshBadge()

    val row = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0))
    row.isOpaque = false
    row.border = JBUI.Borders.empty(2, 4)
    row.add(bell)
    return row
}
