package io.mateu.ijp.ui

import com.intellij.testFramework.PlatformTestUtil
import com.intellij.ui.components.JBList
import com.intellij.ui.components.JBTextField
import java.awt.event.KeyEvent
import javax.swing.JButton
import javax.swing.JComponent

/** The editable Workflow / FormEditor and the searchable @AppContext picker, rendered headless. */
class DefinitionEditorsRenderTest : RenderTestCase() {

    private fun lists(c: JComponent) = all(c).filterIsInstance<JBList<*>>().toList()

    fun testAddingAStepWritesTheWorkflowJsonUnderTheComponentId() {
        val ctx = context()
        val ui = ComponentRenderer(ctx).render(json("""{"type":"ClientSide","id":"definition","metadata":
            {"type":"Workflow","value":"{\"name\":\"Onboarding\",\"steps\":[{\"id\":\"a\",\"type\":\"ACTION\",\"name\":\"Start\"}]}"}}"""),
            json("{}"), json("{}"))
        assertEquals(1, lists(ui).single().model.size)
        button(ui, "Add step").doClick()
        val written = mapper.readTree(ctx.currentComponentState["definition"] as String)
        assertEquals(2, written.path("steps").size())
        assertEquals("a", written.path("steps")[0].path("id").asText())
        assertEquals("Onboarding", written.path("name").asText())
        // the new step is selected: its properties (and Delete) show
        button(ui, "Delete step").doClick()
        assertEquals(1, mapper.readTree(ctx.currentComponentState["definition"] as String).path("steps").size())
    }

    fun testTheFormEditorAddsAndDuplicatesFields() {
        val ctx = context()
        val ui = ComponentRenderer(ctx).render(json("""{"type":"ClientSide","id":"form","metadata":
            {"type":"FormEditor","value":"{\"name\":\"Customer\",\"fields\":[]}"}}"""), json("{}"), json("{}"))
        button(ui, "Add field").doClick()
        button(ui, "Duplicate").doClick()
        val fields = mapper.readTree(ctx.currentComponentState["form"] as String).path("fields")
        assertEquals(listOf("New Field", "New Field (copy)"), fields.map { it.path("label").asText() })
    }

    fun testAContextSelectorWithManyOptionsIsASearchablePicker() {
        val ctx = context()
        ctx.appShell = true
        ctx.titleConsumer = {}
        val options = (1..9).joinToString(",") { """{"value":"h$it","label":"Hotel $it"}""" }
        val ui = render(ctx, """{"type":"App","title":"PMS","rootRoute":"/app","serverSideType":"x.Pms","menu":[],
            "contextSelectors":[{"fieldName":"hotel","label":"Hotel","options":[$options]}]}""")
        assertTrue(all(ui).filterIsInstance<JButton>().any { it.accessibleContext.accessibleName == "Hotel" })
    }

    fun testTheSearchPanelFiltersAtOnceThenAsksTheServer() {
        val ctx = context()
        var picked: Pair<String, String>? = null
        val panel = appContextSearchPanel(ctx.session, "hotel", "Hotel",
            listOf("h1" to "Palma", "h2" to "Ibiza"), "/app", "x.Pms") { picked = it }
        val field = all(panel).filterIsInstance<JBTextField>().single()
        val list = lists(panel).single()
        assertEquals(2, list.model.size)
        field.text = "ib"
        assertEquals(1, list.model.size)
        val until = System.currentTimeMillis() + 5_000
        while (server.requests.none { it.path("actionId").asText() == "_appcontext-search-hotel" }) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("no _appcontext-search-hotel request: ${server.actionIds()}")
            Thread.sleep(20)
        }
        val rq = server.requests.first { it.path("actionId").asText() == "_appcontext-search-hotel" }
        assertEquals("ib", rq.path("parameters").path("searchText").asText())
        assertEquals("x.Pms", rq.path("serverSideType").asText())
        list.selectedIndex = 0
        list.keyListeners.forEach { it.keyPressed(KeyEvent(list, KeyEvent.KEY_PRESSED, 0, 0, KeyEvent.VK_ENTER, KeyEvent.CHAR_UNDEFINED)) }
        assertNotNull(picked)
    }
}
