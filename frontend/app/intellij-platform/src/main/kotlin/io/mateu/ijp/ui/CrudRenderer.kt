package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.displayString
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.table.AbstractTableModel

/**
 * Crud — port of the JavaFX `CrudRenderer`. A [JBTable] whose columns come from `metadata.columns`
 * and whose rows come from the data fragment (`data.content[]`). Toolbar, search bar and a
 * pagination bar drive `search`/`prevPage`/`nextPage`; a double-click on a row opens its detail/edit
 * view. Search results arrive as a data-only fragment routed to the `"crud"` data handler.
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
    val toolbar = metadata.arr("toolbar")
    if (toolbar.isNotEmpty()) header.addStacked(buttonRow(r, toolbar), 4)
    panel.add(header, BorderLayout.NORTH)

    // ── columns + table ──
    val columns = metadata.arr("columns")
    val colIds = columns.map { it.path("metadata").text("id", it.text("id")) }
    val headers = columns.map { c ->
        c.path("metadata").text("label", c.path("metadata").text("id", c.text("id")))
    }
    val model = CrudTableModel(colIds, headers)
    val table = JBTable(model)
    table.setShowGrid(true)

    val detailPath = metadata.text("detailPath")
    table.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount < 2) return
            val viewRow = table.selectedRow
            if (viewRow < 0) return
            val row = model.rowAt(table.convertRowIndexToModel(viewRow)) ?: return
            val rowId = extractRowId(row) ?: return
            val base = detailPath.ifBlank { ctx.currentRoute }
            ctx.navigate("$base/$rowId", "", null, "")
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

    // ── search bar ──
    if (metadata.bool("searchable")) {
        val searchField = JBTextField(24)
        searchField.emptyText.text = "Search…"
        val doSearch = {
            ctx.currentComponentState["searchText"] = searchField.text
            ctx.currentComponentState["page"] = 0
            ctx.currentComponentState["size"] = 10
            ctx.currentComponentState["sort"] = emptyList<Any>()
            ctx.runAction("search", null)
        }
        searchField.addActionListener { doSearch() }
        val searchBar = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(JBGap), 0)).apply {
            isOpaque = false
            add(searchField)
            add(JButton("Search").apply { addActionListener { doSearch() } })
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

private fun extractRows(node: JsonNode): List<JsonNode> {
    val content = node.path("content")
    return when {
        content.isArray -> content.toList()
        node.isArray -> node.toList()
        else -> emptyList()
    }
}

private fun extractRowId(row: JsonNode): String? {
    for (key in listOf("id", "_id", "key", "uuid")) {
        val v = row.path(key)
        if (!v.isMissingNode && !v.isNull) return v.asText()
    }
    return null
}

/** JTable model backed by a live list of row [JsonNode]s; cells read `row[colId]` as display text. */
private class CrudTableModel(
    private val colIds: List<String>,
    private val headers: List<String>,
) : AbstractTableModel() {
    private val rows = ArrayList<JsonNode>()

    fun setRows(newRows: List<JsonNode>) {
        rows.clear()
        rows.addAll(newRows)
        fireTableDataChanged()
    }

    fun rowAt(index: Int): JsonNode? = rows.getOrNull(index)

    override fun getRowCount(): Int = rows.size
    override fun getColumnCount(): Int = colIds.size
    override fun getColumnName(column: Int): String = headers.getOrElse(column) { "" }
    override fun isCellEditable(rowIndex: Int, columnIndex: Int): Boolean = false
    override fun getValueAt(rowIndex: Int, columnIndex: Int): Any {
        val row = rows.getOrNull(rowIndex) ?: return ""
        return row.path(colIds[columnIndex]).displayString()
    }
}
