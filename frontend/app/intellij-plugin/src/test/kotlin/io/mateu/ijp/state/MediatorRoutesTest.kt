package io.mateu.ijp.state

import junit.framework.TestCase

/** Same cases as React Native's mediatorMove (uxRules.test.ts), against the Java SUT's answers. */
class MediatorRoutesTest : TestCase() {

    fun testTheListingAnswersToBothOfItsNames() {
        // /bulk-actions: seeded with "" and its delete answers "/list" — same screen
        assertTrue(MediatorRoutes.stays("", "/list"))
        assertTrue(MediatorRoutes.stays("list", "/list"))
        assertTrue(MediatorRoutes.stays("list", ""))
    }

    fun testARecordRouteAndAnUnseededViewDoNotStay() {
        assertFalse(MediatorRoutes.stays("list", "/1"))
        assertFalse(MediatorRoutes.stays(null, "/list"))
        assertFalse(MediatorRoutes.stays("1", "/1/edit"))
        assertTrue(MediatorRoutes.stays("1", "/1"))
    }
}
