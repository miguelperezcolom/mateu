package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode

/**
 * What an action's confirmation asks (`@Action(confirmationRequired)` + `confirmationTexts`) — the
 * port of libs/mateu's `confirmationTexts.ts` (and RN's `actionConfirmation.ts`): each declared
 * text wins on its OWN, the rest fall back on the generic wording, and a delete names its outcome
 * instead of a bare "Yes / No". Pure.
 */
data class ConfirmationTexts(
    val header: String,
    val message: String,
    val confirmationText: String,
    val denialText: String,
    val destructive: Boolean,
)

object ActionConfirmation {
    private val GENERIC = ConfirmationTexts("One moment, please", "Are you sure?", "Yes", "No", false)
    private val GENERIC_DELETE = ConfirmationTexts("Delete the selected items?", "This cannot be undone.", "Delete", "Cancel", true)

    fun isDeleteAction(actionId: String?): Boolean =
        actionId == "delete" || actionId == "action-on-row-delete" || actionId == "deleteSelected"

    /** The dialog texts when the action asks for confirmation, null when it runs straight away. */
    fun of(action: JsonNode?): ConfirmationTexts? {
        if (action == null || !action.path("confirmationRequired").asBoolean(false)) return null
        val fallback = if (isDeleteAction(action.path("id").asText(null))) GENERIC_DELETE else GENERIC
        val texts = action.path("confirmationTexts")
        fun declared(key: String, fb: String): String {
            val t = texts.path(key)
            return if (t.isTextual && t.asText().isNotBlank()) t.asText() else fb
        }
        return ConfirmationTexts(
            header = declared("title", fallback.header),
            message = declared("message", fallback.message),
            confirmationText = declared("confirmationText", fallback.confirmationText),
            denialText = declared("denialText", fallback.denialText),
            destructive = fallback.destructive,
        )
    }
}
