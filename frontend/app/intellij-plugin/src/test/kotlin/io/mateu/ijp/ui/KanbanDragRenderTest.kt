package io.mateu.ijp.ui

import java.awt.Component
import java.awt.Dimension
import java.awt.Point
import java.awt.event.InputEvent
import java.awt.event.MouseEvent
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingUtilities

/** A card dragged with the mouse on the desktop board runs the board's moveActionId, with the same
 *  parameters as the web / RN (`_cardId/_fromColumnId/_toColumnId/_toIndex`). Before this, the
 *  plugin had no drag at all: a press-and-drag on a card did nothing. The events are dispatched to
 *  the card's TITLE label, as a real mouse would (it is the deepest component with a listener). */
class KanbanDragRenderTest : RenderTestCase() {

    private val board = """{"type":"Kanban","moveActionId":"moveTask","columns":[
        {"id":"backlog","title":"Backlog","cards":[{"id":"a","title":"Varnish"},{"id":"b","title":"Inpaint"}]},
        {"id":"done","title":"Done","cards":[{"id":"c","title":"Mount"}]}]}"""

    private fun mouse(target: Component, id: Int, at: Point, root: JComponent) {
        val p = SwingUtilities.convertPoint(root, at, target)
        val mods = if (id == MouseEvent.MOUSE_RELEASED) 0 else InputEvent.BUTTON1_DOWN_MASK
        target.dispatchEvent(MouseEvent(target, id, System.currentTimeMillis(), mods, p.x, p.y, 1, false, MouseEvent.BUTTON1))
    }

    private fun label(view: JComponent, text: String) = all(view).filterIsInstance<JLabel>().first { it.text == text }

    private fun drag(view: JComponent, cardTitle: String, to: Point) {
        val source = label(view, cardTitle)
        val from = SwingUtilities.convertPoint(source, Point(5, 5), view)
        mouse(source, MouseEvent.MOUSE_PRESSED, from, view)
        mouse(source, MouseEvent.MOUSE_DRAGGED, Point(from.x + 10, from.y + 10), view)
        mouse(source, MouseEvent.MOUSE_DRAGGED, to, view)
        mouse(source, MouseEvent.MOUSE_RELEASED, to, view)
    }

    private fun column(view: JComponent, title: String): JPanel =
        all(view).filterIsInstance<JPanel>().first { p -> p.components.any { it is JLabel && it.text.orEmpty().startsWith(title) } }

    private fun laidOut(): JComponent = render(context(), board).also { paint(it, Dimension(900, 400)) }

    fun testDraggingACardToAnotherColumnRunsTheMoveAction() {
        val view = laidOut()
        val done = column(view, "Done")
        // below the last card of Done → the end of that column
        drag(view, "Varnish", SwingUtilities.convertPoint(done, Point(done.width / 2, done.height - 2), view))
        awaitRequests(1)
        assertEquals("moveTask", server.actionIds().last())
        val p = lastParameters()
        assertEquals("a", p.path("_cardId").asText())
        assertEquals("backlog", p.path("_fromColumnId").asText())
        assertEquals("done", p.path("_toColumnId").asText())
        assertEquals(1, p.path("_toIndex").asInt())
    }

    fun testDraggingACardAboveAnotherReordersItsColumn() {
        val view = laidOut()
        drag(view, "Inpaint", SwingUtilities.convertPoint(label(view, "Varnish"), Point(5, 0), view))
        awaitRequests(1)
        val p = lastParameters()
        assertEquals("b", p.path("_cardId").asText())
        assertEquals("backlog", p.path("_toColumnId").asText())
        assertEquals(0, p.path("_toIndex").asInt())
    }

    fun testADropWhereTheCardAlreadyIsRunsNothing() {
        val view = laidOut()
        drag(view, "Varnish", SwingUtilities.convertPoint(label(view, "Varnish"), Point(5, 2), view))
        com.intellij.testFramework.PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        Thread.sleep(200)
        com.intellij.testFramework.PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertTrue(server.actionIds().toString(), server.actionIds().none { it == "moveTask" })
    }
}
