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
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.Dimension
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
    val dataType = metadata.text("dataType", "string")
    val stereotype = metadata.text("stereotype")

    // Rule-driven attribute overrides (SetAttributeValue: hidden/disabled/required) + interpolation
    val ruleAttrs = ctx.fieldAttributes[fieldId] ?: emptyMap()
    if (io.mateu.ijp.state.Expressions.truthy(ruleAttrs["hidden"])) return JPanel().apply { isOpaque = false }
    val exprCtx = mapOf<String, Any?>("state" to ctx.currentComponentState, "appState" to ctx.appState)
    val label = io.mateu.ijp.state.Expressions.interpolate(metadata.text("label", fieldId), exprCtx)
    val required = if (ruleAttrs.containsKey("required")) {
        io.mateu.ijp.state.Expressions.truthy(ruleAttrs["required"])
    } else {
        metadata.bool("required")
    }
    val enabled = !metadata.bool("readOnly") && !metadata.bool("disabled") &&
        !io.mateu.ijp.state.Expressions.truthy(ruleAttrs["disabled"])

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
    if (stereotype == "grid" || (dataType == "array" && stereotype != "multiSelect")) {
        if (label.isNotBlank()) {
            val caption = JBLabel(label)
            caption.alignmentX = Component.LEFT_ALIGNMENT
            container.add(caption)
        }
        // @OnRowSelected grids stay read-only selectors (the action drives the master/detail).
        val grid = when {
            metadata.text("onItemSelectionActionId").isNotBlank() -> gridField(ctx, metadata, rawValue)
            enabled -> editableGridField(ctx, fieldId, metadata, rawValue)
            else -> gridField(ctx, metadata, rawValue)
        }
        grid.alignmentX = Component.LEFT_ALIGNMENT
        container.add(grid)
        return container
    }

    // Boolean badge chip (@Badge): lit when true, shows the label.
    if (stereotype == "badge") {
        val chip = badgeChip(label, io.mateu.ijp.state.Expressions.truthy(rawValue.asBoolean(false) || rawValue.asText("").isNotBlank() && rawValue.asText() != "false"))
        chip.alignmentX = Component.LEFT_ALIGNMENT
        container.add(chip)
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
        stereotype == "badge" -> badgeChip(label, io.mateu.ijp.state.Expressions.truthy(value))
        stereotype == "plainText" -> JBLabel(if (dataType == "money") formatMoney(value) else value)
        stereotype == "searchable" || (stereotype == "combobox" && metadata.path("remoteCoordinates").isObject) ->
            lookupField(ctx, fieldId, metadata, value, enabled)
        stereotype == "treeSelect" -> treeSelectField(ctx, fieldId, metadata, value, enabled)
        stereotype == "radio" && options.isNotEmpty() -> radioField(ctx, fieldId, options, value, enabled)
        stereotype == "multiSelect" -> multiSelectField(ctx, fieldId, options, rawValue, enabled)
        stereotype == "slider" -> sliderField(ctx, fieldId, metadata, value, enabled)
        stereotype == "stars" -> starsField(ctx, fieldId, value, enabled)
        stereotype == "color" -> colorField(ctx, fieldId, value, enabled)
        stereotype == "uploadableImage" || stereotype == "camera" -> uploadableImageField(ctx, fieldId, value, enabled)
        stereotype == "signature" -> signatureField(ctx, fieldId, value, enabled)
        stereotype == "image" -> imagePreviewField(value)
        stereotype == "link" && !enabled -> linkField(value)
        stereotype in setOf("markdown", "html", "richText") && !enabled -> richTextField(value, stereotype)
        stereotype == "textarea" || (stereotype in setOf("markdown", "html", "richText") && enabled) ->
            textArea(ctx, fieldId, value, enabled)
        options.isNotEmpty() -> optionsCombo(ctx, fieldId, options, value, enabled)
        dataType == "reference" -> referenceCombo(ctx, fieldId, data, enabled)
        stereotype == "password" -> passwordField(ctx, fieldId, value, enabled)
        dataType in DATE_TYPES || dataType == "datetime" -> dateField(ctx, fieldId, value, enabled)
        dataType in INT_TYPES && metadata.bool("stepButtonsVisible") -> stepperField(ctx, fieldId, metadata, value, enabled)
        dataType in INT_TYPES -> numberField(ctx, fieldId, value, enabled, integer = true)
        (dataType in NUMBER_TYPES || dataType == "money" || stereotype in MONEY_STEREOTYPES) && !enabled ->
            JBLabel(formatMoney(value))
        dataType in NUMBER_TYPES || dataType == "money" || stereotype in MONEY_STEREOTYPES ->
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
 * EDITABLE grid field (the form is in edit mode). Two flavours, per the wire's `inlineEditing`
 * flag: marked (@InlineEditing) → cells edit in place; unmarked (the default) → cells stay
 * read-only and rows are added/edited through a ROW FORM dialog (double-click or the + button),
 * like the web's row sub-editor. Either way everything mutates the live row list stored in
 * `ctx.currentComponentState[fieldId]`, which the form's save action round-trips to the server
 * (the entity is rebuilt from the component state — no per-cell server calls).
 */
private fun editableGridField(ctx: AppContext, fieldId: String, metadata: JsonNode, rows: JsonNode): JComponent {
    val inlineEditing = metadata.bool("inlineEditing")
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
        override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean = inlineEditing
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

    fun editRowInDialog(index: Int?) {
        if (index == null) {
            // New row: empty form, Add appends.
            val edited = showRowFormDialog(table, cols, null) ?: return
            edited["_rowNumber"] = rowsLive.size
            rowsLive.add(edited)
            model.fireTableDataChanged()
            ctx.markUserEdit()
            return
        }
        // Existing row: the dialog navigates prev/next across the rows, applying edits as it moves.
        showRowFormNavigator(table, cols, rowsLive, index) { changedIndex, edited ->
            rowsLive[changedIndex].putAll(edited)
            model.fireTableRowsUpdated(changedIndex, changedIndex)
            table.setRowSelectionInterval(changedIndex, changedIndex)
            ctx.markUserEdit()
        }
    }

    // Row-form editing (the default): double-click a row to edit it in a form dialog.
    if (!inlineEditing) {
        table.addMouseListener(object : java.awt.event.MouseAdapter() {
            override fun mouseClicked(e: java.awt.event.MouseEvent) {
                if (e.clickCount < 2) return
                val row = table.rowAtPoint(e.point)
                if (row >= 0) editRowInDialog(table.convertRowIndexToModel(row))
            }
        })
    }

    // A small manual add/remove/reorder toolbar over the proven header+table block. (The platform
    // ToolbarDecorator was tried first, but its inner scroll pane collapses the rows inside the
    // vertically-stacked form — and it can't run under the render probe to verify a fix.)
    val toolbar = JPanel(java.awt.FlowLayout(java.awt.FlowLayout.LEFT, JBUI.scale(2), 0))
    toolbar.isOpaque = false
    toolbar.add(gridToolButton({ com.intellij.icons.AllIcons.General.Add }, "+", "Add row") {
        if (inlineEditing) {
            val fresh = LinkedHashMap<String, Any?>()
            for ((id, _, colType) in cols) fresh[id] = if (colType in BOOL_TYPES) false else null
            fresh["_rowNumber"] = rowsLive.size
            rowsLive.add(fresh)
            model.fireTableRowsInserted(rowsLive.size - 1, rowsLive.size - 1)
            val last = rowsLive.size - 1
            table.setRowSelectionInterval(last, last)
            ctx.markUserEdit()
        } else {
            editRowInDialog(null)
        }
    })
    if (!inlineEditing) {
        toolbar.add(gridToolButton({ com.intellij.icons.AllIcons.Actions.Edit }, "✎", "Edit selected row") {
            val i = table.selectedRow.takeIf { it >= 0 }?.let(table::convertRowIndexToModel)
            if (i != null) editRowInDialog(i)
        })
    }
    toolbar.add(gridToolButton({ com.intellij.icons.AllIcons.General.Remove }, "−", "Remove selected rows") {
        val selected = table.selectedRows.map(table::convertRowIndexToModel).sortedDescending()
        for (i in selected) if (i in rowsLive.indices) rowsLive.removeAt(i)
        model.fireTableDataChanged()
        ctx.markUserEdit()
    })
    toolbar.add(gridToolButton({ com.intellij.icons.AllIcons.Actions.MoveUp }, "↑", "Move row up") {
        moveRow(table, model, rowsLive, -1); ctx.markUserEdit()
    })
    toolbar.add(gridToolButton({ com.intellij.icons.AllIcons.Actions.MoveDown }, "↓", "Move row down") {
        moveRow(table, model, rowsLive, +1); ctx.markUserEdit()
    })

    val tableBlock = JPanel(BorderLayout())
    tableBlock.isOpaque = false
    tableBlock.add(table.tableHeader, BorderLayout.NORTH)
    tableBlock.add(table, BorderLayout.CENTER)

    val wrapper = JPanel(BorderLayout(0, JBUI.scale(2)))
    wrapper.isOpaque = false
    wrapper.add(toolbar, BorderLayout.NORTH)
    wrapper.add(tableBlock, BorderLayout.CENTER)
    return wrapper
}

/**
 * Modal row form for a grid field: one input per column (checkbox for bools, text otherwise,
 * numbers coerced back on OK). Returns the edited values, or null when cancelled.
 */
private fun showRowFormDialog(
    host: JComponent,
    cols: List<Triple<String, String, String>>,
    existing: Map<String, Any?>?,
): LinkedHashMap<String, Any?>? {
    val owner = javax.swing.SwingUtilities.getWindowAncestor(host)
    val dialog = javax.swing.JDialog(owner, if (existing == null) "New row" else "Edit row", java.awt.Dialog.ModalityType.APPLICATION_MODAL)
    val form = JPanel(java.awt.GridBagLayout())
    form.border = JBUI.Borders.empty(12)
    val editors = LinkedHashMap<String, JComponent>()
    var rowIdx = 0
    for ((id, label, colType) in cols) {
        val gbcLabel = java.awt.GridBagConstraints().apply {
            gridx = 0; gridy = rowIdx; anchor = java.awt.GridBagConstraints.WEST
            insets = JBUI.insets(0, 0, 6, 8)
        }
        val gbcField = java.awt.GridBagConstraints().apply {
            gridx = 1; gridy = rowIdx; weightx = 1.0
            fill = java.awt.GridBagConstraints.HORIZONTAL
            insets = JBUI.insets(0, 0, 6, 0)
        }
        val current = existing?.get(id)
        if (colType in BOOL_TYPES) {
            val cb = JBCheckBox(label, (current as? Boolean) ?: false)
            form.add(JBLabel(""), gbcLabel)
            form.add(cb, gbcField)
            editors[id] = cb
        } else {
            val tf = JBTextField(current?.toString() ?: "", 18)
            form.add(JBLabel(label), gbcLabel)
            form.add(tf, gbcField)
            editors[id] = tf
        }
        rowIdx++
    }

    var accepted = false
    val ok = javax.swing.JButton(if (existing == null) "Add" else "OK")
    ok.addActionListener { accepted = true; dialog.dispose() }
    val cancel = javax.swing.JButton("Cancel")
    cancel.addActionListener { dialog.dispose() }
    val buttons = JPanel(java.awt.FlowLayout(java.awt.FlowLayout.RIGHT, JBUI.scale(6), 0))
    buttons.add(cancel)
    buttons.add(ok)
    form.add(
        buttons,
        java.awt.GridBagConstraints().apply {
            gridx = 0; gridy = rowIdx; gridwidth = 2
            fill = java.awt.GridBagConstraints.HORIZONTAL
            insets = JBUI.insets(8, 0, 0, 0)
        },
    )
    dialog.contentPane.add(form)
    dialog.rootPane.defaultButton = ok
    dialog.rootPane.registerKeyboardAction(
        { dialog.dispose() },
        javax.swing.KeyStroke.getKeyStroke("ESCAPE"),
        JComponent.WHEN_IN_FOCUSED_WINDOW,
    )
    dialog.pack()
    dialog.setLocationRelativeTo(owner)
    dialog.isVisible = true

    if (!accepted) return null
    return collectRowEditors(cols, editors, existing)
}

private fun collectRowEditors(
    cols: List<Triple<String, String, String>>,
    editors: Map<String, JComponent>,
    existing: Map<String, Any?>?,
): LinkedHashMap<String, Any?> {
    val result = LinkedHashMap<String, Any?>()
    existing?.let { result.putAll(it) }
    for ((id, _, colType) in cols) {
        val editor = editors[id] ?: continue
        result[id] = when {
            colType in BOOL_TYPES -> (editor as JBCheckBox).isSelected
            else -> coerceCellValue((editor as JBTextField).text.trim(), existing?.get(id))
        }
    }
    return result
}

/**
 * Row form with ◀/▶ navigation across the grid's rows (the row sub-editor's prev/next): moving to
 * another row APPLIES the current edits via [onApply]; OK applies and closes; Cancel closes
 * discarding only the current form (edits applied while navigating stay).
 */
private fun showRowFormNavigator(
    host: JComponent,
    cols: List<Triple<String, String, String>>,
    rowsLive: List<LinkedHashMap<String, Any?>>,
    startIndex: Int,
    onApply: (Int, LinkedHashMap<String, Any?>) -> Unit,
) {
    val owner = javax.swing.SwingUtilities.getWindowAncestor(host)
    val dialog = javax.swing.JDialog(owner, "", java.awt.Dialog.ModalityType.APPLICATION_MODAL)
    var index = startIndex

    val form = JPanel(java.awt.GridBagLayout())
    form.border = JBUI.Borders.empty(12)
    val editors = LinkedHashMap<String, JComponent>()
    var rowIdx = 0
    for ((id, label, colType) in cols) {
        val gbcLabel = java.awt.GridBagConstraints().apply {
            gridx = 0; gridy = rowIdx; anchor = java.awt.GridBagConstraints.WEST
            insets = JBUI.insets(0, 0, 6, 8)
        }
        val gbcField = java.awt.GridBagConstraints().apply {
            gridx = 1; gridy = rowIdx; weightx = 1.0
            fill = java.awt.GridBagConstraints.HORIZONTAL
            insets = JBUI.insets(0, 0, 6, 0)
        }
        if (colType in BOOL_TYPES) {
            val cb = JBCheckBox(label)
            form.add(JBLabel(""), gbcLabel)
            form.add(cb, gbcField)
            editors[id] = cb
        } else {
            val tf = JBTextField(18)
            form.add(JBLabel(label), gbcLabel)
            form.add(tf, gbcField)
            editors[id] = tf
        }
        rowIdx++
    }

    fun fill() {
        val row = rowsLive.getOrNull(index) ?: return
        dialog.title = "Edit row ${index + 1} of ${rowsLive.size}"
        for ((id, _, colType) in cols) {
            val editor = editors[id] ?: continue
            val v = row[id]
            if (colType in BOOL_TYPES) (editor as JBCheckBox).isSelected = (v as? Boolean) ?: false
            else (editor as JBTextField).text = v?.toString() ?: ""
        }
    }

    fun apply() = onApply(index, collectRowEditors(cols, editors, rowsLive.getOrNull(index)))

    val prev = javax.swing.JButton("◀")
    val next = javax.swing.JButton("▶")
    fun refreshNav() {
        prev.isEnabled = index > 0
        next.isEnabled = index < rowsLive.size - 1
    }
    prev.addActionListener { if (index > 0) { apply(); index--; fill(); refreshNav() } }
    next.addActionListener { if (index < rowsLive.size - 1) { apply(); index++; fill(); refreshNav() } }

    val ok = javax.swing.JButton("OK")
    ok.addActionListener { apply(); dialog.dispose() }
    val cancel = javax.swing.JButton("Cancel")
    cancel.addActionListener { dialog.dispose() }

    val buttons = JPanel(BorderLayout())
    val navSide = JPanel(java.awt.FlowLayout(java.awt.FlowLayout.LEFT, JBUI.scale(4), 0)).apply { add(prev); add(next) }
    val okSide = JPanel(java.awt.FlowLayout(java.awt.FlowLayout.RIGHT, JBUI.scale(6), 0)).apply { add(cancel); add(ok) }
    buttons.add(navSide, BorderLayout.WEST)
    buttons.add(okSide, BorderLayout.EAST)
    form.add(
        buttons,
        java.awt.GridBagConstraints().apply {
            gridx = 0; gridy = rowIdx; gridwidth = 2
            fill = java.awt.GridBagConstraints.HORIZONTAL
            insets = JBUI.insets(8, 0, 0, 0)
        },
    )
    dialog.contentPane.add(form)
    dialog.rootPane.defaultButton = ok
    dialog.rootPane.registerKeyboardAction(
        { dialog.dispose() },
        javax.swing.KeyStroke.getKeyStroke("ESCAPE"),
        JComponent.WHEN_IN_FOCUSED_WINDOW,
    )
    fill()
    refreshNav()
    dialog.pack()
    dialog.setLocationRelativeTo(owner)
    dialog.isVisible = true
}

/** A compact icon button for the grid toolbar; falls back to [fallbackText] without the platform icon. */
private fun gridToolButton(icon: () -> javax.swing.Icon, fallbackText: String, tooltip: String, onClick: () -> Unit): javax.swing.JButton {
    val b = javax.swing.JButton()
    runCatching { b.icon = icon() }.onFailure { b.text = fallbackText }
    b.toolTipText = tooltip
    b.preferredSize = Dimension(JBUI.scale(28), JBUI.scale(24))
    b.addActionListener { onClick() }
    return b
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

private fun dateField(ctx: AppContext, fieldId: String, initial: String, enabled: Boolean): JComponent =
    // IDE-style composite (JBTextField + calendar popup) — see DateField.
    DateField(initial, enabled) { iso -> ctx.putState(fieldId, iso) }

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
