package io.mateu.ijp.state

import junit.framework.TestCase

/** The leave rule shared with the web (leaveActions.ts), Redwood (isLeaveAction) and RN. */
class LeaveActionsTest : TestCase() {

    fun testTheLeaveActionsAreTheWebRule() {
        for (id in listOf("cancel", "cancel-new", "cancel-create", "cancel-edit", "cancel-view", "back", "backToList")) {
            assertTrue(id, LeaveActions.isLeaveAction(id))
        }
        for (id in listOf("cancelBooking", "save", "delete", "", null)) {
            assertFalse(id.toString(), LeaveActions.isLeaveAction(id))
        }
    }

    fun testAWizardsBackIsAStepItsCancelStillLeaves() {
        val wizard = listOf("next", "back", "cancel")
        assertFalse(LeaveActions.isLeaveAction("back", wizard))
        assertTrue(LeaveActions.isLeaveAction("cancel", wizard))
        assertTrue(LeaveActions.isLeaveAction("back", listOf("save", "back")))
    }
}
