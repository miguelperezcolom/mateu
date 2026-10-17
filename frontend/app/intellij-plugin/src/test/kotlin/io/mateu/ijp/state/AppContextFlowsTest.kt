package io.mateu.ijp.state

import com.intellij.testFramework.PlatformTestUtil
import io.mateu.ijp.ui.RenderTestCase
import java.util.concurrent.CopyOnWriteArrayList
import javax.swing.JLabel

/**
 * More of the view context's flows, driven through its entry points against the stub server: a
 * REST action run client-side, the commands an increment carries (refresh, navigate, close an
 * overlay, a header value), loading a server-side component by itself, an embedded island, and
 * what a navigation that brings no content leaves on screen.
 */
class AppContextFlowsTest : RenderTestCase() {

    private val notices = CopyOnWriteArrayList<Pair<String, String>>()

    private fun flowContext(): AppContext {
        val ctx = context()
        ctx.session.notifier = { _, text, variant, _ -> notices.add(text to variant) }
        ctx.silentErrors = false // what the user is told goes to the notifier, never a dialog
        return ctx
    }

    private fun waitUntil(what: String, condition: () -> Boolean) {
        val until = System.currentTimeMillis() + 5_000
        while (!condition()) {
            PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
            if (System.currentTimeMillis() > until) fail("timed out waiting for $what")
            Thread.sleep(10)
        }
        PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()
    }

    private fun capture(ctx: AppContext, actions: String) =
        ctx.captureComponentContext(json("""{"type":"ServerSide","id":"c1","serverSideType":"x.Profile","actions":$actions}"""), "x.Profile")

    fun testARestActionFetchesClientSideMergesTheResultAndSaysSo() {
        val ctx = flowContext()
        server.json["/api/profile"] = """{"data":{"name":"Ada","city":"London"}}"""
        ctx.currentComponentState["user"] = "u1"
        capture(ctx, """[{"id":"loadProfile","restAction":{"source":{"url":"${server.baseUrl}/api/profile?u=${'$'}{state.user}",
            "headers":{"X-User":"${'$'}{state.user}"}},"resultPath":"data","successMessage":"Loaded ${'$'}{state.user}"}}]""")
        ctx.runAction("loadProfile", null)
        waitUntil("the merged state") { ctx.currentComponentState["name"] != null }
        assertEquals("Ada", (ctx.currentComponentState["name"] as com.fasterxml.jackson.databind.JsonNode).asText())
        waitUntil("the notice") { notices.isNotEmpty() }
        assertEquals("Loaded u1" to "success", notices.single())
        assertTrue("no Mateu round trip", server.requests.isEmpty())
    }

    fun testARestActionNamingItsSourceByRefFetchesTheResolvedEndpoint() {
        val ctx = flowContext()
        server.json["/api/profile"] = """{"data":{"name":"Grace"}}"""
        ctx.session.sources.registerRestSources(json("""[{"name":"profile","source":{"url":"${server.baseUrl}/api/profile"}}]"""))
        capture(ctx, """[{"id":"loadProfile","restAction":{"source":{"ref":"profile"},"resultPath":"data"}}]""")
        ctx.runAction("loadProfile", null)
        waitUntil("the merged state") { ctx.currentComponentState["name"] != null || notices.isNotEmpty() }
        assertEquals("Grace", (ctx.currentComponentState["name"] as com.fasterxml.jackson.databind.JsonNode?)?.asText())
        assertTrue("no Mateu round trip", server.requests.isEmpty())
    }

    fun testAFailedRestActionSaysTheRequestFailed() {
        val ctx = flowContext()
        capture(ctx, """[{"id":"ping","restAction":{"source":{"url":"http://127.0.0.1:9/nothing","method":"post","body":"{}"}}}]""")
        ctx.runAction("ping", null)
        waitUntil("the failure notice") { notices.isNotEmpty() }
        assertEquals("Request failed" to "error", notices.single())
    }

    fun testARefreshCommandSearchesFromAFreshPageAndAHeaderValueChangesEverywhere() {
        val ctx = flowContext()
        ctx.session.seedHeaderValues(HeaderValues.of(json("""{"headerValues":[{"id":"date","label":"Date","value":"1"}]}""")))
        ctx.applyIncrement(json("""{"fragments":[],"messages":[],"commands":[
            {"type":"RunAction","data":{"actionId":"search"}},{"type":"UpdateHeaderValue","data":{"id":"date","value":"2"}}]}"""))
        awaitRequests(1)
        assertEquals("search", server.actionIds().single())
        val state = server.requests.single().path("componentState")
        assertEquals(0, state.path("page").asInt())
        assertEquals(10, state.path("size").asInt())
        assertEquals("", state.path("searchText").asText())
        waitUntil("the header value") { ctx.session.headerValues["date"]?.value == "2" }
    }

    fun testNavigateToOpensADetailFromAHostedListingAndAViewThroughTheHost() {
        val ctx = flowContext()
        val details = ArrayList<String>()
        ctx.detailOpener = { _, route, _, _ -> details.add(route) }
        ctx.applyIncrement(json("""{"commands":[{"type":"NavigateTo","data":"/orders/7"}]}"""))
        waitUntil("the detail") { details.isNotEmpty() }
        assertEquals(listOf("/orders/7"), details)

        val hosted = flowContext()
        hosted.nativeToolbarHost = true
        val views = ArrayList<String?>()
        hosted.session.openViewHandler = { _, route, _, _, _ -> views.add(route) }
        hosted.applyIncrement(json("""{"commands":[{"type":"NavigateTo","data":{"href":"/orders"}}]}"""))
        waitUntil("the view") { views.isNotEmpty() }
        assertEquals(listOf<String?>("/orders"), views)
        assertTrue(server.requests.isEmpty())
    }

    fun testCloseModalClosesTheTopOverlayAndEmitsItsEvent() {
        val ctx = flowContext()
        val closed = ArrayList<String>()
        ctx.session.pushOverlay { closed.add("first") }
        ctx.session.pushOverlay { closed.add("second") }
        ctx.applyIncrement(json("""{"commands":[{"type":"CloseModal","data":null}]}"""))
        waitUntil("the close") { closed.isNotEmpty() }
        assertEquals("only the topmost overlay", listOf("second"), closed)
    }

    fun testAServerSideComponentWithoutChildrenLoadsItselfAndShowsItsMessages() {
        val ctx = flowContext()
        server.answer = """{"fragments":[{"component":{"type":"ClientSide","metadata":{"type":"Text","text":"Hello from the server"}},
            "state":{},"data":{}}],"messages":[{"text":"Welcome","variant":"success"}],"commands":[]}"""
        val pane = ctx.loadServerSideComponent(json("""{"type":"ServerSide","id":"w1","route":"/welcome","serverSideType":"x.Welcome"}"""))
        waitUntil("the content") { texts(pane).contains("Hello from the server") }
        assertEquals("/welcome", server.requests.single().path("route").asText())
        assertEquals("x.Welcome", server.requests.single().path("serverSideType").asText())
        waitUntil("the message") { notices.isNotEmpty() }
        assertEquals("Welcome" to "success", notices.single())
    }

    fun testAServerSideComponentThatFailsToLoadSaysSoAndKeepsTheContext() {
        val dead = AppContext(AppSession("http://127.0.0.1:9"))
        dead.silentErrors = true
        dead.contentPane = dead.newSlot()
        dead.currentRoute = "/before"
        val pane = dead.loadServerSideComponent(json("""{"type":"ServerSide","id":"w1","route":"/welcome","serverSideType":"x.Welcome"}"""))
        waitUntil("the failure") { texts(pane).any { it.startsWith("Load failed") } }
        assertEquals("/before", dead.currentRoute)
    }

    fun testAnEmbeddedIslandLoadsItsHomeInItsOwnContext() {
        val ctx = flowContext()
        ctx.currentRoute = "/checkin/3"
        ctx.loadServerSideComponent(json("""{"type":"ServerSide","id":"island","route":"/cardex?_embeddedMediator=1",
            "serverSideType":"x.CardexView","children":[{"type":"ClientSide","metadata":{"type":"App",
            "homeRoute":"/cardex/view","homeServerSideType":"x.CardexView"}}]}"""))
        awaitRequests(1)
        assertEquals("/cardex/view", server.requests.single().path("route").asText())
        assertEquals("the host keeps its own route", "/checkin/3", ctx.currentRoute)
    }

    fun testANavigationThatBringsNoContentDropsTheSpinner() {
        val ctx = flowContext()
        ctx.navigate("/empty", "", "x.Empty", "")
        awaitRequests(1)
        waitUntil("the spinner to go") { ctx.contentPane!!.componentCount == 0 }
        assertEquals("/empty", ctx.currentRoute)
    }

    fun testAFailedNavigationIsReported() {
        val dead = AppContext(AppSession("http://127.0.0.1:9"))
        val shown = CopyOnWriteArrayList<String>()
        dead.session.notifier = { _, text, _, _ -> shown.add(text) }
        dead.contentPane = dead.newSlot()
        dead.navigate("/x", "", null, "")
        waitUntil("the error") { shown.isNotEmpty() }
        assertTrue(shown.single(), shown.single().startsWith("Navigation failed"))
        waitUntil("the spinner to go") { dead.contentPane!!.componentCount == 0 }
        assertTrue(all(dead.contentPane!!).filterIsInstance<JLabel>().none { it.text.orEmpty().contains("Loading") })
    }
}
