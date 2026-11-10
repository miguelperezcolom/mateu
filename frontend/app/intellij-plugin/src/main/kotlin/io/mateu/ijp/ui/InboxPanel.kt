package io.mateu.ijp.ui

import com.intellij.icons.AllIcons
import com.intellij.openapi.ui.popup.JBPopup
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.openapi.ui.popup.JBPopupListener
import com.intellij.openapi.ui.popup.LightweightWindowEvent
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.util.ui.JBUI
import com.intellij.util.ui.UIUtil
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.InboxFilter
import io.mateu.ijp.state.InboxItem
import io.mateu.ijp.state.InboxView
import io.mateu.ijp.state.NoticeTexts
import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.BoxLayout
import javax.swing.ButtonGroup
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JToggleButton

/** The filter the panel last showed, per session: reopening it stays where the user left it. */
private val filters = java.util.WeakHashMap<AppSession, InboxFilter>()

/** The app's inbox under [anchor] in a popup that follows the list while it is open. */
fun showInboxPanel(session: AppSession, anchor: JComponent) {
    var popup: JBPopup? = null
    val panel = InboxPanel(session) { popup?.cancel() }
    val listener: () -> Unit = { panel.rebuild() }
    session.inbox.onChange(listener)
    popup = JBPopupFactory.getInstance()
        .createComponentPopupBuilder(panel, panel.preferredFocus())
        .setTitle(NoticeTexts.notifications(MoneyValues.uiLocale()))
        .setResizable(true)
        .setMovable(true)
        .setRequestFocus(true)
        .setCancelOnClickOutside(true)
        .createPopup()
    popup.addListener(object : JBPopupListener {
        override fun onClosed(event: LightweightWindowEvent) = session.inbox.removeOnChange(listener)
    })
    popup.showUnderneathOf(anchor)
}

/** Filters on top, the entries grouped by category below; the rules are [InboxView]'s. */
internal class InboxPanel(private val session: AppSession, private val close: () -> Unit) : JPanel(BorderLayout()) {
    private val locale = MoneyValues.uiLocale()
    private val inbox get() = session.inbox
    private val list = JPanel().apply {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)
        border = JBUI.Borders.empty(4, 8)
    }
    private val markAll = ActionLink(plain(NoticeTexts.markAllRead(locale))) { inbox.markAllRead() }

    private val filterButtons = linkedMapOf(
        InboxFilter.ALL to NoticeTexts.filterAll(locale),
        InboxFilter.UNREAD to NoticeTexts.filterUnread(locale),
        InboxFilter.RESOLVED to NoticeTexts.filterResolved(locale),
    ).map { (filter, label) -> filter to JToggleButton(plain(label)) }.toMap()

    private var filter: InboxFilter
        get() = synchronized(filters) { filters[session] ?: InboxFilter.ALL }
        set(value) { synchronized(filters) { filters[session] = value } }

    init {
        preferredSize = JBUI.size(420, 420)
        val group = ButtonGroup()
        val bar = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), JBUI.scale(4)))
        bar.add(JBLabel(plain(NoticeTexts.filters(locale))))
        filterButtons.forEach { (value, button) ->
            group.add(button)
            bar.add(button)
            button.addActionListener {
                filter = value
                rebuild()
            }
        }
        val footer = JPanel(FlowLayout(FlowLayout.RIGHT, JBUI.scale(8), JBUI.scale(4)))
        footer.add(markAll)
        session.openNotificationsView?.let { open ->
            footer.add(ActionLink(plain(NoticeTexts.openNotificationsWindow(locale))) { close(); open() })
        }
        add(bar, BorderLayout.NORTH)
        add(JBScrollPane(list).apply { border = JBUI.Borders.empty() }, BorderLayout.CENTER)
        add(footer, BorderLayout.SOUTH)
        rebuild()
    }

    fun preferredFocus(): JComponent = filterButtons.getValue(filter)

    fun rebuild() {
        filterButtons.getValue(filter).isSelected = true
        markAll.isEnabled = inbox.model.unreadCount() > 0
        list.removeAll()
        val groups = InboxView.grouped(InboxView.filtered(inbox.model.listed(), filter))
        if (groups.isEmpty()) {
            list.add(left(JBLabel(plain(NoticeTexts.noNotifications(locale))).apply { foreground = UIUtil.getContextHelpForeground() }))
        }
        for (group in groups) {
            group.category?.let { category ->
                list.add(left(JBLabel(plain(category)).apply {
                    font = font.deriveFont(Font.BOLD)
                    border = JBUI.Borders.empty(8, 0, 2, 0)
                    accessibleName(category)
                }))
            }
            group.items.forEach { list.add(left(entry(it))) }
        }
        list.add(javax.swing.Box.createVerticalGlue())
        list.revalidate()
        list.repaint()
    }

    private fun entry(item: InboxItem): JComponent {
        val box = JPanel().apply {
            layout = BoxLayout(this, BoxLayout.Y_AXIS)
            border = JBUI.Borders.empty(4, 0)
        }
        val title = item.title.ifBlank { item.id }
        val head = JBLabel(plain(title), if (item.pending) AllIcons.General.BalloonInformation else null, JBLabel.LEADING)
        if (item.pending) head.font = head.font.deriveFont(Font.BOLD)
        val opens = item.hasDetail || item.route != null
        box.add(left(if (opens) link(title) { close(); inbox.open(item) } else head))
        val line = listOfNotNull(item.text.ifBlank { null }, item.whenText).joinToString(" — ")
        if (line.isNotBlank()) box.add(left(JBLabel(plain(line)).apply { foreground = UIUtil.getContextHelpForeground() }))
        if (item.resolved) box.add(left(JBLabel(plain(NoticeTexts.resolved(locale))).apply { foreground = UIUtil.getContextHelpForeground() }))
        val actions = JPanel(FlowLayout(FlowLayout.LEFT, 0, 0)).apply { isOpaque = false }
        if (!item.resolved) {
            item.actions.forEach { action ->
                actions.add(link(action.labelFor(locale)) { close(); inbox.act(item, action) })
                actions.add(javax.swing.Box.createHorizontalStrut(JBUI.scale(10)))
            }
        }
        actions.add(link(NoticeTexts.dismiss(locale)) { inbox.dismiss(listOf(item.id)) })
        box.add(left(actions))
        return box
    }

    private fun link(text: String, onClick: () -> Unit) = ActionLink(plain(text)) { onClick() }

    private fun left(c: JComponent): JComponent = c.apply {
        alignmentX = LEFT_ALIGNMENT
        maximumSize = Dimension(Int.MAX_VALUE, preferredSize.height)
    }
}
