package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.state.AgentPairingState
import io.mateu.ijp.state.AppSession
import junit.framework.TestCase
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.Collections
import javax.swing.JComponent
import javax.swing.SwingUtilities

/**
 * LIVE probe of live UI push against a REAL backend (opt-in: CI has none). Runs only with
 * `-Pmateu.live.baseUrl=http://localhost:21550` (optionally `-Pmateu.live.route=/app`), e.g.
 *
 *     ./gradlew test --tests '*AgentPushLiveProbeTest' -Pmateu.live.baseUrl=http://localhost:21550
 *
 * It drives the plugin's own pieces — [AppSession], the channel, the pairing model, [ConnectAiPanel]
 * and the shared [AgentEvents] — and plays the agent through the backend's `/mateu/mcp`: the channel
 * opens, a code comes back, `mateu_pair_session` flips the dialog to connected, `mateu_push_ui`
 * reaches the Preview tab through `__preview__`, `mateu_navigate` opens a view like a menu click,
 * `mateu_dispatch_event` reaches the bus, and Disconnect unpairs (the agent loses the session).
 */
class AgentPushLiveProbeTest : TestCase() {
    private val mapper = ObjectMapper()
    private val http = HttpClient.newHttpClient()
    private val baseUrl: String? = System.getProperty("mateu.live.baseUrl")?.trimEnd('/')?.ifBlank { null }
    private val agentKey = "intellij-live-probe-" + java.util.UUID.randomUUID()

    fun testLiveUiPushEndToEnd() {
        val base = baseUrl ?: return // opt-in
        val route = System.getProperty("mateu.live.route")?.ifBlank { null } ?: "/app"
        val session = AppSession(base)

        // 1. the app shell, rendered by the plugin's own renderer, turns push on and opens the channel
        val opened = Collections.synchronizedList(ArrayList<List<String?>>())
        session.openViewHandler = { label, r, consumed, sst, action -> opened.add(listOf(label, r, consumed, sst, action)) }
        val previews = Collections.synchronizedList(ArrayList<Pair<String, JComponent>>())
        session.contentPreviewHandler = { title, panel, _ -> previews.add(title to panel) }
        val bus = Collections.synchronizedList(ArrayList<JsonNode?>())
        session.subscribe(this, "probe-picked") { bus.add(it) }

        val shell = session.apiClient.initialLoad(route, session.appState)
        val app = findApp(shell) ?: fail("no App in the answer of $route: $shell").let { return }
        SwingUtilities.invokeAndWait {
            val ctx = io.mateu.ijp.state.AppContext(session)
            ctx.silentErrors = true
            ctx.appShell = true
            ctx.titleConsumer = {}
            ctx.contentPane = ctx.newSlot()
            ComponentRenderer(ctx).render(mapper.readTree("""{"type":"ClientSide","metadata":$app}"""), mapper.readTree("{}"), mapper.readTree("{}"))
        }
        assertTrue("the app has agentPush", session.agentPush)
        log("app ${session.appServerSideType} root=${session.appRootRoute} home=${session.homeRoute}; channel started")

        // 2. "Connect AI": the dialog asks for a code (retrying while the channel registers the session)
        lateinit var panel: ConnectAiPanel
        SwingUtilities.invokeAndWait { panel = ConnectAiPanel(session, {}) }
        var code: String? = null
        val until = System.currentTimeMillis() + 15_000
        while (code == null) {
            waitFor("a pairing answer") { session.agentPairing.codePhase !is AgentPairingState.CodePhase.Requesting }
            when (val p = session.agentPairing.codePhase) {
                is AgentPairingState.CodePhase.Showing -> code = p.code
                is AgentPairingState.CodePhase.Failed -> {
                    log("pair refused (yet): ${p.message}")
                    if (System.currentTimeMillis() > until) fail("no pairing code: ${p.message} / channel: ${session.agentPairing.channelProblem}")
                    Thread.sleep(500)
                    SwingUtilities.invokeAndWait { panel.clickNewCode() }
                }
                else -> fail("unexpected pairing phase $p")
            }
        }
        assertNull("the channel is open", session.agentPairing.channelProblem)
        SwingUtilities.invokeAndWait { assertEquals(code, panel.codeText) }
        log("code $code (${panel.countdownText})")

        // 3. the agent pairs: the channel's status flips the dialog to connected
        val paired = tool("mateu_pair_session", mapOf("code" to code!!.lowercase().replace("-", "")))
        val handle = paired.path("session").asText()
        assertTrue("pair answer: $paired", handle.isNotBlank() && paired.path("paired").asBoolean())
        assertEquals("intellij", paired.path("renderer").asText())
        waitFor("connected") { session.agentPairing.paired }
        SwingUtilities.invokeAndWait {
            assertNotNull(panel.connectedText)
            assertEquals("", panel.codeText)
        }
        log("paired: ${panel.connectedText}; label '${session.agentPairing.controlLabel()}'")

        // 4. a pushed render → __preview__ → the Preview tab
        val yaml = "layout:\n  type: Text\n  text: Pushed from the probe\n"
        val pushed = tool("mateu_push_ui", mapOf("session" to handle, "yaml" to yaml, "target" to "content"))
        assertTrue("push answer: $pushed", pushed.path("delivered").asBoolean())
        waitFor("the pushed preview") { previews.isNotEmpty() }
        val previewTexts = texts(previews.single().second)
        log("preview '${previews.single().first}': $previewTexts")
        assertTrue("preview shows the pushed text: $previewTexts", previewTexts.any { it.contains("Pushed from the probe") })

        // 5. a navigate → a menu click
        assertTrue(tool("mateu_navigate", mapOf("session" to handle, "route" to "/app/section2")).path("delivered").asBoolean())
        waitFor("the navigation") { opened.isNotEmpty() }
        log("navigated: ${opened.single()}")
        assertEquals("/app/section2", opened.single()[1])

        // 6. an event → the session bus
        assertTrue(tool("mateu_dispatch_event", mapOf("session" to handle, "event" to "probe-picked", "detail" to mapOf("id" to 7))).path("delivered").asBoolean())
        waitFor("the event") { bus.isNotEmpty() }
        assertEquals(7, bus.single()!!.path("id").asInt())

        // 7. Disconnect: the state says so and the agent no longer reaches the session
        SwingUtilities.invokeAndWait { panel.clickDisconnect() }
        waitFor("disconnected") { !session.agentPairing.paired }
        SwingUtilities.invokeAndWait { assertNull(panel.connectedText) }
        val after = toolRaw("mateu_navigate", mapOf("session" to handle, "route" to "/app/section1"))
        log("after disconnect: $after")
        assertTrue("the agent lost the session: $after", after.contains("Unknown session"))

        SwingUtilities.invokeAndWait { panel.dispose(); session.syncAgentPush(false) }
        session.dispose()
    }

    // ── the agent's side: MCP tools/call ─────────────────────────────────────────────────────

    private fun toolRaw(name: String, arguments: Map<String, Any?>): String {
        val body = mapper.writeValueAsString(
            mapOf("jsonrpc" to "2.0", "id" to 1, "method" to "tools/call", "params" to mapOf("name" to name, "arguments" to arguments)),
        )
        val request = HttpRequest.newBuilder(URI.create("$baseUrl/mateu/mcp"))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream")
            .header("X-Mateu-Agent-Key", agentKey)
            .POST(HttpRequest.BodyPublishers.ofString(body)).build()
        return http.send(request, HttpResponse.BodyHandlers.ofString()).body()
    }

    /** A tool's result (its text content parsed as JSON); fails on an MCP error. */
    private fun tool(name: String, arguments: Map<String, Any?>): JsonNode {
        val raw = toolRaw(name, arguments)
        val answer = mapper.readTree(raw)
        val result = answer.path("result")
        assertFalse("$name: $raw", answer.has("error") || result.path("isError").asBoolean())
        return mapper.readTree(result.path("content").path(0).path("text").asText("{}"))
    }

    private fun findApp(n: JsonNode): JsonNode? {
        if (n.isObject && n.path("metadata").path("type").asText() == "App") return n.path("metadata")
        for (child in n) findApp(child)?.let { return it }
        return null
    }

    private fun texts(c: java.awt.Component): List<String> {
        val out = ArrayList<String>()
        fun walk(x: java.awt.Component) {
            when (x) {
                is javax.swing.JLabel -> x.text?.let { out.add(it) }
                is javax.swing.text.JTextComponent -> x.text?.let { out.add(it) }
            }
            if (x is java.awt.Container) x.components.forEach { walk(it) }
        }
        walk(c)
        return out
    }

    private fun log(s: String) = println("[live probe] $s")

    private fun waitFor(what: String, condition: () -> Boolean) {
        val deadline = System.currentTimeMillis() + 15_000
        while (true) {
            var ok = false
            SwingUtilities.invokeAndWait { ok = condition() }
            if (ok) break
            if (System.currentTimeMillis() > deadline) fail("timed out waiting for $what")
            Thread.sleep(50)
        }
        SwingUtilities.invokeAndWait {}
    }
}
