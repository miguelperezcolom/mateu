package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the matrix-grid model (mirrors the RN matrixGrid tests). */
class MatrixGridsTest : TestCase() {

    private val grid = MatrixGrids.parse(
        ObjectMapper().readTree(
            """
            {"type": "MatrixGrid", "rowHeaderLabel": "Type", "cellActionId": "openCell", "editActionId": "editCell",
             "columns": [
               {"id": "d1", "label": "Fri 9", "group": "October", "tone": null},
               {"id": "d2", "label": "Sat 10", "group": "October", "tone": "warning"},
               {"id": "d3", "label": "Sun 1", "group": "November", "tone": null},
               {"id": "d4", "label": "Mon 2", "group": null, "tone": null}
             ],
             "sections": [
               {"id": "top", "title": "", "collapsed": true, "rows": [
                 {"id": "occ", "label": "Occupancy", "emphasis": true, "editable": false,
                  "cells": [{"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"}]}]},
               {"id": "rooms", "title": "Rooms", "collapsed": false, "rows": [
                 {"id": "avail", "label": "Available", "editable": true, "emphasis": false, "cells": [
                   {"value": "10"}, {"value": "12", "tone": "danger", "link": true}, {"value": "9"}, {"value": "8"}]},
                 {"id": "sold", "label": "Sold", "cells": [{"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"}]}]},
               {"id": "rates", "title": "Rates", "collapsed": true, "rows": [{"id": "bar", "label": "BAR", "cells": []}]}
             ]}
            """.trimIndent(),
        ),
    )

    private fun names(lines: List<MatrixGrids.Line>) = lines.map {
        when (it) {
            is MatrixGrids.Line.SectionLine -> "[${it.title}${if (it.collapsed) "+" else "-"}]"
            is MatrixGrids.Line.RowLine -> it.row.id
        }
    }

    fun testGroupHeaders() {
        assertEquals(
            listOf(
                MatrixGrids.GroupHeader("October", 0, 2),
                MatrixGrids.GroupHeader("November", 2, 1),
                MatrixGrids.GroupHeader("", 3, 1),
            ),
            MatrixGrids.groupHeaders(grid.columns),
        )
        assertTrue(MatrixGrids.groupHeaders(grid.columns.map { it.copy(group = "") }).isEmpty())
    }

    fun testTonesCellWinsOverColumn() {
        val row = grid.sections[1].rows[0]
        assertEquals("warning", MatrixGrids.cellTone(row.cells[0], grid.columns[1]))
        assertEquals("danger", MatrixGrids.cellTone(row.cells[1], grid.columns[1]))
        assertNull(MatrixGrids.cellTone(row.cells[0], grid.columns[0]))
    }

    fun testSectionsFlattenAndToggle() {
        val collapsed = MatrixGrids.initialCollapsed(grid)
        assertEquals(setOf("rates"), collapsed)
        assertEquals(listOf("occ", "[Rooms-]", "avail", "sold", "[Rates+]"), names(MatrixGrids.lines(grid, collapsed)))
        assertEquals(
            listOf("occ", "[Rooms-]", "avail", "sold", "[Rates-]", "bar"),
            names(MatrixGrids.lines(grid, emptySet())),
        )
        assertEquals(listOf("occ", "[Rooms+]", "[Rates+]"), names(MatrixGrids.lines(grid, setOf("rooms", "rates"))))
    }

    fun testParametersAndLinks() {
        val row = grid.sections[1].rows[0]
        assertEquals(
            mapOf("_rowId" to "avail", "_columnId" to "d2", "_value" to "12"),
            MatrixGrids.cellParameters(row, grid.columns[1], "12"),
        )
        assertTrue(MatrixGrids.isActionableLink(grid, row.cells[1]))
        assertFalse(MatrixGrids.isActionableLink(grid, row.cells[0]))
        assertFalse(MatrixGrids.isActionableLink(grid.copy(cellActionId = ""), row.cells[1]))
        assertTrue(row.editable)
        assertTrue(grid.sections[0].rows[0].emphasis)
    }

    fun testNoOpCommitsDoNotDispatch() {
        assertFalse(MatrixGrids.shouldCommit(grid, "12", "12"))
        assertTrue(MatrixGrids.shouldCommit(grid, "12", "13"))
        assertFalse(MatrixGrids.shouldCommit(grid, null, ""))
        assertFalse(MatrixGrids.shouldCommit(grid.copy(editActionId = ""), "12", "13"))
    }

    fun testA11yName() {
        assertEquals("Available, Sat 10: 12", MatrixGrids.cellA11yName(grid.sections[1].rows[0], grid.columns[1], "12"))
    }
}
