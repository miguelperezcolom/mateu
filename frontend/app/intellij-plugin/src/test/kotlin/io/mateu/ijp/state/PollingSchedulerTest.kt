package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Periodic refresh scheduling (mirrors the Redwood `polling:` and RN polling tests). */
class PollingSchedulerTest : TestCase() {

    /** A manual clock: timers only fire when the test advances time. */
    private class FakeTimer : PollingScheduler.PollTimer {
        var now = 0L
        private var seq = 0
        val pending = LinkedHashMap<Int, Pair<Long, () -> Unit>>()
        override fun schedule(delayMillis: Long, fire: () -> Unit): Any {
            val id = ++seq
            pending[id] = (now + delayMillis) to fire
            return id
        }
        override fun cancel(handle: Any) {
            pending.remove(handle as Int)
        }
        fun advance(ms: Long) {
            now += ms
            for ((id, t) in pending.entries.sortedBy { it.value.first }.toList()) {
                if (t.first <= now && pending.containsKey(id)) {
                    pending.remove(id)
                    t.second()
                }
            }
        }
    }

    private val mapper = ObjectMapper()
    private fun json(s: String): JsonNode = mapper.readTree(s)

    private val loop = json(
        """[
          {"type": "OnLoad", "actionId": "refresh", "timeoutMillis": 10000, "background": true},
          {"type": "OnSuccess", "actionId": "refresh", "calledActionId": "refresh", "timeoutMillis": 10000, "background": true}
        ]""",
    )

    private val clock = FakeTimer()
    private val ran = mutableListOf<Pair<String, Boolean>>()
    private var live = true
    private val s = PollingScheduler({ a, bg -> ran += a to bg }, clock, { live })

    fun testTimedOnLoadIsScheduledNotFiredAndFiresOnceAfterTheDelay() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        assertEquals(0, ran.size)
        assertEquals(1, clock.pending.size)
        clock.advance(9999)
        assertEquals(0, ran.size)
        clock.advance(1)
        assertEquals(listOf("refresh" to true), ran)
        clock.advance(60000)
        assertEquals(1, ran.size) // OnLoad is one-shot: the loop needs the OnSuccess
    }

    fun testSuccessOfTheCalledActionSchedulesTheNextRound() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        val gen = s.generation
        clock.advance(10000)
        // the refresh answers a re-render of the SAME screen: must not re-arm the OnLoad
        s.enterScreen("Floors|floors", loop, fresh = false)
        assertEquals(0, clock.pending.size)
        assertEquals(1, s.actionSucceeded(gen, "refresh"))
        assertEquals(1, clock.pending.size)
        clock.advance(10000)
        assertEquals(2, ran.size)
        s.actionSucceeded(gen, "refresh")
        clock.advance(10000)
        assertEquals(3, ran.size)
    }

    fun testSuccessOfAnotherActionSchedulesNothing() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        clock.advance(10000)
        assertEquals(0, s.actionSucceeded(s.generation, "save"))
        assertEquals(0, clock.pending.size)
    }

    fun testActionDispatchedOnAnotherScreenSchedulesNothing() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        val old = s.generation
        s.enterScreen("Orders|orders", json("[]"), fresh = false) // the user moved on
        assertEquals(0, s.actionSucceeded(old, "refresh"))
        assertEquals(0, clock.pending.size)
    }

    fun testNavigatingAwayDropsWhatWasPending() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        s.enterScreen("Orders|orders", json("[]"), fresh = false)
        clock.advance(60000)
        assertEquals(0, ran.size)
    }

    fun testFreshNavigationToTheSameScreenReArmsOnce() {
        s.enterScreen("Floors|floors", loop, fresh = true)
        s.enterScreen("Floors|floors", loop, fresh = true)
        assertEquals(1, clock.pending.size)
        clock.advance(10000)
        assertEquals(1, ran.size)
    }

    fun testStopCancelsAndATimerFiringAnywayIsIgnored() {
        var leaked: (() -> Unit)? = null
        val leaky = object : PollingScheduler.PollTimer {
            override fun schedule(delayMillis: Long, fire: () -> Unit): Any { leaked = fire; return 1 }
            override fun cancel(handle: Any) {}
        }
        val runs = mutableListOf<String>()
        val p = PollingScheduler({ a, _ -> runs += a }, leaky)
        p.enterScreen("Floors|floors", loop, fresh = true)
        p.stop()
        leaked!!()
        assertEquals(0, runs.size)
    }

    fun testUndelayedOnSuccessRunsAtOnceAndUndelayedOnLoadIsLeftToTheCaller() {
        s.enterScreen(
            "X|x",
            json("""[{"type":"OnLoad","actionId":"search"},{"type":"OnSuccess","actionId":"audit","calledActionId":"save"}]"""),
            fresh = true,
        )
        assertEquals(0, clock.pending.size)
        assertEquals(0, ran.size)
        s.actionSucceeded(s.generation, "save")
        assertEquals(listOf("audit" to false), ran)
    }

    fun testConditionIsEvaluatedAtFireTime() {
        val t = json("""[{"type":"OnLoad","actionId":"refresh","timeoutMillis":100,"condition":"state.auto"}]""")
        live = false
        s.enterScreen("X|x", t, fresh = true)
        clock.advance(100)
        assertEquals(0, ran.size)
        live = true
        s.enterScreen("X|x", t, fresh = true)
        clock.advance(100)
        assertEquals(1, ran.size)
    }

    fun testIsTimedOnLoad() {
        assertTrue(PollingScheduler.isTimedOnLoad(json("""{"type":"OnLoad","actionId":"r","timeoutMillis":5}""")))
        assertFalse(PollingScheduler.isTimedOnLoad(json("""{"type":"OnLoad","actionId":"r","timeoutMillis":0}""")))
        assertFalse(PollingScheduler.isTimedOnLoad(json("""{"type":"OnSuccess","actionId":"r","timeoutMillis":5}""")))
    }
}
