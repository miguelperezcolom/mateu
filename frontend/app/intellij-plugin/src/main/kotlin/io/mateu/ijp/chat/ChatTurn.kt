package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.JsonNode

/**
 * One turn of the conversation: every event's data the stream yields goes through [accept], which
 * keeps the answer / progress / usage and tells the [listener] what changed. Pure (the panel hops to
 * the EDT in its listener), so the whole stream → screen mapping is unit-tested.
 */
class ChatTurn(private val listener: Listener, private val clock: () -> Long = System::currentTimeMillis) {
    interface Listener {
        /** The answer so far (markdown, newlines kept). */
        fun answer(text: String) {}

        /** The progress changed (read [ChatTurn.progressLine]). */
        fun progress() {}

        /** The last non-placeholder usage, merged. */
        fun usage(usage: TokenUsage) {}

        /** A UI event — applied AS SOON AS it arrives, mid-stream. */
        fun event(event: String, detail: JsonNode) {}
    }

    val answer = ChatAnswer()
    val progress = ChatProgress(clock())
    var usage: TokenUsage? = null
        private set

    /** Whether any answer text (or an agent error) arrived. */
    val answered: Boolean get() = answer.text.isNotEmpty()

    fun accept(payload: String) {
        when (val msg = ChatStream.classify(payload)) {
            is ChatStreamMessage.Usage -> {
                // older agents send all-zero placeholders while they work: not a count
                if (ChatStream.isEmptyUsage(msg.usage)) return
                val merged = usage?.merge(msg.usage) ?: msg.usage
                usage = merged
                listener.usage(merged)
            }
            is ChatStreamMessage.Delta -> {
                answer.delta(msg.text)
                progress.text(clock())
                listener.answer(answer.text)
                listener.progress()
            }
            is ChatStreamMessage.Text -> {
                answer.line(msg.text)
                progress.text(clock())
                listener.answer(answer.text)
                listener.progress()
            }
            is ChatStreamMessage.Error -> {
                answer.error(msg.message)
                listener.answer(answer.text)
            }
            is ChatStreamMessage.Status -> {
                progress.status(msg.phase, msg.text, clock())
                listener.progress()
            }
            is ChatStreamMessage.Tool -> {
                progress.tool(msg.detail, clock())
                listener.progress()
            }
            is ChatStreamMessage.Event -> listener.event(msg.event, msg.detail)
        }
    }

    /** The line under the conversation: the agent's progress, else "Thinking… N s" since [startedAt]. */
    fun progressLine(startedAt: Long, now: Long = clock()): String =
        progress.line(now) ?: run {
            val secs = maxOf(0L, (now - startedAt) / 1000)
            if (secs > 0) "Thinking… $secs s" else "Thinking…"
        }

    companion object {
        const val NO_ANSWER = "⚠️ The agent returned no answer. Check that the LLM is configured correctly (API key)."
        const val CONNECTION_CLOSED =
            "⚠️ No answer from the agent. The server closed the connection without sending data — check that the LLM has its API key configured and is available."
        const val ERROR_PREFIX = "⚠️ Error: "

        /** What a failed turn shows: the connection closing before anything arrived, or the error. */
        fun failureText(error: Throwable, answeredSoFar: Boolean): String {
            val message = error.message?.takeIf { it.isNotBlank() }
            if (error is java.io.IOException && !answeredSoFar) return CONNECTION_CLOSED + (message?.let { " ($it)" } ?: "")
            return ERROR_PREFIX + (message ?: error.javaClass.simpleName)
        }
    }
}
