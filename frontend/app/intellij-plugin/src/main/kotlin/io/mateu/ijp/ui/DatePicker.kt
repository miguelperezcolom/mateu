package io.mateu.ijp.ui

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
import javax.swing.JPopupMenu
import javax.swing.SwingConstants

/**
 * Opens a lightweight month-calendar under [anchor]; [onPick] fires with the chosen date.
 *
 * Uses a plain Swing [JPopupMenu] (not `JBPopupFactory`, which is a platform *service* and needs a
 * booted Application — this standalone app deliberately runs without one).
 */
fun openCalendarPopup(anchor: JComponent, initial: LocalDate?, onPick: (LocalDate) -> Unit) {
    val menu = JPopupMenu()
    menu.border = JBUI.Borders.empty(4)
    menu.add(
        CalendarPanel(initial ?: LocalDate.now()) { picked ->
            onPick(picked)
            menu.isVisible = false
        },
    )
    menu.show(anchor, 0, anchor.height)
}

private class CalendarPanel(start: LocalDate, val onPick: (LocalDate) -> Unit) : JPanel(BorderLayout(0, JBUI.scale(4))) {
    private var ym = YearMonth.from(start)
    private val selected = start
    private val header = JBLabel("", SwingConstants.CENTER)
    private val grid = JPanel(GridLayout(0, 7, JBUI.scale(2), JBUI.scale(2)))

    init {
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
                    if (date == selected) {
                        isOpaque = true
                        background = JBUI.CurrentTheme.Focus.focusColor()
                        foreground = Color.WHITE
                    }
                    addActionListener { onPick(date) }
                },
            )
        }
        grid.revalidate()
        grid.repaint()
    }
}

/**
 * IDE-style date input: a [com.intellij.ui.components.JBTextField] holding the ISO date (editable,
 * `yyyy-mm-dd` placeholder) plus a chevron button opening [openCalendarPopup]. Replaces SwingX's
 * JXDatePicker, whose look sat oddly among JB components.
 */
class DateField(
    initialIso: String = "",
    enabled: Boolean = true,
    private val onChange: (String) -> Unit = {},
) : JPanel(BorderLayout(JBUI.scale(2), 0)) {

    private val input = com.intellij.ui.components.JBTextField(9)

    /** The current text when it parses as an ISO date; empty text → "" (cleared). */
    val isoValue: String
        get() = input.text.trim().let { t ->
            if (t.isEmpty() || runCatching { LocalDate.parse(t) }.isSuccess) t else ""
        }

    fun clear() {
        input.text = ""
    }

    init {
        isOpaque = false
        input.text = initialIso
        input.emptyText.text = "yyyy-mm-dd"
        input.isEnabled = enabled
        input.document.addDocumentListener(object : javax.swing.event.DocumentListener {
            override fun insertUpdate(e: javax.swing.event.DocumentEvent) = onChange(isoValue)
            override fun removeUpdate(e: javax.swing.event.DocumentEvent) = onChange(isoValue)
            override fun changedUpdate(e: javax.swing.event.DocumentEvent) = onChange(isoValue)
        })
        val pick = JButton()
        runCatching { pick.icon = com.intellij.icons.AllIcons.General.ArrowDownSmall }
            .onFailure { pick.text = "▾" }
        pick.preferredSize = java.awt.Dimension(JBUI.scale(24), input.preferredSize.height)
        pick.isFocusable = false
        pick.isEnabled = enabled
        pick.addActionListener {
            val current = runCatching { LocalDate.parse(input.text.trim()) }.getOrNull()
            openCalendarPopup(this, current) { picked -> input.text = picked.toString() }
        }
        add(input, BorderLayout.CENTER)
        add(pick, BorderLayout.EAST)
    }
}
