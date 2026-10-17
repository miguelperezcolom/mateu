package io.mateu.ijp.ui

import javax.swing.JCheckBox

/** The «I want to…» panel as the user operates it: the trigger, the columns, Show more, the hide toggle, choosing. */
class ActionPanelRenderTest : RenderTestCase() {

    private val panel = """{"type":"ActionPanel","label":"I want to…","shortcut":"ctrl+i","maxPerCategory":2,
        "hideUnpopulatedToggle":true,"categories":[
          {"title":"Modify","actions":[
            {"label":"Rate","actionId":"rate","populated":false},
            {"label":"Traces","actionId":"traces","count":3,"populated":true},
            {"label":"Notes","actionId":"notes","count":40,"populated":true,"parameters":{"tab":"notes"}},
            {"label":"Lock","actionId":"lock","disabled":true}]},
          {"title":"Empty one","actions":[{"label":"Nothing","actionId":"n","populated":false}]}]}"""

    fun testTheTriggerNamesItsShortcut() {
        val trigger = buttons(render(context(), panel)).single()
        assertEquals("I want to…", trigger.text)
        assertEquals("I want to… (ctrl+i)", trigger.toolTipText)
        assertEquals("Shortcut: ctrl+i", trigger.accessibleContext.accessibleDescription)
    }

    fun testChoosingAnActionClosesThePanelAndRunsItWithItsParameters() {
        val ctx = context()
        var closed = 0
        val content = actionPanelContent(ctx, json(panel), onChosen = { closed++ }, onRelayout = {})
        assertTrue(texts(content).containsAll(listOf("Modify", "Empty one")))
        assertEquals(listOf("Traces (3)", "Notes (25+)", "Show more (2)", "Nothing"), buttons(content).filter { it !is JCheckBox }.map { it.text })
        button(content, "Notes (25+)").doClick()
        assertEquals(1, closed)
        awaitRequests(1)
        assertEquals("notes", server.actionIds().single())
        assertEquals("notes", lastParameters().path("tab").asText())
    }

    fun testShowMoreAndHideUnpopulatedRebuildTheColumnsInPlace() {
        var relayouts = 0
        val content = actionPanelContent(context(), json(panel), onChosen = {}, onRelayout = { relayouts++ })
        val initial = relayouts
        button(content, "Show more (2)").doClick()
        assertEquals(listOf("Traces (3)", "Notes (25+)", "Rate", "Lock", "Nothing"),
            buttons(content).filter { it !is JCheckBox }.map { it.text })
        assertFalse("a disabled action cannot be chosen", button(content, "Lock").isEnabled)
        button(content, "Lock").doClick()
        assertTrue(server.requests.isEmpty())

        buttons(content).filterIsInstance<JCheckBox>().single().doClick()
        assertFalse("the empty category goes away", texts(content).contains("Empty one"))
        assertEquals(initial + 2, relayouts)
    }

    fun testAPanelWithNoActionsSaysSo() {
        val content = actionPanelContent(context(), json("""{"type":"ActionPanel","categories":[]}"""), onChosen = {}, onRelayout = {})
        assertEquals(listOf("No actions"), texts(content))
    }
}
