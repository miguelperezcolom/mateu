package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/**
 * Matrix grids (wire type `MatrixGrid`): rows (metrics, room types…) × columns (dates…), the shape
 * of an availability or forecast grid. Same contract as the web renderers:
 *
 *  - consecutive columns sharing a `group` get ONE spanning header above theirs;
 *  - a section with a non-blank title is a header line that toggles its rows (client-side, initial
 *    state = `collapsed`); a blank title puts its rows at the top level, with no header;
 *  - a cell tone wins over its column tone (info, success, warning, danger, neutral);
 *  - a `link` cell dispatches `cellActionId`, an edited cell of an `editable` row dispatches
 *    `editActionId` — both with `{ _rowId, _columnId, _value }`; an unchanged value dispatches nothing.
 *
 * Pure (no Swing) so it is unit-testable; `renderMatrixGrid` (MatrixGridRenderer.kt) draws it.
 */
object MatrixGrids {

    private val TONES = setOf("info", "success", "warning", "danger", "neutral")

    data class Column(val id: String, val label: String, val group: String, val tone: String?)
    data class Cell(val value: String, val tone: String?, val link: Boolean)
    data class Row(val id: String, val label: String, val cells: List<Cell>, val editable: Boolean, val emphasis: Boolean)
    data class Section(val key: String, val title: String, val collapsed: Boolean, val rows: List<Row>)

    data class Grid(
        val rowHeaderLabel: String,
        val columns: List<Column>,
        val sections: List<Section>,
        val cellActionId: String,
        val editActionId: String,
    )

    /** A spanning header: [label] ('' for a run of ungrouped columns) over [span] columns from [start]. */
    data class GroupHeader(val label: String, val start: Int, val span: Int)

    sealed class Line {
        data class SectionLine(val key: String, val title: String, val collapsed: Boolean) : Line()
        data class RowLine(val sectionKey: String, val row: Row) : Line()
    }

    private fun tone(raw: String): String? = raw.trim().lowercase().takeIf { it in TONES }

    fun parse(metadata: JsonNode): Grid = Grid(
        rowHeaderLabel = metadata.text("rowHeaderLabel"),
        columns = metadata.arr("columns").map {
            Column(it.text("id"), it.text("label"), it.text("group").trim(), tone(it.text("tone")))
        },
        sections = metadata.arr("sections").mapIndexed { i, s ->
            Section(
                key = s.text("id").trim().ifBlank { "#$i" },
                title = s.text("title").trim(),
                collapsed = s.bool("collapsed"),
                rows = s.arr("rows").map { r ->
                    Row(
                        id = r.text("id"),
                        label = r.text("label"),
                        cells = r.arr("cells").map { c -> Cell(c.text("value"), tone(c.text("tone")), c.bool("link")) },
                        editable = r.bool("editable"),
                        emphasis = r.bool("emphasis"),
                    )
                },
            )
        },
        cellActionId = metadata.text("cellActionId").trim(),
        editActionId = metadata.text("editActionId").trim(),
    )

    /** One header per run of consecutive columns sharing a group; empty when no column has a group. */
    fun groupHeaders(columns: List<Column>): List<GroupHeader> {
        if (columns.none { it.group.isNotBlank() }) return emptyList()
        val out = ArrayList<GroupHeader>()
        columns.forEachIndexed { i, c ->
            val last = out.lastOrNull()
            if (last != null && last.label == c.group) out[out.size - 1] = last.copy(span = last.span + 1)
            else out.add(GroupHeader(c.group, i, 1))
        }
        return out
    }

    /** The tone a cell paints with: its own, else its column's, else null. */
    fun cellTone(cell: Cell?, column: Column?): String? = cell?.tone ?: column?.tone

    /** The keys of the TITLED sections the wire marks collapsed (an untitled section cannot collapse). */
    fun initialCollapsed(grid: Grid): Set<String> =
        grid.sections.filter { it.title.isNotBlank() && it.collapsed }.map { it.key }.toSet()

    /** What to paint, top to bottom, for the given collapse state. */
    fun lines(grid: Grid, collapsed: Set<String>): List<Line> {
        val out = ArrayList<Line>()
        for (s in grid.sections) {
            val titled = s.title.isNotBlank()
            val isCollapsed = titled && s.key in collapsed
            if (titled) out.add(Line.SectionLine(s.key, s.title, isCollapsed))
            if (!isCollapsed) s.rows.forEach { out.add(Line.RowLine(s.key, it)) }
        }
        return out
    }

    fun cellParameters(row: Row, column: Column, value: String?): Map<String, Any?> =
        linkedMapOf("_rowId" to row.id, "_columnId" to column.id, "_value" to (value ?: ""))

    fun isActionableLink(grid: Grid, cell: Cell?): Boolean = cell?.link == true && grid.cellActionId.isNotBlank()

    /** Only dispatch when there is an editActionId and the value really changed. */
    fun shouldCommit(grid: Grid, previous: String?, next: String?): Boolean =
        grid.editActionId.isNotBlank() && (previous ?: "") != (next ?: "")

    /** The screen-reader name of a cell: "Available, Sat 10: 12". */
    fun cellA11yName(row: Row, column: Column, value: String?): String = "${row.label}, ${column.label}: ${value ?: ""}"
}
