package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.actionSystem.ex.ActionUtil
import com.intellij.testFramework.PlatformTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.sun.net.httpserver.HttpServer
import java.awt.Container
import java.net.InetSocketAddress
import java.util.concurrent.CopyOnWriteArrayList
import javax.swing.JComponent
import javax.swing.JLabel
import javax.swing.KeyStroke
import javax.swing.text.JTextComponent

/**
 * The view context's behaviour a user relies on, driven through its public entry points against a
 * stub Mateu server: client validation refusing a save (and saying why), the bulk-action guard,
 * client rules, the dirty guard, an increment's messages / commands / banners / app state, the
 * event bus, client-run flows and keyboard shortcuts.
 */
class AppContextBehaviourTest : BasePlatformTestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)

    private lateinit var server: HttpServer
    /** Each request body the stub received. */
    private val requests = CopyOnWriteArrayList<JsonNode>()
    /** What the stub answers to every action. */
    @Volatile private var answer: String = """{"fragments":[],"messages":[],"commands":[]}"""
    /** What the context told the user: (title, text, variant). */
    private val notices = CopyOnWriteArrayList<Triple<String?, String, String>>()
    private val undos = CopyOnWriteArrayList<Pair<String, () -> Unit>>()

    override fun setUp() {
        super.setUp()
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            requests.add(mapper.readTree(ex.requestBody.readAllBytes()))
            val bytes = answer.toByteArray()
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
        session.notifier = { title, text, variant, undo ->
            notices.add(Triple(title, text, variant))
            if (undo != null) undos.add(undo)
        }
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

    private fun all(c: Container): Sequence<java.awt.Component> = sequenceOf<java.awt.Component>(c) +
        c.components.asSequence().flatMap { if (it is Container) all(it) else sequenceOf(it) }

    /** A ServerSide component with one email field, as the server sends a form. */
    private fun loadForm(ctx: AppContext, extra: String = ""): JComponent {
        val ssc = json(
            """{"type":"ServerSide","id":"cmp1","serverSideType":"com.example.Signup","route":"/signup",
                "initialData":{"email":""},
                "children":[{"type":"ClientSide","metadata":{"type":"FormField","fieldId":"email","label":"Email","required":true}}],
                "validations":[{"fieldId":"email","condition":"state.email","message":"Email is required"}],
                "actions":[{"id":"save","validationRequired":true},{"id":"other"}]
                $extra}""",
        )
        val pane = ctx.loadServerSideComponent(ssc)
        ctx.contentPane!!.add(pane)
        flush()
        return pane
    }

    fun testASaveWithAnInvalidFieldIsRefusedClientSideAndSaysWhy() {
        val ctx = context()
        val pane = loadForm(ctx)
        ctx.runAction("save", null)
        flush()
        assertEquals("Email is required", ctx.currentFieldErrors["email"])
        assertTrue("the refusal is told", notices.any { it.second.contains("email: Email is required") && it.third == "warning" })
        assertTrue("nothing reaches the server", requests.isEmpty())
        // the form re-renders with the message under the field and in its accessible description
        await("the error under the field") { all(pane).filterIsInstance<JLabel>().any { it.text == "Email is required" } }
        val input = all(pane).filterIsInstance<JTextComponent>().single()
        assertEquals("email", input.getClientProperty("mateu.fieldId"))
        assertTrue(input.accessibleContext.accessibleDescription.contains("Invalid: Email is required"))
    }

    fun testAValidSaveGoesToTheServerWithTheComponentStateAndAppliesTheAnswer() {
        val ctx = context()
        loadForm(ctx)
        ctx.putState("email", "ada@example.com")
        answer = """{"fragments":[],"commands":[],"messages":[{"text":"Saved","variant":"success"}],
                     "appState":{"tenant":"t1"}}"""
        ctx.runAction("save", mapOf("p" to 1))
        await("the server answer") { notices.any { it.second == "Saved" } }
        val body = requests.single()
        assertEquals("save", body.path("actionId").asText())
        assertEquals("com.example.Signup", body.path("serverSideType").asText())
        assertEquals("ada@example.com", body.path("componentState").path("email").asText())
        assertEquals(1, body.path("parameters").path("p").asInt())
        assertTrue(ctx.currentFieldErrors.isEmpty())
        assertEquals("t1", (ctx.appState["tenant"] as JsonNode).asText())
    }

    fun testAFailedActionIsReportedUnlessSilent() {
        val ctx = context()
        loadForm(ctx)
        server.stop(0)
        ctx.runAction("other", null)
        await("the failure") { notices.any { it.third == "error" && it.second.startsWith("Action failed") } }
        notices.clear()
        ctx.runAction("other", null, silent = true)
        Thread.sleep(200)
        flush()
        assertTrue("a silent (trigger) failure only logs", notices.isEmpty())
    }

    fun testBulkActionsNeedASelection() {
        val ctx = context()
        loadForm(ctx)
        ctx.captureComponentContext(json("""{"actions":[{"id":"archive","rowsSelectedRequired":true}]}"""), "x.Crud")
        ctx.runAction("archive", null)
        flush()
        assertTrue(notices.any { it.second == "You first need to select some rows" })
        assertTrue(requests.isEmpty())
        ctx.currentComponentState["crud_selected_items"] = listOf(mapOf("id" to 1))
        ctx.runAction("archive", null)
        await("the bulk action request") { requests.size == 1 }
    }

    fun testRulesHideFieldsAndDeriveStateAsTheUserTypes() {
        val ctx = context()
        loadForm(ctx, """,
            "rules":[
              {"filter":"state.kind == 'company'","action":"SetAttributeValue","fieldName":"lastName","fieldAttribute":"hidden","value":true,"result":"Continue"},
              {"filter":"","action":"SetStateValue","fieldName":"total","expression":"state.qty * 2","result":"Continue"}
            ]""")
        ctx.putState("kind", "company")
        assertEquals(true, ctx.fieldAttributes["lastName"]?.get("hidden"))
        ctx.putState("qty", 4)
        assertEquals(8.0, ctx.currentComponentState["total"])
    }

    fun testATrackedFormBecomesDirtyOnEditAndCleanOnCommand() {
        val ctx = context()
        val transitions = ArrayList<Boolean>()
        ctx.onDirtyChanged = { transitions.add(it) }
        loadForm(ctx, ""","confirmOnNavigationIfDirty":true""")
        assertTrue(ctx.trackDirty)
        assertFalse(ctx.dirty)
        ctx.putState("email", "x")
        assertTrue(ctx.dirty)
        ctx.applyIncrement(json("""{"commands":[{"type":"MarkAsClean"}]}"""))
        assertFalse(ctx.dirty)
        ctx.applyIncrement(json("""{"commands":[{"type":"MarkAsDirty"}]}"""))
        assertEquals(listOf(true, false, true), transitions)
    }

    fun testAnUntrackedFormNeverTurnsDirty() {
        val ctx = context()
        loadForm(ctx)
        ctx.putState("email", "x")
        assertFalse(ctx.dirty)
    }

    fun testAnUndoableMessageOffersUndoThatRunsTheReverseAction() {
        val ctx = context()
        loadForm(ctx)
        ctx.applyIncrement(json("""{"messages":[{"text":"Deleted","variant":"info","undoActionId":"restore","undoLabel":"Restore","undoParameters":{"id":7}}]}"""))
        await("the toast") { notices.any { it.second == "Deleted" } }
        val (label, run) = undos.single()
        assertEquals("Restore", label)
        run()
        await("the undo request") { requests.isNotEmpty() }
        assertEquals("restore", requests.single().path("actionId").asText())
        assertEquals(7, requests.single().path("parameters").path("id").asInt())
    }

    fun testActionBannersReplaceOrAppend() {
        val ctx = context()
        loadForm(ctx)
        ctx.applyIncrement(json("""{"banners":[{"title":"a"}]}"""))
        ctx.applyIncrement(json("""{"banners":[{"title":"b"}]}"""))
        assertEquals(listOf("b"), ctx.actionBanners.map { it.path("title").asText() })
        ctx.applyIncrement(json("""{"banners":[{"title":"c"}],"appendBanners":true}"""))
        assertEquals(listOf("b", "c"), ctx.actionBanners.map { it.path("title").asText() })
        // a component (re)load drops them
        loadForm(ctx)
        assertTrue(ctx.actionBanners.isEmpty())
    }

    fun testWindowTitleGoesToTheViewsConsumer() {
        val ctx = context()
        val titles = ArrayList<String>()
        ctx.titleConsumer = { titles.add(it) }
        ctx.applyIncrement(json("""{"commands":[{"type":"SetWindowTitle","data":"Orders"},{"type":"SetWindowTitle","data":{"title":"[raw]"}}]}"""))
        flush()
        assertEquals(listOf("Orders"), titles)
        assertEquals("Orders", ctx.lastWindowTitle)
    }

    fun testDispatchedEventsReachSubscribersStampedWithTheEmitter() {
        val listener = context()
        val emitter = AppContext(listener.session).apply { contentPane = newSlot() }
        // the listener subscribes (DOCUMENT and COMPONENT scope) through its triggers
        listener.loadServerSideComponent(json(
            """{"type":"ServerSide","id":"l","serverSideType":"x.Host","children":[{"type":"ClientSide","metadata":{"type":"Text","text":"host"}}],
                "triggers":[{"type":"OnCustomEvent","eventName":"saved","actionId":"reload"},
                            {"type":"OnCustomEvent","eventName":"picked","actionId":"onPick","source":"COMPONENT","from":"other-panel"}]}"""))
        flush()
        emitter.captureComponentContext(json("""{"emitsName":"guests"}"""), "x.Guests")
        emitter.applyIncrement(json("""{"commands":[{"type":"DispatchEvent","data":{"eventName":"saved","payload":{"id":3}}}]}"""))
        await("the subscribed action") { requests.isNotEmpty() }
        val body = requests.single()
        assertEquals("reload", body.path("actionId").asText())
        assertEquals(3, body.path("parameters").path("id").asInt())
        assertEquals("guests", body.path("parameters").path("__source").asText())
        // a COMPONENT-scoped subscription ignores events from another emitter
        emitter.applyIncrement(json("""{"commands":[{"type":"DispatchEvent","data":{"eventName":"picked","payload":{"id":4}}}]}"""))
        Thread.sleep(200)
        flush()
        assertEquals(1, requests.size)
    }

    fun testADeclaredFlowRunsInTheClientWithNoRoundTrip() {
        val ctx = context()
        loadForm(ctx, ""","confirmOnNavigationIfDirty":true""")
        ctx.captureComponentContext(json("""{"confirmOnNavigationIfDirty":true,"actions":[{"id":"touch","commands":[{"type":"MarkAsDirty"}]}]}"""), "x.Form")
        ctx.runAction("touch", null)
        assertTrue(ctx.dirty)
        assertTrue(requests.isEmpty())
    }

    fun testFieldScopedDataGoesToItsFieldNotTheListing() {
        val ctx = context()
        var fieldGot: JsonNode? = null
        var crudGot: JsonNode? = null
        ctx.registerFieldDataHandler("country", { fieldGot = it })
        ctx.registerDataHandler("crud", { crudGot = it })
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"cmp1","data":{"country":{"content":[1]}}}]}"""))
        assertNotNull(fieldGot)
        assertNull(crudGot)
        ctx.applyIncrement(json("""{"fragments":[{"targetComponentId":"cmp1","data":{"page":{"content":[]}}}]}"""))
        assertNotNull(crudGot)
    }

    fun testActionShortcutsAreRegisteredOnTheView() {
        val ctx = context()
        loadForm(ctx)
        ctx.captureComponentContext(json("""{"actions":[{"id":"save","shortcut":"ctrl+alt+s"},{"id":"bad","shortcut":"hyper+x"},{"id":"enter","shortcut":"enter"}]}"""), "x.Form")
        val strokes = ActionUtil.getActions(ctx.contentPane!!).flatMap { a ->
            a.shortcutSet.shortcuts.mapNotNull { (it as? com.intellij.openapi.actionSystem.KeyboardShortcut)?.firstKeyStroke }
        }
        assertTrue(strokes.contains(KeyStroke.getKeyStroke("ctrl alt S")))
        assertTrue(strokes.contains(KeyStroke.getKeyStroke("ENTER")))
        assertEquals("an unparseable shortcut is skipped", 2, strokes.size)
        // re-capturing replaces them instead of piling up
        ctx.captureComponentContext(json("""{"actions":[{"id":"save","shortcut":"ctrl+s"}]}"""), "x.Form")
        assertEquals(1, ActionUtil.getActions(ctx.contentPane!!).size)
    }
}
