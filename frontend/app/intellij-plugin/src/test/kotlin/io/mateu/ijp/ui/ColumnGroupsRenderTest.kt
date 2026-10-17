package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import javax.swing.JTable

/**
 * Column groups (`GridGroupColumn`, the wire shape pinned by GridColumnGroupSyncTest: the grouped
 * columns in `metadata.columns`). A Swing header is flat, so every grouped column is a table column
 * headed "Group · Column" — in a fluent Grid, a Crud listing and a grid form field alike.
 */
class ColumnGroupsRenderTest : BasePlatformTestCase() {

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
        ctx.currentServerSideType = "x.Rooms"
        return ctx
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun headers(c: Container) = all(c).filterIsInstance<JTable>().first().let { t -> (0 until t.columnCount).map { t.getColumnName(it) } }

    private val columns = """[
        {"type":"ClientSide","id":"room","metadata":{"type":"GridColumn","id":"room","label":"Room"}},
        {"type":"ClientSide","id":"occupancy","children":[],"metadata":{"type":"GridGroupColumn","id":"occupancy","label":"Occupancy","columns":[
          {"type":"ClientSide","id":"adults","metadata":{"type":"GridColumn","id":"adults","label":"Adults"}},
          {"type":"ClientSide","id":"children","metadata":{"type":"GridColumn","id":"children","label":"Children"}}]}}]"""

    private val expected = listOf("Room", "Occupancy · Adults", "Occupancy · Children")

    fun testAFluentGridShowsEveryGroupedColumnHeadedWithItsGroup() {
        val view = ComponentRenderer(context()).render(
            json("""{"type":"ClientSide","id":"g","metadata":{"type":"Grid","content":$columns,"page":{"content":[{"room":"101","adults":2,"children":1}]}}}"""),
            json("{}"), json("{}"))
        assertEquals(expected, headers(view))
        val table = all(view).filterIsInstance<JTable>().first()
        assertEquals("2", table.getValueAt(0, 1))
    }

    fun testACrudListingShowsEveryGroupedColumn() {
        val view = ComponentRenderer(context()).render(
            json("""{"type":"ClientSide","id":"crud1","metadata":{"type":"Crud","title":"Rooms","columns":$columns}}"""),
            json("{}"), json("""{"page":{"content":[{"room":"101","adults":2,"children":1}],"totalElements":1,"pageNumber":0,"pageSize":10}}"""))
        assertEquals(expected, headers(view))
    }

    fun testNestedGroupsComposeTheirPrefixes() {
        val flat = ColumnGroups.flatten(json("""[{"type":"GridGroupColumn","label":"A","columns":[
            {"type":"GridGroupColumn","label":"B","columns":[{"type":"GridColumn","id":"x","label":"X"}]},
            {"type":"GridGroupColumn","columns":[{"type":"GridColumn","id":"y"}]}]}]""").toList())
        assertEquals(listOf("A · B · X", "A · y"), flat.map { it.path("label").asText() })
    }
}
