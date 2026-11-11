package io.mateu.ijp.ui

import javax.swing.JEditorPane

/**
 * Links inside a screen's HTML open. A JLabel paints an `<a href>` but never follows it: the front
 * office's «En otros sistemas» table (an Element with «Ver recorrido», the CRS booking…) did nothing
 * on click.
 */
class ContentLinksRenderTest : RenderTestCase() {

    private val table = "<table><tbody><tr><th>Recorrido de la reserva</th><td>" +
        "<a href=\\\"https://rw.ec1.mateu.io/journey/bookings/ZUAAKJ\\\" target=\\\"_blank\\\">Ver recorrido</a></td></tr></tbody></table>"

    fun testAnElementWithLinksIsAPaneThatFollowsThem() {
        val c = render(context(), """{"type":"Element","name":"div","html":true,"content":"$table"}""")
        val pane = all(c).filterIsInstance<JEditorPane>().single()
        assertTrue("the link keeps its target", pane.text.contains("https://rw.ec1.mateu.io/journey/bookings/ZUAAKJ"))
        assertTrue("a click is heard", pane.hyperlinkListeners.isNotEmpty())
        assertFalse(pane.isEditable)
    }

    fun testAnElementWithoutLinksStaysALabel() {
        val c = render(context(), """{"type":"Element","name":"div","html":true,"content":"<b>Hola</b>"}""")
        assertTrue(all(c).none { it is JEditorPane })
    }

    fun testAReadOnlyHtmlValueFollowsItsLinks() {
        val pane = richTextField("<a href=\"https://example.com/x\">x</a>", "html") as JEditorPane
        assertTrue(pane.hyperlinkListeners.isNotEmpty())
    }
}
