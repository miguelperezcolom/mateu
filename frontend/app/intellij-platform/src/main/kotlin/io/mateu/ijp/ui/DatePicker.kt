package io.mateu.ijp.ui

import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Font
import java.awt.GridLayout
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingConstants

/** Opens a lightweight month-calendar popup under [anchor]; [onPick] fires with the chosen date. */
fun openCalendarPopup(anchor: JComponent, initial: LocalDate?, onPick: (LocalDate) -> Unit) {
    val panel = CalendarPanel(initial ?: LocalDate.now(), onPick)
    val popup = JBPopupFactory.getInstance()
        .createComponentPopupBuilder(panel, panel)
        .setRequestFocus(true)
        .setResizable(false)
        .setMovable(false)
        .createPopup()
    panel.onDone = { popup.cancel() }
    popup.showUnderneathOf(anchor)
}

private class CalendarPanel(start: LocalDate, val onPick: (LocalDate) -> Unit) : JPanel(BorderLayout(0, JBUI.scale(4))) {
    var onDone: (() -> Unit)? = null
    private var ym = YearMonth.from(start)
    private val selected = start
    private val header = JBLabel("", SwingConstants.CENTER)
    private val grid = JPanel(GridLayout(0, 7, JBUI.scale(2), JBUI.scale(2)))

    init {
        border = JBUI.Borders.empty(6)
        val nav = JPanel(BorderLayout())
        nav.add(JButton("‹").apply { addActionListener { ym = ym.minusMonths(1); rebuild() } }, BorderLayout.WEST)
        header.font = header.font.deriveFont(Font.BOLD)
        nav.add(header, BorderLayout.CENTER)
        nav.add(JButton("›").apply { addActionListener { ym = ym.plusMonths(1); rebuild() } }, BorderLayout.EAST)
        add(nav, BorderLayout.NORTH)
        add(grid, BorderLayout.CENTER)
        rebuild()
    }

    private fun rebuild() {
        header.text = "${ym.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${ym.year}"
        grid.removeAll()
        for (d in listOf("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su")) {
            grid.add(JBLabel(d, SwingConstants.CENTER).apply { foreground = JBUI.CurrentTheme.Label.disabledForeground() })
        }
        val lead = ym.atDay(1).dayOfWeek.value - 1 // Monday = 1 → 0 leading blanks
        repeat(lead) { grid.add(JLabel("")) }
        for (day in 1..ym.lengthOfMonth()) {
            val date = ym.atDay(day)
            grid.add(
                JButton(day.toString()).apply {
                    margin = JBUI.insets(2)
                    isFocusPainted = false
                    if (date == selected) { isOpaque = true; background = JBUI.CurrentTheme.Focus.focusColor(); foreground = Color.WHITE }
                    addActionListener { onPick(date); onDone?.invoke() }
                },
            )
        }
        grid.revalidate()
        grid.repaint()
    }
}
