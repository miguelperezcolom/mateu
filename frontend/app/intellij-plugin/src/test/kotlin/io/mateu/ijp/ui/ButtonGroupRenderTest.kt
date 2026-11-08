package io.mateu.ijp.ui

import javax.swing.JMenuItem
import javax.swing.JPopupMenu

/**
 * A ButtonGroup placed in content reaches the wire as a Button whose `children` are the group's
 * buttons (no action of its own). It used to draw as one button labelled like the group that ran
 * nothing; now it is a trigger opening a menu of its buttons, each running its own action.
 */
class ButtonGroupRenderTest : RenderTestCase() {

    private val group = """{"type":"Button","label":"More","children":[
        {"type":"Button","label":"Export","actionId":"export"},
        {"type":"Button","label":"Archive","actionId":"archive","parameters":{"all":true}}]}"""

    fun testTheGroupIsATriggerWhoseMenuRunsEachButtonsAction() {
        val trigger = buttons(render(context(), group)).single()
        assertEquals("More ▾", trigger.text)
        val menu = trigger.getClientProperty(BUTTON_GROUP_MENU) as JPopupMenu
        val items = menu.components.filterIsInstance<JMenuItem>()
        assertEquals(listOf("Export", "Archive"), items.map { it.text })
        items[1].doClick()
        awaitRequests(1)
        assertEquals("archive", server.actionIds().single())
        assertTrue(lastParameters().path("all").asBoolean())
    }

    fun testAPlainButtonIsNotAGroup() {
        val button = buttons(render(context(), """{"type":"Button","label":"Save","actionId":"save"}""")).single()
        assertEquals("Save", button.text)
        assertNull(button.getClientProperty(BUTTON_GROUP_MENU))
    }
}
