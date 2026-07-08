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
import java.awt.Dimension
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
    // from the field's state value. Read-only view → plain table; editable form → editable cells
    // plus the IDE's ToolbarDecorator (add/remove/reorder rows), all mutating the live state array
    // that the form's save round-trips.
    if (stereotype == "grid" || dataType == "array") {
        if (label.isNotBlank()) {
            val caption = JBLabel(label)
            caption.alignmentX = Component.LEFT_ALIGNMENT
            container.add(caption)
        }
        val grid = if (enabled) editableGridField(ctx, fieldId, metadata, rawValue) else gridField(ctx, metadata, rawValue)
        grid.alignmentX = Component.LEFT_ALIGNMENT
        container.add(grid)
        return container
    }

    // Boolean → inline checkbox carrying its own label, no separate caption.
    if (dataType in BOOL_TYPES) {
        val cb = JBCheckBox(label, rawValue.asBoolean(false))
        cb.isEnabled = enabled
        cb.addActionListener { ctx.putState(fieldId, cb.isSelected) }
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
 * EDITABLE grid field (the form is in edit mode): cells edit in place — strings as text editors,
 * bools as checkboxes, numbers coerced back on commit — and the platform's [ToolbarDecorator]
 * contributes add/remove/move-up/move-down. Everything mutates the live row list stored in
 * `ctx.currentComponentState[fieldId]`, which the form's save action round-trips to the server
 * (the entity is rebuilt from the component state — no per-cell server calls).
 */
private fun editableGridField(ctx: AppContext, fieldId: String, metadata: JsonNode, rows: JsonNode): JComponent {
    // The web's editable grid adds a `_select` marker column; Swing uses the table selection itself.
    val cols = metadata.arr("columns").mapNotNull { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        if (id.isBlank() || id.startsWith("_")) null else Triple(id, cm.text("label", id), cm.text("dataType"))
    }
    // Live rows: plain mutable maps hydrated from the state array; the SAME list instance is put
    // into the component state so every mutation is already "in the form".
    val rowsLive = ArrayList<LinkedHashMap<String, Any?>>()
    if (rows.isArray) {
        for (r in rows) {
            @Suppress("UNCHECKED_CAST")
            rowsLive.add(LinkedHashMap(ctx.mapper.convertValue(r, Map::class.java) as Map<String, Any?>))
        }
    }
    ctx.currentComponentState[fieldId] = rowsLive

    val model = object : AbstractTableModel() {
        override fun getRowCount(): Int = rowsLive.size
        override fun getColumnCount(): Int = cols.size
        override fun getColumnName(column: Int): String = cols[column].second
        override fun getColumnClass(columnIndex: Int): Class<*> =
            if (cols[columnIndex].third in BOOL_TYPES) java.lang.Boolean::class.java else String::class.java
        override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean = true
        override fun getValueAt(rowIndex: Int, columnIndex: Int): Any? {
            val v = rowsLive[rowIndex][cols[columnIndex].first]
            return if (cols[columnIndex].third in BOOL_TYPES) (v as? Boolean) ?: false else v?.toString() ?: ""
        }
        override fun setValueAt(aValue: Any?, rowIndex: Int, columnIndex: Int) {
            val (id, _, colType) = cols[columnIndex]
            val old = rowsLive[rowIndex][id]
            val coerced: Any? = when {
                colType in BOOL_TYPES -> aValue as? Boolean ?: false
                else -> coerceCellValue(aValue?.toString() ?: "", old)
            }
            if (coerced == old) return
            rowsLive[rowIndex][id] = coerced
            fireTableCellUpdated(rowIndex, columnIndex)
            ctx.markUserEdit()
        }
    }
    val table = JBTable(model)
    table.setShowGrid(true)
    table.rowHeight = JBUI.scale(28)
    table.putClientProperty("terminateEditOnFocusLost", true)
    runCatching { com.intellij.ui.TableSpeedSearch.installOn(table) }

    // ToolbarDecorator needs the ActionManager (full IDE); without it (render probe) fall back to
    // the plain header+table block — cells stay editable either way.
    val decorated = runCatching {
        com.intellij.ui.ToolbarDecorator.createDecorator(table)
            .setAddAction {
                val fresh = LinkedHashMap<String, Any?>()
                for ((id, _, colType) in cols) fresh[id] = if (colType in BOOL_TYPES) false else null
                fresh["_rowNumber"] = rowsLive.size
                rowsLive.add(fresh)
                model.fireTableRowsInserted(rowsLive.size - 1, rowsLive.size - 1)
                ctx.markUserEdit()
            }
            .setRemoveAction {
                val selected = table.selectedRows.map(table::convertRowIndexToModel).sortedDescending()
                for (i in selected) if (i in rowsLive.indices) rowsLive.removeAt(i)
                model.fireTableDataChanged()
                ctx.markUserEdit()
            }
            .setMoveUpAction { moveRow(table, model, rowsLive, -1); ctx.markUserEdit() }
            .setMoveDownAction { moveRow(table, model, rowsLive, +1); ctx.markUserEdit() }
            .createPanel()
    }.getOrNull()

    if (decorated != null) {
        // The decorator wraps the table in its own scroll pane, which collapses inside the
        // vertically-stacked form — pin an explicit preferred height (header + toolbar + rows).
        val rowsShown = (rowsLive.size + 1).coerceIn(3, 12)
        decorated.preferredSize = Dimension(JBUI.scale(400), JBUI.scale(28) * rowsShown + JBUI.scale(70))
        return decorated
    }
    val wrapper = JPanel(BorderLayout())
    wrapper.isOpaque = false
    wrapper.add(table.tableHeader, BorderLayout.NORTH)
    wrapper.add(table, BorderLayout.CENTER)
    return wrapper
}

private fun moveRow(table: JBTable, model: AbstractTableModel, rowsLive: MutableList<LinkedHashMap<String, Any?>>, delta: Int) {
    val i = table.selectedRow.takeIf { it >= 0 }?.let(table::convertRowIndexToModel) ?: return
    val j = i + delta
    if (j !in rowsLive.indices) return
    val tmp = rowsLive[i]; rowsLive[i] = rowsLive[j]; rowsLive[j] = tmp
    model.fireTableRowsUpdated(minOf(i, j), maxOf(i, j))
    table.setRowSelectionInterval(j, j)
}

/** Coerce an edited cell back to the value's original type (numbers stay numbers on the wire). */
private fun coerceCellValue(text: String, old: Any?): Any? {
    if (text.isEmpty()) return if (old is String || old == null) text.ifEmpty { null } else null
    return when (old) {
        is Int -> text.toIntOrNull() ?: old
        is Long -> text.toLongOrNull() ?: old
        is Double, is Float -> text.replace(',', '.').toDoubleOrNull() ?: old
        else -> text.toIntOrNull() ?: text.replace(',', '.').toDoubleOrNull()?.takeIf { text.any { c -> c == '.' || c == ',' } } ?: text
    }
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
    tf.onTextChange { ctx.putState(fieldId, tf.text) }
    return tf
}

private fun passwordField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val pf = JBPasswordField()
    pf.text = initial
    pf.isEnabled = enabled
    pf.onTextChange { ctx.putState(fieldId, String(pf.password)) }
    return pf
}

private fun textArea(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent {
    val ta = JBTextArea(initial, 4, 40)
    ta.isEnabled = enabled
    ta.lineWrap = true
    ta.wrapStyleWord = true
    ta.document.addDocumentListener(object : DocumentListener {
        override fun insertUpdate(e: DocumentEvent) { ctx.putState(fieldId, ta.text) }
        override fun removeUpdate(e: DocumentEvent) { ctx.putState(fieldId, ta.text) }
        override fun changedUpdate(e: DocumentEvent) { ctx.putState(fieldId, ta.text) }
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
        ctx.putState(fieldId, iso)
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
        if (integer) raw.toIntOrNull()?.let { ctx.putState(fieldId, it) }
        else raw.replace(',', '.').toDoubleOrNull()?.let { ctx.putState(fieldId, it) }
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
        if (i in values.indices) ctx.putState(fieldId, values[i])
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
        if (i in labels.indices) ctx.putState(fieldId, labels[i])
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
