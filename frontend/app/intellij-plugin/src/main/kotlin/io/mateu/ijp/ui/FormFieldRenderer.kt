package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.ComboBox
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBPasswordField
import com.intellij.ui.components.JBTextArea
import com.intellij.ui.components.JBTextField
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.displayString
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import org.jdesktop.swingx.JXDatePicker
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.time.LocalDate
import java.time.ZoneId
import java.util.Date
import javax.swing.DefaultComboBoxModel
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JScrollPane
import javax.swing.table.AbstractTableModel
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener
import javax.swing.text.AbstractDocument
import javax.swing.text.AttributeSet
import javax.swing.text.DocumentFilter

private val BOOL_TYPES = setOf("bool", "boolean", "Boolean")
private val DATE_TYPES = setOf("date", "LocalDate")
private val INT_TYPES = setOf("integer", "int", "long", "Integer", "Long")
private val NUMBER_TYPES = setOf("number", "double", "float", "decimal", "BigDecimal")
private val MONEY_STEREOTYPES = setOf("money", "currency")

/**
 * FormField → a concrete Swing/JB input, seeded from `state[fieldId]` (else `metadata.initialValue`),
 * writing user edits back into `ctx.currentComponentState[fieldId]`. Port of the JavaFX
 * `FormFieldRenderer` decision order.
 */
fun renderFormField(ctx: AppContext, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val fieldId = metadata.text("fieldId")
    val label = metadata.text("label", fieldId)
    val dataType = metadata.text("dataType", "string")
    val stereotype = metadata.text("stereotype")
    val required = metadata.bool("required")
    val enabled = !metadata.bool("readOnly") && !metadata.bool("disabled")

    val rawValue: JsonNode = if (!state.isNull && !state.isMissingNode && state.has(fieldId)) {
        state.path(fieldId)
    } else {
        metadata.path("initialValue")
    }
    val value = if (rawValue.isNull || rawValue.isMissingNode) "" else rawValue.asText("")

    val container = verticalPanel(2)

    // Grid field (e.g. a List<T> of nested records): a table built from `metadata.columns`, rows
    // from the field's state value. Read-only cells for now (the web's inline-editable grid and
    // add/remove-row controls are not ported yet).
    if (stereotype == "grid" || dataType == "array") {
        if (label.isNotBlank()) {
            val caption = JBLabel(label)
            caption.alignmentX = Component.LEFT_ALIGNMENT
            container.add(caption)
        }
        val grid = gridField(ctx, metadata, rawValue)
        grid.alignmentX = Component.LEFT_ALIGNMENT
        container.add(grid)
        return container
    }

    // Boolean → inline checkbox carrying its own label, no separate caption.
    if (dataType in BOOL_TYPES) {
        val cb = JBCheckBox(label, rawValue.asBoolean(false))
        cb.isEnabled = enabled
        cb.addActionListener { ctx.currentComponentState[fieldId] = cb.isSelected }
        cb.alignmentX = Component.LEFT_ALIGNMENT
        container.add(cb)
        return container
    }

    val caption = JBLabel(if (required) "$label *" else label)
    caption.alignmentX = Component.LEFT_ALIGNMENT
    container.add(caption)

    val options = metadata.arr("options")
    val input: JComponent = when {
        stereotype == "textarea" -> textArea(ctx, fieldId, value, enabled)
        options.isNotEmpty() -> optionsCombo(ctx, fieldId, options, value, enabled)
        dataType == "reference" -> referenceCombo(ctx, fieldId, data, enabled)
        stereotype == "password" -> passwordField(ctx, fieldId, value, enabled)
        dataType in DATE_TYPES -> dateField(ctx, fieldId, value, enabled)
        dataType in INT_TYPES -> numberField(ctx, fieldId, value, enabled, integer = true)
        dataType in NUMBER_TYPES || stereotype in MONEY_STEREOTYPES ->
            numberField(ctx, fieldId, value, enabled, integer = false)
        else -> plainField(ctx, fieldId, value, enabled)
    }
    input.alignmentX = Component.LEFT_ALIGNMENT
    container.add(input)

    val error = ctx.currentFieldErrors[fieldId]
    if (error != null) {
        val err = JBLabel(error)
        err.foreground = Color(0xC9, 0x19, 0x0B)
        err.alignmentX = Component.LEFT_ALIGNMENT
        container.add(err)
    }
    return container
}

/**
 * A grid FormField ({@code stereotype=grid} / {@code dataType=array}): columns from the
 * `metadata.columns` GridColumn nodes, rows from the field's state array. Bool columns render as
 * checkboxes; everything else as text. When the field declares `onItemSelectionActionId`
 * (`@OnRowSelected`), selecting a row dispatches that action with the row as `_clickedRow`.
 */
private fun gridField(ctx: AppContext, metadata: JsonNode, rows: JsonNode): JComponent {
    val cols = metadata.arr("columns").mapNotNull { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        if (id.isBlank()) null else Triple(id, cm.text("label", id), cm.text("dataType"))
    }
    val rowList = if (rows.isArray) rows.toList() else emptyList()

    val model = object : AbstractTableModel() {
        override fun getRowCount(): Int = rowList.size
        override fun getColumnCount(): Int = cols.size
        override fun getColumnName(column: Int): String = cols[column].second
        override fun getColumnClass(columnIndex: Int): Class<*> =
            if (cols[columnIndex].third in BOOL_TYPES) java.lang.Boolean::class.java else String::class.java
        override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean = false
        override fun getValueAt(rowIndex: Int, columnIndex: Int): Any? {
            val cell = rowList[rowIndex].path(cols[columnIndex].first)
            return if (cols[columnIndex].third in BOOL_TYPES) cell.asBoolean(false) else cell.displayString()
        }
    }
    val table = JBTable(model)
    table.setShowGrid(true)
    table.rowHeight = JBUI.scale(28)
    // Speed search: type over the grid to jump to matching rows (guarded for the render probe).
    runCatching { com.intellij.ui.TableSpeedSearch.installOn(table) }

    val onItemSelection = metadata.text("onItemSelectionActionId")
    if (onItemSelection.isNotBlank()) {
        table.selectionModel.addListSelectionListener { e ->
            if (e.valueIsAdjusting) return@addListSelectionListener
            val viewRow = table.selectedRow
            if (viewRow < 0) return@addListSelectionListener
            val row = rowList.getOrNull(table.convertRowIndexToModel(viewRow)) ?: return@addListSelectionListener
            @Suppress("UNCHECKED_CAST")
            val params = ctx.mapper.convertValue(row, Map::class.java) as Map<String, Any?>
            ctx.runAction(onItemSelection, mapOf("_clickedRow" to params))
        }
    }
    // NO scroll pane: inside the vertically-stacked form a JScrollPane collapses to its header
    // height (JBTable ignores preferredScrollableViewportSize here — see the render probe). Header
    // + table stacked in a BorderLayout report exactly header+rows as preferred height instead.
    val wrapper = JPanel(BorderLayout())
    wrapper.isOpaque = false
    wrapper.add(table.tableHeader, BorderLayout.NORTH)
    wrapper.add(table, BorderLayout.CENTER)
    return wrapper
}

private fun plainField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val tf = JBTextField(initial)
    tf.isEnabled = enabled
    tf.onTextChange { ctx.currentComponentState[fieldId] = tf.text }
    return tf
}

private fun passwordField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val pf = JBPasswordField()
    pf.text = initial
    pf.isEnabled = enabled
    pf.onTextChange { ctx.currentComponentState[fieldId] = String(pf.password) }
    return pf
}

private fun textArea(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val ta = JBTextArea(initial, 4, 40)
    ta.isEnabled = enabled
    ta.lineWrap = true
    ta.wrapStyleWord = true
    ta.document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
        override fun removeUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
        override fun changedUpdate(e: DocumentEvent) { ctx.currentComponentState[fieldId] = ta.text }
    })
    return JScrollPane(ta)
}

private fun dateField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    // Native platform date picker (SwingX): a formatted field + a real calendar dropdown.
    val picker = JXDatePicker()
    picker.setFormats("yyyy-MM-dd")
    picker.isEnabled = enabled
    parseIsoDate(initial)?.let { picker.date = it.toDate() }
    picker.addActionListener {
        val iso = picker.date?.toLocalDate()?.toString() ?: ""
        ctx.currentComponentState[fieldId] = iso
    }
    return picker
}

private fun parseIsoDate(s: String): LocalDate? =
    if (s.isEmpty()) null else runCatching { LocalDate.parse(s) }.getOrNull()

private fun LocalDate.toDate(): Date = Date.from(atStartOfDay(ZoneId.systemDefault()).toInstant())
private fun Date.toLocalDate(): LocalDate = toInstant().atZone(ZoneId.systemDefault()).toLocalDate()

private fun numberField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean, integer: Boolean): JComponent {
    val tf = JBTextField(initial)
    tf.isEnabled = enabled
    // Reject non-numeric keystrokes outright so letters can't be typed into a numeric field.
    (tf.document as AbstractDocument).documentFilter = NumericDocumentFilter(integer)
    tf.onTextChange {
        val raw = tf.text
        if (integer) raw.toIntOrNull()?.let { ctx.currentComponentState[fieldId] = it }
        else raw.replace(',', '.').toDoubleOrNull()?.let { ctx.currentComponentState[fieldId] = it }
    }
    return tf
}

/** Only lets the text stay a (possibly partial) number: optional leading `-`, digits, one decimal sep. */
private class NumericDocumentFilter(private val integer: Boolean) : DocumentFilter() {
    private val pattern = if (integer) Regex("-?\\d*") else Regex("-?\\d*([.,]\\d*)?")
    private fun allows(proposed: String) = pattern.matches(proposed)

    override fun insertString(fb: FilterBypass, offset: Int, string: String, attr: AttributeSet?) {
        val cur = fb.document.getText(0, fb.document.length)
        if (allows(cur.substring(0, offset) + string + cur.substring(offset))) {
            super.insertString(fb, offset, string, attr)
        }
    }

    override fun replace(fb: FilterBypass, offset: Int, length: Int, text: String?, attrs: AttributeSet?) {
        val cur = fb.document.getText(0, fb.document.length)
        val proposed = cur.substring(0, offset) + (text ?: "") + cur.substring(offset + length)
        if (allows(proposed)) super.replace(fb, offset, length, text, attrs)
    }
}

private fun optionsCombo(ctx: AppContext, fieldId: String, options: List<JsonNode>, value: String, enabled: Boolean): JComponent {
    val labels = options.map { it.text("label", it.text("value")) }
    val values = options.map { it.text("value") }
    val combo = ComboBox(DefaultComboBoxModel(labels.toTypedArray()))
    combo.isEnabled = enabled
    val selectedIdx = values.indexOf(value)
    if (selectedIdx >= 0) combo.selectedIndex = selectedIdx
    combo.addActionListener {
        val i = combo.selectedIndex
        if (i in values.indices) ctx.currentComponentState[fieldId] = values[i]
    }
    return combo
}

private fun referenceCombo(ctx: AppContext, fieldId: String, data: JsonNode, enabled: Boolean): JComponent {
    val remote = if (!data.isNull && !data.isMissingNode) {
        if (data.has(fieldId)) data.path(fieldId) else data
    } else {
        data
    }
    val content = if (remote.has("content")) remote.path("content") else remote
    val options = if (content.isArray) content.toList() else emptyList()
    val labels = options.map { it.text("label", it.text("name", it.text("value"))) }
    val combo = ComboBox(DefaultComboBoxModel(labels.toTypedArray()))
    combo.isEnabled = enabled
    combo.selectedIndex = -1
    combo.addActionListener {
        val i = combo.selectedIndex
        if (i in labels.indices) ctx.currentComponentState[fieldId] = labels[i]
    }
    return combo
}

/** Convenience: fire [block] on any text-document change. */
private fun javax.swing.text.JTextComponent.onTextChange(block: () -> Unit) {
    document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) = block()
        override fun removeUpdate(e: DocumentEvent) = block()
        override fun changedUpdate(e: DocumentEvent) = block()
    })
}
