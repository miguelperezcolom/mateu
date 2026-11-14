package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.io.File

/**
 * The live side inside the platform: a listing rendered by the real pipeline (AppContext +
 * CrudRenderer) remembers the page it painted, which the screen summary then reads; and the tools
 * answer sensibly with no UI open.
 */
class LiveUiPlatformTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()

    private fun case(name: String): JsonNode {
        val dir = generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "conformance/cases") }.first { it.isDirectory }
        return mapper.readTree(File(dir, "$name/expected.json"))
    }

    private fun rendered(vararg increments: JsonNode): AppContext {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        ctx.titleConsumer = {}
        for (i in increments) {
            ctx.applyIncrement(i)
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        }
        return ctx
    }

    fun testARenderedListingIsSummarisedWithTheRowsItPainted() {
        val ctx = rendered(case("crud"), case("crud-search"))
        assertTrue("no page remembered: ${ctx.listingPages.keys}", ctx.listingPages.isNotEmpty())
        val summary = ScreenSummary.build(
            ScreenSummary.Input(
                route = "/conformance/crud",
                view = ScreenSummary.View(ctx.lastContent, HashMap(ctx.currentComponentState), listings = HashMap(ctx.listingPages)),
            ),
            mapper,
        )
        val listing = summary.path("listings").path(0)
        assertEquals("Milk frother", listing.path("rows").path(0).path("name").asText())
        assertEquals(3, listing.path("totalElements").asInt())
    }

    /**
     * A crud mounted alone (no app shell): its root answers a MEDIATOR, then the listing lands in
     * the SAME context — the one the MCP server reads when no other view is in front.
     */
    fun testACrudMountedAloneIsTheScreenOfTheRootContext() {
        fun increment(name: String) = mapper.readTree(javaClass.getResource("/increments/$name.json")!!)
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.appShell = true
        ctx.contentPane = ctx.newSlot()
        ctx.titleConsumer = {}
        ctx.applyIncrement(increment("autocrud-alone-root"))
        assertFalse(LiveUi.rootShowsAScreen(ctx.lastContent))
        ctx.applyIncrement(increment("autocrud-alone-listing"))
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
        assertTrue(LiveUi.rootShowsAScreen(ctx.lastContent))
        val summary = ScreenSummary.build(
            ScreenSummary.Input(view = ScreenSummary.View(ctx.lastContent, HashMap(ctx.currentComponentState))),
            mapper,
        )
        val listing = summary.path("listings").path(0)
        assertTrue(summary.toString(), listing.isObject)
        assertEquals(listOf("name", "email", "country", "vip"), listing.path("columns").map { it.path("id").asText() })
    }

    fun testAMessageShownIsRemembered() {
        val ctx = rendered(case("action-effects"))
        val texts = ctx.session.recentMessages.map { it.text }
        assertTrue(texts.toString(), texts.containsAll(listOf("Saved", "Could not notify the warehouse")))
    }

    fun testWithNoUiOpenTheToolsSaySo() {
        val live = LiveUi(mapper)
        val e = runCatching { live.callTool(McpTools.GET_SCREEN, mapper.createObjectNode()) }.exceptionOrNull()
        assertTrue("$e", e is McpToolError)
        assertTrue(e!!.message!!, e.message!!.startsWith("No UI is open."))
        val action = runCatching {
            live.callTool(McpTools.RUN_ACTION, mapper.createObjectNode().put("actionId", "save"))
        }.exceptionOrNull()
        assertTrue("$action", action is McpToolError)
    }

    fun testTheAuthoringToolsWorkOffline() {
        val live = LiveUi(mapper)
        assertTrue(live.callTool(McpTools.GET_GUIDE, mapper.createObjectNode()).path("guide").asText().isNotBlank())
        assertTrue(live.callTool(McpTools.LIST_COMPONENTS, mapper.createObjectNode().put("query", "Button")).path("count").asInt() > 0)
        assertEquals("Text", live.callTool(McpTools.GET_COMPONENT_SCHEMA, mapper.createObjectNode().put("type", "Text")).path("type").asText())
        assertTrue(live.resources.map { it.uri }.containsAll(listOf(LiveUi.UIS_URI, LiveUi.SCREEN_URI, LiveUi.MENU_URI, "mateu://guide")))
        assertNotNull(live.readResource("mateu://catalog"))
        val uis = mapper.readTree(live.readResource(LiveUi.UIS_URI))
        assertEquals("fixed", uis.path("variant").asText())
    }

    fun testAShowScreenNeedsAUi() {
        val e = runCatching {
            LiveUi(mapper).callTool(McpTools.SHOW_SCREEN, mapper.createObjectNode().put("yaml", "type: Form\ntitle: Hi"))
        }.exceptionOrNull()
        assertTrue("$e", e is McpToolError)
    }
}
