package io.mateu.ijp.ui

import io.mateu.ijp.state.AppContext
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JTable
import javax.swing.JTree

/**
 * The listing features beyond rows and paging: group headers + totals, inline editing that saves
 * the row, the pager, master-detail, the tree layout, the pre-search content and cell tooltips.
 */
class CrudFeaturesRenderTest : RenderTestCase() {
    // the expectations below are written in a Spanish app's number format; pin it, or the test
    // depends on the machine's default locale (money follows the UI locale since 3.0-alpha.430)
    override fun setUp() {
        super.setUp()
        MoneyValues.setAppLocale("es-ES")
    }

    override fun tearDown() {
        try {
            MoneyValues.setAppLocale(null)
        } finally {
            super.tearDown()
        }
    }


    private fun crudContext(): AppContext = context().also { it.currentServerSideType = "x.Bookings" }

    private fun crud(ctx: AppContext, metadata: String, data: String): JComponent =
        ComponentRenderer(ctx).render(json("""{"type":"ClientSide","id":"crud1","metadata":$metadata}"""), json("{}"), json(data))

    private fun table(c: JComponent) = all(c).filterIsInstance<JTable>().first()

    private fun cells(t: JTable) = (0 until t.rowCount).map { r -> (0 until t.columnCount).map { c -> t.model.getValueAt(r, c)?.toString() } }

    fun testGroupedRowsGetAHeaderPerGroupAndTheTotalsAFooter() {
        val t = table(crud(crudContext(), """{"type":"Crud","groupBy":"hotel","columns":[
            {"metadata":{"id":"hotel","label":"Hotel"}},{"metadata":{"id":"guest","label":"Guest"}},
            {"metadata":{"id":"amount","label":"Amount","dataType":"money","aggregate":"sum"}},
            {"metadata":{"id":"nights","label":"Nights","aggregate":"count"}}]}""",
            """{"page":{"content":[{"hotel":"Palma","guest":"Ada","amount":100,"nights":2},{"hotel":"Palma","guest":"Grace","amount":50.5,"nights":1},
              {"hotel":"Ibiza","guest":"Linus","amount":10,"nights":3}],"totalElements":3},
             "groups":[{"value":"Palma","count":2,"aggregates":{"amount":150.5,"nights":2}},{"value":"Ibiza","count":1,"aggregates":{"amount":10}}],
             "aggregates":{"amount":160.5,"nights":3}}"""))
        val rows = cells(t)
        assertEquals(listOf("Palma (2)", "", "150,50", "2"), rows[0])
        assertEquals("Ada", rows[1][1])
        assertEquals(listOf("Ibiza (1)", "", "10,00", ""), rows[3])
        assertEquals(listOf("Total (3)", "", "160,50", "3"), rows[5])
        assertEquals(6, rows.size)
        assertFalse("a synthetic row is not editable", t.model.isCellEditable(0, 1))
        // the synthetic rows paint with their own renderer
        assertNotSame(t.getCellRenderer(1, 1), t.getCellRenderer(0, 1))
    }

    fun testATotalsFooterWithoutGroupsIsLabelledTotal() {
        val t = table(crud(crudContext(), """{"type":"Crud","columns":[{"metadata":{"id":"guest","label":"Guest"}},
            {"metadata":{"id":"amount","label":"Amount","aggregate":"avg"}}]}""",
            """{"page":{"content":[{"guest":"Ada","amount":1},{"guest":"Grace","amount":2}],"totalElements":2},"aggregates":{"amount":1.5}}"""))
        assertEquals(listOf("Total", "1.5".replace(".", java.text.DecimalFormatSymbols.getInstance().decimalSeparator.toString())), cells(t).last())
    }

    fun testCommittingAnEditedCellSavesTheRowAndANoOpCommitDoesNot() {
        val ctx = crudContext()
        val t = table(crud(ctx, """{"type":"Crud","columns":[{"metadata":{"id":"id","label":"Id"}},
            {"metadata":{"id":"qty","label":"Qty","editable":true,"editorType":"integer"}},
            {"metadata":{"id":"price","label":"Price","editable":true,"editorType":"number"}},
            {"metadata":{"id":"active","label":"Active","editable":true,"editorType":"boolean"}},
            {"metadata":{"id":"note","label":"Note","editable":true}}]}""",
            """{"page":{"content":[{"id":"s1","qty":3,"price":2.5,"active":false,"note":"x"}],"totalElements":1}}"""))
        assertTrue(t.model.isCellEditable(0, 1))
        assertFalse(t.model.isCellEditable(0, 0))
        assertEquals(java.lang.Boolean::class.java, t.model.getColumnClass(3))
        t.model.setValueAt("3", 0, 1) // unchanged
        t.model.setValueAt("abc", 0, 1) // not a number
        t.model.setValueAt("x", 0, 4) // unchanged
        assertTrue(server.requests.isEmpty())
        t.model.setValueAt("4", 0, 1)
        awaitRequests(1)
        assertEquals("update-row", server.actionIds().single())
        val edited = lastParameters().path("_editedRow")
        assertEquals(4, edited.path("qty").asInt())
        assertEquals("s1", edited.path("id").asText())
        t.model.setValueAt("3,75", 0, 2)
        awaitRequests(2)
        assertEquals(3.75, lastParameters().path("_editedRow").path("price").asDouble())
        assertEquals("the earlier edit stays in the row", 4, lastParameters().path("_editedRow").path("qty").asInt())
        t.model.setValueAt(true, 0, 3)
        awaitRequests(3)
        assertTrue(lastParameters().path("_editedRow").path("active").asBoolean())
    }

    fun testThePagerSaysWhereTheUserIsAndStepsThePage() {
        val ctx = crudContext()
        val c = crud(ctx, """{"type":"Crud","columns":[{"metadata":{"id":"name","label":"Name"}}]}""",
            """{"page":{"content":[{"name":"a"}],"totalElements":25,"pageNumber":1,"pageSize":10}}""")
        assertTrue(texts(c).contains("  Page 2 of 3 (25 total)"))
        assertTrue(button(c, "‹ Prev").isEnabled)
        button(c, "Next ›").doClick()
        button(c, "‹ Prev").doClick()
        awaitRequests(2)
        assertEquals(listOf("nextPage", "prevPage"), server.actionIds())
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"crud1","data":{"page":{"content":[],"totalElements":0}}}]}"""))
        assertTrue(texts(c).contains("  Page 1 of 1 (0 total)"))
        assertFalse(button(c, "Next ›").isEnabled)
    }

    fun testMasterDetailShowsTheSelectedRow() {
        val c = crud(crudContext(), """{"type":"Crud","gridLayout":"masterDetail","columns":[
            {"metadata":{"id":"name","label":"Name"}},{"metadata":{"id":"city","label":"City"}}]}""",
            """{"page":{"content":[{"name":"Ada","city":"London"},{"name":"Grace","city":"NYC"}],"totalElements":2}}""")
        assertTrue(texts(c).contains("Select a row to see its details."))
        val t = table(c)
        t.setRowSelectionInterval(1, 1)
        assertTrue(texts(c).containsAll(listOf("Name", "Grace", "City", "NYC")))
        t.clearSelection()
        assertTrue(texts(c).contains("Select a row to see its details."))
    }

    fun testATreeListingSelectsANodeOnDoubleClick() {
        val ctx = crudContext()
        val c = crud(ctx, """{"type":"Crud","gridLayout":"tree","title":"Zones","columns":[
            {"metadata":{"id":"_select"}},{"metadata":{"id":"name","label":"Name","actionId":"select"}}]}""",
            """{"content":[{"id":"eu","name":"Europe","children":[{"id":"es","name":"Spain"}]}]}""")
        assertTrue(texts(c).contains("Zones"))
        val tree = all(c).filterIsInstance<JTree>().single()
        assertEquals("expanded on arrival", 2, tree.rowCount)
        tree.setSelectionRow(1)
        val e = MouseEvent(tree, MouseEvent.MOUSE_CLICKED, 0, 0, 5, 25, 2, false)
        tree.mouseListeners.forEach { it.mouseClicked(e) }
        awaitRequests(1)
        assertEquals("action-on-row-select", server.actionIds().single())
        assertEquals("es", lastParameters().path("_clickedRow").path("id").asText())
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"crud1","data":{"content":[{"id":"am","name":"America"}]}}]}"""))
        com.intellij.testFramework.PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertEquals(1, tree.rowCount)
    }

    fun testPreSearchContentGivesWayToTheFirstAnswer() {
        val ctx = crudContext()
        val c = crud(ctx, """{"type":"Crud","searchable":true,"preSearch":[{"type":"ClientSide","metadata":{"type":"Text","text":"Try a city"}}],
            "columns":[{"metadata":{"id":"name","label":"Name"}}]}""", "{}")
        assertTrue(texts(c).contains("Try a city"))
        assertTrue("the results wait for the first answer", all(c).filterIsInstance<JTable>().none())
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"crud1","data":{"page":{"content":[{"name":"Palma"}],"totalElements":1}}}]}"""))
        assertFalse(texts(c).contains("Try a city"))
        assertEquals("Palma", table(c).model.getValueAt(0, 0))
    }

    fun testACellWithATooltipPathShowsThatFieldOnHover() {
        val c = crud(crudContext(), """{"type":"Crud","columns":[{"metadata":{"id":"name","label":"Name","tooltipPath":"notes"}}]}""",
            """{"page":{"content":[{"name":"Ada","notes":"VIP guest"}],"totalElements":1}}""")
        val t = table(c)
        t.setSize(400, 200)
        t.doLayout()
        val tip = t.getToolTipText(MouseEvent(t, MouseEvent.MOUSE_MOVED, 0, 0, 10, 5, 0, false))
        assertTrue(tip.orEmpty(), tip.orEmpty().contains("VIP guest"))
    }
}
