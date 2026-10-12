package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.awt.event.ActionEvent
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JTable
import javax.swing.KeyStroke

/**
 * The two dense operational widgets, rendered and driven: the matrix grid (edit a cell in place,
 * open a link cell from the keyboard, fold a section) and the calendar (a day and an event act,
 * the view switcher re-draws the period). The pure models are pinned in MatrixGridsTest /
 * CalendarsTest; this pins the wiring between them and the server.
 */
class BoardsRenderTest : BasePlatformTestCase() {

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
        return ctx
    }

    private fun render(ctx: AppContext, metadata: String): JComponent =
        ComponentRenderer(ctx).render(json("""{"type":"ClientSide","metadata":$metadata}"""), json("{}"), json("{}"))

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun awaitRequests(n: Int) {
        val until = System.currentTimeMillis() + 5_000
        while (server.requests.size < n) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("expected $n requests, got ${server.actionIds()}")
            Thread.sleep(10)
        }
    }

    private fun JComponent.fire(stroke: String) {
        val listener = getActionForKeyStroke(KeyStroke.getKeyStroke(stroke)) ?: error("no $stroke binding")
        listener.actionPerformed(ActionEvent(this, ActionEvent.ACTION_PERFORMED, stroke))
    }

    private val matrix = """{"type":"MatrixGrid","rowHeaderLabel":"Type","cellActionId":"openCell","editActionId":"editCell",
        "columns":[{"id":"d1","label":"Fri 9"},{"id":"d2","label":"Sat 10"}],
        "sections":[{"id":"rooms","title":"Rooms","collapsed":false,"rows":[
          {"id":"avail","label":"Available","editable":true,"cells":[{"value":"10"},{"value":"12","link":true}]},
          {"id":"sold","label":"Sold","cells":[{"value":"1"},{"value":"2"}]}]}]}"""

    private fun tables(view: JComponent): Pair<JTable, JTable> {
        val tables = all(view).filterIsInstance<JTable>().toList()
        return tables.first { it.accessibleContext.accessibleName == "Type" && it.columnCount > 1 } to
            tables.first { it.columnCount == 1 }
    }

    fun testEditingAnEditableCellCommitsItsCoordinates() {
        val ctx = context()
        val (cells, _) = tables(render(ctx, matrix))
        // line 0 = the "Rooms" section, 1 = Available, 2 = Sold
        assertTrue(cells.isCellEditable(1, 0))
        assertFalse("a row not marked editable is read-only", cells.isCellEditable(2, 0))
        cells.setValueAt("11", 1, 0)
        awaitRequests(1)
        val body = server.requests.single()
        assertEquals("editCell", body.path("actionId").asText())
        assertEquals("avail", body.path("parameters").path("_rowId").asText())
        assertEquals("d1", body.path("parameters").path("_columnId").asText())
        assertEquals("11", body.path("parameters").path("_value").asText())
        // the same value again is not a change
        cells.setValueAt("11", 1, 0)
        Thread.sleep(100)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertEquals(1, server.requests.size)
    }

    fun testALinkCellOpensFromTheKeyboardAndAPlainOneDoesNot() {
        val ctx = context()
        val (cells, _) = tables(render(ctx, matrix))
        cells.changeSelection(1, 0, false, false)
        cells.fire("SPACE")
        Thread.sleep(100)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertTrue("not a link", server.requests.isEmpty())
        cells.changeSelection(1, 1, false, false)
        cells.fire("SPACE")
        awaitRequests(1)
        assertEquals("openCell", server.actionIds().single())
        assertEquals("12", server.requests.single().path("parameters").path("_value").asText())
    }

    fun testASectionFoldsFromTheKeyboard() {
        val ctx = context()
        val (cells, labels) = tables(render(ctx, matrix))
        assertEquals(3, labels.rowCount)
        labels.changeSelection(0, 0, false, false)
        labels.fire("ENTER")
        assertEquals("folded: only the section line remains", 1, labels.rowCount)
        assertEquals(1, cells.rowCount)
        labels.fire("SPACE")
        assertEquals(3, labels.rowCount)
    }

    private val calendar = """{"type":"Calendar","month":"2026-10-15","view":"month","views":["month","list"],
        "dayActionId":"openDay",
        "days":[{"date":"2026-10-15","label":"Avail 12","tone":"success"}],
        "events":[{"id":"e1","title":"Conference","date":"2026-10-15","actionId":"openConference"}]}"""

    fun testADayAndAnEventAct() {
        val ctx = context()
        val view = render(ctx, calendar)
        val texts = all(view).filterIsInstance<JLabel>().map { it.text.orEmpty() }.toList()
        assertTrue(texts.contains("Conference"))
        assertTrue(texts.contains("Avail 12"))
        val actionable = all(view).filterIsInstance<JComponent>()
            .filter { it.isFocusable && it.mouseListeners.isNotEmpty() && it !is AbstractButton && it.accessibleContext.accessibleRole == javax.accessibility.AccessibleRole.PUSH_BUTTON }
            .toList()
        val event = actionable.first { it.accessibleContext.accessibleName.contains("Conference") }
        event.mouseListeners.forEach { it.mouseClicked(java.awt.event.MouseEvent(event, java.awt.event.MouseEvent.MOUSE_CLICKED, 0, 0, 1, 1, 1, false)) }
        awaitRequests(1)
        assertEquals("openConference", server.actionIds().last())
        val day = actionable.first { it !== event && it.accessibleContext.accessibleName.contains("15") }
        day.mouseListeners.forEach { it.mouseClicked(java.awt.event.MouseEvent(day, java.awt.event.MouseEvent.MOUSE_CLICKED, 0, 0, 1, 1, 1, false)) }
        awaitRequests(2)
        assertEquals("openDay", server.actionIds().last())
        assertEquals("2026-10-15", server.requests.last().path("parameters").path("_date").asText())
    }

    fun testTheViewSwitcherRedrawsThePeriod() {
        val view = render(context(), calendar)
        val buttons = all(view).filterIsInstance<AbstractButton>().filter { it.accessibleContext.accessibleName?.endsWith(" view") == true }.toList()
        assertEquals(2, buttons.size)
        val before = all(view).count()
        buttons.last().doClick()
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertTrue("the list view is drawn instead of the month grid", all(view).count() != before)
        assertTrue(all(view).filterIsInstance<JLabel>().any { it.text.orEmpty() == "Conference" })
    }
}
