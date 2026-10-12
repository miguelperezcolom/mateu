package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.ui.ComboBox
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.ui.components.ActionLink
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import java.awt.Container
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.JSeparator

/**
 * The app shell as the navigator draws it: what it publishes to the IDE (menu, title, home route,
 * access keys), the menu tree (groups, separators, leaves that open views, rule leaves that run a
 * flow) and the @AppContext selectors that fix a value for every request.
 */
class AppShellRenderTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    private val app = """{"type":"App","title":"Back office","homeRoute":"/orders","homeConsumedRoute":"",
        "homeServerSideType":"x.Orders","rootRoute":"/app","accessKeys":true,
        "actions":[{"id":"newOrder","commands":[{"type":"NavigateTo","data":"orders/new"}]}],
        "menu":[
          {"label":"Sales","submenus":[
            {"label":"Orders","route":"/orders","consumedRoute":"","serverSideType":"x.Orders"},
            {"label":"Customers","route":"/customers"}
          ]},
          {"separator":true},
          {"label":"Settings","route":"/settings"}
        ],
        "contextSelectors":[{"fieldName":"hotel","label":"Hotel","options":[{"value":"h1","label":"Palma"},{"value":"h2","label":"Ibiza"}]}]
    }"""

    private fun render(ctx: AppContext, metadata: String = app): JComponent =
        ComponentRenderer(ctx).render(json("""{"type":"ClientSide","metadata":$metadata}"""), json("{}"), json("{}"))

    private fun context(shell: Boolean): AppContext {
        val ctx = AppContext(AppSession("http://127.0.0.1:9"))
        ctx.silentErrors = true
        ctx.contentPane = ctx.newSlot()
        ctx.appShell = shell
        ctx.titleConsumer = {}
        return ctx
    }

    fun testTheShellPublishesItsMenuAndHomeToTheIde() {
        val ctx = context(shell = true)
        var changed = 0
        ctx.session.onAppMenuChanged = { changed++ }
        render(ctx)
        val session = ctx.session
        assertEquals("Back office", session.appTitle)
        assertEquals(3, session.appMenu!!.size())
        assertEquals("/orders", session.homeRoute)
        assertEquals("x.Orders", session.homeServerSideType)
        assertTrue(session.accessKeys)
        assertEquals(1, changed)
        assertEquals("Back office", ctx.lastWindowTitle)
    }

    fun testAMediatorAppInsideAViewDoesNotTakeOverTheNavigator() {
        val ctx = context(shell = false)
        render(ctx)
        assertNull(ctx.session.appMenu)
        assertNull(ctx.session.homeRoute)
    }

    fun testTheMenuTreeGroupsAndLeaves() {
        val ctx = context(shell = true)
        val opened = ArrayList<List<String?>>()
        ctx.session.openViewHandler = { label, route, consumed, sst, actionId -> opened.add(listOf(label, route, consumed, sst, actionId)) }
        val view = render(ctx)
        val labels = all(view).filterIsInstance<JLabel>().map { it.text }.toList()
        assertTrue("a top-level group is a header: $labels", labels.contains("SALES"))
        assertTrue(all(view).any { it is JSeparator })
        val links = all(view).filterIsInstance<ActionLink>().associateBy { it.text }
        assertEquals(setOf("Orders", "Customers", "Settings"), links.keys)
        links.getValue("Orders").doClick()
        assertEquals(listOf("Orders", "/orders", "", "x.Orders", ""), opened.single())
    }

    fun testARuleLeafRunsTheShellFlowInsteadOfOpeningAView() {
        val ctx = context(shell = true)
        val opened = ArrayList<List<String?>>()
        ctx.session.openViewHandler = { label, route, consumed, sst, actionId -> opened.add(listOf(label, route, consumed, sst, actionId)) }
        render(ctx, app.replace(
            """{"label":"Settings","route":"/settings"}""",
            """{"label":"New order","rules":[{"filter":"true","action":"RunAction","actionId":"newOrder"}]}""",
        ))
        ctx.session.openMenuEntry(json("""{"label":"New order","rules":[{"filter":"true","action":"RunAction","actionId":"newOrder"}]}"""))
        // the shell declares the flow: it NAVIGATES (under the app root) instead of dispatching newOrder
        assertEquals(listOf<String?>("orders/new", "/app/orders/new", "/app", null, null), opened.single())
        // an id the shell does not declare goes to the server against the home route
        opened.clear()
        ctx.session.openMenuEntry(json("""{"label":"Export","rules":[{"action":"RunAction","actionId":"export"}]}"""))
        assertEquals(listOf<String?>("Export", "/orders", "", "x.Orders", "export"), opened.single())
    }

    fun testTheAppContextSelectorFixesAValueForEveryRequest() {
        val ctx = context(shell = true)
        ctx.session.appState["hotel"] = "h2"
        var reloads = 0
        ctx.session.onAppContextChanged = { reloads++ }
        val view = render(ctx)
        assertTrue(all(view).filterIsInstance<JLabel>().any { it.text == "Hotel" })
        val combo = all(view).filterIsInstance<ComboBox<*>>().single()
        assertEquals(3, combo.itemCount)
        assertEquals("the current value is shown", "h2" to "Ibiza", combo.selectedItem)
        combo.selectedIndex = 1
        assertEquals("h1", ctx.session.appState["hotel"])
        combo.selectedIndex = 0
        assertFalse("— clears it", ctx.session.appState.containsKey("hotel"))
        assertEquals(2, reloads)
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
    }
}
