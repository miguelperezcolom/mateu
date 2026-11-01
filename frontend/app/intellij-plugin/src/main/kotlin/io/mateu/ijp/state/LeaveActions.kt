package io.mateu.ijp.state

/**
 * The actions that LEAVE the screen without saving — the same rule as the web renderer's libs/mateu
 * `leaveActions.ts`, Redwood's `isLeaveAction` and React Native's `core/leaveActions.ts` (keep them
 * in step): `cancel`, any `cancel-…` (the crud's cancel-new / cancel-create / cancel-edit /
 * cancel-view), `back` and `backToList`. A business action called `cancelBooking` does not leave; a
 * wizard's `back` (its owner advertises `next`) steps inside the same screen and keeps what was typed.
 *
 * The plugin used to guard only cancel-edit / cancel-view / cancel: a crud's New form lost what was
 * typed on Cancel (cancel-new) or Back without asking.
 */
object LeaveActions {

    val WIZARD_STEP_ACTIONS = setOf("next", "back", "skip", "goToStep")

    fun isWizardStepAction(actionId: String, ownerActionIds: Collection<String>): Boolean =
        actionId in WIZARD_STEP_ACTIONS && "next" in ownerActionIds

    fun isLeaveAction(actionId: String?, ownerActionIds: Collection<String> = emptyList()): Boolean {
        if (actionId.isNullOrEmpty()) return false
        if (isWizardStepAction(actionId, ownerActionIds)) return false
        return actionId == "cancel" || actionId.startsWith("cancel-") || actionId == "back" || actionId == "backToList"
    }
}
