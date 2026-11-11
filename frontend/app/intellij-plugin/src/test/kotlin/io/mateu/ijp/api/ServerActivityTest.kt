package io.mateu.ijp.api

import junit.framework.TestCase

class ServerActivityTest : TestCase() {
    fun testABusyPeriodIsAnnouncedOnceAndEndsWithItsLastRequest() {
        var started = 0
        val listener = ServerActivity.Listener { started++ }
        ServerActivity.addListener(listener)
        try {
            ServerActivity.track("a") {
                assertTrue(ServerActivity.busy)
                ServerActivity.track("b") { assertTrue(ServerActivity.busy) }
                assertTrue(ServerActivity.busy)
            }
            assertFalse(ServerActivity.busy)
            assertEquals(1, started)
            runCatching { ServerActivity.track("c") { error("down") } }
            assertFalse("a failed request is not pending any more", ServerActivity.busy)
            assertEquals(2, started)
        } finally {
            ServerActivity.removeListener(listener)
        }
    }

    fun testTheLabelNeverCarriesTheQuery() {
        assertEquals("api.example.com/artists", ServerActivity.labelOf("https://api.example.com/artists?name=secret&page=1"))
    }
}
