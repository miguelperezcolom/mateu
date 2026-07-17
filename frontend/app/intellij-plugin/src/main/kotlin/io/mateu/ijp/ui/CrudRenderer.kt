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
    // GridLayout.tree: hierarchical rows carrying a self-referential `children` list render as a
    // real JTree (double-click = the row link/select action). cards/list variants stay tables on
    // the desktop — the richer widget is the platform-appropriate adaptation.
    if (metadata.text("gridLayout") == "tree") return renderTreeCrud(r, component, metadata, data)
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
        ColSpec(
            id, label, kind, dataType, actionId, text, cm.bool("editable"), cm.text("editorType"),
            cm.text("stereotype"), cm.text("aggregate"),
        )
    }
    // The action id used to open a row's detail: the first link column (e.g. the id column's "view").
    val rowLinkActionId = allSpecs.firstOrNull { it.kind == ColKind.LINK }?.actionId ?: ""
    // Row actions live in the right-click context menu (the IDE way) — no button column in the table.
    val actionSpecs = allSpecs.filter { it.kind == ColKind.ACTIONS }
    val specs = allSpecs.filterNot { it.kind == ColKind.ACTIONS }

    // Inline editing (@InlineEditing crud): committing an edited cell persists its row right away
    // through the crud's `update-row` action, like the web's renderEditableCell.
    val model = CrudTableModel(specs) { updatedRow ->
        ctx.runAction("update-row", mapOf("_editedRow" to updatedRow))
    }
    // Group headers / totals footer (synthetic, presentation-only rows) render bold on a tinted
    // background through a dedicated renderer, bypassing the per-column renderers/editors.
    val syntheticRenderer = SyntheticRowRenderer()
    val table = object : JBTable(model) {
        override fun getCellRenderer(row: Int, column: Int): TableCellRenderer {
            val m = getModel() as? CrudTableModel
            return if (m != null && m.isSynthetic(convertRowIndexToModel(row))) syntheticRenderer
            else super.getCellRenderer(row, column)
        }
    }
    table.setShowGrid(true)
    table.rowHeight = JBUI.scale(30)
    table.putClientProperty("terminateEditOnFocusLost", true)
    // Speed search: type over the table to jump to matching rows (guarded: needs no full IDE, but
    // keep the render probe safe).
    runCatching { TableSpeedSearch.installOn(table) }

    // Empty listings show the wire's emptyStateMessage through the IDE's StatusText.
    table.emptyText.text = metadata.text("emptyStateMessage").ifBlank { "No data" }

    // Bulk row selection (@RowsSelection crud): native JTable multi-selection; the selected row
    // objects (as they came off the wire — synthetic group/totals rows excluded) travel in the
    // component state under `crud_selected_items`, where rowsSelectedRequired actions expect them.
    if (metadata.bool("rowsSelectionEnabled")) {
        table.rowSelectionAllowed = true
        table.selectionModel.selectionMode = javax.swing.ListSelectionModel.MULTIPLE_INTERVAL_SELECTION
        table.selectionModel.addListSelectionListener { e ->
            if (e.valueIsAdjusting) return@addListSelectionListener
            val items = table.selectedRows.toList()
                .mapNotNull { viewRow -> model.rowAt(table.convertRowIndexToModel(viewRow)) }
                .map { rowAsParams(ctx, it) }
            ctx.currentComponentState["crud_selected_items"] = items
        }
    }

    // Header click cycles the column sort (ascending → descending → none) and re-runs the search
    // with the Pageable shape [{field, direction}].
    run {
        val sortables = metadata.arr("columns").mapNotNull { col ->
            val cm = col.path("metadata")
            val id = cm.text("id", col.text("id"))
            if (cm.bool("sortable")) id to cm.text("sortingProperty").ifBlank { id } else null
        }.toMap()
        var sortField = ""
        var sortAscending = true
        table.tableHeader.addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                val viewCol = table.columnModel.getColumnIndexAtX(e.x)
                if (viewCol < 0) return
                val spec = specs.getOrNull(table.convertColumnIndexToModel(viewCol)) ?: return
                val property = sortables[spec.id] ?: return
                when {
                    sortField != property -> { sortField = property; sortAscending = true }
                    sortAscending -> sortAscending = false
                    else -> sortField = ""
                }
                ctx.currentComponentState["sort"] =
                    if (sortField.isBlank()) emptyList<Any>()
                    else listOf(mapOf("field" to sortField, "direction" to if (sortAscending) "ascending" else "descending"))
                ctx.currentComponentState["page"] = 0
                ctx.runAction("search", null, silent = true)
            }
        })
    }

    // Custom renderers only for STATUS/LINK; the rest use JTable's class-based defaults
    // (Boolean → checkbox, String → label), which also provide the inline-editing editors.
    for ((i, spec) in specs.withIndex()) {
        val column = table.columnModel.getColumn(i)
        when (spec.kind) {
            ColKind.STATUS -> column.cellRenderer = StatusCellRenderer()
            ColKind.LINK -> column.cellRenderer = LinkCellRenderer(spec.text)
            else -> {}
        }
    }

    // Double-click a row → open its detail via the row link action (e.g. "view"), passing the
    // whole row as parameters. Listings without a link column (e.g. the check-in board) fall back
    // to the row's FIRST action — its primary (e.g. "Check-in").
    table.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount < 2) return
            val viewRow = table.rowAtPoint(e.point)
            if (viewRow < 0) return
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            if (rowLinkActionId.isNotBlank()) {
                ctx.runAction(rowLinkActionId, rowAsParams(ctx, row))
                return
            }
            val firstAction = actionSpecs.firstNotNullOfOrNull { spec ->
                collectActions(row.path(spec.id), spec.dataType).firstOrNull()
            } ?: return
            val method = firstAction.text("methodNameInCrud")
            if (method.isNotBlank()) ctx.runAction("action-on-row-$method", mapOf("_clickedRow" to row))
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

    // ── search bar: the IDE's SearchTextField (magnifier, clear button, history popup) plus a
    //    collapsible "Filter by" panel with a type-specific widget per filter (smart search port) ──
    if (metadata.bool("searchable")) {
        val searchField = SearchTextField(true)
        searchField.textEditor.emptyText.text = "Search…"
        searchField.textEditor.columns = 24

        var filterBar: FilterBar? = null
        val doSearch = {
            searchField.addCurrentTextToHistory()
            ctx.currentComponentState["searchText"] = searchField.text
            ctx.currentComponentState["page"] = 0
            ctx.currentComponentState["size"] = 10
            ctx.currentComponentState["sort"] = emptyList<Any>()
            filterBar?.collectInto(ctx.currentComponentState)
            ctx.runAction("search", null)
        }
        searchField.textEditor.addActionListener { doSearch() }
        val searchBar = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0)).apply {
            isOpaque = false
            add(searchField)
        }

        val north = verticalPanel(0)
        north.addStacked(searchBar, 2)
        val filtersMeta = metadata.arr("filters")
        if (filtersMeta.isNotEmpty()) {
            val bar = FilterBar(ctx, filtersMeta) { doSearch() }
            filterBar = bar
            searchBar.add(bar.toggle)
            north.addStacked(bar.panel, 2)
        }
        center.add(north, BorderLayout.NORTH)
    }
    // GridLayout.masterDetail: table on the left, a read-only detail form of the selected row on
    // the right (a JBSplitter). Every other layout keeps the plain full-width table.
    if (metadata.text("gridLayout") == "masterDetail") {
        val detail = JPanel(BorderLayout())
        detail.border = JBUI.Borders.emptyLeft(12)
        val hint = JBLabel("Select a row to see its details.")
        hint.foreground = JBUI.CurrentTheme.Label.disabledForeground()
        detail.add(hint, BorderLayout.NORTH)
        table.selectionModel.addListSelectionListener { e ->
            if (e.valueIsAdjusting) return@addListSelectionListener
            val viewRow = table.selectedRow
            detail.removeAll()
            if (viewRow >= 0) {
                val row = model.rowAt(table.convertRowIndexToModel(viewRow))
                if (row != null) {
                    val form = verticalPanel(6)
                    for (spec in specs) {
                        val cell = JBLabel(row.path(spec.id).displayString())
                        val cap = JBLabel(spec.label)
                        cap.foreground = JBUI.CurrentTheme.Label.disabledForeground()
                        form.addStacked(cap, 0)
                        form.addStacked(cell, 6)
                    }
                    detail.add(JBScrollPane(form), BorderLayout.CENTER)
                }
            } else {
                detail.add(hint, BorderLayout.NORTH)
            }
            detail.revalidate(); detail.repaint()
        }
        val splitter = com.intellij.ui.OnePixelSplitter(false, 0.55f)
        splitter.firstComponent = JBScrollPane(table)
        splitter.secondComponent = detail
        center.add(splitter, BorderLayout.CENTER)
    } else {
        center.add(JBScrollPane(table), BorderLayout.CENTER)
    }
    center.add(pager, BorderLayout.SOUTH)
    panel.add(center, BorderLayout.CENTER)

    // ── data handler: initial data + async search results land here ──
    val groupBy = metadata.text("groupBy")
    val applyData = { d: JsonNode ->
        // The listing envelope (the object carrying `page` — plus `aggregates`/`groups` when the
        // crud is grouped/aggregated); `eff` is the page itself.
        val crudNode = d.path("crud")
        val listing = if (!crudNode.path("page").isMissingNode && !crudNode.path("page").isNull) crudNode else d
        val eff = listing.path("page").let { if (!it.isMissingNode && !it.isNull) it else d }
        val rows = extractRows(eff)
        model.setEntries(buildEntries(rows, specs, groupBy, listing))
        val total = eff.path("totalElements").asLong(rows.size.toLong())
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
    val editable: Boolean = false,
    val editorType: String = "",
    val stereotype: String = "",
    val aggregate: String = "",
)

// ── listing groups + aggregates (replicates the web's listingGroups.ts rules) ────────────

/** A table row: real wire data, or a synthetic (presentation-only) group header / totals row. */
private sealed interface RowEntry
private class DataRow(val node: JsonNode) : RowEntry
private class SyntheticRow(val cells: Map<String, String>) : RowEntry

private fun JsonNode?.groupKeyString(): String =
    if (this == null || isNull || isMissingNode) "" else asText("")

/**
 * Formats an aggregate value like the matching cells do: money dataType/stereotype → German
 * locale with exactly 2 fraction digits; 'count' → integer; else default locale, max 2 decimals.
 */
private fun formatAggregate(value: Double, spec: ColSpec): String {
    if (spec.dataType == "money" || spec.stereotype == "money") {
        val nf = java.text.NumberFormat.getNumberInstance(java.util.Locale.GERMANY)
        nf.minimumFractionDigits = 2
        nf.maximumFractionDigits = 2
        return nf.format(value)
    }
    if (spec.aggregate == "count") {
        return java.text.NumberFormat.getIntegerInstance().format(Math.round(value))
    }
    val nf = java.text.NumberFormat.getNumberInstance()
    nf.maximumFractionDigits = 2
    return nf.format(value)
}

/**
 * Walks the (group-sorted) page rows inserting a group header wherever the `groupBy` value
 * changes — "value (count)" in the label column (the groupBy column when visible, else the first
 * column), each group's formatted aggregate in aggregated columns — and appends a totals footer
 * when any column has an aggregate AND the listing data carries `aggregates`.
 */
private fun buildEntries(
    rows: List<JsonNode>,
    specs: List<ColSpec>,
    groupBy: String,
    listing: JsonNode,
): List<RowEntry> {
    val entries = ArrayList<RowEntry>()
    val groups = listing.arr("groups")
    if (groupBy.isNotBlank() && groups.isNotEmpty()) {
        val labelColId = if (specs.any { it.id == groupBy }) groupBy else specs.firstOrNull()?.id
        var lastKey: String? = null
        var started = false
        for (row in rows) {
            val key = row.path(groupBy).groupKeyString()
            if (!started || key != lastKey) {
                started = true
                lastKey = key
                val summary = groups.firstOrNull { it.path("value").groupKeyString() == key }
                val count = summary?.path("count")?.asLong()
                    ?: rows.count { it.path(groupBy).groupKeyString() == key }.toLong()
                val aggregates = summary?.path("aggregates")
                val cells = LinkedHashMap<String, String>()
                for (spec in specs) {
                    when {
                        spec.id == labelColId ->
                            cells[spec.id] = "${summary?.path("value")?.asText(key) ?: key} ($count)"
                        spec.aggregate.isNotBlank() && aggregates != null &&
                            aggregates.path(spec.id).isNumber ->
                            cells[spec.id] = formatAggregate(aggregates.path(spec.id).asDouble(), spec)
                    }
                }
                entries.add(SyntheticRow(cells))
            }
            entries.add(DataRow(row))
        }
    } else {
        rows.forEach { entries.add(DataRow(it)) }
    }
    // Totals footer: whole-filtered-set aggregates pinned as the last row of the table.
    val aggregates = listing.path("aggregates")
    if (aggregates.isObject && specs.any { it.aggregate.isNotBlank() }) {
        val cells = LinkedHashMap<String, String>()
        for (spec in specs) {
            if (spec.aggregate.isNotBlank() && aggregates.path(spec.id).isNumber) {
                cells[spec.id] = formatAggregate(aggregates.path(spec.id).asDouble(), spec)
            }
        }
        specs.firstOrNull()?.let { first ->
            if (cells[first.id] == null) {
                val totalRows = listing.path("page").path("totalElements")
                cells[first.id] = if (groupBy.isNotBlank() && first.id == groupBy && totalRows.isNumber) {
                    "Total (${totalRows.asLong()})"
                } else {
                    "Total"
                }
            }
        }
        entries.add(SyntheticRow(cells))
    }
    return entries
}

/** Bold text on a tinted band — group headers and the totals footer. */
private class SyntheticRowRenderer : DefaultTableCellRenderer() {
    override fun getTableCellRendererComponent(
        table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
    ): Component {
        val c = super.getTableCellRendererComponent(table, value, false, false, row, column) as JLabel
        c.font = c.font.deriveFont(Font.BOLD)
        c.background = com.intellij.ui.JBColor(Color(0xED, 0xF3, 0xFC), Color(0x2D, 0x33, 0x3B))
        c.foreground = table.foreground
        c.isOpaque = true
        return c
    }
}

private fun extractRows(node: JsonNode): List<JsonNode> {
    val content = node.path("content")
    return when {
        content.isArray -> content.toList()
        node.isArray -> node.toList()
        else -> emptyList()
    }
}

// ── cell renderers ─────────────────────────────────────────────────────────────────────

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
 * JTable model backed by a live list of row [JsonNode]s. STATUS/LINK cells return the row's field
 * node (their renderers inspect its shape); bool cells return Boolean (checkbox rendering/editor);
 * the rest return display strings. `editable` columns (an @InlineEditing crud) edit in place: a
 * committed change rebuilds the row map, updates the local node and invokes [onRowEdited] —
 * no-op commits are skipped (a checkbox editor fires on initialization).
 */
private class CrudTableModel(
    private val specs: List<ColSpec>,
    private val onRowEdited: (Map<String, Any?>) -> Unit = {},
) : AbstractTableModel() {
    private val entries = ArrayList<RowEntry>()
    private val mapper = com.fasterxml.jackson.databind.ObjectMapper()

    fun setEntries(newEntries: List<RowEntry>) {
        entries.clear()
        entries.addAll(newEntries)
        fireTableDataChanged()
    }

    /** The wire row node at [index] — null for synthetic (group header / totals) rows, so every
     *  caller (row click, context menu, selection) naturally skips them. */
    fun rowAt(index: Int): JsonNode? = (entries.getOrNull(index) as? DataRow)?.node

    fun isSynthetic(index: Int): Boolean = entries.getOrNull(index) is SyntheticRow

    override fun getRowCount(): Int = entries.size
    override fun getColumnCount(): Int = specs.size
    override fun getColumnName(column: Int): String = specs.getOrNull(column)?.label ?: ""
    override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean =
        entries.getOrNull(rowIndex) is DataRow && specs.getOrNull(columnIndex)?.editable == true

    override fun getColumnClass(columnIndex: Int): Class<*> {
        val spec = specs.getOrNull(columnIndex) ?: return Any::class.java
        return when {
            spec.kind == ColKind.STATUS || spec.kind == ColKind.LINK -> JsonNode::class.java
            spec.dataType == "bool" || spec.editorType == "boolean" -> java.lang.Boolean::class.java
            else -> String::class.java
        }
    }

    override fun getValueAt(rowIndex: Int, columnIndex: Int): Any? {
        val spec = specs[columnIndex]
        val entry = entries.getOrNull(rowIndex) ?: return null
        if (entry is SyntheticRow) return entry.cells[spec.id] ?: ""
        val row = (entry as DataRow).node
        val node = row.path(spec.id)
        return when {
            spec.kind == ColKind.STATUS || spec.kind == ColKind.LINK -> node
            spec.dataType == "bool" || spec.editorType == "boolean" -> node.asBoolean(false)
            else -> node.displayString()
        }
    }

    override fun setValueAt(aValue: Any?, rowIndex: Int, columnIndex: Int) {
        val spec = specs.getOrNull(columnIndex) ?: return
        if (!spec.editable) return
        val row = rowAt(rowIndex) ?: return
        val newValue: Any? = when (spec.editorType) {
            "boolean" -> aValue as? Boolean ?: false
            "integer" -> (aValue?.toString() ?: "").toLongOrNull() ?: return
            "number" -> (aValue?.toString() ?: "").replace(',', '.').toDoubleOrNull() ?: return
            else -> aValue?.toString() ?: ""
        }
        val oldNode = row.path(spec.id)
        val oldValue: Any? = when {
            oldNode.isMissingNode || oldNode.isNull -> null
            oldNode.isBoolean -> oldNode.asBoolean()
            oldNode.isIntegralNumber -> oldNode.asLong()
            oldNode.isNumber -> oldNode.asDouble()
            else -> oldNode.asText()
        }
        if (newValue == oldValue) return
        @Suppress("UNCHECKED_CAST")
        val updated = LinkedHashMap(mapper.convertValue(row, Map::class.java) as Map<String, Any?>)
        updated[spec.id] = newValue
        entries[rowIndex] = DataRow(mapper.valueToTree(updated))
        fireTableCellUpdated(rowIndex, columnIndex)
        onRowEdited(updated)
    }
}


/** GridLayout.tree — rows (and their nested `children`) as a JTree; double-click dispatches the
 *  first LINK/select action with the clicked row, which is how tree lookup selectors resolve. */
private fun renderTreeCrud(r: ComponentRenderer, component: JsonNode, metadata: JsonNode, data: JsonNode): JComponent {
    val ctx = r.ctx
    val panel = JPanel(BorderLayout(0, JBUI.scale(8)))
    panel.border = JBUI.Borders.empty(16)
    val title = metadata.text("title")
    if (title.isNotBlank()) {
        val l = JBLabel(title)
        l.font = l.font.deriveFont(Font.BOLD, 18f)
        panel.add(l, BorderLayout.NORTH)
    }
    val firstColumn = metadata.arr("columns").firstNotNullOfOrNull { col ->
        val cm = col.path("metadata")
        val id = cm.text("id", col.text("id"))
        if (id.isBlank() || id.startsWith("_") || cm.text("dataType") in setOf("actionGroup", "menu", "action")) null else id
    } ?: "name"
    val linkActionId = metadata.arr("columns").firstNotNullOfOrNull { col ->
        col.path("metadata").text("actionId").ifBlank { null }
    } ?: "select"

    val root = javax.swing.tree.DefaultMutableTreeNode("root")
    val treeModel = javax.swing.tree.DefaultTreeModel(root)
    val tree = javax.swing.JTree(treeModel)
    tree.isRootVisible = false
    tree.setCellRenderer { _, value, _, _, _, _, _ ->
        val row = (value as? javax.swing.tree.DefaultMutableTreeNode)?.userObject as? JsonNode
        JBLabel(row?.path(firstColumn)?.displayString() ?: "").apply { border = JBUI.Borders.empty(2, 4) }
    }
    fun fill(parent: javax.swing.tree.DefaultMutableTreeNode, rows: List<JsonNode>) {
        for (row in rows) {
            val node = javax.swing.tree.DefaultMutableTreeNode(row)
            parent.add(node)
            val children = row.path("children")
            if (children.isArray) fill(node, children.toList())
        }
    }
    fun publish(rows: List<JsonNode>) {
        root.removeAllChildren()
        fill(root, rows)
        treeModel.reload()
        for (i in 0 until tree.rowCount) tree.expandRow(i)
    }
    publish(extractRows(data))
    ctx.registerDataHandler(component.text("id").ifBlank { "crud" }) { d -> javax.swing.SwingUtilities.invokeLater { publish(extractRows(d)) } }
    ctx.registerDataHandler("crud") { d -> javax.swing.SwingUtilities.invokeLater { publish(extractRows(d)) } }

    tree.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount < 2) return
            val node = tree.lastSelectedPathComponent as? javax.swing.tree.DefaultMutableTreeNode ?: return
            val row = node.userObject as? JsonNode ?: return
            ctx.runAction("action-on-row-$linkActionId", mapOf("_clickedRow" to row))
        }
    })
    panel.add(javax.swing.JScrollPane(tree), BorderLayout.CENTER)
    return panel
}
