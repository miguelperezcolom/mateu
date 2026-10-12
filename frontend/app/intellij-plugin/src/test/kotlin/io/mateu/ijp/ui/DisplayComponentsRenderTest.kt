package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import java.awt.event.KeyEvent
import javax.swing.AbstractButton
import javax.swing.JComponent
import javax.swing.JLabel

/**
 * The display components that carry an action (a tile, a card, a row): what they show, and that
 * their action is reachable — by click AND by keyboard (Enter/Space on a focusable, named target),
 * reaching the server with the item it belongs to.
 */
class DisplayComponentsRenderTest : BasePlatformTestCase() {

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

    private fun texts(c: JComponent) = all(c).filterIsInstance<JLabel>().map { it.text.orEmpty() }.toList()

    /** The keyboard-activatable targets (focusable with a key listener, not a real button). */
    private fun targets(c: JComponent) = all(c).filterIsInstance<JComponent>()
        .filter { it !is AbstractButton && it.isFocusable && it.keyListeners.isNotEmpty() }.toList()

    private fun pressEnter(target: JComponent) = target.keyListeners.forEach {
        it.keyPressed(KeyEvent(target, KeyEvent.KEY_PRESSED, 0, 0, KeyEvent.VK_ENTER, KeyEvent.CHAR_UNDEFINED))
    }

    private fun awaitRequests(n: Int) {
        val until = System.currentTimeMillis() + 5_000
        while (server.requests.size < n) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("expected $n requests, got ${server.actionIds()}")
            Thread.sleep(10)
        }
    }

    fun testAMetricTileDrillsInFromTheKeyboard() {
        val ctx = context()
        val tile = render(ctx, """{"type":"MetricCard","title":"Revenue","value":"12.4k","trendLabel":"+8%","trend":"up","actionId":"openRevenue"}""")
        assertTrue(texts(tile).containsAll(listOf("Revenue", "12.4k", "+8%")))
        val target = targets(tile).single()
        assertTrue("named for a screen reader", target.accessibleContext.accessibleName.contains("Revenue"))
        pressEnter(target)
        awaitRequests(1)
        assertEquals("openRevenue", server.actionIds().single())
    }

    fun testAMetricTileWithoutAnActionIsNotAStop() {
        val tile = render(context(), """{"type":"MetricCard","title":"Revenue","value":"12.4k"}""")
        assertTrue(targets(tile).isEmpty())
    }

    fun testStatusListRowsActOnTheirItem() {
        val ctx = context()
        val list = render(ctx, """{"type":"StatusList","rowActionId":"openGuest","items":[
            {"id":"g1","title":"Ada","description":"Room 12","status":"In house","statusColor":"success"},
            {"id":"g2","title":"Grace","status":"Due"}]}""")
        assertTrue(texts(list).containsAll(listOf("Ada", "Room 12", "Grace")))
        val rows = targets(list)
        assertEquals(listOf("Ada", "Grace"), rows.map { it.accessibleContext.accessibleName })
        pressEnter(rows[1])
        awaitRequests(1)
        assertEquals("g2", server.requests.single().path("parameters").path("_item").asText())
    }

    fun testTaskQueueCardsSelectAndAct() {
        val ctx = context()
        val queue = render(ctx, """{"type":"TaskQueue","actionId":"pick","groups":[
            {"label":"Today (2)","items":[{"id":"t1","title":"Call ACME","caption":"9:00"},{"id":"t2","title":"Send invoice"}]}]}""")
        assertTrue(texts(queue).containsAll(listOf("Call ACME", "Send invoice")))
        val cards = targets(queue)
        assertEquals(2, cards.size)
        pressEnter(cards[0])
        awaitRequests(1)
        assertEquals("t1", server.requests.single().path("parameters").path("_item").asText())
    }

    fun testKanbanTimelineChecklistFileListOrgChartAndFeatureGridActions() {
        val ctx = context()
        val fixtures = listOf(
            """{"type":"Kanban","columns":[{"title":"Doing","cards":[{"title":"Card A","actionId":"a1"}]}]}""" to "a1",
            """{"type":"Timeline","items":[{"title":"Created","timestamp":"9:00","actionId":"a2"}]}""" to "a2",
            """{"type":"Checklist","title":"Setup","items":[{"label":"Install","done":true},{"label":"Configure","actionId":"a3"}]}""" to "a3",
            """{"type":"FileList","files":[{"name":"report.pdf","size":"2 MB","actionId":"a4"}]}""" to "a4",
            """{"type":"OrgChart","root":{"title":"CEO","actionId":"a5"}}""" to "a5",
            """{"type":"FeatureGrid","features":[{"title":"Fast","description":"Very","actionId":"a6"}]}""" to "a6",
            """{"type":"Stat","label":"Users","value":"120","actionId":"a7"}""" to "a7",
        )
        var expected = 0
        for ((metadata, actionId) in fixtures) {
            val view = render(ctx, metadata)
            val target = targets(view).singleOrNull()
            assertNotNull("no keyboard target in $metadata", target)
            assertFalse("unnamed target in $metadata", target!!.accessibleContext.accessibleName.isNullOrBlank())
            pressEnter(target)
            expected++
            awaitRequests(expected)
            assertEquals(actionId, server.actionIds().last())
        }
        // the checklist counts what is done
        assertTrue(texts(render(ctx, fixtures[2].first)).any { it.contains("(1 / 2)") })
    }

    fun testEmptyStateCtaAndNoticeAction() {
        val ctx = context()
        val empty = render(ctx, """{"type":"EmptyState","icon":"📭","title":"No orders","description":"Create one","actionId":"newOrder","actionLabel":"New order"}""")
        assertTrue(texts(empty).containsAll(listOf("No orders", "Create one")))
        // a web icon token is not a glyph: it must not print as text
        val tokenIcon = render(ctx, """{"type":"EmptyState","icon":"vaadin:list-select","title":"Select an item"}""")
        assertFalse(texts(tokenIcon).contains("vaadin:list-select"))
        all(empty).filterIsInstance<AbstractButton>().single { it.text == "New order" }.doClick()
        awaitRequests(1)
        val notice = render(ctx, """{"type":"Notice","theme":"warning","text":"2 complaints pending","actionLabel":"Review","actionId":"review"}""")
        assertTrue(texts(notice).contains("2 complaints pending"))
        all(notice).filterIsInstance<AbstractButton>().single { it.text == "Review" }.doClick()
        awaitRequests(2)
        assertEquals(listOf("newOrder", "review"), server.actionIds())
    }

    fun testEntityHeaderAndMeter() {
        val header = render(context(), """{"type":"EntityHeader","title":"ACME Corp","subtitle":"Customer since 2019",
            "badges":[{"label":"VIP","color":"success"}],"facts":[{"label":"Country","value":"Spain"}],"metricValue":"1.2M","metricLabel":"Revenue"}""")
        assertTrue(texts(header).containsAll(listOf("ACME Corp", "Customer since 2019", "VIP", "1.2M")))
        val meter = render(context(), """{"type":"Meter","label":"Occupancy","value":75,"max":100}""")
        assertTrue(texts(meter).any { it.contains("Occupancy") })
        assertTrue("the caption defaults to the percentage", texts(meter).any { it.contains("75%") })
    }
}
