package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.panel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.awt.Font
import java.awt.FlowLayout
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
 * FormLayout → a Kotlin UI DSL v2 `panel { }`. FormRow children are flattened into their own fields;
 * v1 lays fields out one per row (single column). colspan/maxColumns are read but not yet honored.
 */
fun renderFormLayout(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
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
    return panel {
        for (field in flattened) {
            row {
                cell(r.render(field, state, data)).align(AlignX.FILL)
            }
        }
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
