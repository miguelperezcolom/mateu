package io.mateu.ijp.chat

import junit.framework.TestCase

/** The SSE stream read by EVENT, and what each event's data means (port of chatStream.test.ts). */
class ChatStreamTest : TestCase() {

    // ── SseParser ──

    fun testAnEventEndsAtABlankLineAndItsDataLinesJoinWithNewlines() {
        val p = SseParser()
        assertEquals(emptyList<String>(), p.push("data: # Title\ndata: \ndata: - item"))
        assertEquals(listOf("# Title\n\n- item"), p.push("\n\n"))
    }

    fun testOnlyOneSpaceAfterDataIsDroppedSoIndentationSurvives() {
        assertEquals(listOf("    code", "x"), SseParser().push("data:     code\n\ndata:x\n\n"))
    }

    fun testCommentsAndOtherFieldsAreIgnored() {
        assertEquals(listOf("hi"), SseParser().push(":keep-alive\n\nevent: message\nid: 3\ndata: hi\n\n"))
    }

    fun testAnEventWithoutDataYieldsNothing() {
        assertEquals(emptyList<String>(), SseParser().push("event: ping\n\n"))
    }

    fun testCrlfAndCrLineEnds() {
        val p = SseParser()
        assertEquals(listOf("a\nb", "c"), p.push("data: a\r\ndata: b\r\n\r\ndata: c\r\rdata: d"))
        assertEquals(listOf("d"), p.end())
    }

    fun testACrSplitFromItsLfAcrossChunksIsOneLineEnd() {
        val p = SseParser()
        assertEquals(emptyList<String>(), p.push("data: a\r"))
        assertEquals(emptyList<String>(), p.push("\ndata: b\r"))
        assertEquals(listOf("a\nb"), p.push("\n\r\n"))
    }

    fun testChunksSplitAnywhere() {
        val stream = "data: {\"event\":\"agent-delta\",\"detail\":{\"text\":\"Hel\"}}\n\ndata: lo\n\n"
        val p = SseParser()
        val out = ArrayList<String>()
        stream.forEach { out.addAll(p.push(it.toString())) }
        assertEquals(listOf("{\"event\":\"agent-delta\",\"detail\":{\"text\":\"Hel\"}}", "lo"), out)
    }

    fun testTheLastEventIsFlushedAtEndWithoutATrailingBlankLine() {
        val p = SseParser()
        assertEquals(emptyList<String>(), p.push("data: last\r"))
        assertEquals(listOf("last"), p.end())
        assertEquals(emptyList<String>(), p.end())
    }

    fun testADataFieldWithoutColonIsAnEmptyLine() {
        assertEquals(listOf(""), SseParser().push("data\n\n"))
    }

    // ── classify ──

    fun testUsage() {
        val m = ChatStream.classify("{\"inputTokens\":10,\"outputTokens\":5,\"totalTokens\":15}") as ChatStreamMessage.Usage
        assertEquals(TokenUsage(10, 5, 15), m.usage)
        assertTrue(ChatStream.classify("{\"totalTokens\":3}") is ChatStreamMessage.Usage)
    }

    fun testAgentEvents() {
        assertEquals(ChatStreamMessage.Delta("Hi"), ChatStream.classify("{\"event\":\"agent-delta\",\"detail\":{\"text\":\"Hi\"}}"))
        assertEquals(ChatStreamMessage.Delta(""), ChatStream.classify("{\"event\":\"agent-delta\"}"))
        assertEquals(ChatStreamMessage.Status("thinking", "Reading"), ChatStream.classify("{\"event\":\"agent-status\",\"detail\":{\"phase\":\"thinking\",\"text\":\"Reading\"}}"))
        val tool = ChatStream.classify("{\"event\":\"agent-tool\",\"detail\":{\"name\":\"search\",\"server\":\"s\",\"kind\":\"mcp\",\"phase\":\"end\",\"ms\":120,\"error\":\"boom\"}}") as ChatStreamMessage.Tool
        assertEquals(ToolDetail("search", "s", "mcp", "end", 120, "boom"), tool.detail)
        assertEquals(ChatStreamMessage.Error("quota"), ChatStream.classify("{\"event\":\"agent-error\",\"detail\":{\"message\":\"quota\"}}"))
        assertEquals(ChatStreamMessage.Error(ChatStream.AGENT_ERROR), ChatStream.classify("{\"event\":\"agent-error\"}"))
    }

    fun testUiEventsCarryTheirDetailDefaultingToAnEmptyObject() {
        val nav = ChatStream.classify("{\"event\":\"navigation-requested\",\"detail\":{\"route\":\"/orders\"}}") as ChatStreamMessage.Event
        assertEquals("navigation-requested", nav.event)
        assertEquals("/orders", nav.detail.path("route").asText())
        val close = ChatStream.classify("{\"event\":\"close-requested\"}") as ChatStreamMessage.Event
        assertTrue(close.detail.isObject && close.detail.isEmpty)
    }

    fun testTextThatStartsWithABraceIsStillText() {
        assertEquals(ChatStreamMessage.Text("{not json"), ChatStream.classify("{not json"))
        assertEquals(ChatStreamMessage.Text("{\"a\":1}"), ChatStream.classify("{\"a\":1}"))
        assertEquals(ChatStreamMessage.Text("{\"event\":3}"), ChatStream.classify("{\"event\":3}"))
        assertEquals(ChatStreamMessage.Text("[1,2]"), ChatStream.classify("[1,2]"))
        assertEquals(ChatStreamMessage.Text("plain"), ChatStream.classify("plain"))
    }

    fun testEmptyUsageIsAPlaceholder() {
        assertTrue(ChatStream.isEmptyUsage(null))
        assertTrue(ChatStream.isEmptyUsage(TokenUsage()))
        assertTrue(ChatStream.isEmptyUsage(TokenUsage(0, 0, 0)))
        assertFalse(ChatStream.isEmptyUsage(TokenUsage(0, 3, null)))
    }

    fun testUsageLineAndMerge() {
        assertEquals("15 tokens", TokenUsage(totalTokens = 15).line())
        assertEquals("Tokens: in 10 · out 5 · total 15", TokenUsage(10, 5, 15).line())
        assertEquals(TokenUsage(10, 7, 17), TokenUsage(10, 5, 15).merge(TokenUsage(null, 7, 17)))
    }

    // ── ChatAnswer ──

    fun testLinesJoinWithNewlinesSoMarkdownSurvives() {
        val a = ChatAnswer()
        a.line("# Title")
        a.line("- one")
        assertEquals("# Title\n- one", a.text)
    }

    fun testDeltasAppendAndTheNextTextReplacesThem() {
        val a = ChatAnswer()
        a.delta("Hel")
        a.delta("lo")
        assertEquals("Hello", a.text)
        assertEquals("Hello, world.", a.line("Hello, world."))
        assertEquals("Hello, world.\nmore", a.line("more"))
    }

    fun testAnErrorBecomesTheAnswer() {
        val a = ChatAnswer()
        a.delta("partial")
        assertEquals("⚠️ quota", a.error("quota"))
        assertEquals("⚠️ quota\nnext", a.line("next"))
    }

    // ── ChatProgress ──

    fun testProgressLine() {
        val p = ChatProgress(0)
        assertNull(p.line(5000))
        p.status("thinking", null, 1000)
        assertEquals("Thinking…", p.line(1500))
        assertEquals("Thinking… 2 s", p.line(3000))
        p.status("thinking", "Reading the order", 3000)
        assertEquals("Reading the order", p.line(3000))
        p.tool(ToolDetail(name = "search", phase = "start"), 4000)
        assertEquals("Calling search…", p.line(4000))
        assertEquals("Calling search… 1 s", p.line(5000))
        p.tool(ToolDetail(name = "search", phase = "end", ms = 900), 6000)
        assertNull(p.runningTool)
        assertEquals(listOf(ChatToolStep("search", ms = 900, running = false)), p.steps)
        p.text(7000)
        assertEquals("Answering…", p.line(9000))
    }

    fun testAToolEndWithoutStartIsStillAStepAndANamelessToolIsCalledTool() {
        val p = ChatProgress(0)
        p.tool(ToolDetail(phase = "end"), 1)
        assertEquals("tool", p.steps.single().name)
        p.tool(ToolDetail(phase = "start"), 2)
        assertEquals("Calling tool…", p.line(2))
    }
}
