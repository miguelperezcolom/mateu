package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text

/**
 * Live UI push (phase C, `conformance/mcp/README.md` "Live UI push"): an agent, through MCP, sends
 * UI to this app window. Pure (no Swing, no HTTP) so it is unit-tested on its own: the channel
 * ([AgentChannelStream]) and the "Connect AI" dialog (`ui/ConnectAi.kt`) apply what it decides.
 *
 * The UI session id is [AppSession.sessionId] — the `X-Session-Id` every request carries AND the
 * chat's `sessionId`, one id for both, as on the web — and the channel secret is
 * [AppSession.agentSecret], sent only on the three actions below.
 */
object AgentPush {
    const val CHANNEL_ACTION = "_agent-channel"
    const val PAIR_ACTION = "_agent-pair"
    const val UNPAIR_ACTION = "_agent-unpair"
    const val RENDERER = "intellij"
    const val STATUS_EVENT = "mateu-agent-status"
    const val COMMAND_TYPE = "AgentPush"

    /** What the user is asked to tell the agent. */
    const val INSTRUCTION = "Ask your agent to pair with this code (mateu_pair_session)"

    /** Events a pushed `event` message may not carry: they have their own kinds (or close the chat). */
    private val RESERVED_EVENTS = setOf("render-screen", "navigation-requested", "close-requested", STATUS_EVENT)

    /** `AppDto.agentPush`: only then does the UI open its channel and show "Connect AI". */
    fun enabled(app: JsonNode?): Boolean = app?.path("agentPush")?.asBoolean(false) == true

    /** One pushed message: the data of an `AgentPush` command. */
    data class Message(val kind: String, val event: String, val detail: JsonNode)

    /** The `AgentPush` commands an increment of the channel carries, in order. */
    fun messagesOf(increment: JsonNode?): List<Message> =
        increment.arr("commands")
            .filter { it.text("type") == COMMAND_TYPE }
            .map { it.path("data") }
            .filter { it.isObject }
            .map { data ->
                val raw = data.path("detail")
                val detail: JsonNode = if (raw.isMissingNode || raw.isNull) JsonNodeFactory.instance.objectNode() else raw
                Message(data.text("kind"), data.text("event"), detail)
            }

    sealed interface Effect {
        /** The pairing status: update the "Connect AI" control — never dispatched as an event. */
        data class Status(val paired: Boolean, val agents: List<String>) : Effect

        /** Apply [event] exactly like the chat's event of that name (`ui/AgentEvents`). */
        data class UiEvent(val event: String, val detail: JsonNode) : Effect

        data object Ignore : Effect
    }

    /**
     * What a message does. `render` is the chat's `render-screen`, `navigate` its
     * `navigation-requested`, `event` any other chat event; the event NAME is fixed by the kind (a
     * server sending `render` with another event name still renders), and an `event` message naming a
     * reserved event is dropped — the server refuses those, this is the belt to its braces (a pushed
     * `close-requested` would otherwise close whatever the shared applier considers "the chat").
     */
    fun decide(message: Message): Effect = when (message.kind) {
        "status" -> Effect.Status(
            message.detail.path("paired").asBoolean(false),
            message.detail.arr("agents").filter { it.isTextual }.map { it.asText() },
        )
        "render" -> Effect.UiEvent("render-screen", message.detail)
        "navigate" -> Effect.UiEvent("navigation-requested", message.detail)
        "event" -> {
            val name = message.event
            if (name.isBlank() || name in RESERVED_EVENTS) Effect.Ignore else Effect.UiEvent(name, message.detail)
        }
        else -> Effect.Ignore
    }

    /** `{sessionId, secret}` — every one of the three actions carries them. */
    fun credentials(sessionId: String, secret: String): Map<String, Any?> = linkedMapOf("sessionId" to sessionId, "secret" to secret)

    /** The `_agent-channel` parameters: the credentials + the route the UI shows + `intellij`. */
    fun channelParameters(sessionId: String, secret: String, route: String?): Map<String, Any?> =
        credentials(sessionId, secret) + linkedMapOf("route" to (route ?: ""), "renderer" to RENDERER)

    data class Pairing(val code: String, val expiresInSeconds: Int)

    /** What `_agent-pair` / `_agent-unpair` answered. */
    sealed interface PairAnswer {
        data class Code(val pairing: Pairing) : PairAnswer
        /** `Data{_agentPairing: null}` — unpaired (or a pair answer with no code). */
        data object Cleared : PairAnswer
        data class Failed(val message: String) : PairAnswer
    }

    const val NO_CODE = "No pairing code came back from the app."

    /** The `_agentPairing` of a sync answer (`fragments[].data._agentPairing`); an error message wins. */
    fun pairAnswerOf(increment: JsonNode?): PairAnswer {
        errorOf(increment)?.let { return PairAnswer.Failed(it) }
        for (f in increment.arr("fragments")) {
            val data = f.path("data")
            if (!data.has("_agentPairing")) continue
            val p = data.path("_agentPairing")
            val code = p.text("code")
            if (!p.isObject || code.isBlank()) return PairAnswer.Cleared
            return PairAnswer.Code(Pairing(code, p.path("expiresInSeconds").asInt(300).coerceAtLeast(0)))
        }
        return PairAnswer.Cleared
    }

    /** The first error message an increment carries (`messages[]` with variant error), if any. */
    fun errorOf(increment: JsonNode?): String? =
        increment.arr("messages")
            .firstOrNull { it.text("variant") == "error" && (it.text("text").isNotBlank() || it.text("title").isNotBlank()) }
            ?.let { it.text("text").ifBlank { it.text("title") } }

    private val mapper = com.fasterxml.jackson.databind.ObjectMapper()

    /**
     * What a failed call says to the user: the server's own error message when the failure carries
     * the answer (`HTTP 500: {…messages…}` — e.g. `Live UI push is not enabled.`), else its text.
     */
    fun failureText(failure: Throwable): String {
        val text = failure.message ?: failure.toString()
        val body = text.substringAfter(": ", "").trim()
        if (text.startsWith("HTTP ") && body.startsWith("{")) {
            val tree = runCatching { mapper.readTree(body) }.getOrNull()
            errorOf(tree)?.let { return it }
            tree?.path("message")?.takeIf { it.isTextual && it.asText().isNotBlank() }?.let { return it.asText() }
        }
        return text
    }

    /**
     * Wait before reopening the channel. The server ends a healthy stream every 5 minutes on purpose
     * and the UI reconnects at once (a short pause, so a server that ends it at once is no busy loop);
     * after errors — push off, the session refused, the backend down — the live-updates back-off.
     */
    fun reconnectDelayMillis(failures: Int): Long = if (failures <= 0) 250L else HeaderValues.reconnectDelayMillis(failures)

    /** A fresh channel secret: 256 random bits, URL-safe. */
    fun newSecret(): String {
        val bytes = ByteArray(32)
        java.security.SecureRandom().nextBytes(bytes)
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    /** "4:59" — the code's countdown. */
    fun countdown(seconds: Int): String {
        val s = seconds.coerceAtLeast(0)
        return "${s / 60}:${(s % 60).toString().padStart(2, '0')}"
    }

    /** "5 minutes" / "1 minute 30 seconds" / "45 seconds" — the countdown as a screen reader says it. */
    fun spokenDuration(seconds: Int): String {
        val s = seconds.coerceAtLeast(0)
        fun unit(n: Int, word: String) = "$n $word" + if (n == 1) "" else "s"
        val minutes = s / 60
        val rest = s % 60
        return when {
            minutes == 0 -> unit(rest, "second")
            rest == 0 -> unit(minutes, "minute")
            else -> unit(minutes, "minute") + " " + unit(rest, "second")
        }
    }

    /** "alice", "alice and an agent", "alice, bob and an agent". */
    fun agentsText(agents: List<String>): String {
        val names = agents.map { it.ifBlank { "an agent" } }.ifEmpty { listOf("an agent") }
        return if (names.size == 1) names[0] else names.dropLast(1).joinToString(", ") + " and " + names.last()
    }

    /** The code as it is spoken: one character at a time, the dash as a pause ("K 7 Q F, 4 M Z P"). */
    fun spokenCode(code: String): String =
        code.split('-').filter { it.isNotEmpty() }.joinToString(", ") { part -> part.toCharArray().joinToString(" ") }
}

/**
 * The pairing state of one app session — what the "Connect AI" control and its dialog show. EDT
 * only (the channel and the actions post to it with `invokeLater`). Two independent halves: whether
 * agents are paired (the channel's `status` messages say so) and the code being shown, if any.
 */
class AgentPairingState {
    sealed interface CodePhase {
        data object None : CodePhase
        data object Requesting : CodePhase
        data class Showing(val code: String, val expiresAtMillis: Long) : CodePhase
        data class Failed(val message: String) : CodePhase
    }

    /** What the dialog shows about the code [now]. */
    sealed interface CodeView {
        data object None : CodeView
        data object Requesting : CodeView
        data class Showing(val code: String, val secondsLeft: Int) : CodeView
        data object Expired : CodeView
        data class Failed(val message: String) : CodeView
    }

    var paired: Boolean = false
        private set
    var agents: List<String> = emptyList()
        private set
    var codePhase: CodePhase = CodePhase.None
        private set

    /** Why the channel is not open (push off on the server, the backend down…); null while it is. */
    var channelProblem: String? = null
        private set

    private val listeners = java.util.concurrent.CopyOnWriteArrayList<() -> Unit>()

    /** Called after every change; the returned function unsubscribes. */
    fun onChange(listener: () -> Unit): () -> Unit {
        listeners.add(listener)
        return { listeners.remove(listener) }
    }

    private fun changed() = listeners.forEach { it() }

    fun requesting() {
        codePhase = CodePhase.Requesting
        changed()
    }

    fun codeReceived(pairing: AgentPush.Pairing, now: Long) {
        codePhase = CodePhase.Showing(pairing.code, now + pairing.expiresInSeconds * 1000L)
        changed()
    }

    fun failed(message: String) {
        codePhase = CodePhase.Failed(message)
        changed()
    }

    /** The code is no longer of interest (dialog closed / a new one asked for). */
    fun forgetCode() {
        if (codePhase == CodePhase.None) return
        codePhase = CodePhase.None
        changed()
    }

    /**
     * A `status` message. A pairing that ADDS an agent while a code is shown used that code (a code
     * works once), so the code is dropped and the dialog moves to its connected state.
     */
    fun status(paired: Boolean, agents: List<String>) {
        val gained = paired && (!this.paired || agents.size > this.agents.size)
        this.paired = paired
        this.agents = if (paired) agents else emptyList()
        if (gained && codePhase is CodePhase.Showing) codePhase = CodePhase.None
        changed()
    }

    /** `_agent-unpair` answered: nothing paired any more (the channel's status confirms it). */
    fun unpaired() {
        paired = false
        agents = emptyList()
        changed()
    }

    fun channelOpened() {
        if (channelProblem == null) return
        channelProblem = null
        changed()
    }

    fun channelFailed(message: String) {
        if (channelProblem == message) return
        channelProblem = message
        changed()
    }

    /** Push switched off: back to the start. */
    fun reset() {
        paired = false
        agents = emptyList()
        codePhase = CodePhase.None
        channelProblem = null
        changed()
    }

    fun codeView(now: Long): CodeView = when (val p = codePhase) {
        CodePhase.None -> CodeView.None
        CodePhase.Requesting -> CodeView.Requesting
        is CodePhase.Failed -> CodeView.Failed(p.message)
        is CodePhase.Showing -> {
            val left = ((p.expiresAtMillis - now + 999) / 1000).toInt()
            if (left <= 0) CodeView.Expired else CodeView.Showing(p.code, left)
        }
    }

    /** The control's label: "Connect AI", or who is connected. */
    fun controlLabel(): String = if (paired) "AI connected: " + AgentPush.agentsText(agents) else "Connect AI"
}
