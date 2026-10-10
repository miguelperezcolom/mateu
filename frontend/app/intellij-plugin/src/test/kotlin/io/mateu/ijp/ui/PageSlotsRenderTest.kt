package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.ui.ComboBox
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Color
import java.awt.Container
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JTable

/** Renders the pattern-gap wire pieces through the real dispatcher. */
class PageSlotsRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()

    private fun ctx() = AppContext(AppSession("http://127.0.0.1:9")).apply {
        silentErrors = true
        contentPane = newSlot()
    }

    private fun render(ctx: AppContext, json: String): JComponent {
        val empty = mapper.createObjectNode()
        return ComponentRenderer(ctx).render(mapper.readTree(json), empty, empty)
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun labels(c: Container) = all(c).filterIsInstance<JLabel>().map { it.text }.toList()

    fun testPageHeaderSwitcherIsANamedComboOnTheCurrentValue() {
        val page = render(
            ctx(),
            """
            {"type":"ClientSide","metadata":{"type":"Page","title":"Order 2","switcher":{
              "options":[{"value":"1","label":"Order 1"},{"value":"2","label":"Order 2"}],
              "value":"2","type":"object","label":"Order","searchable":true,"disabled":true,
              "actionId":"_switchRecord"}},"children":[]}
            """.trimIndent(),
        )
        val combo = all(page).filterIsInstance<ComboBox<*>>().single()
        assertEquals(1, combo.selectedIndex)
        assertFalse(combo.isEnabled)
        assertEquals("Order", combo.accessibleContext.accessibleName)
        assertTrue(labels(page).contains("Order 2"))
    }

    fun testHeroToneTintsTheBand() {
        val hero = render(ctx(), """{"type":"ClientSide","metadata":{"type":"HeroSection","title":"Hi","tone":"pine"},"children":[]}""")
        assertEquals(Color(0x2d5a3d), hero.background)
        val plain = render(ctx(), """{"type":"ClientSide","metadata":{"type":"HeroSection","title":"Hi","tone":"nope"},"children":[]}""")
        assertEquals(Color(0x2B, 0x3A, 0x55), plain.background)
    }

    fun testFoldoutShowsThePanelSummaryUnderItsTitle() {
        val foldout = render(
            ctx(),
            """
            {"type":"ClientSide","metadata":{"type":"FoldoutLayout","panels":[{"title":"Ops"}]},"children":[
              {"type":"ClientSide","slot":"overview","metadata":{"type":"Text","text":"Overview"}},
              {"type":"ClientSide","slot":"panel-0","metadata":{"type":"Text","text":"Panel body"}},
              {"type":"ClientSide","slot":"summary-0","metadata":{"type":"Text","text":"3 pending"}}]}
            """.trimIndent(),
        )
        val texts = labels(foldout)
        assertTrue(texts.containsAll(listOf("Overview", "Ops", "Panel body", "3 pending")))
        // the summary is not mistaken for the overview
        assertEquals(1, texts.count { it == "3 pending" })
    }

    fun testPreSearchStandsInForTheResultsUntilTheFirstAnswer() {
        val ctx = ctx()
        val crud = render(
            ctx,
            """
            {"type":"ClientSide","id":"bookings","metadata":{"type":"Crud","columns":[
               {"metadata":{"id":"name","label":"Name"}}],
             "preSearch":[{"type":"ClientSide","metadata":{"type":"Text","text":"Recent searches"}}]},"children":[]}
            """.trimIndent(),
        )
        fun showing(text: String) = all(crud).filterIsInstance<JLabel>().any { it.text == text }
        assertTrue(showing("Recent searches"))
        assertTrue(all(crud).filterIsInstance<JTable>().none())

        ctx.applyIncrement(
            mapper.readTree("""{"fragments":[{"targetComponentId":"","data":{"page":{"content":[],"totalElements":0}}}]}"""),
        )
        assertFalse(showing("Recent searches"))
        assertEquals(1, all(crud).filterIsInstance<JTable>().count())
        assertEquals(true, ctx.currentComponentState[PageSlots.preSearchDoneKey("bookings")])
    }
}
