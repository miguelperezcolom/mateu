package io.mateu.ijp.ui

import com.intellij.testFramework.PlatformTestUtil
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBList
import io.mateu.ijp.state.AppContext
import javax.swing.JComponent

/**
 * Multi-value fields (multiSelect, listBox, a multi-select combobox) read their options from a REST
 * source (`optionsSource`) like a select does: fetched directly, through a catalogue `ref`, or proxied
 * through `__restfetch__` — and the picks are written back as the options' values.
 */
class SourcedMultiValueOptionsTest : RenderTestCase() {

    private val missions = """[{"id":7,"name":"Apollo 11"},{"id":25,"name":"Artemis III"}]"""

    private fun field(stereotype: String, source: String, dataType: String = "array") =
        """{"type":"FormField","fieldId":"f","label":"Missions","dataType":"$dataType","stereotype":"$stereotype",
            "optionsSource":$source}"""

    private fun field(ctx: AppContext, metadata: String, state: String = "{}"): JComponent =
        renderFormField(ctx, json(metadata), json(state), json("{}"))

    /** Lets the background fetch land and its EDT update run. */
    private fun settle(c: JComponent, until: () -> Boolean) {
        val deadline = System.currentTimeMillis() + 5000
        while (!until() && System.currentTimeMillis() < deadline) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            Thread.sleep(20)
        }
        c.doLayout()
    }

    private fun checkboxes(c: JComponent) = all(c).filterIsInstance<JBCheckBox>().toList()

    private fun direct(ctx: AppContext) = """{"url":"${server.baseUrl}/missions","valuePath":"id","labelPath":"name"}"""

    fun testAMultiSelectListsTheSourceAndWritesIdsBack() {
        server.json["/missions"] = missions
        val ctx = context()
        val c = field(ctx, field("multiSelect", direct(ctx)), state = """{"f":["25"]}""")
        settle(c) { checkboxes(c).size == 2 }
        val boxes = checkboxes(c)
        assertEquals(listOf("Apollo 11", "Artemis III"), boxes.map { it.text })
        assertTrue(boxes[1].isSelected)
        boxes[0].doClick()
        assertEquals(setOf("7", "25"), ctx.currentComponentState["f"].let { (it as List<*>).map(Any?::toString).toSet() })
    }

    fun testAMultiSelectComboboxIsACheckboxGroupOfTheSource() {
        server.json["/missions"] = missions
        val ctx = context()
        val c = field(ctx, field("combobox", direct(ctx)))
        settle(c) { checkboxes(c).size == 2 }
        assertEquals(listOf("Apollo 11", "Artemis III"), checkboxes(c).map { it.text })
    }

    fun testAListBoxReadsTheSourceThroughACatalogueRef() {
        server.json["/missions"] = missions
        val ctx = context()
        ctx.session.sources.registerRestSources(json(
            """[{"name":"missions","source":{"url":"${server.baseUrl}/missions","valuePath":"id","labelPath":"name"}}]"""))
        val c = field(ctx, field("listBox", """{"ref":"missions"}"""), state = """{"f":["7"]}""")
        settle(c) { all(c).filterIsInstance<JBList<*>>().any { it.model.size == 2 } }
        val list = all(c).filterIsInstance<JBList<*>>().single()
        assertEquals("Apollo 11", list.model.getElementAt(0))
        assertEquals(listOf(0), list.selectedIndices.toList())
    }

    fun testAProxiedSourceIsFetchedThroughTheServer() {
        server.answer = """{"fragments":[],"messages":[],"commands":[],"appData":{"_restfetch":$missions}}"""
        val ctx = context()
        val c = field(ctx, field("multiSelect", """{"url":"https://api.example.test/missions","valuePath":"id","labelPath":"name","proxy":true}"""))
        settle(c) { checkboxes(c).size == 2 }
        assertTrue("__restfetch__" in server.actionIds())
        assertEquals("options", server.requests.first { it.path("actionId").asText() == "__restfetch__" }
            .path("parameters").path("_sourceKind").asText())
    }

    fun testWhichFieldsAreMultiValued() {
        assertTrue(sourcedMultiValue("multiSelect", "array"))
        assertTrue(sourcedMultiValue("listBox", "string"))
        assertTrue(sourcedMultiValue("combobox", "array"))
        assertFalse(sourcedMultiValue("combobox", "string"))
        assertFalse(sourcedMultiValue("select", "string"))
    }

    fun testOptionsAreReadThroughTheSourcePaths() {
        val opts = sourcedOptionsOf(json("""{"data":$missions}"""), json("""{"itemsPath":"data","valuePath":"id","labelPath":"name"}"""))
        assertEquals(listOf("7" to "Apollo 11", "25" to "Artemis III"), opts.map { it.path("value").asText() to it.path("label").asText() })
    }
}
