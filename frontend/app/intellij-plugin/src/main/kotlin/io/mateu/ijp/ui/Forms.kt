package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.int
import io.mateu.ijp.api.text
import java.awt.Font
import java.awt.FlowLayout
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Form / FormLayout / FormRow — port of the JavaFX `FormRenderer` using the Kotlin UI DSL v2 as the
 * primary layout layer. Header (title/subtitle + top actions unless read-only), fields, bottom buttons.
 */
fun renderForm(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val panel = verticalPanel()

    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(plain(title))
        l.font = l.font.deriveFont(Font.BOLD, 16f)
        panel.addStacked(l, 4)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(plain(subtitle))
        l.foreground = ToneColors.secondaryText()
        panel.addStacked(l, 8)
    }

    val readOnly = metadata.bool("readOnly")
    if (!readOnly) {
        val actions = metadata.arr("actions")
        if (actions.isNotEmpty()) panel.addStacked(buttonRow(r, actions), 8)
    }

    val children = component.path("children")
    if (children.isArray) for (child in children) panel.addStacked(r.render(child, state, data), JBGap)

    if (!readOnly) {
        val buttons = metadata.arr("buttons")
        if (buttons.isNotEmpty()) panel.addStacked(buttonRow(r, buttons), 0)
    }
    return panel
}

/**
 * FormLayout → a multi-column grid ([GridBagLayout]). FormRow wrappers are flattened away and their
 * fields re-flowed into `maxColumns` (default 2) equal-weight columns; a field's `colspan` makes it
 * span that many columns (and forces a wrap when it doesn't fit the row's remaining columns). Columns
 * align across rows because every column carries the same `weightx`.
 */
fun renderFormLayout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val maxColumns = metadata.int("maxColumns", 2).coerceAtLeast(1)

    val flattened = ArrayList<JsonNode>()
    val children = component.path("children")
    if (children.isArray) {
        for (child in children) {
            // an authored FormRow (fluent / YAML: the layout is not auto-responsive) keeps its fields
            // on ONE line, a cell spanning every column; the reflective forms' rows (auto-responsive)
            // are the grid's own lines and flow into it
            if (child.path("metadata").text("type") == "FormRow" && !metadata.bool("autoResponsive")) {
                flattened.add(child)
            } else if (child.path("metadata").text("type") == "FormRow") {
                val inner = child.path("children")
                if (inner.isArray) for (f in inner) flattened.add(f)
            } else {
                flattened.add(child)
            }
        }
    }

    val panel = JPanel(GridBagLayout())
    var col = 0
    var rowIdx = 0
    for (field in flattened) {
        val isRow = field.path("metadata").text("type") == "FormRow"
        val span = if (isRow) maxColumns else field.path("metadata").int("colspan", 1).coerceIn(1, maxColumns)
        if (col + span > maxColumns) { col = 0; rowIdx++ }
        val gbc = GridBagConstraints().apply {
            gridx = col
            gridy = rowIdx
            gridwidth = span
            weightx = span.toDouble()
            fill = GridBagConstraints.HORIZONTAL
            anchor = GridBagConstraints.NORTHWEST
            insets = JBUI.insets(0, 0, JBGap, JBGap)
        }
        panel.add(if (isRow) oneLineRow(r, field, state, data) else r.render(field, state, data), gbc)
        col += span
    }
    // Bottom filler so fields stay top-aligned when the grid is placed in a filling container.
    // Zero preferred size: a default JPanel measures 10x10 and added a phantom bottom margin.
    panel.add(
        JPanel().apply { isOpaque = false; preferredSize = java.awt.Dimension(0, 0) },
        GridBagConstraints().apply {
            gridx = 0; gridy = rowIdx + 1; gridwidth = maxColumns
            weightx = 1.0; weighty = 1.0; fill = GridBagConstraints.BOTH
        },
    )
    return panel
}

/** An authored FormRow inside a form layout: its fields side by side, sharing the line equally. */
private fun oneLineRow(r: ComponentRenderer, row: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val children = row.path("children").let { if (it.isArray) it.toList() else emptyList() }
    return JPanel(java.awt.GridLayout(1, children.size.coerceAtLeast(1), JBUI.scale(JBGap), 0)).apply {
        isOpaque = false
        children.forEach { add(r.render(it, state, data)) }
    }
}

/** FormRow → a horizontal row of its children (each field builds its own label + input). */
fun renderFormRow(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0))
    row.isOpaque = false
    val children = component.path("children")
    if (children.isArray) for (child in children) row.add(r.render(child, state, data))
    return row
}
