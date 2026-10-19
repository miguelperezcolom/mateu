package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Live UI push (phase C): parsing the channel's commands, what each one does, the pairing state. */
class AgentPushTest : TestCase() {
    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    fun testOnlyAnAppWithAgentPushOpensTheChannel() {
        assertTrue(AgentPush.enabled(json("""{"agentPush":true}""")))
        assertFalse(AgentPush.enabled(json("""{"agentPush":false}""")))
        assertFalse(AgentPush.enabled(json("{}")))
        assertFalse(AgentPush.enabled(null))
    }

    fun testTheAgentPushCommandsOfAnIncrementInOrder() {
        val increment = json(
            """{"commands":[
                 {"type":"AgentPush","data":{"kind":"status","event":"mateu-agent-status","detail":{"paired":true,"agents":["alice","an agent"]}}},
                 {"type":"UpdateHeaderValue","data":{"id":"x","value":"1"}},
                 {"type":"AgentPush","data":{"kind":"event","event":"order-picked"}},
                 {"type":"AgentPush"}
               ],"messages":[],"fragments":[]}""",
        )
        val messages = AgentPush.messagesOf(increment)
        assertEquals(listOf("status", "event"), messages.map { it.kind })
        assertEquals("mateu-agent-status", messages[0].event)
        // a message with no detail gets {} — the chat's events always carry an object
        assertTrue(messages[1].detail.isObject && messages[1].detail.isEmpty)
        assertEquals(emptyList<AgentPush.Message>(), AgentPush.messagesOf(json("""{"commands":[]}""")))
        assertEquals(emptyList<AgentPush.Message>(), AgentPush.messagesOf(json("{}")))
        assertEquals(emptyList<AgentPush.Message>(), AgentPush.messagesOf(null))
    }

    fun testEachKindIsTheChatsEventOfThatNameAndStatusIsNotDispatched() {
        fun m(kind: String, event: String, detail: String = "{}") = AgentPush.Message(kind, event, json(detail))
        assertEquals(
            AgentPush.Effect.Status(true, listOf("alice", "an agent")),
            AgentPush.decide(m("status", "mateu-agent-status", """{"paired":true,"agents":["alice","an agent"]}""")),
        )
        assertEquals(AgentPush.Effect.Status(false, emptyList()), AgentPush.decide(m("status", "mateu-agent-status", "{}")))

        val render = json("""{"yaml":"type: Page","target":"drawer","title":"Draft"}""")
        assertEquals(AgentPush.Effect.UiEvent("render-screen", render), AgentPush.decide(AgentPush.Message("render", "render-screen", render)))
        // the KIND decides: a render message names render-screen whatever its event says
        assertEquals("render-screen", (AgentPush.decide(AgentPush.Message("render", "x", render)) as AgentPush.Effect.UiEvent).event)

        val nav = json("""{"route":"/orders/42","consumedRoute":""}""")
        assertEquals(AgentPush.Effect.UiEvent("navigation-requested", nav), AgentPush.decide(AgentPush.Message("navigate", "navigation-requested", nav)))

        val custom = json("""{"id":7}""")
        assertEquals(AgentPush.Effect.UiEvent("order-picked", custom), AgentPush.decide(AgentPush.Message("event", "order-picked", custom)))
    }

    fun testReservedOrUnknownMessagesAreDropped() {
        for (reserved in listOf("render-screen", "navigation-requested", "close-requested", "mateu-agent-status", "")) {
            assertEquals(reserved, AgentPush.Effect.Ignore, AgentPush.decide(AgentPush.Message("event", reserved, json("{}"))))
        }
        assertEquals(AgentPush.Effect.Ignore, AgentPush.decide(AgentPush.Message("teleport", "x", json("{}"))))
    }

    fun testTheChannelSendsTheCredentialsTheRouteAndTheRenderer() {
        assertEquals(
            mapOf("sessionId" to "s1", "secret" to "k", "route" to "/orders", "renderer" to "intellij"),
            AgentPush.channelParameters("s1", "k", "/orders"),
        )
        assertEquals("", AgentPush.channelParameters("s1", "k", null)["route"])
        assertEquals(mapOf("sessionId" to "s1", "secret" to "k"), AgentPush.credentials("s1", "k"))
    }

    fun testThePairingAnswer() {
        assertEquals(
            AgentPush.PairAnswer.Code(AgentPush.Pairing("K7QF-4MZP", 300)),
            AgentPush.pairAnswerOf(json("""{"fragments":[{"data":{"_agentPairing":{"code":"K7QF-4MZP","expiresInSeconds":300}}}]}""")),
        )
        assertEquals(AgentPush.PairAnswer.Cleared, AgentPush.pairAnswerOf(json("""{"fragments":[{"data":{"_agentPairing":null}}]}""")))
        assertEquals(AgentPush.PairAnswer.Cleared, AgentPush.pairAnswerOf(json("""{"fragments":[]}""")))
        assertEquals(
            AgentPush.PairAnswer.Failed("Live UI push is not enabled."),
            AgentPush.pairAnswerOf(json("""{"messages":[{"variant":"error","text":"Live UI push is not enabled."}],"fragments":[]}""")),
        )
    }

    fun testAFailedCallSaysWhatTheServerSaid() {
        val http = RuntimeException("""HTTP 500: {"messages":[{"variant":"error","text":"This UI session belongs to another channel."}]}""")
        assertEquals("This UI session belongs to another channel.", AgentPush.failureText(http))
        assertEquals("HTTP 502: <html>", AgentPush.failureText(RuntimeException("HTTP 502: <html>")))
        assertEquals("Connection refused", AgentPush.failureText(java.io.IOException("Connection refused")))
    }

    fun testReconnectAtOnceAfterACleanEndAndBackOffAfterErrors() {
        assertEquals(250L, AgentPush.reconnectDelayMillis(0))
        assertTrue(AgentPush.reconnectDelayMillis(1) < AgentPush.reconnectDelayMillis(3))
        assertEquals(60_000L, AgentPush.reconnectDelayMillis(20))
    }

    fun testSecretsAreUnguessableAndUrlSafe() {
        val a = AgentPush.newSecret()
        assertTrue(a, a.matches(Regex("[A-Za-z0-9_-]{43}")))
        assertFalse(a == AgentPush.newSecret())
    }

    fun testTextsForPeopleAndScreenReaders() {
        assertEquals("4:59", AgentPush.countdown(299))
        assertEquals("0:05", AgentPush.countdown(5))
        assertEquals("0:00", AgentPush.countdown(-3))
        assertEquals("5 minutes", AgentPush.spokenDuration(300))
        assertEquals("1 minute 1 second", AgentPush.spokenDuration(61))
        assertEquals("45 seconds", AgentPush.spokenDuration(45))
        assertEquals("alice", AgentPush.agentsText(listOf("alice")))
        assertEquals("alice and an agent", AgentPush.agentsText(listOf("alice", "an agent")))
        assertEquals("a, b and c", AgentPush.agentsText(listOf("a", "b", "c")))
        assertEquals("an agent", AgentPush.agentsText(emptyList()))
        assertEquals("K 7 Q F, 4 M Z P", AgentPush.spokenCode("K7QF-4MZP"))
    }

    // ── the pairing state ──────────────────────────────────────────────────────────────────

    fun testACodeCountsDownAndExpires() {
        val s = AgentPairingState()
        var changes = 0
        s.onChange { changes++ }
        assertEquals(AgentPairingState.CodeView.None, s.codeView(0))
        s.requesting()
        assertEquals(AgentPairingState.CodeView.Requesting, s.codeView(0))
        s.codeReceived(AgentPush.Pairing("K7QF-4MZP", 300), 1_000)
        assertEquals(AgentPairingState.CodeView.Showing("K7QF-4MZP", 300), s.codeView(1_000))
        assertEquals(AgentPairingState.CodeView.Showing("K7QF-4MZP", 1), s.codeView(300_500))
        assertEquals(AgentPairingState.CodeView.Expired, s.codeView(301_000))
        assertEquals(2, changes)
        assertEquals("Connect AI", s.controlLabel())
    }

    fun testAPairingThatAddsAnAgentUsesTheCodeShown() {
        val s = AgentPairingState()
        s.codeReceived(AgentPush.Pairing("AAAA-BBBB", 300), 0)
        // the first status of the channel (nobody paired yet) keeps the code
        s.status(false, emptyList())
        assertTrue(s.codeView(0) is AgentPairingState.CodeView.Showing)
        s.status(true, listOf("alice"))
        assertEquals(AgentPairingState.CodeView.None, s.codeView(0))
        assertTrue(s.paired)
        assertEquals("AI connected: alice", s.controlLabel())

        // a second code while connected: a repeated status (same agents) does not drop it…
        s.codeReceived(AgentPush.Pairing("CCCC-DDDD", 300), 0)
        s.status(true, listOf("alice"))
        assertTrue(s.codeView(0) is AgentPairingState.CodeView.Showing)
        // …a second agent does
        s.status(true, listOf("alice", "an agent"))
        assertEquals(AgentPairingState.CodeView.None, s.codeView(0))
        assertEquals("AI connected: alice and an agent", s.controlLabel())
    }

    fun testUnpairResetAndChannelProblems() {
        val s = AgentPairingState()
        s.status(true, listOf("alice"))
        s.unpaired()
        assertFalse(s.paired)
        assertEquals(emptyList<String>(), s.agents)

        s.failed("Live UI push is not enabled.")
        assertEquals(AgentPairingState.CodeView.Failed("Live UI push is not enabled."), s.codeView(0))

        var changes = 0
        s.onChange { changes++ }
        s.channelFailed("down")
        s.channelFailed("down") // the same problem again is no change
        assertEquals("down", s.channelProblem)
        s.channelOpened()
        assertNull(s.channelProblem)
        assertEquals(2, changes)

        s.status(true, listOf("x"))
        s.reset()
        assertFalse(s.paired)
        assertEquals(AgentPairingState.CodeView.None, s.codeView(0))
    }
}
