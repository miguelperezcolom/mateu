package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode
import junit.framework.TestCase

/** A whole turn: the stream's events → answer, progress, usage and UI events, in arrival order. */
class ChatTurnTest : TestCase() {
    private var now = 0L
    private val answers = ArrayList<String>()
    private val usages = ArrayList<TokenUsage>()
    private val events = ArrayList<Pair<String, JsonNode>>()
    private var progressCalls = 0

    private val turn = ChatTurn(
        object : ChatTurn.Listener {
            override fun answer(text: String) { answers.add(text) }
            override fun usage(usage: TokenUsage) { usages.add(usage) }
            override fun event(event: String, detail: JsonNode) { events.add(event to detail) }
            override fun progress() { progressCalls++ }
        },
        clock = { now },
    )

    fun testAStreamOfDeltasThenTheFinalAnswerWithEventsInBetween() {
        val parser = SseParser()
        val stream = listOf(
            "data: {\"inputTokens\":0,\"outputTokens\":0,\"totalTokens\":0}\n\n",
            "data: {\"event\":\"agent-status\",\"detail\":{\"phase\":\"thinking\"}}\n\n",
            "data: {\"event\":\"agent-delta\",\"detail\":{\"text\":\"Here \"}}\n\n",
            "data: {\"event\":\"navigation-requested\",\"detail\":{\"route\":\"/orders\"}}\n\n",
            "data: {\"event\":\"agent-delta\",\"detail\":{\"text\":\"you go\"}}\n\n",
            "data: # Orders\ndata: - one\n\n",
            "data: {\"inputTokens\":10,\"outputTokens\":4}\n\n",
            "data: {\"totalTokens\":14}",
        )
        stream.forEach { chunk -> parser.push(chunk).forEach(turn::accept) }
        parser.end().forEach(turn::accept)

        assertEquals(listOf("Here ", "Here you go", "# Orders\n- one"), answers)
        assertEquals(listOf("navigation-requested"), events.map { it.first })
        assertEquals("/orders", events[0].second.path("route").asText())
        // placeholders ignored; the last report shown, merged
        assertEquals(listOf(TokenUsage(10, 4, null), TokenUsage(10, 4, 14)), usages)
        assertTrue(turn.answered)
        assertTrue(progressCalls > 0)
    }

    fun testAnAgentErrorIsShownNotSwallowed() {
        turn.accept("{\"event\":\"agent-error\",\"detail\":{\"message\":\"No API key\"}}")
        assertEquals(listOf("⚠️ No API key"), answers)
    }

    fun testTextLinesStartingWithABraceAreText() {
        turn.accept("{not json}")
        turn.accept("second")
        assertEquals("{not json}\nsecond", turn.answer.text)
    }

    fun testProgressLineFallsBackToThinkingWithSeconds() {
        assertEquals("Thinking…", turn.progressLine(0, 500))
        assertEquals("Thinking… 3 s", turn.progressLine(0, 3000))
        now = 1000
        turn.accept("{\"event\":\"agent-tool\",\"detail\":{\"name\":\"lookup\",\"phase\":\"start\"}}")
        assertEquals("Calling lookup…", turn.progressLine(0, 1000))
    }

    fun testFailureTexts() {
        assertTrue(ChatTurn.failureText(java.io.IOException(), false).startsWith(ChatTurn.CONNECTION_CLOSED))
        assertEquals(ChatTurn.ERROR_PREFIX + "boom", ChatTurn.failureText(java.io.IOException("boom"), true))
        assertEquals(ChatTurn.ERROR_PREFIX + "IllegalStateException", ChatTurn.failureText(IllegalStateException(), false))
    }
}
