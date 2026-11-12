package io.mateu.ijp.ui

import com.intellij.testFramework.PlatformTestUtil
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.components.JBList
import javax.swing.JComponent

/**
 * A multi-value field (multiSelect, checkbox, listBox, a multi combobox) fed by a REST
 * `optionsSource` draws the source's options — before, only the single-value combo read a source
 * and the others showed nothing. The source answers from its `sample` (sample mode), so no server.
 */
class SourcedMultiOptionsRenderTest : RenderTestCase() {

    private val source = """{"url":"http://127.0.0.1:9/tags","itemsPath":"items","valuePath":"id","labelPath":"name",
        "sample":{"items":[{"id":"a","name":"Alpha"},{"id":"b","name":"Beta"},{"id":"c","name":"Gamma"}]}}"""

    private fun field(metadata: String, state: String): Pair<io.mateu.ijp.state.AppContext, JComponent> {
        val ctx = context()
        ctx.session.sources.setSampleMode(true)
        return ctx to renderFormField(ctx, json(metadata), json(state), json("{}"))
    }

    /** Waits for the off-EDT fetch and the EDT swap that follows it. */
    private fun settle(c: JComponent, until: (JComponent) -> Boolean) {
        val deadline = System.currentTimeMillis() + 5_000
        while (!until(c) && System.currentTimeMillis() < deadline) {
            PlatformTestUtil.dispatchAllEventsInIdeEventQueue()
            Thread.sleep(20)
        }
        PlatformTestUtil.dispatchAllEventsInIdeEventQueue()
    }

    private fun checkboxes(c: JComponent) = all(c).filterIsInstance<JBCheckBox>().toList()

    fun testAMultiSelectListsItsSourceAndChecksTheCurrentIds() {
        val (ctx, rendered) = field(
            """{"fieldId":"tags","label":"Tags","dataType":"array","stereotype":"multiSelect","optionsSource":$source}""",
            """{"tags":["b"]}""")
        settle(rendered) { checkboxes(it).size == 3 }
        val boxes = checkboxes(rendered)
        assertEquals(listOf("Alpha", "Beta", "Gamma"), boxes.map { it.text })
        assertEquals(listOf(false, true, false), boxes.map { it.isSelected })
        boxes[0].doClick()
        @Suppress("UNCHECKED_CAST")
        assertEquals(setOf("a", "b"), (ctx.currentComponentState["tags"] as List<Any?>).map { it.toString() }.toSet())
    }

    fun testAMultiComboboxIsCheckboxesOverItsSource() {
        val (_, rendered) = field(
            """{"fieldId":"tags","label":"Tags","dataType":"array","stereotype":"combobox","optionsSource":$source}""",
            """{"tags":[]}""")
        settle(rendered) { checkboxes(it).size == 3 }
        assertEquals(listOf("Alpha", "Beta", "Gamma"), checkboxes(rendered).map { it.text })
    }

    fun testAListBoxListsItsSourceAndSelectsTheCurrentIds() {
        val (_, rendered) = field(
            """{"fieldId":"tags","label":"Tags","dataType":"array","stereotype":"listBox","optionsSource":$source}""",
            """{"tags":["a","c"]}""")
        settle(rendered) { all(it).any { c -> c is JBList<*> } }
        val list = all(rendered).filterIsInstance<JBList<*>>().single()
        assertEquals(3, list.model.size)
        assertEquals("Alpha", list.model.getElementAt(0))
        assertEquals(listOf(0, 2), list.selectedIndices.toList())
        assertEquals("Tags", list.accessibleContext.accessibleName)
    }

    fun testASingleValueFieldStillGetsTheCombo() {
        assertFalse(readsSourcedOptionsAsMany("", "string"))
        assertFalse(readsSourcedOptionsAsMany("radio", "string"))
        assertTrue(readsSourcedOptionsAsMany("checkbox", "string"))
        assertTrue(readsSourcedOptionsAsMany("combobox", "array"))
    }

    fun testOptionPairsFollowTheSourcePaths() {
        val pairs = restOptionPairs(json("""{"data":{"rows":[{"code":1,"title":"One"},{"code":2}]}}"""),
            json("""{"itemsPath":"data.rows","valuePath":"code","labelPath":"title"}"""))
        assertEquals(listOf("1" to "One", "2" to "2"), pairs)
    }
}
