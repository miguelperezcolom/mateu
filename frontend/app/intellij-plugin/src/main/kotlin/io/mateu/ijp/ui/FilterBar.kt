package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.ComboBox
import com.intellij.openapi.ui.JBPopupMenu
import com.intellij.ui.components.JBCheckBoxMenuItem
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import org.jdesktop.swingx.JXDatePicker
import java.awt.Component
import java.awt.FlowLayout
import java.awt.GridLayout
import java.time.ZoneId
import javax.swing.DefaultComboBoxModel
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * The listing's filter panel — the desktop port of the web's smart search bar: a "Filters" toggle
 * next to the search field opens a panel with a type-specific widget per filter (text, Yes/No,
 * checkable multi-select, from–to for date/number ranges). Values are collected into the crud's
 * component state on every search ([collectInto] — range bounds as `<field>_from`/`_to`,
 * multi-select values as a list), exactly the wire shapes `FilterCriteriaBuilder` expects.
 */
class FilterBar(ctx: AppContext, filters: List<JsonNode>, onApply: () -> Unit) {

    private val collectors = ArrayList<(MutableMap<String, Any?>) -> Unit>()
    private val clearers = ArrayList<() -> Unit>()
    private val activeCount: () -> Int

    val panel: JPanel = JPanel(GridLayout(0, 3, JBUI.scale(JBGap), JBUI.scale(4))).apply {
        isOpaque = false
        border = JBUI.Borders.empty(4, 0)
        isVisible = false
    }

    val toggle: JButton = JButton("Filters")

    init {
        val actives = ArrayList<() -> Boolean>()
        for (f in filters) {
            val fieldId = f.text("fieldId", f.text("id"))
            if (fieldId.isBlank()) continue
            val label = f.text("label", fieldId)
            val stereotype = f.text("stereotype")
            val dataType = f.text("dataType")
            val cell = verticalPanel(2)
            cell.isOpaque = false
            val caption = JBLabel(label)
            caption.foreground = JBUI.CurrentTheme.Label.disabledForeground()
            caption.alignmentX = Component.LEFT_ALIGNMENT
            cell.add(caption)

            val widget: JComponent = when {
                stereotype == "dateRange" -> dateRange(fieldId, actives)
                stereotype == "numberRange" -> numberRange(fieldId, actives)
                stereotype == "multiSelect" -> multiSelect(fieldId, f.arr("options"), actives)
                stereotype == "select" || f.arr("options").isNotEmpty() -> select(fieldId, f.arr("options"), actives)
                dataType == "bool" -> yesNo(fieldId, actives)
                else -> textFilter(fieldId, onApply, actives)
            }
            widget.alignmentX = Component.LEFT_ALIGNMENT
            cell.add(widget)
            panel.add(cell)
        }
        activeCount = { actives.count { it() } }

        val buttons = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0)).apply { isOpaque = false }
        buttons.add(JButton("Apply").apply { addActionListener { onApply(); refreshToggle() } })
        buttons.add(JButton("Clear").apply {
            addActionListener {
                clearers.forEach { it() }
                onApply()
                refreshToggle()
            }
        })
        val buttonsCell = verticalPanel(2).apply { isOpaque = false }
        buttonsCell.add(JBLabel(" "))
        buttons.alignmentX = Component.LEFT_ALIGNMENT
        buttonsCell.add(buttons)
        panel.add(buttonsCell)

        toggle.addActionListener {
            panel.isVisible = !panel.isVisible
            panel.parent?.revalidate()
            panel.parent?.repaint()
        }
    }

    /** Write the current filter values into [state] (absent widgets contribute nothing). */
    fun collectInto(state: MutableMap<String, Any?>) {
        for (c in collectors) c(state)
        refreshToggle()
    }

    private fun refreshToggle() {
        val n = activeCount()
        toggle.text = if (n > 0) "Filters ($n)" else "Filters"
    }

    // ── widgets ────────────────────────────────────────────────────────────────────────

    private fun textFilter(fieldId: String, onApply: () -> Unit, actives: MutableList<() -> Boolean>): JComponent {
        val tf = JBTextField(10)
        tf.addActionListener { onApply() }
        collectors.add { st -> tf.text.trim().takeIf { it.isNotEmpty() }?.let { st[fieldId] = it } }
        clearers.add { tf.text = "" }
        actives.add { tf.text.isNotBlank() }
        return tf
    }

    private fun yesNo(fieldId: String, actives: MutableList<() -> Boolean>): JComponent {
        val combo = ComboBox(DefaultComboBoxModel(arrayOf("", "Yes", "No")))
        collectors.add { st ->
            when (combo.selectedIndex) {
                1 -> st[fieldId] = true
                2 -> st[fieldId] = false
            }
        }
        clearers.add { combo.selectedIndex = 0 }
        actives.add { combo.selectedIndex > 0 }
        return combo
    }

    private fun select(fieldId: String, options: List<JsonNode>, actives: MutableList<() -> Boolean>): JComponent {
        val labels = arrayOf("") + options.map { it.text("label", it.text("value")) }.toTypedArray()
        val values = listOf("") + options.map { it.text("value") }
        val combo = ComboBox(DefaultComboBoxModel(labels))
        collectors.add { st ->
            val i = combo.selectedIndex
            if (i > 0) st[fieldId] = values[i]
        }
        clearers.add { combo.selectedIndex = 0 }
        actives.add { combo.selectedIndex > 0 }
        return combo
    }

    private fun multiSelect(fieldId: String, options: List<JsonNode>, actives: MutableList<() -> Boolean>): JComponent {
        val selected = LinkedHashSet<String>()
        val button = JButton("Any")
        fun refresh() {
            button.text = if (selected.isEmpty()) "Any" else selected.joinToString(", ").let {
                if (it.length > 24) "${selected.size} selected" else it
            }
        }
        button.addActionListener {
            val menu = JBPopupMenu()
            for (opt in options) {
                val value = opt.text("value")
                val item = JBCheckBoxMenuItem()
                item.text = opt.text("label", value)
                item.isSelected = value in selected
                item.addActionListener {
                    if (item.isSelected) selected.add(value) else selected.remove(value)
                    refresh()
                }
                menu.add(item)
            }
            menu.show(button, 0, button.height)
        }
        collectors.add { st -> if (selected.isNotEmpty()) st[fieldId] = selected.toList() }
        clearers.add { selected.clear(); refresh() }
        actives.add { selected.isNotEmpty() }
        return button
    }

    private fun numberRange(fieldId: String, actives: MutableList<() -> Boolean>): JComponent {
        val from = JBTextField(5)
        val to = JBTextField(5)
        val row = rangeRow(from, to)
        collectors.add { st ->
            from.text.trim().replace(',', '.').toDoubleOrNull()?.let { st["${fieldId}_from"] = it }
            to.text.trim().replace(',', '.').toDoubleOrNull()?.let { st["${fieldId}_to"] = it }
        }
        clearers.add { from.text = ""; to.text = "" }
        actives.add { from.text.isNotBlank() || to.text.isNotBlank() }
        return row
    }

    private fun dateRange(fieldId: String, actives: MutableList<() -> Boolean>): JComponent {
        val from = JXDatePicker().apply { setFormats("yyyy-MM-dd") }
        val to = JXDatePicker().apply { setFormats("yyyy-MM-dd") }
        val row = rangeRow(from, to)
        fun iso(p: JXDatePicker): String? =
            p.date?.toInstant()?.atZone(ZoneId.systemDefault())?.toLocalDate()?.toString()
        collectors.add { st ->
            iso(from)?.let { st["${fieldId}_from"] = it }
            iso(to)?.let { st["${fieldId}_to"] = it }
        }
        clearers.add { from.date = null; to.date = null }
        actives.add { from.date != null || to.date != null }
        return row
    }

    private fun rangeRow(from: JComponent, to: JComponent): JComponent {
        val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), 0))
        row.isOpaque = false
        row.add(from)
        row.add(JBLabel("–"))
        row.add(to)
        return row
    }
}
