package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.text
import java.awt.Component
import javax.swing.JTable
import javax.swing.table.DefaultTableCellRenderer

/**
 * What the fluent `Grid` (and a listing's columns) say about their table beyond ids and labels, on a
 * JTable: a column's `width` / `autoWidth` / `flexGrow`, its `align`, money / number / date formatting,
 * a TREE of rows (`children`), striped rows. All of it was ignored — a fixed `14rem` column took any
 * width, an `insurance` amount read "82000000", and a tree grid showed only its top level.
 */
object GridTables {
    /** A row of a (tree) grid as it is shown: the wire row, its depth, whether it has children. */
    data class ShownRow(val row: JsonNode, val depth: Int, val key: String, val hasChildren: Boolean)

    /** A row's children (the web's `itemHasChildrenPath = "children"`). */
    fun childrenOf(row: JsonNode): List<JsonNode> = row.path("children").let { if (it.isArray) it.toList() else emptyList() }

    /**
     * The rows a tree grid shows: every top-level row, and the children of the EXPANDED ones (by
     * their key, the path of indexes "0", "0/1"…), depth first — collapsed by default, as the web's
     * tree column starts.
     */
    fun flatten(rows: List<JsonNode>, expanded: Set<String>, parentKey: String = "", depth: Int = 0): List<ShownRow> =
        rows.flatMapIndexed { i, row ->
            val key = if (parentKey.isEmpty()) "$i" else "$parentKey/$i"
            val kids = childrenOf(row)
            listOf(ShownRow(row, depth, key, kids.isNotEmpty())) +
                if (kids.isNotEmpty() && key in expanded) flatten(kids, expanded, key, depth + 1) else emptyList()
        }

    /** The tree column's text: indentation, the ▸ / ▾ toggle (a leaf keeps the toggle's room), the value. */
    fun treeCellText(shown: ShownRow, value: String, expanded: Boolean): String {
        val indent = "    ".repeat(shown.depth)
        val toggle = if (!shown.hasChildren) "   " else if (expanded) "▾ " else "▸ "
        return indent + toggle + value
    }

    /**
     * A cell's text as the web formats it: an amount (dataType / stereotype money) with two decimals
     * in the UI's locale, a number grouped, a date in the UI's locale, anything else as it is.
     */
    fun cellText(value: JsonNode, column: JsonNode): String {
        val dataType = column.text("dataType")
        val stereotype = column.text("stereotype")
        val raw = when {
            value.isMissingNode || value.isNull -> return ""
            value.isValueNode -> value.asText()
            value.has("label") -> return value.text("label")
            value.has("text") -> return value.text("text")
            MoneyValues.isAmount(value) -> return MoneyValues.text(value)
            else -> return value.toString()
        }
        return when {
            dataType == "money" || stereotype == "money" || stereotype == "currency" -> formatNumberCell(raw, money = true)
            dataType in NUMBER_TYPES -> formatNumberCell(raw, money = false)
            else -> DateValues.cellText(raw, dataType)
        }
    }

    private val NUMBER_TYPES = setOf("integer", "int", "long", "number", "double", "float", "decimal", "BigDecimal")

    /** A column's width plan, from its wire `width` / `autoWidth` / `flexGrow`. */
    data class WidthPlan(val fixedPx: Int?, val autoWidth: Boolean, val grows: Boolean)

    fun widthPlan(column: JsonNode): WidthPlan {
        val px = cssLengthPx(column.text("width"))
        val grows = column.text("flexGrow").let { it.isBlank() || (it.toDoubleOrNull() ?: 1.0) > 0 }
        val auto = column.path("autoWidth").asBoolean(false)
        return WidthPlan(px, auto && px == null, grows)
    }

    /**
     * Applies each column's width plan ([columns] by MODEL index): a `width` is the column's width (and
     * its only one when it does not grow); `autoWidth` sizes it to its header and widest cell, then
     * lets it grow unless `flexGrow: 0`. Columns with neither share what is left.
     */
    fun applyWidths(table: JTable, columns: List<JsonNode>) {
        val scale = { n: Int -> com.intellij.util.ui.JBUI.scale(n) }
        for (view in 0 until table.columnCount) {
            val model = table.convertColumnIndexToModel(view)
            val meta = columns.getOrNull(model) ?: continue
            val plan = widthPlan(meta)
            val col = table.columnModel.getColumn(view)
            val target = plan.fixedPx?.let(scale) ?: if (plan.autoWidth) contentWidth(table, view) else null
            target ?: continue
            col.preferredWidth = target
            if (!plan.grows) {
                col.minWidth = target
                col.maxWidth = target
            } else {
                col.minWidth = minOf(target, scale(40))
            }
        }
    }

    /** The width the header and the widest cell of [view] need (+ the cell padding). */
    private fun contentWidth(table: JTable, view: Int): Int {
        val header = table.tableHeader?.let { h ->
            h.defaultRenderer.getTableCellRendererComponent(table, table.columnModel.getColumn(view).headerValue, false, false, -1, view)
                .preferredSize.width
        } ?: 0
        var widest = header
        for (row in 0 until minOf(table.rowCount, 200)) {
            val c = table.prepareRenderer(table.getCellRenderer(row, view), row, view)
            widest = maxOf(widest, c.preferredSize.width)
        }
        return widest + com.intellij.util.ui.JBUI.scale(16)
    }
}

/**
 * A grid cell: aligned as its column (a declared `align`, else numbers to the end), striped rows
 * when the grid asks for `rowStripes`, and link-coloured when the column runs an action.
 */
internal class GridCellRenderer(
    private val align: ColumnAlign.Align,
    private val stripes: Boolean,
    private val link: Boolean,
) : DefaultTableCellRenderer() {
    init { htmlDisabled() }

    override fun getTableCellRendererComponent(table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int): Component {
        val c = super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column)
        horizontalAlignment = ColumnAlign.swing(align)
        if (!isSelected) {
            background = if (stripes && row % 2 == 1) STRIPE else table.background
            foreground = if (link) com.intellij.util.ui.JBUI.CurrentTheme.Link.Foreground.ENABLED else table.foreground
        }
        return c
    }

    companion object {
        val STRIPE = com.intellij.ui.JBColor(java.awt.Color(0, 0, 0, 10), java.awt.Color(255, 255, 255, 12))
    }
}
