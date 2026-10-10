package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the action-panel model (mirrors the RN actionPanel tests). */
class ActionPanelsTest : TestCase() {

    private val mapper = ObjectMapper()

    private val panel = mapper.readTree(
        """
        {"type": "ActionPanel", "label": "I want to…", "shortcut": "ctrl+i",
         "maxPerCategory": 2, "hideUnpopulatedToggle": true, "categories": [
          {"title": "Modify", "actions": [
            {"label": "Rate", "actionId": "rate", "parameters": null, "count": null, "populated": false, "disabled": false},
            {"label": "Traces", "actionId": "traces", "count": 3, "populated": true, "disabled": false},
            {"label": "Notes", "actionId": "notes", "count": 40, "populated": true, "disabled": false,
             "parameters": {"tab": "notes"}},
            {"label": "Lock", "actionId": "lock", "populated": false, "disabled": true}
          ]},
          {"title": "Empty one", "actions": [{"label": "Nothing", "actionId": "n", "populated": false}]},
          {"title": "No actions", "actions": []}
        ]}
        """.trimIndent(),
    )

    fun testCountLabels() {
        assertEquals("Traces (3)", ActionPanels.countLabel("Traces", 3))
        assertEquals("Traces (25)", ActionPanels.countLabel("Traces", 25))
        assertEquals("Traces (25+)", ActionPanels.countLabel("Traces", 26))
        assertEquals("Traces", ActionPanels.countLabel("Traces", 0))
        assertEquals("Traces", ActionPanels.countLabel("Traces", null))
    }

    fun testDefaults() {
        assertEquals("I want to…", ActionPanels.labelOf(mapper.readTree("{}")))
        assertEquals(10, ActionPanels.maxPerCategoryOf(mapper.readTree("{}")))
        assertEquals(10, ActionPanels.maxPerCategoryOf(mapper.readTree("""{"maxPerCategory": 0}""")))
        assertEquals(2, ActionPanels.maxPerCategoryOf(panel))
    }

    fun testPopulatedFirstThenCutWithShowMore() {
        val view = ActionPanels.view(panel)
        assertEquals(listOf("Modify", "Empty one"), view.map { it.title })
        val modify = view[0]
        assertEquals(listOf("Traces (3)", "Notes (25+)"), modify.actions.map { it.label })
        assertTrue(modify.actions.all { it.populated })
        assertEquals(2, modify.hiddenCount)
        assertEquals("Show more (2)", modify.moreLabel)
        assertEquals("notes", modify.actions[1].parameters?.path("tab")?.asText())
        assertNull(modify.actions[0].parameters)
    }

    fun testShowMoreRevealsTheRestOfThatCategory() {
        val modify = ActionPanels.view(panel, expanded = setOf(0))[0]
        assertEquals(listOf("traces", "notes", "rate", "lock"), modify.actions.map { it.actionId })
        assertEquals(0, modify.hiddenCount)
        assertNull(modify.moreLabel)
        assertTrue(modify.actions[3].disabled)
    }

    fun testHideUnpopulatedDropsActionsAndEmptiedCategories() {
        val view = ActionPanels.view(panel, hideUnpopulated = true)
        assertEquals(listOf("Modify"), view.map { it.title })
        assertEquals(listOf("traces", "notes"), view[0].actions.map { it.actionId })
        assertEquals(0, view[0].hiddenCount)
    }

    fun testHideUnpopulatedIgnoredWithoutTheToggle() {
        val noToggle = (panel.deepCopy<com.fasterxml.jackson.databind.node.ObjectNode>())
            .put("hideUnpopulatedToggle", false)
        assertEquals(2, ActionPanels.view(noToggle, hideUnpopulated = true).size)
    }

    fun testKeyStrokeSpec() {
        assertEquals("ctrl I", ActionPanels.keyStrokeSpec("ctrl+i"))
        assertEquals("ctrl shift A", ActionPanels.keyStrokeSpec("Ctrl + Shift + a"))
        assertEquals("alt ENTER", ActionPanels.keyStrokeSpec("alt+enter"))
        assertNull(ActionPanels.keyStrokeSpec(null))
        assertNull(ActionPanels.keyStrokeSpec(""))
        assertNull(ActionPanels.keyStrokeSpec("hyper+i"))
        assertNull(ActionPanels.keyStrokeSpec("ctrl"))
        assertNotNull(javax.swing.KeyStroke.getKeyStroke(ActionPanels.keyStrokeSpec("ctrl+i")!!))
    }
}
