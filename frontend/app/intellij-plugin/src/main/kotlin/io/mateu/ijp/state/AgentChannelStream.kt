package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import javax.swing.SwingUtilities

/**
 * The live UI push CHANNEL of one app session (phase C): one background thread holds
 * `POST {base}/mateu/v3/sse/<root>` running the app-level `_agent-channel` action with
 * `{sessionId, secret, route, renderer: "intellij"}`, and hands every `AgentPush` command it carries
 * to [deliverTo] — by default [AppSession.applyAgentPush] on the EDT, which applies it exactly like the
 * chat's event of the same name.
 *
 * The server ends a healthy stream every 5 minutes and the channel reopens at once (re-registering
 * with the CURRENT route); after an error — push off on the server, the session refused, the backend
 * down — it backs off ([AgentPush.reconnectDelayMillis]) and records the problem in
 * [AppSession.agentPairing]. A stream counts as healthy once it delivered a message (the server's
 * first increment is always the session's status). Started only while the app has `agentPush`;
 * [stop] ends it (the read wakes up with the next 20 s heartbeat at the latest).
 */
class AgentChannelStream(
    private val session: AppSession,
    deliverTo: ((AgentPush.Message) -> Unit)? = null,
) {
    @Volatile private var running = false

    /** A message read after [stop] (still queued for the EDT) is dropped: the channel is gone. */
    private val deliver: (AgentPush.Message) -> Unit =
        deliverTo ?: { m -> SwingUtilities.invokeLater { if (running) session.applyAgentPush(m) } }
    private var thread: Thread? = null

    /** How one stream ended. */
    sealed interface Outcome {
        /** It opened (delivered its status) and the server ended it: reopen at once. */
        data object Ended : Outcome

        /** It never opened, or failed: back off. */
        data class Failed(val reason: String) : Outcome
    }

    fun start() {
        if (running) return
        running = true
        thread = Thread({ loop() }, "mateu-agent-channel").apply { isDaemon = true; start() }
    }

    fun stop() {
        running = false
        thread?.interrupt()
        thread = null
    }

    private fun loop() {
        var failures = 0
        while (running) {
            val outcome = streamOnce()
            if (!running) break
            failures = if (outcome is Outcome.Ended) 0 else failures + 1
            if (outcome is Outcome.Failed) SwingUtilities.invokeLater { if (running) session.agentPairing.channelFailed(outcome.reason) }
            try {
                Thread.sleep(AgentPush.reconnectDelayMillis(failures))
            } catch (_: InterruptedException) {
                break
            }
        }
    }

    /** Opens the channel once and reads it to its end. Blocking; internal for the tests. */
    internal fun streamOnce(): Outcome {
        var opened = false
        var error: String? = null
        val parameters = AgentPush.channelParameters(session.sessionId, session.agentSecret, session.currentUiRoute())
        val failure = runCatching {
            session.apiClient.runActionStream(
                session.appRootRoute, "", AgentPush.CHANNEL_ACTION, session.appServerSideType, "mateu-agent-channel",
                emptyMap(), HashMap(session.appState), parameters,
            ) { increment: JsonNode ->
                // stopped: leave the read at the next increment (a heartbeat comes every 20 s)
                if (!running) throw java.util.concurrent.CancellationException("agent channel stopped")
                val messages = AgentPush.messagesOf(increment)
                if (messages.isEmpty()) {
                    AgentPush.errorOf(increment)?.let { if (!opened) error = it }
                } else if (!opened) {
                    opened = true
                    SwingUtilities.invokeLater { if (running) session.agentPairing.channelOpened() }
                }
                messages.forEach(deliver)
            }
        }.exceptionOrNull()
        return when {
            error != null -> Outcome.Failed(error!!)
            failure != null && failure !is java.util.concurrent.CancellationException -> Outcome.Failed(AgentPush.failureText(failure))
            opened -> Outcome.Ended
            else -> Outcome.Failed("The live UI channel closed before it opened.")
        }
    }

    /** For the tests: a stream read outside [start]. */
    internal fun markRunning() {
        running = true
    }
}
