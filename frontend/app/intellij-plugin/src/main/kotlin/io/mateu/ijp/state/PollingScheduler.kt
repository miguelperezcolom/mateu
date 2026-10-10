package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode

/**
 * Periodic refresh (timed triggers) — the plugin port of the web's triggerOnLoad/scheduleOnload +
 * handleBackendSucceeded and of the Redwood shell's poc/polling.mjs (and RN's core/polling.ts).
 *
 * - `OnLoad` with `timeoutMillis > 0` runs its action ONCE after that delay (≤ 0 stays immediate —
 *   that path is the caller's, see [isTimedOnLoad]).
 * - `OnSuccess` runs `actionId` after an action whose id == `calledActionId` succeeded on the SAME
 *   screen (after `timeoutMillis` when > 0, else at once).
 * Together: OnLoad(refresh, 10000) + OnSuccess(refresh after refresh, 10000) = refresh every 10 s.
 *
 * One GENERATION per screen: entering a different screen (or a fresh navigation) bumps it, cancels
 * the pending timers and drops any that fire anyway (the web's callbackToken). A re-render of the
 * SAME screen (what a refresh answers) keeps the generation and does NOT re-arm the timed OnLoads,
 * or every round would add a loop. Pure (no Swing) with an injectable timer, so it is unit-tested.
 */
class PollingScheduler(
    /** Runs a scheduled action; `background` = a silent refresh. */
    private val runner: (actionId: String, background: Boolean) -> Unit,
    private val timer: PollTimer = SwingPollTimer,
    /** Evaluated at FIRE time against the live state (a trigger `condition`). */
    private val conditionHolds: (String) -> Boolean = { true },
) {
    interface PollTimer {
        fun schedule(delayMillis: Long, fire: () -> Unit): Any
        fun cancel(handle: Any)
    }

    /** One-shot Swing timer: fires on the EDT, where AppContext.runAction must run. */
    object SwingPollTimer : PollTimer {
        override fun schedule(delayMillis: Long, fire: () -> Unit): Any =
            javax.swing.Timer(delayMillis.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()) { fire() }
                .apply { isRepeats = false; start() }

        override fun cancel(handle: Any) {
            (handle as? javax.swing.Timer)?.stop()
        }
    }

    var generation = 0
        private set
    private var screenKey: String? = null
    private var triggers: List<JsonNode> = emptyList()
    private val handles = LinkedHashSet<Any>()

    val pendingCount: Int get() = handles.size

    /**
     * A ServerSide component was rendered. A new screen (different key, or `fresh` = it came from a
     * navigation) cancels what was pending and arms its timed OnLoads; the same screen re-rendered
     * by one of its own actions only refreshes the trigger list (OnSuccess re-schedules the loop).
     */
    fun enterScreen(key: String, triggers: JsonNode?, fresh: Boolean) {
        val same = !fresh && screenKey != null && key == screenKey
        this.triggers = if (triggers != null && triggers.isArray) triggers.toList() else emptyList()
        if (same) return
        cancelAll()
        screenKey = key
        for (t in this.triggers) if (isTimedOnLoad(t)) schedule(t, generation)
    }

    /** An action dispatched at [generation] succeeded: schedule its OnSuccess followers. */
    fun actionSucceeded(generation: Int, actionId: String): Int {
        if (generation != this.generation || screenKey == null) return 0
        val next = triggers.filter {
            typeOf(it) == "onsuccess" && it.path("actionId").asText("").isNotBlank() &&
                it.path("calledActionId").asText("") == actionId
        }
        for (t in next) schedule(t, this.generation)
        return next.size
    }

    /** The screen went away (view closed): nothing pending may fire. */
    fun stop() {
        cancelAll()
        screenKey = null
        triggers = emptyList()
    }

    private fun cancelAll() {
        generation++
        for (h in handles) timer.cancel(h)
        handles.clear()
    }

    private fun schedule(t: JsonNode, gen: Int) {
        val fire = {
            if (gen == generation) {
                val condition = t.path("condition").asText("")
                if (condition.isBlank() || conditionHolds(condition)) {
                    runner(t.path("actionId").asText(""), t.path("background").asBoolean(false))
                }
            }
        }
        val ms = timeoutOf(t)
        if (ms <= 0) {
            fire()
            return
        }
        var handle: Any? = null
        handle = timer.schedule(ms) {
            handle?.let { handles.remove(it) }
            fire()
        }
        handles.add(handle)
    }

    companion object {
        private fun typeOf(t: JsonNode) = t.path("type").asText("").lowercase()
        private fun timeoutOf(t: JsonNode) = t.path("timeoutMillis").asLong(0)

        /** An OnLoad trigger the scheduler owns (delayed); the immediate ones keep the caller's path. */
        fun isTimedOnLoad(t: JsonNode): Boolean =
            typeOf(t) == "onload" && t.path("actionId").asText("").isNotBlank() && timeoutOf(t) > 0
    }
}
