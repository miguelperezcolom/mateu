package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.openapi.ui.JBMenuItem
import com.intellij.openapi.ui.JBPopupMenu
import com.intellij.ui.SearchTextField
import com.intellij.ui.TableSpeedSearch
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.displayString
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Component
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTable
import javax.swing.table.AbstractTableModel
import javax.swing.table.DefaultTableCellRenderer
import javax.swing.table.TableCellRenderer

/**
 * Crud — port of the JavaFX `CrudRenderer`. A [JBTable] whose columns come from `metadata.columns`
 * and whose rows come from the data fragment (`data.content[]`). Each column renders per its
 * `dataType`: `status` → a coloured badge, `actionGroup`/`menu`/`action` → row-action buttons, a
 * column carrying an `actionId` → a link, everything else → plain text. A double-click on a row
 * dispatches the row link action (e.g. `view`) which — on a listing hosted in the bottom tool window
 * — opens the detail in a central editor tab (see `AppContext.detailOpener`). Toolbar, search bar and
 * a pagination bar drive the usual `search`/`prevPage`/`nextPage` actions.
 */
fun renderCrud(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode): JComponent {
    val ctx = r.ctx
    val panel = JPanel(BorderLayout(0, JBUI.scale(JBGap)))
    panel.border = JBUI.Borders.empty(16)

    // ── header: title/subtitle + toolbar ──
    val header = verticalPanel(4)
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD, 18f)
        header.addStacked(l, 2)
    }
    val subtitle = metadata.text("subtitle")
    if (subtitle.isNotBlank()) {
        val l = JBLabel(subtitle)
        l.foreground = JBUI.CurrentTheme.Label.disabledForeground()
        header.addStacked(l, 4)
    }
    // Crud toolbar (New, export…) → the native host toolbar when available (tool window title).
    val toolbar = metadata.arr("toolbar")
    if (toolbar.isNotEmpty() && !ctx.publishToolbar(toolbar)) header.addStacked(buttonRow(r, toolbar), 4)
    panel.add(header, BorderLayout.NORTH)

    // ── column specs ──
    val allSpecs = metadata.arr("columns").map { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        val label = cm.text("label", id)
        val dataType = cm.text("dataType")
        val actionId = cm.text("actionId")
        val text = cm.text("text")
        val kind = when {
            dataType == "status" -> ColKind.STATUS
            dataType == "actionGroup" || dataType == "menu" || dataType == "action" -> ColKind.ACTIONS
            actionId.isNotBlank() -> ColKind.LINK
            else -> ColKind.TEXT
        }
        ColSpec(id, label, kind, dataType, actionId, text)
    }
    // The action id used to open a row's detail: the first link column (e.g. the id column's "view").
    val rowLinkActionId = allSpecs.firstOrNull { it.kind == ColKind.LINK }?.actionId ?: ""
    // Row actions live in the right-click context menu (the IDE way) — no button column in the table.
    val actionSpecs = allSpecs.filter { it.kind == ColKind.ACTIONS }
    val specs = allSpecs.filterNot { it.kind == ColKind.ACTIONS }

    val model = CrudTableModel(specs)
    val table = JBTable(model)
    table.setShowGrid(true)
    table.rowHeight = JBUI.scale(30)
    // Speed search: type over the table to jump to matching rows (guarded: needs no full IDE, but
    // keep the render probe safe).
    runCatching { TableSpeedSearch.installOn(table) }

    // Per-column renderers.
    for ((i, spec) in specs.withIndex()) {
        val column = table.columnModel.getColumn(i)
        when (spec.kind) {
            ColKind.STATUS -> column.cellRenderer = StatusCellRenderer()
            ColKind.LINK -> column.cellRenderer = LinkCellRenderer(spec.text)
            else -> column.cellRenderer = NodeTextRenderer()
        }
    }

    // Double-click a row → open its detail via the row link action (e.g. "view"), passing the whole
    // row as parameters (matching the JavaFX renderer).
    table.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount < 2 || rowLinkActionId.isBlank()) return
            val viewRow = table.rowAtPoint(e.point)
            if (viewRow < 0) return
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            ctx.runAction(rowLinkActionId, rowAsParams(ctx, row))
        }
    })

    // Right-click a row → context menu with the row link ("Open") + the row's column actions
    // (e.g. "Set as blue") — the IDE-native way to reach row actions.
    table.addMouseListener(object : MouseAdapter() {
        override fun mousePressed(e: MouseEvent) = maybePopup(e)
        override fun mouseReleased(e: MouseEvent) = maybePopup(e)
        private fun maybePopup(e: MouseEvent) {
            if (!e.isPopupTrigger) return
            val viewRow = table.rowAtPoint(e.point)
            if (viewRow < 0) return
            table.setRowSelectionInterval(viewRow, viewRow)
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            val menu = JBPopupMenu()
            if (rowLinkActionId.isNotBlank()) {
                menu.add(JBMenuItem("Open").apply {
                    addActionListener { ctx.runAction(rowLinkActionId, rowAsParams(ctx, row)) }
                })
            }
            var hadRowActions = false
            for (spec in actionSpecs) {
                for (a in collectActions(row.path(spec.id), spec.dataType)) {
                    val method = a.text("methodNameInCrud")
                    val label = a.text("label", method)
                    if (label.isBlank()) continue
                    if (!hadRowActions && menu.componentCount > 0) menu.addSeparator()
                    hadRowActions = true
                    menu.add(JBMenuItem(label).apply {
                        isEnabled = !a.bool("disabled")
                        addActionListener { ctx.runAction("action-on-row-$method", mapOf("_clickedRow" to row)) }
                    })
                }
            }
            if (menu.componentCount > 0) menu.show(table, e.x, e.y)
        }
    })

    // ── pagination bar ──
    val pageInfo = JBLabel("")
    val prev = JButton("‹ Prev").apply { addActionListener { ctx.runAction("prevPage", null) } }
    val next = JButton("Next ›").apply { addActionListener { ctx.runAction("nextPage", null) } }
    val pager = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0)).apply {
        isOpaque = false
        add(prev); add(next); add(pageInfo)
    }

    val center = JPanel(BorderLayout(0, JBUI.scale(4)))
    center.isOpaque = false

    // ── search bar: the IDE's SearchTextField (magnifier, clear button, history popup) ──
    if (metadata.bool("searchable")) {
        val searchField = SearchTextField(true)
        searchField.textEditor.emptyText.text = "Search…"
        searchField.textEditor.columns = 24
        val doSearch = {
            searchField.addCurrentTextToHistory()
            ctx.currentComponentState["searchText"] = searchField.text
            ctx.currentComponentState["page"] = 0
            ctx.currentComponentState["size"] = 10
            ctx.currentComponentState["sort"] = emptyList<Any>()
            ctx.runAction("search", null)
        }
        searchField.textEditor.addActionListener { doSearch() }
        val searchBar = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0)).apply {
            isOpaque = false
            add(searchField)
        }
        center.add(searchBar, BorderLayout.NORTH)
    }
    center.add(JBScrollPane(table), BorderLayout.CENTER)
    center.add(pager, BorderLayout.SOUTH)
    panel.add(center, BorderLayout.CENTER)

    // ── data handler: initial data + async search results land here ──
    val applyData = { d: JsonNode ->
        val eff = d.path("crud").path("page").let { if (!it.isMissingNode && !it.isNull) it else d }
        model.setRows(extractRows(eff))
        val total = eff.path("totalElements").asLong(model.rowCount.toLong())
        val pageNumber = eff.path("pageNumber").asInt(0)
        val pageSize = eff.path("pageSize").asInt(10).coerceAtLeast(1)
        val totalPages = if (total == 0L) 1 else ((total + pageSize - 1) / pageSize).toInt()
        pageInfo.text = "  Page ${pageNumber + 1} of $totalPages ($total total)"
        prev.isEnabled = pageNumber > 0
        next.isEnabled = pageNumber + 1 < totalPages
    }
    ctx.registerDataHandler("crud") { applyData(it) }
    // Seed with any data already present on this fragment.
    if (!data.isNull && !data.isMissingNode) applyData(data)

    return panel
}

@Suppress("UNCHECKED_CAST")
private fun rowAsParams(ctx: io.mateu.ijp.state.AppContext, row: JsonNode): Map<String, Any?> =
    ctx.mapper.convertValue(row, Map::class.java) as Map<String, Any?>

private enum class ColKind { TEXT, STATUS, LINK, ACTIONS }

private data class ColSpec(
    val id: String,
    val label: String,
    val kind: ColKind,
    val dataType: String,
    val actionId: String,
    val text: String,
)

private fun extractRows(node: JsonNode): List<JsonNode> {
    val content = node.path("content")
    return when {
        content.isArray -> content.toList()
        node.isArray -> node.toList()
        else -> emptyList()
    }
}

// ── cell renderers ─────────────────────────────────────────────────────────────────────

/** Plain text: unwraps `{message}`/`{value}` objects via [displayString]. */
private class NodeTextRenderer : DefaultTableCellRenderer() {
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component = super.getTableCellRendererComponent(
        table, (value as? JsonNode).displayString(), isSelected, hasFocus, row, column,
    )
}

/** Link-styled cell (an identifier column with an `actionId`); the row double-click opens it. */
private class LinkCellRenderer(private val fixedText: String) : DefaultTableCellRenderer() {
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        val node = value as? JsonNode
        val cellText = fixedText.ifBlank { node.displayString() }
        val c = super.getTableCellRendererComponent(table, cellText, isSelected, hasFocus, row, column) as JLabel
        if (!isSelected) c.foreground = JBUI.CurrentTheme.Link.Foreground.ENABLED
        return c
    }
}

/** Status column: renders the `{type,message,value}` object as a coloured badge. */
private class StatusCellRenderer : TableCellRenderer {
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        val wrapper = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(4), JBUI.scale(2)))
        wrapper.background = if (isSelected) table.selectionBackground else table.background
        val node = value as? JsonNode
        if (node != null && !node.isNull && !node.isMissingNode) {
            val text = node.displayString()
            val type = if (node.isObject) node.text("type") else ""
            if (text.isNotBlank()) wrapper.add(statusBadge(text, type))
        }
        return wrapper
    }
}

private fun statusBadge(text: String, type: String): JComponent {
    val badge = JLabel(text)
    badge.isOpaque = true
    badge.foreground = Color.WHITE
    badge.background = statusColor(type)
    badge.border = JBUI.Borders.empty(1, 8)
    return badge
}

private fun statusColor(type: String): Color = when (type.uppercase()) {
    "SUCCESS", "OK", "DONE" -> Color(0x3E, 0x86, 0x35)
    "ERROR", "DANGER", "KO" -> Color(0xC9, 0x19, 0x0B)
    "WARNING", "WARN", "PENDING" -> Color(0xF0, 0xAB, 0x00)
    "INFO" -> Color(0x2B, 0x9A, 0xF3)
    else -> Color(0x6A, 0x6E, 0x73)
}

/** The row-action nodes of an action-group/menu/action field (feeds the row context menu). */
private fun collectActions(fieldNode: JsonNode?, dataType: String): List<JsonNode> {
    if (fieldNode == null || fieldNode.isNull || fieldNode.isMissingNode) return emptyList()
    return if (dataType == "action") {
        if (fieldNode.has("methodNameInCrud")) listOf(fieldNode) else emptyList()
    } else {
        fieldNode.path("actions").let { if (it.isArray) it.toList() else emptyList() }
    }
}

/**
 * JTable model backed by a live list of row [JsonNode]s. Each cell returns the row's field node
 * (`row[colId]`) so the per-column renderers can inspect its shape (status object, …).
 */
private class CrudTableModel(private val specs: List<ColSpec>) : AbstractTableModel() {
    private val rows = ArrayList<JsonNode>()

    fun setRows(newRows: List<JsonNode>) {
        rows.clear()
        rows.addAll(newRows)
        fireTableDataChanged()
    }

    fun rowAt(index: Int): JsonNode? = rows.getOrNull(index)

    override fun getRowCount(): Int = rows.size
    override fun getColumnCount(): Int = specs.size
    override fun getColumnName(column: Int): String = specs.getOrNull(column)?.label ?: ""
    override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean = false
    override fun getValueAt(rowIndex: Int, columnIndex: Int): Any? {
        val row = rows.getOrNull(rowIndex) ?: return null
        return row.path(specs[columnIndex].id)
    }
}
