package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.ui.components.JBTextField
import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.state.AppSession
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections
import javax.swing.JComponent
import javax.swing.JEditorPane
import javax.swing.SwingUtilities

/**
 * The assistant panel end to end against a stub agent: the body it sends, the streamed answer
 * (markdown kept), and every UI event applied — navigation like a menu click, a render-screen the
 * shell renders through `__preview__`, a custom event on the bus, the close.
 */
class ChatPanelTest : TestCase() {
    private val mapper = ObjectMapper()
    private lateinit var server: HttpServer
    private val chatBodies: MutableList<JsonNode> = Collections.synchronizedList(ArrayList())
    private val syncBodies: MutableList<JsonNode> = Collections.synchronizedList(ArrayList())
    private var stream = ""

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/api/ai/chat") { ex ->
            chatBodies.add(mapper.readTree(ex.requestBody.readAllBytes()))
            ex.responseHeaders.add("Content-Type", "text/event-stream")
            ex.sendResponseHeaders(200, 0)
            ex.responseBody.use { it.write(stream.toByteArray()) }
        }
        server.createContext("/mateu/v3/sync/") { ex ->
            syncBodies.add(mapper.readTree(ex.requestBody.readAllBytes()))
            val answer = """{"fragments":[{"targetComponentId":"ux_main","action":"Replace","component":{"id":"t","metadata":{"type":"Text","text":"Previewed"},"children":[]}}],"messages":[],"commands":[]}""".toByteArray()
            ex.sendResponseHeaders(200, answer.size.toLong())
            ex.responseBody.use { it.write(answer) }
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private fun ev(json: String) = "data: $json\n\n"

    fun testATurnStreamsTheAnswerAndAppliesEveryEvent() {
        val session = AppSession("http://127.0.0.1:${server.address.port}")
        session.appMenu = mapper.readTree("""[{"label":"Orders","route":"/orders","consumedRoute":"","serverSideType":"app.Orders"}]""")
        session.appMcpUrl = "/mcp"
        val opened = Collections.synchronizedList(ArrayList<List<String?>>())
        session.openViewHandler = { label, route, consumed, sst, action -> opened.add(listOf(label, route, consumed, sst, action)) }
        val previews = Collections.synchronizedList(ArrayList<Pair<String, JComponent>>())
        session.contentPreviewHandler = { title, panel, _ -> previews.add(title to panel) }
        val bus = Collections.synchronizedList(ArrayList<JsonNode?>())
        session.subscribe(this, "order-picked") { bus.add(it) }
        val closed = java.util.concurrent.atomic.AtomicBoolean(false)

        stream = ev("""{"event":"agent-status","detail":{"phase":"thinking"}}""") +
            ev("""{"event":"agent-delta","detail":{"text":"Opening"}}""") +
            ev("""{"event":"navigation-requested","detail":{"route":"/orders","consumedRoute":"","actionId":"","serverSideType":"app.Orders"}}""") +
            ev("""{"event":"render-screen","detail":{"yaml":"type: Page","title":"Draft"}}""") +
            ev("""{"event":"order-picked","detail":{"id":7}}""") +
            "data: ## Done\ndata: - first\ndata: {braces are text}\n\n" +
            ev("""{"inputTokens":3,"outputTokens":2,"totalTokens":5}""") +
            ev("""{"event":"close-requested"}""")

        lateinit var panel: JComponent
        SwingUtilities.invokeAndWait {
            panel = buildChatPanel(session, "/api/ai/chat", null, host = null) { closed.set(true) }
            val input = find<JBTextField>(panel)!!
            input.text = "show me the orders"
            input.postActionEvent()
        }
        waitFor { closed.get() && previews.isNotEmpty() && syncBodies.isNotEmpty() }
        var html = ""
        waitFor {
            SwingUtilities.invokeAndWait { html = find<JEditorPane>(panel)!!.text }
            html.contains("first")
        }

        val body = chatBodies.single()
        assertEquals("show me the orders", body.path("message").asText())
        // one UI session id: the chat names the session its requests (and the push channel) carry
        assertEquals(session.sessionId, body.path("sessionId").asText())
        assertEquals("http://127.0.0.1:${server.address.port}/mcp", body.path("mcpUrl").asText())
        assertEquals("Orders", body.path("menuContext").path(0).path("path").path(0).asText())
        assertTrue(body.has("context"))

        assertEquals(listOf(listOf("Orders", "/orders", "", "app.Orders", "")), opened)
        val preview = syncBodies.single()
        assertEquals("__preview__", preview.path("actionId").asText())
        assertEquals("type: Page", preview.path("parameters").path("_yaml").asText())
        assertEquals("an agent's screen is untrusted", true, preview.path("parameters").path("_untrusted").asBoolean())
        assertFalse(preview.has("serverSideType"))
        assertEquals("Draft", previews.single().first)
        assertEquals(7, bus.single()!!.path("id").asInt())

        assertTrue(html, html.contains("Done"))
        assertTrue(html, html.contains("{braces are text}"))
        assertTrue(html, html.contains("<li>"))
        assertFalse(html, html.contains("Opening"))

        // the second message carries no menu context
        stream = ev("""{"event":"agent-error","detail":{"message":"quota exceeded"}}""")
        SwingUtilities.invokeAndWait {
            val input = find<JBTextField>(panel)!!
            input.text = "again"
            input.postActionEvent()
        }
        waitFor {
            SwingUtilities.invokeAndWait { html = find<JEditorPane>(panel)!!.text }
            html.contains("quota exceeded")
        }
        assertFalse(chatBodies[1].has("menuContext"))
    }

    fun testANetworkFailureIsShown() {
        val session = AppSession("http://127.0.0.1:1")
        lateinit var panel: JComponent
        SwingUtilities.invokeAndWait {
            panel = buildChatPanel(session, "/api/ai/chat")
            val input = find<JBTextField>(panel)!!
            input.text = "hi"
            input.postActionEvent()
        }
        var html = ""
        waitFor {
            SwingUtilities.invokeAndWait { html = find<JEditorPane>(panel)!!.text }
            html.contains("No answer from the agent") || html.contains("Error")
        }
    }

    private inline fun <reified T> find(c: java.awt.Component): T? = findBy(c) { it is T } as T?

    private fun findBy(c: java.awt.Component, test: (java.awt.Component) -> Boolean): java.awt.Component? {
        if (test(c)) return c
        if (c is java.awt.Container) for (child in c.components) findBy(child, test)?.let { return it }
        return null
    }

    private fun waitFor(condition: () -> Boolean) {
        val deadline = System.currentTimeMillis() + 10_000
        while (!condition()) {
            if (System.currentTimeMillis() > deadline) fail("timed out")
            Thread.sleep(25)
        }
        // let the EDT drain what the background thread posted
        SwingUtilities.invokeAndWait {}
    }
}
