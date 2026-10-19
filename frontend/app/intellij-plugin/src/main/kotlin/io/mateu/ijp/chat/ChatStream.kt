package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.JsonNodeFactory

/**
 * The chat's SSE stream, read as SSE — by EVENT, not by line — and turned into what the panel shows:
 * the answer, the token line and a progress line while the agent works.
 *
 * The Kotlin port of the web client's `chatStream.ts` (libs/mateu `infra/ui/chatStream.ts`); the
 * Redwood renderer has the same logic in `apps/redwood/poc/chat.mjs` — keep the three in step. Pure
 * (no Swing), so it is unit-tested on its own; `ui/ChatPanel.kt` drives it.
 */

/** Token usage, as the agent reports it (the LAST one is shown, never summed). */
data class TokenUsage(val inputTokens: Long? = null, val outputTokens: Long? = null, val totalTokens: Long? = null) {
    /** Later counters win; the ones this report does not carry are kept. */
    fun merge(next: TokenUsage) = TokenUsage(
        next.inputTokens ?: inputTokens,
        next.outputTokens ?: outputTokens,
        next.totalTokens ?: totalTokens,
    )

    /** "in 120 · out 45 · total 165", or "165 tokens" when only the total is known. */
    fun line(): String {
        if (inputTokens == null && outputTokens == null && totalTokens != null) return "$totalTokens tokens"
        val parts = ArrayList<String>()
        inputTokens?.let { parts.add("in $it") }
        outputTokens?.let { parts.add("out $it") }
        totalTokens?.let { parts.add("total $it") }
        return "Tokens: " + parts.joinToString(" · ")
    }
}

/** What one event's data is. */
sealed interface ChatStreamMessage {
    data class Usage(val usage: TokenUsage) : ChatStreamMessage
    data class Delta(val text: String) : ChatStreamMessage
    data class Text(val text: String) : ChatStreamMessage
    data class Status(val phase: String?, val text: String?) : ChatStreamMessage
    data class Tool(val detail: ToolDetail) : ChatStreamMessage
    data class Error(val message: String) : ChatStreamMessage
    /** A UI event (navigation-requested, close-requested, render-screen, anything else). */
    data class Event(val event: String, val detail: JsonNode) : ChatStreamMessage
}

data class ToolDetail(
    val name: String? = null,
    val server: String? = null,
    val kind: String? = null,
    val phase: String? = null,
    val ms: Long? = null,
    val error: String? = null,
)

/**
 * An SSE parser (the WHATWG event-stream format, minus `retry`): feed it text as it arrives, in
 * pieces of any size, and it returns the data of every event a blank line has completed. An event's
 * `data:` lines are joined with '\n'; only the one optional space after `data:` is dropped, so the
 * indentation of a markdown line survives; comment lines (`:keep-alive`) and other fields are
 * ignored. [end] returns an event the stream ended without a blank line after.
 */
class SseParser {
    private val buffer = StringBuilder()
    private val data = ArrayList<String>()
    private var hasData = false

    fun push(text: String): List<String> {
        buffer.append(text)
        val out = ArrayList<String>()
        var start = 0
        var i = 0
        while (i < buffer.length) {
            val c = buffer[i]
            if (c == '\n' || c == '\r') {
                // A '\r' that ends the buffer may be the first half of a '\r\n' split across pieces.
                if (c == '\r' && i == buffer.length - 1) break
                line(buffer.substring(start, i), out)
                i += if (c == '\r' && buffer[i + 1] == '\n') 2 else 1
                start = i
                continue
            }
            i++
        }
        buffer.delete(0, start)
        return out
    }

    fun end(): List<String> {
        val out = ArrayList<String>()
        if (buffer.isNotEmpty()) {
            line(buffer.toString().removeSuffix("\r"), out)
            buffer.setLength(0)
        }
        dispatch(out)
        return out
    }

    private fun line(line: String, out: MutableList<String>) {
        if (line.isEmpty()) {
            dispatch(out)
            return
        }
        if (line.startsWith(":")) return
        val colon = line.indexOf(':')
        val field = if (colon < 0) line else line.substring(0, colon)
        if (field != "data") return
        var value = if (colon < 0) "" else line.substring(colon + 1)
        if (value.startsWith(" ")) value = value.substring(1)
        data.add(value)
        hasData = true
    }

    private fun dispatch(out: MutableList<String>) {
        if (hasData) out.add(data.joinToString("\n"))
        data.clear()
        hasData = false
    }
}

object ChatStream {
    private val mapper = ObjectMapper()

    const val AGENT_ERROR = "The agent failed."

    /** What one event's data is — the order matters: usage, then the agent events, then UI events, then text. */
    fun classify(payload: String): ChatStreamMessage {
        val trimmed = payload.trim()
        if (trimmed.startsWith("{")) {
            val obj = runCatching { mapper.readTree(trimmed) }.getOrNull()?.takeIf { it.isObject }
            if (obj != null) {
                if (obj.has("inputTokens") || obj.has("outputTokens") || obj.has("totalTokens")) {
                    return ChatStreamMessage.Usage(
                        TokenUsage(number(obj, "inputTokens"), number(obj, "outputTokens"), number(obj, "totalTokens")),
                    )
                }
                val event = obj.path("event")
                if (event.isTextual) {
                    val rawDetail = obj.path("detail")
                    val detail: JsonNode = if (rawDetail.isMissingNode || rawDetail.isNull) JsonNodeFactory.instance.objectNode() else rawDetail
                    return when (event.asText()) {
                        "agent-delta" -> ChatStreamMessage.Delta(detail.path("text").takeIf { it.isTextual }?.asText() ?: "")
                        "agent-status" -> ChatStreamMessage.Status(
                            detail.path("phase").takeIf { it.isTextual }?.asText(),
                            detail.path("text").takeIf { it.isTextual }?.asText(),
                        )
                        "agent-tool" -> ChatStreamMessage.Tool(
                            ToolDetail(
                                name = text(detail, "name"),
                                server = text(detail, "server"),
                                kind = text(detail, "kind"),
                                phase = text(detail, "phase"),
                                ms = number(detail, "ms"),
                                error = text(detail, "error"),
                            ),
                        )
                        "agent-error" -> ChatStreamMessage.Error(
                            detail.path("message").let { if (it.isMissingNode || it.isNull) AGENT_ERROR else it.asText() },
                        )
                        else -> ChatStreamMessage.Event(event.asText(), detail)
                    }
                }
            }
        }
        return ChatStreamMessage.Text(payload)
    }

    /** A usage report that says nothing: every counter it has is zero (older agents' placeholders). */
    fun isEmptyUsage(usage: TokenUsage?): Boolean {
        if (usage == null) return true
        val values = listOfNotNull(usage.inputTokens, usage.outputTokens, usage.totalTokens)
        return values.isEmpty() || values.all { it == 0L }
    }

    private fun text(node: JsonNode, field: String): String? = node.path(field).takeIf { it.isTextual }?.asText()

    private fun number(node: JsonNode, field: String): Long? = node.path(field).takeIf { it.isNumber }?.asLong()
}

/** The answer of one turn, as the stream builds it. */
class ChatAnswer {
    var text: String = ""
        private set

    /** Deltas have been shown since the last full text: the next text event replaces them. */
    private var streamed = false

    fun delta(piece: String): String {
        text += piece
        streamed = true
        return text
    }

    fun line(line: String): String {
        text = if (streamed) {
            streamed = false
            line
        } else if (text.isEmpty()) {
            line
        } else {
            text + "\n" + line
        }
        return text
    }

    fun error(message: String): String {
        text = "⚠️ $message"
        streamed = false
        return text
    }
}

/** One tool call the agent made in this turn. */
data class ChatToolStep(
    val name: String,
    val server: String? = null,
    val kind: String? = null,
    val ms: Long? = null,
    val error: String? = null,
    /** Still running. */
    val running: Boolean,
)

/** What the agent is doing, as the status and tool events say. */
class ChatProgress(now: Long) {
    var phase: String? = null
        private set
    var statusText: String? = null
        private set

    /** When the current phase, tool or answer started (ms). */
    var since: Long = now
        private set
    var steps: List<ChatToolStep> = emptyList()
        private set

    /** Text is arriving: the agent is answering, not thinking. */
    var answering = false
        private set

    /** Whether the agent has sent any progress at all (older agents do not). */
    var reported = false
        private set

    fun status(phase: String?, text: String?, now: Long) {
        reported = true
        if (phase != this.phase || text != statusText || answering) since = now
        this.phase = phase
        statusText = text
        answering = false
    }

    fun tool(detail: ToolDetail, now: Long) {
        reported = true
        val name = detail.name ?: "tool"
        if (detail.phase == "start") {
            steps = steps + ChatToolStep(name, detail.server, detail.kind, running = true)
            since = now
            answering = false
            return
        }
        // end: the last running call of that name
        val list = steps.toMutableList()
        var i = list.size - 1
        while (i >= 0 && !(list[i].running && list[i].name == name)) i--
        val done = ChatToolStep(name, detail.server, detail.kind, detail.ms, detail.error, running = false)
        if (i >= 0) list[i] = done else list.add(done)
        steps = list
        since = now
    }

    fun text(now: Long) {
        if (!answering) since = now
        answering = true
    }

    val runningTool: ChatToolStep? get() = steps.lastOrNull { it.running }

    /**
     * The one line under the conversation: the tool being called, "Answering…" while text arrives,
     * or the phase the agent said — with the seconds it has been at it once there are any. Null when
     * the agent reported nothing (the panel keeps its own "Thinking… N s").
     */
    fun line(now: Long): String? {
        val secs = maxOf(0L, (now - since) / 1000)
        fun withSecs(s: String) = if (secs > 0) "$s $secs s" else s
        runningTool?.let { return withSecs("Calling ${it.name}…") }
        if (answering) return "Answering…"
        if (!reported) return null
        return withSecs(statusText?.takeIf { it.isNotEmpty() } ?: "Thinking…")
    }
}
