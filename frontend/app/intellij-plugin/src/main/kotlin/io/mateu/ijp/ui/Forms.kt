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

    // The Form's header is a PAGE header (a YAML record page is a Form): the same one the Page
    // draws — title and subtitle interpolated (`${state.name}` showed as typed), and the toolbar
    // (Edit, Back to People), which was dropped. A page template that owns the header (noHeader:
    // the Welcome page's hero) gets none, or its title showed twice.
    val exprCtx = PageChrome.exprContext(r.ctx, state, data)
    val header = if (PageChrome.ownsNoHeader(metadata)) null else PageChrome.header(r, metadata, exprCtx, state, data)
    if (header != null) panel.addStacked(header, JBGap)
    // A form with a header (or one whose template owns it) IS the page: it gets the page gutter
    // instead of touching the window's edges.
    if (header != null || PageChrome.ownsNoHeader(metadata)) panel.border = JBUI.Borders.empty(PageChrome.GUTTER)

    val readOnly = metadata.bool("readOnly")
    if (!readOnly) {
        val actions = metadata.arr("actions")
        if (actions.isNotEmpty()) panel.addStacked(buttonRow(r, actions), 8)
    }

    val children = component.path("children")
    if (children.isArray) for (child in children) panel.addStacked(r.render(child, state, data), JBGap)
    PageChrome.footer(r, metadata, state, data)?.let { panel.addStacked(it, JBGap) }

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
    // 100 (or more) is the web's "as many as fit" (auto-responsive, YAML's absent maxColumns): taken
    // literally, every field of the form sat side by side on ONE row
    val maxColumns = metadata.int("maxColumns", 2).let { if (it >= AUTO_COLUMNS) 2 else it }.coerceAtLeast(1)

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
        // an authored FormRow, or a property row (label left, value right, a divider below), is a row
        // of the whole form, as on the web
        val isRow = field.path("metadata").text("type") == "FormRow"
        val span = if (isRow || field.path("metadata").bool("propertyRow")) maxColumns
            else field.path("metadata").int("colspan", 1).coerceIn(1, maxColumns)
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
        val rendered = if (isRow) oneLineRow(r, field, state, data) else r.render(field, state, data)
        // labelsAside: the caption beside the control (the wire's dense-form inference) — ignored before
        val aside = metadata.bool("labelsAside") && field.path("metadata").text("type") == "FormField"
        panel.add(if (aside) PageLevel.labelAside(rendered) else rendered, gbc)
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

/** A FormLayout's maxColumns from this value on means "as many as fit" (the web's auto-responsive). */
private const val AUTO_COLUMNS = 100

/** FormRow → a horizontal row of its children (each field builds its own label + input). */
fun renderFormRow(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val row = JPanel(FlushFlowLayout(JBUI.scale(JBGap)))
    row.isOpaque = false
    val children = component.path("children")
    if (children.isArray) for (child in children) row.add(r.render(child, state, data))
    return row
}
