package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

/** Same contract as libs/mateu's presence.ts and RN's core/presence.ts. */
class PresenceTest : TestCase() {

    private val json = ObjectMapper()

    fun testReadsThePresenceChangedCommandsOfAnIncrement() {
        val increment = json.readTree(
            """{"commands":[{"type":"UpdateHeaderValue","data":{}},
               {"type":"PresenceChanged","data":{"key":"orders/7|V","entries":[{"name":"ana","editing":true,"since":"t"}]}}]}""",
        )
        assertEquals(listOf(Presence.Change("orders/7|V", listOf(Presence.Entry("ana", true, "t")))), Presence.changesOf(increment))
        assertEquals(emptyList<Presence.Change>(), Presence.changesOf(null))
    }

    fun testARecordViewIsTwoSegmentsOrAViewThatEditsNeverACreatePage() {
        assertEquals("orders/7", Presence.routeOf("/app/orders/7?x=1", "/app"))
        assertTrue(Presence.isRecordRoute("orders/7/edit"))
        assertFalse(Presence.isRecordRoute("orders/new"))
        assertFalse(Presence.isRecordRoute("dashboard"))
        assertTrue(Presence.isRecordRoute("profile", edits = true))
    }

    fun testEditorsFirstOnAWarningAndWhoStartsEditing() {
        assertNull(Presence.summary(emptyList()))
        val s = Presence.summary(listOf(Presence.Entry("Bob", false), Presence.Entry("Ana", true)))!!
        assertTrue(s.warning)
        assertEquals("Ana is editing this record · Bob is viewing it", s.text)
        assertEquals(listOf("Ana"), Presence.newEditors(listOf(Presence.Entry("Ana", false)), listOf(Presence.Entry("Ana", true))))
    }

    fun testTheHubReportsSharesAWatchAndLeaves() {
        val sent = CopyOnWriteArrayList<Map<String, Any?>>()
        val answer: JsonNode = json.readTree("""{"commands":[{"type":"PresenceChanged","data":{"key":"orders/7|V","entries":[{"name":"bob","editing":false}]}}]}""")
        val hub = PresenceHub { p -> sent.add(p); answer }
        assertNull(hub.watch("dashboard", "V", false, { false }) {})
        hub.configure(true)
        val heard = AtomicReference<List<Presence.Entry>>()
        val first = hub.watch("orders/7", "V", false, { false }) { heard.set(it) }!!
        waitFor { heard.get() != null }
        assertEquals("viewing", sent.first()["state"])
        hub.apply(Presence.Change("orders/7|V", listOf(Presence.Entry("bob", true))))
        assertTrue(heard.get().single().editing)
        // a re-rendered header takes the record again before the old one lets go: no leave
        val second = hub.watch("orders/7", "V", false, { true }) {}!!
        first.stop()
        Thread.sleep(PresenceHub.LEAVE_GRACE_MILLIS + 300)
        assertTrue(sent.none { it["state"] == "leave" })
        second.stop()
        waitFor { sent.any { it["state"] == "leave" } }
        hub.dispose()
    }

    private fun waitFor(condition: () -> Boolean) {
        val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
        while (!condition() && System.nanoTime() < deadline) Thread.sleep(20)
        assertTrue("condition met in time", condition())
    }
}
