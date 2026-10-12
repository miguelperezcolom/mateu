package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.ui.SearchTextField
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.awt.event.MouseEvent
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JTable

/**
 * The listing (Crud) a user works in all day: rows and paging from the wire, the search box, the
 * header sort cycle, opening a row, bulk selection into the component state, data that arrives
 * later (a search answer), and a @RestListing fetched client-side and paged in memory.
 */
class CrudListingRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)
    private lateinit var server: StubMateuServer

    override fun setUp() {
        super.setUp()
        server = StubMateuServer()
    }

    override fun tearDown() {
        try {
            server.close()
        } finally {
            super.tearDown()
        }
    }

    private fun context(): AppContext {
        val ctx = AppContext(AppSession(server.baseUrl))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        ctx.currentServerSideType = "x.Products"
        return ctx
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun await(what: String, cond: () -> Boolean) {
        val until = System.currentTimeMillis() + 5_000
        while (!cond()) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("timed out waiting for $what")
            Thread.sleep(10)
        }
    }

    private val crud = """{"type":"Crud","title":"Products","searchable":true,"rowsSelectionEnabled":true,
        "emptyStateMessage":"No products yet",
        "columns":[
          {"metadata":{"id":"id","label":"Id","actionId":"view","sortable":true}},
          {"metadata":{"id":"name","label":"Name","sortable":true,"sortingProperty":"fullName"}},
          {"metadata":{"id":"status","label":"Status","dataType":"status"}},
          {"metadata":{"id":"price","label":"Price","dataType":"money"}}
        ]}"""

    private val page = """{"page":{"content":[
          {"id":"p1","name":"Tea","status":"ACTIVE","price":2.5},
          {"id":"p2","name":"Coffee","status":"INACTIVE","price":3}
        ],"totalElements":25,"pageNumber":0,"pageSize":10}}"""

    private fun render(ctx: AppContext, metadata: String = crud, data: String = page): JComponent =
        ComponentRenderer(ctx).render(json("""{"type":"ClientSide","id":"crud1","metadata":$metadata}"""), json("{}"), json(data))

    private fun table(c: JComponent) = all(c).filterIsInstance<JTable>().first()

    fun testRowsAndPagingComeFromTheWire() {
        val ctx = context()
        val view = render(ctx)
        val table = table(view)
        assertEquals(2, table.rowCount)
        assertEquals(listOf("Id", "Name", "Status", "Price"), (0 until table.columnCount).map { table.getColumnName(it) })
        assertTrue(all(view).filterIsInstance<JLabel>().any { it.text.contains("Page 1 of 3 (25 total)") })
        val (prev, next) = all(view).filterIsInstance<JButton>().let { b -> b.first { it.text == "‹ Prev" } to b.first { it.text == "Next ›" } }
        assertFalse(prev.isEnabled)
        assertTrue(next.isEnabled)
        assertEquals("No products yet", (table as com.intellij.ui.table.JBTable).emptyText.text)
        next.doClick()
        await("nextPage") { server.actionIds().contains("nextPage") }
    }

    fun testALaterSearchAnswerReplacesTheRows() {
        val ctx = context()
        val view = render(ctx)
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"crud1","data":{"page":{"content":[{"id":"p9","name":"Mate"}],"totalElements":1,"pageNumber":0,"pageSize":10}}}]}"""))
        val table = table(view)
        assertEquals(1, table.rowCount)
        assertTrue(all(view).filterIsInstance<JLabel>().any { it.text.contains("Page 1 of 1 (1 total)") })
    }

    fun testTheSearchBoxSearchesWithTheTextFromPageZero() {
        val ctx = context()
        val view = render(ctx)
        val search = all(view).filterIsInstance<SearchTextField>().single()
        assertEquals("Search Products", search.textEditor.accessibleContext.accessibleName)
        ctx.currentComponentState["page"] = 2
        search.text = "tea"
        search.textEditor.postActionEvent()
        await("the search request") { server.actionIds().contains("search") }
        val state = server.requests.last().path("componentState")
        assertEquals("tea", state.path("searchText").asText())
        assertEquals(0, state.path("page").asInt())
    }

    fun testTheHeaderCyclesTheSortOnSortableColumnsOnly() {
        val ctx = context()
        val view = render(ctx)
        val table = table(view)
        fun clickHeader(col: Int) {
            val x = table.tableHeader.getHeaderRect(col).centerX.toInt()
            val e = MouseEvent(table.tableHeader, MouseEvent.MOUSE_CLICKED, 0, 0, x, 5, 1, false)
            table.tableHeader.mouseListeners.forEach { it.mouseClicked(e) }
        }
        table.tableHeader.setSize(400, 20)
        table.setSize(400, 200)
        table.doLayout()
        clickHeader(1)
        assertEquals(listOf(mapOf("field" to "fullName", "direction" to "ascending")), ctx.currentComponentState["sort"])
        clickHeader(1)
        assertEquals(listOf(mapOf("field" to "fullName", "direction" to "descending")), ctx.currentComponentState["sort"])
        clickHeader(1)
        assertEquals(emptyList<Any>(), ctx.currentComponentState["sort"])
        ctx.currentComponentState["sort"] = "untouched"
        clickHeader(2) // Status is not sortable
        assertEquals("untouched", ctx.currentComponentState["sort"])
        await("three searches") { server.actionIds().count { it == "search" } == 3 }
    }

    fun testDoubleClickingARowOpensItWithTheRowAsParameters() {
        val ctx = context()
        val table = table(render(ctx))
        table.setSize(400, 200)
        val rect = table.getCellRect(1, 1, true)
        val e = MouseEvent(table, MouseEvent.MOUSE_CLICKED, 0, 0, rect.centerX.toInt(), rect.centerY.toInt(), 2, false)
        table.mouseListeners.forEach { it.mouseClicked(e) }
        await("the view request") { server.actionIds().contains("view") }
        assertEquals("p2", server.requests.last().path("parameters").path("id").asText())
    }

    fun testSelectedRowsTravelInTheComponentState() {
        val ctx = context()
        val table = table(render(ctx))
        table.selectionModel.setSelectionInterval(0, 1)
        @Suppress("UNCHECKED_CAST")
        val selected = ctx.currentComponentState["crud_selected_items"] as List<Map<String, Any?>>
        assertEquals(listOf("p1", "p2"), selected.map { it["id"] })
    }

    fun testARestListingIsFetchedClientSideAndSearchedInMemory() {
        server.json["/api/products"] = """{"items":[{"id":"a","name":"Tea"},{"id":"b","name":"Coffee"},{"id":"c","name":"Green tea"}]}"""
        val ctx = context()
        val metadata = """{"type":"Crud","title":"Remote","searchable":true,"pageSize":2,
            "rowsSource":{"url":"${server.baseUrl}/api/products","itemsPath":"items"},
            "columns":[{"metadata":{"id":"id","label":"Id"}},{"metadata":{"id":"name","label":"Name"}}]}"""
        val view = render(ctx, metadata, "{}")
        val table = table(view)
        await("the rows from the source") { table.rowCount == 2 }
        assertTrue(all(view).filterIsInstance<JLabel>().any { it.text.contains("(3 total)") })
        val search = all(view).filterIsInstance<SearchTextField>().single()
        search.text = "tea"
        search.textEditor.postActionEvent()
        await("the in-memory search") { table.rowCount == 2 && all(view).filterIsInstance<JLabel>().any { it.text.contains("(2 total)") } }
        assertTrue("a REST listing never asks the Mateu server", server.requests.none { it.path("actionId").asText() == "search" })
    }
}
