package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.JBColor
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import io.mateu.ijp.state.AppContext
import java.awt.Color
import java.awt.Component
import java.awt.Cursor
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent
import javax.swing.BorderFactory
import javax.swing.BoxLayout
import javax.swing.JComponent
import javax.swing.JPanel
import javax.swing.JScrollPane
import javax.swing.JTable
import javax.swing.KeyStroke
import javax.swing.ListSelectionModel
import javax.swing.SwingConstants
import javax.swing.table.AbstractTableModel
import javax.swing.table.DefaultTableCellRenderer

private val CELL_W get() = JBUI.scale(72)
private val LABEL_W get() = JBUI.scale(150)
private const val MAX_VISIBLE_W = 900

internal fun toneBackground(tone: String?): Color? = when (tone) {
    "info" -> JBColor(0xE9EFF7, 0x23324A)
    "success" -> JBColor(0xE8F2E9, 0x243B28)
    "warning" -> JBColor(0xF8EFE6, 0x45361F)
    "danger" -> JBColor(0xFCE6EA, 0x4A2328)
    "neutral" -> JBColor(0xF1F1F2, 0x34363A)
    else -> null
}

internal fun toneInk(tone: String?): Color? = when (tone) {
    "info" -> JBColor(0x2763B1, 0x7AA7E8)
    "success" -> JBColor(0x177A23, 0x6CC17A)
    "warning" -> JBColor(0xB85E04, 0xF0B060)
    "danger" -> JBColor(0xC4001F, 0xF08A99)
    else -> null
}

private val LINK_INK = JBColor(0x2763B1, 0x589DF6)

/**
 * Matrix grid (wire `MatrixGrid`): a [JBTable] of cells in a [JBScrollPane] whose ROW HEADER VIEW is
 * a second one-column table with the row labels (so they stay visible while scrolling sideways), and
 * whose column header view stacks the spanning group headers over the table header. Flattening,
 * spans, tones and the commit rule live in [MatrixGrids].
 *
 * Section collapse is client-side: click (or Enter/Space on) a section line. A `link` cell runs
 * `cellActionId` on single click or Space, like [renderButton] (`ctx.runAction(id, params)`); a
 * cell of an `editable` row is edited in place (double click / F2 / typing) and commits through
 * `editActionId` — an unchanged value dispatches nothing. Committed values show locally until the
 * server re-renders the grid.
 */
fun renderMatrixGrid(ctx: AppContext, metadata: JsonNode): JComponent {
    val grid = MatrixGrids.parse(metadata)
    val columns = grid.columns
    val collapsed = HashSet(MatrixGrids.initialCollapsed(grid))
    val overrides = HashMap<String, String>()
    var lines = MatrixGrids.lines(grid, collapsed)

    fun key(row: MatrixGrids.Row, column: MatrixGrids.Column) = "${row.id}::${column.id}"
    fun valueOf(row: MatrixGrids.Row, c: Int): String =
        overrides[key(row, columns[c])] ?: row.cells.getOrNull(c)?.value ?: ""

    val cellsModel = object : AbstractTableModel() {
        override fun getRowCount() = lines.size
        override fun getColumnCount() = columns.size
        override fun getColumnName(column: Int) = columns[column].label
        override fun getValueAt(rowIndex: Int, columnIndex: Int): Any =
            (lines[rowIndex] as? MatrixGrids.Line.RowLine)?.let { valueOf(it.row, columnIndex) } ?: ""
        override fun isCellEditable(rowIndex: Int, columnIndex: Int) =
            (lines[rowIndex] as? MatrixGrids.Line.RowLine)?.row?.editable == true
        override fun setValueAt(aValue: Any?, rowIndex: Int, columnIndex: Int) {
            val row = (lines[rowIndex] as? MatrixGrids.Line.RowLine)?.row ?: return
            val previous = valueOf(row, columnIndex)
            val next = aValue?.toString() ?: ""
            if (!MatrixGrids.shouldCommit(grid, previous, next)) return
            val column = columns[columnIndex]
            overrides[key(row, column)] = next
            fireTableCellUpdated(rowIndex, columnIndex)
            ctx.runAction(grid.editActionId, MatrixGrids.cellParameters(row, column, next))
        }
    }

    val labelsModel = object : AbstractTableModel() {
        override fun getRowCount() = lines.size
        override fun getColumnCount() = 1
        override fun getColumnName(column: Int) = grid.rowHeaderLabel
        override fun getValueAt(rowIndex: Int, columnIndex: Int): Any = when (val l = lines[rowIndex]) {
            is MatrixGrids.Line.SectionLine -> "${if (l.collapsed) "▸" else "▾"} ${l.title}"
            is MatrixGrids.Line.RowLine -> l.row.label
        }
    }

    val cells = JBTable(cellsModel)
    val labels = JBTable(labelsModel)
    val sectionBg = JBColor(0xF4F4F5, 0x2B2D30)

    cells.autoResizeMode = JTable.AUTO_RESIZE_OFF
    cells.cellSelectionEnabled = true
    cells.setSelectionMode(ListSelectionModel.SINGLE_SELECTION)
    cells.tableHeader.reorderingAllowed = false
    cells.tableHeader.resizingAllowed = false
    cells.putClientProperty("terminateEditOnFocusLost", true)
    for (i in 0 until cells.columnModel.columnCount) {
        cells.columnModel.getColumn(i).apply { preferredWidth = CELL_W; minWidth = CELL_W; maxWidth = CELL_W }
    }
    cells.accessibleContext.accessibleName = grid.rowHeaderLabel.ifBlank { "Matrix" }

    labels.tableHeader.reorderingAllowed = false
    labels.tableHeader.resizingAllowed = false
    labels.rowHeight = cells.rowHeight
    labels.setSelectionMode(ListSelectionModel.SINGLE_SELECTION)
    labels.accessibleContext.accessibleName = grid.rowHeaderLabel.ifBlank { "Rows" }

    cells.setDefaultRenderer(Any::class.java, object : DefaultTableCellRenderer() {
        override fun getTableCellRendererComponent(
            table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
        ): Component {
            super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column)
            horizontalAlignment = SwingConstants.RIGHT
            font = table.font
            val line = lines.getOrNull(row)
            if (line !is MatrixGrids.Line.RowLine) {
                text = ""
                background = sectionBg
                accessibleContext.accessibleName = (line as? MatrixGrids.Line.SectionLine)?.title ?: ""
                return this
            }
            val r = line.row
            val col = columns[column]
            val cell = r.cells.getOrNull(column)
            val v = value?.toString() ?: ""
            val tone = MatrixGrids.cellTone(cell, col)
            val link = MatrixGrids.isActionableLink(grid, cell)
            if (r.emphasis) font = font.deriveFont(Font.BOLD)
            if (!isSelected) {
                background = toneBackground(tone) ?: table.background
                foreground = when {
                    link -> LINK_INK
                    cell?.tone != null -> toneInk(cell.tone) ?: table.foreground
                    else -> table.foreground
                }
            }
            text = if (link) "<html><u>${escapeHtml(v)}</u></html>" else v
            accessibleContext.accessibleName = MatrixGrids.cellA11yName(r, col, v)
            accessibleContext.accessibleDescription = when {
                link && r.editable -> "Link. Press Space to open, F2 to edit"
                link -> "Link. Press Space to open"
                r.editable -> "Editable. Press F2 to edit"
                else -> null
            }
            return this
        }
    })

    labels.setDefaultRenderer(Any::class.java, object : DefaultTableCellRenderer() {
        override fun getTableCellRendererComponent(
            table: JTable, value: Any?, isSelected: Boolean, hasFocus: Boolean, row: Int, column: Int,
        ): Component {
            super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column)
            font = table.font
            when (val l = lines.getOrNull(row)) {
                is MatrixGrids.Line.SectionLine -> {
                    font = font.deriveFont(Font.BOLD)
                    if (!isSelected) background = sectionBg
                    accessibleContext.accessibleName = "${l.title}, ${if (l.collapsed) "collapsed" else "expanded"}"
                    accessibleContext.accessibleDescription = "Section. Press Enter or Space to toggle"
                }
                is MatrixGrids.Line.RowLine -> {
                    if (l.row.emphasis) font = font.deriveFont(Font.BOLD)
                    if (!isSelected) background = table.background
                    accessibleContext.accessibleName = l.row.label
                    accessibleContext.accessibleDescription = null
                }
                null -> {}
            }
            return this
        }
    })

    val scroll = JBScrollPane(cells)

    fun resize() {
        val h = lines.size * cells.rowHeight
        cells.preferredScrollableViewportSize = Dimension(minOf(columns.size * CELL_W, JBUI.scale(MAX_VISIBLE_W)), h)
        labels.preferredScrollableViewportSize = Dimension(LABEL_W, h)
        scroll.revalidate()
        scroll.repaint()
    }

    fun toggle(row: Int) {
        val section = lines.getOrNull(row) as? MatrixGrids.Line.SectionLine ?: return
        if (cells.isEditing) cells.cellEditor.stopCellEditing()
        if (!collapsed.remove(section.key)) collapsed.add(section.key)
        lines = MatrixGrids.lines(grid, collapsed)
        cellsModel.fireTableDataChanged()
        labelsModel.fireTableDataChanged()
        val again = lines.indexOfFirst { it is MatrixGrids.Line.SectionLine && it.key == section.key }
        if (again >= 0) labels.setRowSelectionInterval(again, again)
        resize()
        val now = lines[again] as MatrixGrids.Line.SectionLine
        announce(labels, "${now.title}, ${if (now.collapsed) "collapsed" else "expanded"}")
    }

    fun activateLink(row: Int, column: Int): Boolean {
        val line = lines.getOrNull(row) as? MatrixGrids.Line.RowLine ?: return false
        if (column !in columns.indices) return false
        val cell = line.row.cells.getOrNull(column)
        if (!MatrixGrids.isActionableLink(grid, cell)) return false
        ctx.runAction(grid.cellActionId, MatrixGrids.cellParameters(line.row, columns[column], valueOf(line.row, column)))
        return true
    }

    labels.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            toggle(labels.rowAtPoint(e.point))
        }
    })
    val toggleSelected = { _: java.awt.event.ActionEvent -> toggle(labels.selectedRow) }
    labels.registerKeyboardAction(toggleSelected, KeyStroke.getKeyStroke("ENTER"), JComponent.WHEN_FOCUSED)
    labels.registerKeyboardAction(toggleSelected, KeyStroke.getKeyStroke("SPACE"), JComponent.WHEN_FOCUSED)

    cells.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            if (e.clickCount != 1) return
            val row = cells.rowAtPoint(e.point)
            if (lines.getOrNull(row) is MatrixGrids.Line.SectionLine) toggle(row)
            else activateLink(row, cells.columnAtPoint(e.point))
        }
    })
    cells.addMouseMotionListener(object : MouseAdapter() {
        override fun mouseMoved(e: MouseEvent) {
            val line = lines.getOrNull(cells.rowAtPoint(e.point)) as? MatrixGrids.Line.RowLine
            val cell = line?.row?.cells?.getOrNull(cells.columnAtPoint(e.point))
            cells.cursor = if (MatrixGrids.isActionableLink(grid, cell)) Cursor.getPredefinedCursor(Cursor.HAND_CURSOR)
            else Cursor.getDefaultCursor()
        }
    })
    cells.registerKeyboardAction(
        { activateLink(cells.selectedRow, cells.selectedColumn) },
        KeyStroke.getKeyStroke("SPACE"),
        JComponent.WHEN_FOCUSED,
    )

    // Column header: spanning group headers (when any column declares a group) over the table header.
    val groups = MatrixGrids.groupHeaders(columns)
    val groupH = JBUI.scale(24)
    val divider = JBColor.border()
    if (groups.isNotEmpty()) {
        val groupRow = JPanel()
        groupRow.layout = BoxLayout(groupRow, BoxLayout.X_AXIS)
        for (g in groups) {
            val label = JBLabel(g.label, SwingConstants.CENTER).apply {
                font = font.deriveFont(Font.BOLD)
                border = BorderFactory.createMatteBorder(0, 0, 1, 1, divider)
                val d = Dimension(g.span * CELL_W, groupH)
                preferredSize = d; minimumSize = d; maximumSize = d
                accessibleName(g.label.ifBlank { null })
            }
            groupRow.add(label)
        }
        val header = JPanel()
        header.layout = BoxLayout(header, BoxLayout.Y_AXIS)
        groupRow.alignmentX = 0f
        cells.tableHeader.alignmentX = 0f
        header.add(groupRow)
        header.add(cells.tableHeader)
        scroll.setColumnHeaderView(header)

        val corner = JPanel()
        corner.layout = BoxLayout(corner, BoxLayout.Y_AXIS)
        val spacer = JPanel(FlowLayout()).apply {
            val d = Dimension(LABEL_W, groupH)
            preferredSize = d; minimumSize = d; maximumSize = d
            border = BorderFactory.createMatteBorder(0, 0, 1, 1, divider)
        }
        spacer.alignmentX = 0f
        labels.tableHeader.alignmentX = 0f
        corner.add(spacer)
        corner.add(labels.tableHeader)
        scroll.setCorner(JScrollPane.UPPER_LEFT_CORNER, corner)
    } else {
        scroll.setCorner(JScrollPane.UPPER_LEFT_CORNER, labels.tableHeader)
    }
    scroll.setRowHeaderView(labels)
    resize()
    return scroll
}

private fun escapeHtml(s: String) = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
