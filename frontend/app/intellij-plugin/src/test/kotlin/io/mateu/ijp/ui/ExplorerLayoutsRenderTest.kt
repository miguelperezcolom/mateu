package io.mateu.ijp.ui

import com.intellij.openapi.ui.Splitter
import java.awt.GridBagLayout
import javax.swing.JPanel
import javax.swing.text.JTextComponent

/**
 * Layouts authored in YAML that reached the desktop renderer without what they declared (the Mateu
 * Explorer, 3.0-beta.51): a vertical MasterDetailLayout, a FormRow of a fluent/YAML FormLayout and
 * a board row whose items declare their boardCols.
 */
class ExplorerLayoutsRenderTest : RenderTestCase() {

    private fun text(id: String) = """{"type":"ClientSide","id":"$id","metadata":{"type":"Text","text":"$id"},"children":[]}"""
    private fun field(id: String) =
        """{"type":"ClientSide","id":"$id","metadata":{"type":"FormField","fieldId":"$id","dataType":"string","label":"$id"},"children":[]}"""

    fun testAVerticalMasterDetailPutsTheDetailBelowTheMaster() {
        val vertical = render(context(), """{"type":"MasterDetailLayout","orientation":"vertical"}""", "[${text("m")},${text("d")}]")
        assertTrue("a splitter", vertical is Splitter)
        assertTrue("vertical = detail below", (vertical as Splitter).isVertical)
        val beside = render(context(), """{"type":"MasterDetailLayout"}""", "[${text("m")},${text("d")}]")
        assertFalse((beside as Splitter).isVertical)
    }

    fun testAFormRowOfAnAuthoredFormLayoutKeepsItsFieldsOnOneLine() {
        val form = render(context(), """{"type":"FormLayout","maxColumns":1}""",
            """[{"type":"ClientSide","metadata":{"type":"FormRow"},"children":[${field("deposit")},${field("paidOn")}]}]""")
        val grid = all(form).filterIsInstance<JPanel>().first { it.layout is GridBagLayout }
        // ONE grid cell holds the whole row (flattened, the two fields took a line each); the
        // zero-size bottom filler is not a cell
        val cells = grid.components.filter { it.preferredSize.height > 0 }
        assertEquals(1, cells.size)
        val inputs = all(cells[0] as JPanel).filterIsInstance<JTextComponent>().toList()
        assertEquals(2, inputs.size)
    }

    fun testABoardRowSharesItsWidthByBoardCols() {
        val row = render(context(), """{"type":"BoardLayoutRow"}""",
            """[{"type":"ClientSide","metadata":{"type":"BoardLayoutItem","boardCols":2},"children":[${text("a")}]},
                {"type":"ClientSide","metadata":{"type":"BoardLayoutItem"},"children":[${text("b")}]}]""") as JPanel
        val layout = row.layout as GridBagLayout
        val weights = row.components.map { layout.getConstraints(it).weightx }
        assertEquals(listOf(2.0, 1.0), weights)
    }
}
