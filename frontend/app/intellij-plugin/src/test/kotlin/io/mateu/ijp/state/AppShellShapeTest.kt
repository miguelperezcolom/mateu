package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.mcp.LiveUi
import junit.framework.TestCase

/**
 * A crud mounted ALONE (`@UI("/customers") class Customers extends AutoCrud<Customer>`) answers its
 * root with a MEDIATOR App and no menu (captured from a running app: increments/autocrud-alone-*.json).
 * That is the screen, not a navigator: the desktop app opens it in an editor tab, and the MCP
 * server reads it as the screen in front.
 */
class AppShellShapeTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun increment(name: String): JsonNode =
        mapper.readTree(javaClass.getResource("/increments/$name.json")!!)

    private fun component(name: String): JsonNode = increment(name).path("fragments").path(0).path("component")

    fun testACrudMediatorIsNoAppShell() {
        val root = increment("autocrud-alone-root")
        assertEquals("MEDIATOR", root.path("fragments").path(0).path("component").path("children").path(0).path("metadata").path("variant").asText())
        assertFalse(ScreenShapes.hasAppShell(root))
    }

    fun testAnAppWithAMenuIsAnAppShell() {
        val shell = mapper.readTree(
            """{"fragments":[{"component":{"type":"ServerSide","children":[{"type":"ClientSide",
               "metadata":{"type":"App","variant":"HAMBURGER_MENU","menu":[{"label":"Artworks","route":"/artworks"}]}}]}}]}""",
        )
        assertTrue(ScreenShapes.hasAppShell(shell))
        // an App with no variant is a shell too (only the crud's mediator is not)
        assertTrue(ScreenShapes.hasAppShell(mapper.readTree("""{"metadata":{"type":"App"}}""")))
    }

    fun testTheRootShowsAScreenOnlyOnceTheListingLanded() {
        // the bare mediator: its inner route is still coming
        assertFalse(LiveUi.rootShowsAScreen(component("autocrud-alone-root")))
        // the listing it loads next, in the same context
        assertTrue(LiveUi.rootShowsAScreen(component("autocrud-alone-listing")))
        // a navigator (an app shell's menu) is never the screen
        assertFalse(LiveUi.rootShowsAScreen(mapper.readTree("""{"type":"ClientSide","metadata":{"type":"App","menu":[]}}""")))
        assertFalse(LiveUi.rootShowsAScreen(null))
    }
}
