package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.StubMateuServer
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import javax.swing.AbstractButton
import javax.swing.JComponent

/**
 * A MicroFrontend the HOST resolved (`resolve = SERVER`) arrives with the remote's answer to its
 * load: the island paints it without asking anybody, and what is pressed inside it still goes to
 * the remote — never to the host.
 */
class MicroFrontendResolvedRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)
    private lateinit var remote: StubMateuServer

    override fun setUp() {
        super.setUp()
        remote = StubMateuServer()
    }

    override fun tearDown() {
        try {
            remote.close()
        } finally {
            super.tearDown()
        }
    }

    /** The host: another backend, which nobody should talk to from the island. */
    private fun host(): AppContext {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        return ctx
    }

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private fun settle() {
        repeat(20) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            Thread.sleep(10)
        }
    }

    private val answer = """
        {"fragments":[{"targetComponentId":"mfe_x","action":"Replace","state":{},"data":{},
          "component":{"type":"ServerSide","id":"w","serverSideType":"remote.Widget","route":"/widget",
            "actions":[{"id":"like"}],
            "children":[{"type":"ClientSide","id":"b","children":[],
              "metadata":{"type":"Button","label":"Like","actionId":"like"}}]}}]}
    """.trimIndent()

    private fun render(ctx: AppContext, resolved: String?): JComponent {
        val metadata = """{"type":"MicroFrontend","baseUrl":"${remote.baseUrl}","route":"/widget",
            "consumedRoute":"","serverSideType":"remote.Widget"${if (resolved != null) ",\"resolved\":$resolved" else ""}}"""
        return ComponentRenderer(ctx).render(json("""{"type":"ClientSide","metadata":$metadata}"""), json("{}"), json("{}"))
    }

    fun testAResolvedMicroFrontendIsPaintedWithoutAskingAndItsActionsGoToTheRemote() {
        val island = render(host(), answer)
        settle()
        assertTrue("no request for the first paint", remote.requests.isEmpty())
        val like = all(island).filterIsInstance<AbstractButton>().single { it.text == "Like" }
        like.doClick()
        val until = System.currentTimeMillis() + 5_000
        while (remote.requests.isEmpty() && System.currentTimeMillis() < until) settle()
        assertEquals(listOf("like"), remote.actionIds())
        assertEquals("remote.Widget", remote.requests.single().path("serverSideType").asText())
    }

    /** The island's panel inside a page body, the way a real render leaves it. */
    private fun renderedIn(ctx: AppContext): javax.swing.JPanel {
        val page = javax.swing.JPanel()
        page.add(render(ctx, answer))
        settle()
        return page
    }

    fun testAnIslandEndsWithThePageItWasRenderedIn() {
        val ctx = host()
        val page = renderedIn(ctx)
        val sessions = ctx.islandSessions
        assertEquals(1, sessions.size)
        assertNotSame(ctx.session, sessions.single())
        assertFalse(sessions.single().executor.isShutdown)

        ctx.retireIslandsUnder(page)

        assertTrue(ctx.islandSessions.isEmpty())
        assertTrue("its own session stops with it", sessions.single().executor.isShutdown)
        assertFalse("the host goes on", ctx.session.executor.isShutdown)
    }

    fun testAnIslandOutsideWhatIsReplacedGoesOn() {
        val ctx = host()
        renderedIn(ctx)
        ctx.retireIslandsUnder(javax.swing.JPanel())
        assertEquals(1, ctx.islandSessions.size)
        assertFalse(ctx.islandSessions.single().executor.isShutdown)
    }

    fun testEndingTheSessionEndsTheIslandsOfEveryView() {
        val ctx = host()
        renderedIn(ctx)
        val island = ctx.islandSessions.single()
        ctx.session.dispose()
        assertTrue(island.executor.isShutdown)
    }

    fun testADisposedIslandDoesNotBringItsPollingBack() {
        val ctx = host()
        val island = AppContext(AppSession("http://127.0.0.1:9"))
        island.silentErrors = true
        island.contentPane = island.newSlot()
        ctx.adoptIsland(island, island.contentPane!!)
        island.dispose()
        island.applyIncrement(json(answer)) // the answer that was in flight
        settle()
        assertNull(island.lastContent)
    }

    fun testAnUnresolvedMicroFrontendAsksItsRemoteAsAlways() {
        render(host(), null)
        val until = System.currentTimeMillis() + 5_000
        while (remote.requests.isEmpty() && System.currentTimeMillis() < until) settle()
        assertEquals("/widget", remote.requests.single().path("route").asText())
    }
}
