package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.actionSystem.ex.ActionUtil
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.util.concurrent.CopyOnWriteArrayList
import javax.swing.KeyStroke

/**
 * The view context's per-screen decisions, pinned through its public entry points before they were
 * moved out of AppContext: which server-side type an action goes to (bubbling to the crud
 * orchestrator), the native host toolbar, a crud mediator's detail navigation, keyboard shortcut
 * parsing, validation conditions in the legacy `state['x']` spelling, and when the host is told the
 * view's first real content arrived.
 */
class AppContextScreenTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)

    private lateinit var server: HttpServer
    private val requests = CopyOnWriteArrayList<JsonNode>()
    private val notices = CopyOnWriteArrayList<Triple<String?, String, String>>()

    override fun setUp() {
        super.setUp()
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            requests.add(mapper.readTree(ex.requestBody.readAllBytes()))
            val bytes = """{"fragments":[],"messages":[],"commands":[]}""".toByteArray()
            ex.responseHeaders.add("Content-Type", "application/json")
            ex.sendResponseHeaders(200, bytes.size.toLong())
            ex.responseBody.use { it.write(bytes) }
        }
        server.start()
    }

    override fun tearDown() {
        try {
            server.stop(0)
        } finally {
            super.tearDown()
        }
    }

    private fun context(): AppContext {
        val session = AppSession("http://127.0.0.1:${server.address.port}")
        session.notifier = { title, text, variant, _ -> notices.add(Triple(title, text, variant)) }
        val ctx = AppContext(session)
        ctx.contentPane = ctx.newSlot()
        return ctx
    }

    private fun flush() = PlatformTestUtil.dispatchAllInvocationEventsInIdeEventQueue()

    private fun await(what: String, cond: () -> Boolean) {
        val until = System.currentTimeMillis() + 5_000
        while (!cond()) {
            flush()
            if (System.currentTimeMillis() > until) fail("timed out waiting for $what")
            Thread.sleep(10)
        }
        flush()
    }

    private fun sentTo(ctx: AppContext, actionId: String): String {
        val before = requests.size
        ctx.runAction(actionId, null)
        await("the $actionId request") { requests.size > before }
        return requests.last().path("serverSideType").asText()
    }

    fun testAnActionTheViewDoesNotOwnBubblesToTheCrudOrchestrator() {
        val ctx = context()
        // the orchestrator's load names its component route…
        ctx.captureComponentContext(json("""{"initialData":{"componentRoute":"/products"}}"""), "x.Products")
        // …then the inner detail view loads with its own type and actions
        ctx.captureComponentContext(json("""{"actions":[{"id":"own"},{"id":"up","bubble":true},{"id":"pre*"}]}"""), "x.Product")
        ctx.currentRoute = "/products/0130"
        ctx.currentServerSideType = "x.Product"
        assertEquals("x.Product", sentTo(ctx, "own"))
        assertEquals("x.Product", sentTo(ctx, "pre-x"))
        assertEquals("an unowned action bubbles", "x.Products", sentTo(ctx, "edit"))
        assertEquals("a bubble-flagged action bubbles", "x.Products", sentTo(ctx, "up"))
        // outside the orchestrator's route nothing bubbles to it
        ctx.currentRoute = "/elsewhere"
        assertEquals("x.Product", sentTo(ctx, "edit"))
    }

    fun testTheNativeHostToolbarClaimsButtonsOnlyWhenHosted() {
        val ctx = context()
        val buttons = listOf(
            json("""{"actionId":"save","label":"Save","buttonStyle":"primary","parameters":{"a":1}}"""),
            json("""{"id":"archive","disabled":true}"""),
            json("""{"actionId":"cancel-view","label":"Back"}"""),
            json("""{"label":"no id"}"""),
        )
        assertFalse(ctx.publishToolbar(buttons))
        assertTrue(ctx.viewActions.isEmpty())
        ctx.nativeToolbarHost = true
        var changes = 0
        ctx.onViewActionsChanged = { changes++ }
        assertTrue(ctx.publishToolbar(buttons))
        assertEquals(
            listOf(
                ToolbarSpec("save", "Save", disabled = false, primary = true, parameters = mapOf("a" to 1)),
                ToolbarSpec("archive", "archive", disabled = true, primary = false),
            ),
            ctx.viewActions,
        )
        // republishing the same view replaces, it does not pile up
        ctx.publishToolbar(buttons)
        assertEquals(2, ctx.viewActions.size)
        assertEquals(2, changes)
    }

    fun testACrudMediatorRouteOpensTheDetailThroughTheHost() {
        val ctx = context()
        ctx.currentConsumedRoute = "/products"
        ctx.currentServerSideType = "x.Product"
        val opened = CopyOnWriteArrayList<List<String>>()
        ctx.detailOpener = { label, route, consumed, sst -> opened.add(listOf(label, route, consumed, sst)) }
        ctx.applyIncrement(json("""{"fragments":[{"state":{"_route":"/0130","_componentRoute":"/products"}}]}"""))
        ctx.applyIncrement(json("""{"fragments":[{"state":{"_route":"/new","_componentRoute":""}}]}"""))
        ctx.applyIncrement(json("""{"fragments":[{"state":{"_route":"/0130/edit/","_componentRoute":"/products"}}]}"""))
        // once the orchestrator is known, its type resolves the crud sub-routes
        ctx.captureComponentContext(json("""{"initialData":{"_componentRoute":"/products"}}"""), "x.Products")
        ctx.applyIncrement(json("""{"fragments":[{"state":{"_route":"/7","_componentRoute":"/products"}}]}"""))
        await("the detail tabs") { opened.size == 4 }
        assertEquals(listOf("0130", "/products/0130", "/products", "x.Product"), opened[0])
        assertEquals(listOf("New", "/products/new", "/products", "x.Product"), opened[1])
        assertEquals("edit", opened[2][0])
        assertEquals(listOf("7", "/products/7", "/products", "x.Products"), opened[3])
    }

    fun testShortcutSpellingsBecomeKeyStrokes() {
        val ctx = context()
        ctx.captureComponentContext(
            json(
                """{"actions":[{"id":"a","shortcut":"Esc"},{"id":"b","shortcut":"control+space"},
                   {"id":"c","shortcut":"cmd+del"},{"id":"d","shortcut":"shift + tab"},{"id":"e","shortcut":"meta+escape"},
                   {"id":"f","shortcut":"alt+delete"},{"id":"g","shortcut":"ctrl+f2"},{"id":"h","shortcut":" + "}]}""",
            ),
            "x.Form",
        )
        val strokes = ActionUtil.getActions(ctx.contentPane!!).flatMap { a ->
            a.shortcutSet.shortcuts.mapNotNull { (it as? com.intellij.openapi.actionSystem.KeyboardShortcut)?.firstKeyStroke }
        }.toSet()
        assertEquals(
            setOf(
                KeyStroke.getKeyStroke("ESCAPE"),
                KeyStroke.getKeyStroke("ctrl SPACE"),
                KeyStroke.getKeyStroke("meta DELETE"),
                KeyStroke.getKeyStroke("shift TAB"),
                KeyStroke.getKeyStroke("meta ESCAPE"),
                KeyStroke.getKeyStroke("alt DELETE"),
                KeyStroke.getKeyStroke("ctrl F2"),
            ),
            strokes,
        )
    }

    fun testValidationConditionsInTheBracketSpellingAreEnforced() {
        val ctx = context()
        ctx.captureComponentContext(
            json(
                """{"actions":[{"id":"go","validationRequired":true}],
                   "validations":[{"fieldId":"qty","condition":"state['qty'] >= 3","message":"At least 3"},
                                  {"fieldId":"name","condition":"state['name']"},
                                  {"fieldId":"qty","condition":"state['qty'] != 2","message":"second message for qty is dropped"}]}""",
            ),
            "x.Form",
        )
        ctx.currentComponentState["qty"] = 2
        ctx.currentComponentState["name"] = ""
        ctx.runAction("go", null)
        flush()
        assertEquals(mapOf("qty" to "At least 3", "name" to "Invalid value"), ctx.currentFieldErrors.toMap())
        assertTrue(requests.isEmpty())
        ctx.currentComponentState["qty"] = "5"
        ctx.currentComponentState["name"] = "Ada"
        ctx.runAction("go", null)
        assertEquals(emptyMap<String, String>(), ctx.currentFieldErrors.toMap())
        await("the valid request") { requests.size == 1 }
    }

    fun testTheHostLearnsAboutTheFirstRealContentAndWhetherItIsACrud() {
        val ctx = context()
        val seen = ArrayList<Boolean>()
        ctx.onFirstContent = { seen.add(it) }
        ctx.applyIncrement(json("""{"fragments":[{"component":{"type":"ClientSide","metadata":{"type":"Text","text":"hello"}}}]}"""))
        ctx.applyIncrement(json("""{"fragments":[{"component":{"type":"ClientSide","metadata":{"type":"Text","text":"again"}}}]}"""))
        assertEquals("told once, not a crud", listOf(false), seen)
    }
}
