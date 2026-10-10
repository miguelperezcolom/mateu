package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppContext
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Cursor
import java.awt.FlowLayout
import java.awt.Font
import java.awt.GridLayout
import java.awt.event.FocusAdapter
import java.awt.event.FocusEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import java.time.LocalDate
import javax.accessibility.AccessibleContext
import javax.accessibility.AccessibleRole
import javax.swing.ButtonGroup
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JToggleButton
import javax.swing.KeyStroke
import javax.swing.border.Border

private const val MONTH_CELL_EVENTS = 3
private val CELL_BORDER = JBColor.border()
private val FOCUS_INK = JBColor(0x2763B1, 0x589DF6)

/**
 * A box of the calendar (a date cell or an event chip). When [actionable] it is a keyboard-reachable
 * PUSH_BUTTON for assistive technology (Enter/Space activate, a focus ring shows where focus is);
 * otherwise a LABEL — its accessible name still carries the date, the day label and the event count.
 */
private class CalendarBox(val actionable: Boolean) : JPanel() {
    private lateinit var a11y: AccessibleContext

    override fun getAccessibleContext(): AccessibleContext {
        if (!::a11y.isInitialized) {
            a11y = object : AccessibleJPanel() {
                override fun getAccessibleRole(): AccessibleRole =
                    if (actionable) AccessibleRole.PUSH_BUTTON else AccessibleRole.LABEL
            }
        }
        return a11y
    }
}

private fun box(
    name: String,
    background: Color?,
    padding: Border,
    onActivate: (() -> Unit)?,
    line: Border = JBUI.Borders.customLine(CELL_BORDER, 1),
): CalendarBox {
    val b = CalendarBox(onActivate != null)
    b.layout = javax.swing.BoxLayout(b, javax.swing.BoxLayout.Y_AXIS)
    b.isOpaque = background != null
    if (background != null) b.background = background
    val idle = JBUI.Borders.compound(line, padding)
    b.border = idle
    b.accessibleName(name)
    if (onActivate != null) {
        b.isFocusable = true
        b.cursor = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
        b.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                b.requestFocusInWindow()
                onActivate()
            }
        })
        val activate = { _: java.awt.event.ActionEvent -> onActivate() }
        b.registerKeyboardAction(activate, KeyStroke.getKeyStroke("ENTER"), JComponent.WHEN_FOCUSED)
        b.registerKeyboardAction(activate, KeyStroke.getKeyStroke("SPACE"), JComponent.WHEN_FOCUSED)
        b.addFocusListener(object : FocusAdapter() {
            override fun focusGained(e: FocusEvent) {
                b.border = JBUI.Borders.compound(JBUI.Borders.customLine(FOCUS_INK, 2), padding)
            }
            override fun focusLost(e: FocusEvent) {
                b.border = idle
            }
        })
    }
    return b
}

private fun muted(text: String, size: Float? = null) = JBLabel(text).apply {
    foreground = JBUI.CurrentTheme.Label.disabledForeground()
    if (size != null) font = font.deriveFont(JBUI.scaleFontSize(size).toFloat())
}

/**
 * Calendar (wire `Calendar`): month grid (7 Monday-first columns), week (Monday..Sunday, one column
 * per day with its events and times), day, or the month's agenda (list). The view switcher (when
 * `views` offers more than one) swaps the body in place — client-side, no server round trip.
 * Periods, spans, tones and the accessible names live in [Calendars].
 *
 * With a `dayActionId` every date cell/header is a keyboard-reachable button dispatching it with
 * `{ _date }` (the same `ctx.runAction(id, params)` a Button with parameters uses); an event with an
 * `actionId` is a button of its own.
 */
fun renderCalendar(ctx: AppContext, metadata: JsonNode): JComponent {
    val model = Calendars.parse(metadata)
    var view = model.view
    val root = verticalPanel(6)
    val title = JBLabel(Calendars.periodTitle(view, model.anchor)).apply { font = font.deriveFont(Font.BOLD, 15f) }
    val body = JPanel(BorderLayout()).apply { isOpaque = false }

    fun dayAction(date: LocalDate): (() -> Unit)? =
        if (model.dayActionable) ({ ctx.runAction(model.dayActionId, Calendars.dayParameters(date)) }) else null

    fun eventChip(e: Calendars.Event, compact: Boolean): JComponent {
        val color = runCatching { Color.decode(e.color) }.getOrNull() ?: FOCUS_INK
        val action = e.actionId.takeIf { it.isNotBlank() }?.let { id -> { ctx.runAction(id, null) } }
        val chip = box(Calendars.eventA11yName(e), null, JBUI.Borders.empty(1, 4), action, JBUI.Borders.customLine(color, 0, 3, 0, 0))
        val time = Calendars.timeRange(e)
        if (!compact && time.isNotBlank()) chip.add(muted(time, 11f))
        chip.add(JBLabel(e.title).apply { if (compact) font = font.deriveFont(JBUI.scaleFontSize(11f).toFloat()) })
        return chip
    }

    fun dayLabel(date: LocalDate): JComponent? {
        val info = Calendars.dayInfo(model, date)
        if (info.label.isBlank()) return null
        return JBLabel(info.label).apply {
            foreground = toneInk(info.tone) ?: JBUI.CurrentTheme.Label.disabledForeground()
            font = font.deriveFont(Font.BOLD, JBUI.scaleFontSize(11f).toFloat())
        }
    }

    fun dayHeader(date: LocalDate): JComponent {
        val cell = box(
            Calendars.dayA11yName(model, date),
            toneBackground(Calendars.dayInfo(model, date).tone),
            JBUI.Borders.empty(3, 6),
            dayAction(date),
        )
        cell.add(muted(Calendars.weekdayShort(date).uppercase(), 11f))
        cell.add(JBLabel(date.dayOfMonth.toString()).apply { font = font.deriveFont(Font.BOLD, 16f) })
        dayLabel(date)?.let { cell.add(it) }
        return cell
    }

    fun monthView(): JComponent {
        val grid = JPanel(GridLayout(0, 7, 0, 0)).apply { isOpaque = false }
        Calendars.WEEKDAY_HEADERS.forEach { grid.add(muted(it).apply { horizontalAlignment = JBLabel.CENTER }) }
        for (week in Calendars.monthWeeks(model.anchor)) {
            for (date in week) {
                if (date == null) {
                    grid.add(JPanel().apply { isOpaque = false; border = JBUI.Borders.customLine(CELL_BORDER, 1) })
                    continue
                }
                val events = Calendars.eventsOn(model, date)
                val cell = box(
                    Calendars.dayA11yName(model, date),
                    toneBackground(Calendars.dayInfo(model, date).tone),
                    JBUI.Borders.empty(2, 4),
                    dayAction(date),
                )
                cell.add(JBLabel(date.dayOfMonth.toString()).apply { font = font.deriveFont(Font.BOLD) })
                dayLabel(date)?.let { cell.add(it) }
                events.take(MONTH_CELL_EVENTS).forEach { cell.add(eventChip(it, compact = true)) }
                if (events.size > MONTH_CELL_EVENTS) cell.add(muted("+${events.size - MONTH_CELL_EVENTS}", 11f))
                grid.add(cell)
            }
        }
        return grid
    }

    fun column(date: LocalDate, emptyText: String?): JComponent {
        val col = verticalPanel(4)
        col.addStacked(dayHeader(date), 4)
        val events = Calendars.eventsOn(model, date)
        events.forEach { col.addStacked(eventChip(it, compact = false), 4) }
        if (events.isEmpty() && emptyText != null) col.addStacked(muted(emptyText), 0)
        return col
    }

    fun weekView(): JComponent {
        val row = JPanel(GridLayout(1, 7, JBUI.scale(6), 0)).apply { isOpaque = false }
        Calendars.periodDates("week", model.anchor).forEach { date ->
            // Top-align each day's column so short days do not stretch.
            row.add(JPanel(BorderLayout()).apply { isOpaque = false; add(column(date, null), BorderLayout.NORTH) })
        }
        return row
    }

    fun dayView(): JComponent = column(model.anchor, "No events")

    fun listView(): JComponent {
        val groups = Calendars.agenda(model)
        if (groups.isEmpty()) return muted("No events")
        val list = verticalPanel(8)
        for (g in groups) {
            val row = JPanel(BorderLayout(JBUI.scale(10), 0)).apply { isOpaque = false }
            row.add(JPanel(BorderLayout()).apply { isOpaque = false; add(dayHeader(g.date), BorderLayout.NORTH) }, BorderLayout.WEST)
            val events = verticalPanel(4)
            g.events.forEach { events.addStacked(eventChip(it, compact = false), 4) }
            row.add(events, BorderLayout.CENTER)
            list.addStacked(row, 8)
        }
        return list
    }

    fun rebuild() {
        title.text = Calendars.periodTitle(view, model.anchor)
        body.removeAll()
        body.add(
            when (view) {
                "week" -> weekView()
                "day" -> dayView()
                "list" -> listView()
                else -> monthView()
            },
            BorderLayout.CENTER,
        )
        body.revalidate()
        body.repaint()
    }

    val header = JPanel(BorderLayout()).apply { isOpaque = false }
    header.add(title, BorderLayout.WEST)
    if (model.showSwitcher) {
        val switcher = JPanel(FlowLayout(FlowLayout.RIGHT, 0, 0)).apply { isOpaque = false }
        switcher.accessibleName("Calendar view")
        val group = ButtonGroup()
        for (v in model.views) {
            val btn = JToggleButton(Calendars.viewLabel(v), v == view)
            btn.accessibleName("${Calendars.viewLabel(v)} view")
            btn.addActionListener {
                if (view == v) return@addActionListener
                view = v
                rebuild()
                announce(root, "${Calendars.viewLabel(v)} view, ${title.text}")
            }
            group.add(btn)
            switcher.add(btn)
        }
        header.add(switcher, BorderLayout.EAST)
    }
    root.addStacked(header, 6)
    rebuild()
    root.add(body)
    body.alignmentX = java.awt.Component.LEFT_ALIGNMENT
    return root
}
