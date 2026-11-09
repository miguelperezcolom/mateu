package io.mateu.ijp.ui

import java.awt.Component
import javax.swing.JLabel
import javax.swing.JTable
import javax.swing.SwingConstants
import javax.swing.table.TableCellRenderer

/**
 * Where a listing column's header and values line up (D-16 / IJ-14), the web's rule
 * (libs/mateu `columnAlign.ts`): numbers and amounts to the END, so magnitudes compare at a glance;
 * booleans centred under their header; everything else at the start. The numbers were already
 * right-aligned, but their header stayed on the left, so a "Price" title sat over empty space and
 * the values started under the next column's edge (Few, *Show Me the Numbers*: a header aligns
 * with its data).
 */
object ColumnAlign {
    enum class Align { START, CENTER, END }

    private val NUMERIC = setOf("integer", "int", "long", "number", "double", "float", "decimal", "BigDecimal", "money")
    private val BOOL = setOf("bool", "boolean", "Boolean")

    /** The alignment of a column typed [dataType] / [stereotype]; a declared `align` wins. */
    fun of(dataType: String, stereotype: String = "", declared: String = ""): Align {
        when (declared.lowercase()) {
            "end", "right" -> return Align.END
            "center" -> return Align.CENTER
            "start", "left" -> return Align.START
        }
        return when {
            dataType in NUMERIC || stereotype == "money" || stereotype == "currency" -> Align.END
            dataType in BOOL -> Align.CENTER
            else -> Align.START
        }
    }

    fun swing(align: Align): Int = when (align) {
        Align.START -> SwingConstants.LEADING
        Align.CENTER -> SwingConstants.CENTER
        Align.END -> SwingConstants.TRAILING
    }

    /**
     * Aligns each header of [table] like its column ([alignOfModelColumn], by MODEL index so a
     * reordered or hidden column keeps its own). The platform's header renderer is one shared
     * label, so the alignment is set on every paint, not once.
     */
    fun alignHeaders(table: JTable, alignOfModelColumn: (Int) -> Align) {
        val base = table.tableHeader.defaultRenderer
        val renderer = TableCellRenderer { t: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int ->
            val c: Component = base.getTableCellRendererComponent(t, value, isSelected, hasFocus, row, column)
            val align = if (column >= 0) alignOfModelColumn(t.convertColumnIndexToModel(column)) else Align.START
            (c as? JLabel)?.horizontalAlignment = swing(align)
            c
        }
        table.tableHeader.defaultRenderer = renderer
    }
}
