package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpServer
import io.mateu.ijp.state.AgentChannelStream
import io.mateu.ijp.state.AgentPairingState
import io.mateu.ijp.state.AgentPush
import io.mateu.ijp.state.AppSession
import junit.framework.TestCase
import java.net.InetSocketAddress
import java.util.Collections
import javax.swing.JComponent
import javax.swing.SwingUtilities

/**
 * Live UI push end to end against a stub backend: the channel request (credentials, route,
 * renderer, the one UI session id), every pushed kind applied exactly like the chat's event (a
 * render through `__preview__` into the Preview tab, a navigation as a menu click, an event on the
 * bus, a status into the pairing state), the channel's outcomes, and the "Connect AI" dialog:
 * code + countdown + copy, the connected state and Disconnect.
 */
class AgentPushChannelTest : TestCase() {
    private val mapper = ObjectMapper()
    private lateinit var server: HttpServer
    private val sseBodies: MutableList<JsonNode> = Collections.synchronizedList(ArrayList())
    private val sseSessionHeaders: MutableList<String?> = Collections.synchronizedList(ArrayList())
    private val syncBodies: MutableList<JsonNode> = Collections.synchronizedList(ArrayList())
    @Volatile private var stream = ""
    @Volatile private var sseStatus = 200
    @Volatile private var pairAnswer = """{"fragments":[{"data":{"_agentPairing":{"code":"K7QF-4MZP","expiresInSeconds":300}}}],"messages":[],"commands":[]}"""

    override fun setUp() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/mateu/v3/sse/") { ex ->
            sseBodies.add(mapper.readTree(ex.requestBody.readAllBytes()))
            sseSessionHeaders.add(ex.requestHeaders.getFirst("X-Session-Id"))
            ex.responseHeaders.add("Content-Type", "text/event-stream")
            ex.sendResponseHeaders(sseStatus, 0)
            ex.responseBody.use { it.write(stream.toByteArray()) }
        }
        server.createContext("/mateu/v3/sync/") { ex ->
            val body = mapper.readTree(ex.requestBody.readAllBytes())
            syncBodies.add(body)
            val answer = when (body.path("actionId").asText()) {
                AgentPush.PAIR_ACTION -> pairAnswer
                AgentPush.UNPAIR_ACTION -> """{"fragments":[{"data":{"_agentPairing":null}}],"messages":[],"commands":[]}"""
                else -> """{"fragments":[{"targetComponentId":"ux_main","action":"Replace","component":{"id":"t","metadata":{"type":"Text","text":"Pushed"},"children":[]}}],"messages":[],"commands":[]}"""
            }.toByteArray()
            ex.sendResponseHeaders(200, answer.size.toLong())
            ex.responseBody.use { it.write(answer) }
        }
        server.start()
    }

    override fun tearDown() = server.stop(0)

    private fun session(): AppSession = AppSession("http://127.0.0.1:${server.address.port}").also {
        it.appRootRoute = "/app"
        it.appServerSideType = "app.Shell"
        it.homeRoute = "/app/home"
    }

    private fun push(kind: String, event: String, detail: String) =
        """data: {"commands":[{"type":"AgentPush","data":{"kind":"$kind","event":"$event","detail":$detail}}],"messages":[],"fragments":[]}""" + "\n\n"

    fun testTheChannelRegistersTheSessionAndDeliversEveryMessage() {
        val session = session()
        stream = push("status", "mateu-agent-status", """{"paired":false,"agents":[]}""") +
            "data: {\"commands\":[],\"messages\":[],\"fragments\":[]}\n\n" + // the 20 s keep-alive
            push("render", "render-screen", """{"yaml":"type: Page","target":"content","title":"Draft"}""") +
            push("navigate", "navigation-requested", """{"route":"/orders/42","consumedRoute":""}""") +
            push("event", "order-picked", """{"id":7}""")
        val delivered = ArrayList<AgentPush.Message>()
        val channel = AgentChannelStream(session) { delivered.add(it) }
        channel.markRunning()

        assertEquals(AgentChannelStream.Outcome.Ended, channel.streamOnce())

        val body = sseBodies.single()
        assertEquals("_agent-channel", body.path("actionId").asText())
        assertEquals("app.Shell", body.path("serverSideType").asText())
        assertEquals("/app", body.path("route").asText())
        val p = body.path("parameters")
        assertEquals(session.sessionId, p.path("sessionId").asText())
        assertEquals(session.agentSecret, p.path("secret").asText())
        assertEquals("/app/home", p.path("route").asText())
        assertEquals("intellij", p.path("renderer").asText())
        // one UI session id: the channel names the session every request carries (and the chat sends)
        assertEquals(session.sessionId, sseSessionHeaders.single())
        assertEquals(listOf("status", "render", "navigate", "event"), delivered.map { it.kind })
    }

    fun testAPushedMessageIsAppliedExactlyLikeTheChatsEvent() {
        val session = session()
        session.appMenu = mapper.readTree("""[{"label":"Orders","route":"/orders/42","consumedRoute":""}]""")
        val opened = Collections.synchronizedList(ArrayList<List<String?>>())
        session.openViewHandler = { label, route, consumed, sst, action -> opened.add(listOf(label, route, consumed, sst, action)) }
        val previews = Collections.synchronizedList(ArrayList<Pair<String, JComponent>>())
        session.contentPreviewHandler = { title, panel, _ -> previews.add(title to panel) }
        val bus = Collections.synchronizedList(ArrayList<JsonNode?>())
        session.subscribe(this, "order-picked") { bus.add(it) }

        fun msg(kind: String, event: String, detail: String) = AgentPush.Message(kind, event, mapper.readTree(detail))
        SwingUtilities.invokeAndWait {
            session.applyAgentPush(msg("status", "mateu-agent-status", """{"paired":true,"agents":["alice"]}"""))
            session.applyAgentPush(msg("render", "render-screen", """{"yaml":"type: Page","target":"content","title":"Draft"}"""))
            session.applyAgentPush(msg("navigate", "navigation-requested", """{"route":"/orders/42","consumedRoute":""}"""))
            session.applyAgentPush(msg("event", "order-picked", """{"id":7}"""))
            session.applyAgentPush(msg("event", "close-requested", "{}"))
        }
        waitFor { previews.isNotEmpty() }

        assertTrue(session.agentPairing.paired)
        assertEquals(listOf("alice"), session.agentPairing.agents)
        // the status is NOT dispatched as an event
        assertFalse(session.hasSubscriber("mateu-agent-status"))
        val preview = syncBodies.single()
        assertEquals("__preview__", preview.path("actionId").asText())
        assertEquals("type: Page", preview.path("parameters").path("_yaml").asText())
        assertEquals("an agent's screen is untrusted", true, preview.path("parameters").path("_untrusted").asBoolean())
        assertEquals("/app/home", preview.path("route").asText())
        assertEquals("Draft", previews.single().first)
        assertEquals(listOf(listOf("Orders", "/orders/42", "", "", "")), opened)
        assertEquals(7, bus.single()!!.path("id").asInt())
    }

    fun testARenderAComponentSubscribesToGoesToItNotToThePreview() {
        val session = session()
        val previews = ArrayList<String>()
        session.contentPreviewHandler = { title, _, _ -> previews.add(title) }
        val taken = ArrayList<JsonNode?>()
        session.subscribe(this, "render-screen") { taken.add(it) }
        SwingUtilities.invokeAndWait {
            session.applyAgentPush(AgentPush.Message("render", "render-screen", mapper.readTree("""{"yaml":"type: Page"}""")))
        }
        assertEquals("type: Page", taken.single()!!.path("yaml").asText())
        assertTrue(previews.isEmpty())
        assertTrue(syncBodies.isEmpty())
    }

    fun testAChannelThatNeverOpensBacksOffWithTheServersReason() {
        val session = session()
        val channel = AgentChannelStream(session) {}
        channel.markRunning()
        stream = "data: {\"commands\":[],\"messages\":[{\"variant\":\"error\",\"text\":\"Live UI push is not enabled.\"}],\"fragments\":[]}\n\n"
        assertEquals(AgentChannelStream.Outcome.Failed("Live UI push is not enabled."), channel.streamOnce())
        stream = ""
        assertTrue(channel.streamOnce() is AgentChannelStream.Outcome.Failed)
        sseStatus = 503
        assertEquals(AgentChannelStream.Outcome.Failed("HTTP 503"), channel.streamOnce())
    }

    fun testTheChannelRunsOnlyWhileTheAppHasPushOn() {
        val session = session()
        stream = push("status", "mateu-agent-status", """{"paired":true,"agents":["alice"]}""")
        var flips = 0
        session.onAgentPushChanged = { flips++ }
        SwingUtilities.invokeAndWait { session.syncAgentPush(true) }
        assertTrue(session.agentPush)
        waitFor { sseBodies.isNotEmpty() && session.agentPairing.paired }
        SwingUtilities.invokeAndWait {
            session.syncAgentPush(true) // idempotent
            session.syncAgentPush(false)
        }
        drainEdt() // a message still queued for the EDT is dropped
        assertFalse(session.agentPush)
        assertFalse(session.agentPairing.paired)
        assertEquals(2, flips)
        session.dispose()
    }

    fun testConnectAiShowsTheCodeThenTheConnectedStateAndDisconnects() {
        val session = session()
        val copied = ArrayList<String>()
        var clock = 1_000_000L
        lateinit var panel: ConnectAiPanel
        SwingUtilities.invokeAndWait { panel = ConnectAiPanel(session, { copied.add(it) }, { clock }) }

        // opening it unpaired asks for a code at once
        waitFor { session.agentPairing.codePhase is AgentPairingState.CodePhase.Showing }
        val pair = syncBodies.single()
        assertEquals("_agent-pair", pair.path("actionId").asText())
        assertEquals("app.Shell", pair.path("serverSideType").asText())
        assertEquals(session.sessionId, pair.path("parameters").path("sessionId").asText())
        assertEquals(session.agentSecret, pair.path("parameters").path("secret").asText())

        SwingUtilities.invokeAndWait {
            assertEquals("K7QF-4MZP", panel.codeText)
            assertEquals("Expires in 5:00", panel.countdownText)
            assertNull(panel.connectedText)
            panel.clickCopy()
            clock += 61_000
            panel.refresh()
            assertEquals("Expires in 3:59", panel.countdownText)
        }
        assertEquals(listOf("K7QF-4MZP"), copied)

        // an agent paired with it: the channel's status moves the dialog to its connected state
        SwingUtilities.invokeAndWait {
            session.applyAgentPush(AgentPush.Message("status", "mateu-agent-status", mapper.readTree("""{"paired":true,"agents":["alice"]}""")))
            assertEquals("", panel.codeText)
            assertEquals("Connected: alice", panel.connectedText)
            assertTrue(panel.newCodeVisible) // "Pair another agent"
            panel.clickDisconnect()
        }
        waitFor { syncBodies.size == 2 && !session.agentPairing.paired }
        val unpair = syncBodies[1]
        assertEquals("_agent-unpair", unpair.path("actionId").asText())
        assertEquals(session.agentSecret, unpair.path("parameters").path("secret").asText())
        SwingUtilities.invokeAndWait {
            assertNull(panel.connectedText)
            panel.dispose()
        }
    }

    fun testAnExpiredCodeOrARefusalOffersANewOne() {
        val session = session()
        pairAnswer = """{"fragments":[],"messages":[{"variant":"error","text":"Live UI push is not enabled."}],"commands":[]}"""
        lateinit var panel: ConnectAiPanel
        SwingUtilities.invokeAndWait { panel = ConnectAiPanel(session, {}, { 0L }) }
        waitFor { session.agentPairing.codePhase is AgentPairingState.CodePhase.Failed }
        SwingUtilities.invokeAndWait {
            assertEquals("Could not get a pairing code: Live UI push is not enabled.", panel.messageText)
            assertTrue(panel.newCodeVisible)
        }

        pairAnswer = """{"fragments":[{"data":{"_agentPairing":{"code":"AAAA-BBBB","expiresInSeconds":1}}}],"messages":[],"commands":[]}"""
        var clock = 0L
        SwingUtilities.invokeAndWait { panel.dispose(); panel = ConnectAiPanel(session, {}, { clock }) }
        waitFor { session.agentPairing.codePhase is AgentPairingState.CodePhase.Showing }
        SwingUtilities.invokeAndWait {
            clock = 5_000
            panel.refresh()
            assertEquals("The code expired. Request a new one to pair an agent.", panel.messageText)
            assertTrue(panel.newCodeVisible)
            panel.dispose()
        }
    }

    private fun drainEdt() = SwingUtilities.invokeAndWait {}

    private fun waitFor(condition: () -> Boolean) {
        val deadline = System.currentTimeMillis() + 10_000
        while (true) {
            var ok = false
            SwingUtilities.invokeAndWait { ok = condition() }
            if (ok) break
            if (System.currentTimeMillis() > deadline) fail("timed out")
            Thread.sleep(25)
        }
        SwingUtilities.invokeAndWait {}
    }
}
