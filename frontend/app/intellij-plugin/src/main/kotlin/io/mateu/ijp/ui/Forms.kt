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
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD, 16f)
        panel.addStacked(l, 4)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle)
        l.foreground = JBUI.CurrentTheme.Label.disabledForeground()
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
            if (child.path("metadata").text("type") == "FormRow") {
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
        val span = field.path("metadata").int("colspan", 1).coerceIn(1, maxColumns)
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
        panel.add(r.render(field, state, data), gbc)
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

/** FormRow → a horizontal row of its children (each field builds its own label + input). */
fun renderFormRow(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0))
    row.isOpaque = false
    val children = component.path("children")
    if (children.isArray) for (child in children) row.add(r.render(child, state, data))
    return row
}
