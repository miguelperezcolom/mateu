package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** App shortcuts, live header values and the idle clock (AppDto E2 fields) — pure logic. */
class AppShellExtrasTest : TestCase() {

    private val mapper = ObjectMapper()

    private val app = mapper.readTree(
        """
        {"type":"App",
         "shortcuts":[
           {"key":"f9","label":"Merge profiles","route":"/e2-demo/merge","code":"MRG"},
           {"key":"alt+s","label":"Sync","actionId":"syncChannels","code":"SYNC"},
           {"label":"nothing to press","route":"/x"}],
         "headerValues":[{"id":"businessDate","label":"Business date","value":"12 Oct 2026"},{"id":"shift","value":"Night"}],
         "liveUpdates":true,
         "idleSession":{"timeoutSeconds":60,"warningSeconds":20,"signOutUrl":"/signed-out","keepAliveActionId":"_keep-alive"}}
        """,
    )

    fun testShortcutsNeedSomethingToPressAndSomewhereToGo() {
        val shortcuts = AppShortcuts.of(app)
        assertEquals(listOf("Merge profiles", "Sync"), shortcuts.map { it.label })
        assertEquals("F9", AppShortcuts.keyStrokeSpec("f9"))
        assertEquals("alt S", AppShortcuts.keyStrokeSpec("alt+s"))
    }

    fun testTheScreenWinsAKeyItAlsoUses() {
        val shortcuts = AppShortcuts.of(app)
        assertEquals(listOf("Sync"), AppShortcuts.bindable(shortcuts, listOf("F9")).map { it.label })
        assertEquals(2, AppShortcuts.bindable(shortcuts, listOf("ctrl+s")).size)
    }

    fun testQuickLaunchByExactCode() {
        val shortcuts = AppShortcuts.of(app)
        assertEquals("/e2-demo/merge", AppShortcuts.quickLaunch(shortcuts, " mrg ")?.route)
        assertNull(AppShortcuts.quickLaunch(shortcuts, "mr"))
        assertEquals("Ctrl+Alt+R", AppShortcuts.keyLabel("ctrl+alt+r"))
    }

    fun testHeaderValuesAndTheirCommands() {
        val values = HeaderValues.of(app)
        assertEquals("Business date: 12 Oct 2026", HeaderValues.display(values[0]))
        assertEquals("Night", HeaderValues.display(values[1]))
        val increment = mapper.readTree(
            """{"commands":[{"type":"UpdateHeaderValue","data":{"id":"businessDate","value":"13 Oct 2026"}},{"type":"NavigateTo","data":"/x"}]}""",
        )
        assertEquals(listOf("businessDate" to "13 Oct 2026"), HeaderValues.changesOf(increment))
        assertEquals(1_000L, HeaderValues.reconnectDelayMillis(0))
        assertEquals(8_000L, HeaderValues.reconnectDelayMillis(3))
        assertEquals(60_000L, HeaderValues.reconnectDelayMillis(30))
    }

    fun testTheSessionKeepsLabelsWhenAValueChanges() {
        val session = AppSession("http://127.0.0.1:9")
        session.seedHeaderValues(HeaderValues.of(app))
        val changed = ArrayList<String?>()
        session.onHeaderValuesChanged { changed.add(it) }
        session.updateHeaderValue("businessDate", "13 Oct 2026")
        session.updateHeaderValue("businessDate", "13 Oct 2026") // same value: nothing
        assertEquals(listOf<String?>("businessDate"), changed)
        assertEquals("Business date", session.headerValues["businessDate"]?.label)
        session.dispose()
    }

    fun testTheIdleClock() {
        val config = IdleClock.of(app)!!
        assertEquals("_keep-alive", config.keepAliveActionId)
        assertEquals(IdleClock.Phase.ACTIVE to 30, IdleClock.phase(30_000, 0, config))
        assertEquals(IdleClock.Phase.WARNING to 15, IdleClock.phase(45_000, 0, config))
        assertEquals(IdleClock.Phase.EXPIRED to 0, IdleClock.phase(60_000, 0, config))
        assertNull(IdleClock.of(mapper.readTree("""{"type":"App"}""")))
    }
}
