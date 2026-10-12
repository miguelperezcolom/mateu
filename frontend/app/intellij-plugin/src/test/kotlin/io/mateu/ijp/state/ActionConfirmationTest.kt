package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Same contract as libs/mateu's confirmationTexts and RN's actionConfirmation (e2e bulk-action-buttons). */
class ActionConfirmationTest : TestCase() {

    private val json = ObjectMapper()

    fun testAnActionWithoutConfirmationRunsStraightAway() {
        assertNull(ActionConfirmation.of(json.readTree("""{"id": "save"}""")))
        assertNull(ActionConfirmation.of(json.readTree("""{"id": "save", "confirmationRequired": false, "confirmationTexts": {"title": "x"}}""")))
    }

    fun testTheDeclaredTextsAreWhatTheDialogShows() {
        val t = ActionConfirmation.of(
            json.readTree(
                """{"id": "nested-form-action-target-cancel", "confirmationRequired": true, "confirmationTexts":
                   {"title": "Cancel processes", "message": "This cannot be undone.", "confirmationText": "Cancel them", "denialText": "Keep running"}}""",
            ),
        )
        assertEquals(ConfirmationTexts("Cancel processes", "This cannot be undone.", "Cancel them", "Keep running", false), t)
    }

    fun testEachMissingTextFallsBackOnItsOwnAndADeleteNamesItsOutcome() {
        val t = ActionConfirmation.of(json.readTree("""{"id": "retry", "confirmationRequired": true, "confirmationTexts": {"message": "Retry them?", "title": " "}}"""))!!
        assertEquals("One moment, please", t.header)
        assertEquals("Retry them?", t.message)
        assertEquals("Yes", t.confirmationText)
        val d = ActionConfirmation.of(json.readTree("""{"id": "delete", "confirmationRequired": true, "confirmationTexts": null}"""))!!
        assertEquals(ConfirmationTexts("Delete the selected items?", "This cannot be undone.", "Delete", "Cancel", true), d)
    }
}
