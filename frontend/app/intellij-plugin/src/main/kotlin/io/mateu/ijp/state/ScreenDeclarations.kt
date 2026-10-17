package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/**
 * What the loaded server-side component declares about itself: its action ids and per-action
 * flags (validation, bubbling, row selection, confirmation, streaming, client-run REST), its full
 * wire actions, its validations and its client rules. Captured on every component (re)load by
 * [AppContext.captureComponentContext]; pure, so the guards and routing decisions taken on it are
 * testable without Swing.
 */
class ScreenDeclarations private constructor(
    /** Action ids the component declares (for action bubbling); a trailing `*` is a prefix. */
    val actionIds: List<String>,
    private val validationRequired: Map<String, Boolean>,
    private val bubble: Map<String, Boolean>,
    private val rowsSelectedRequired: Map<String, Boolean>,
    private val confirmations: Map<String, ConfirmationTexts>,
    /** Actions answered as a STREAM of increments (`ActionDto.sse` — a LongTask). */
    private val streamed: Set<String>,
    /** @RestAction/@RestData: actions whose descriptor makes the client fetch an external REST
     *  endpoint instead of dispatching to the Mateu server (keyed by action id). */
    private val restActions: Map<String, JsonNode>,
    /** The component's full wire actions: the OWNER of an id, before the catalogue. */
    val actionDefs: JsonNode?,
    private val validations: JsonNode?,
    /** Client-side rules of the component (RuleMapper wire shape); null when it has none. */
    val rules: JsonNode?,
) {
    fun owns(actionId: String?): Boolean {
        if (actionId == null) return false
        for (owned in actionIds) {
            if (owned == actionId) return true
            if (owned.endsWith("*") && actionId.startsWith(owned.dropLast(1))) return true
        }
        return false
    }

    /** An action the component does not own, or flagged `bubble`, goes up to its owner. */
    fun bubbles(actionId: String): Boolean = !owns(actionId) || bubble[actionId] == true

    /**
     * Actions flagged validationRequired only fire if every validation condition holds. Unowned
     * SUBMIT actions bubble to the crud mediator, whose flags we never see (the plugin loads the
     * inner view directly) — the mediator's validating set is stable framework knowledge
     * (CrudActionsBuilder: create / create-and-stay / save), so they validate here too.
     */
    fun requiresValidation(actionId: String): Boolean =
        validationRequired[actionId] == true || (!owns(actionId) && actionId in BUBBLED_SUBMIT_ACTIONS)

    /** Bulk actions (ActionDto.rowsSelectedRequired). */
    fun requiresRowSelection(actionId: String): Boolean = rowsSelectedRequired[actionId] == true

    fun confirmation(actionId: String): ConfirmationTexts? = confirmations[actionId]

    fun isStreamed(actionId: String): Boolean = actionId in streamed

    fun restAction(actionId: String): JsonNode? = restActions[actionId]

    /** The validation errors of [state] (fieldId → message, first failing validation per field). */
    fun fieldErrors(state: Map<String, Any?>, appState: Map<String, Any?>): Map<String, String> {
        val errors = LinkedHashMap<String, String>()
        val validations = validations ?: return errors
        if (!validations.isArray) return errors
        for (v in validations) {
            val condition = v.text("condition")
            if (condition.isNotBlank() && !Conditions.holds(condition, state, appState)) {
                val fieldId = v.text("fieldId")
                val message = v.text("message", "Invalid value")
                errors.putIfAbsent(fieldId, message)
            }
        }
        return errors
    }

    companion object {
        /** Crud-mediator submits (validationRequired there — see CrudActionsBuilder). */
        private val BUBBLED_SUBMIT_ACTIONS = setOf("create", "create-and-stay", "save", "update")

        /** Before any component loaded. */
        val NONE = ScreenDeclarations(emptyList(), emptyMap(), emptyMap(), emptyMap(), emptyMap(), emptySet(), emptyMap(), null, null, null)

        fun of(sscNode: JsonNode): ScreenDeclarations {
            val actions = ArrayList<String>()
            val validationFlags = HashMap<String, Boolean>()
            val bubbleFlags = HashMap<String, Boolean>()
            val rowsSelectedFlags = HashMap<String, Boolean>()
            val confirmations = HashMap<String, ConfirmationTexts>()
            val sseActions = HashSet<String>()
            val restData = HashMap<String, JsonNode>()
            val actionNodes = sscNode.path("actions")
            if (actionNodes.isArray) {
                for (a in actionNodes) {
                    val id = a.text("id")
                    if (id.isNotBlank()) {
                        actions.add(id)
                        validationFlags[id] = a.bool("validationRequired")
                        bubbleFlags[id] = a.bool("bubble")
                        rowsSelectedFlags[id] = a.bool("rowsSelectedRequired")
                        ActionConfirmation.of(a)?.let { confirmations[id] = it }
                        if (a.bool("sse")) sseActions.add(id)
                        val rest = a.path("restAction")
                        if (rest.isObject) restData[id] = rest
                    }
                }
            }
            return ScreenDeclarations(
                actionIds = actions,
                validationRequired = validationFlags,
                bubble = bubbleFlags,
                rowsSelectedRequired = rowsSelectedFlags,
                confirmations = confirmations,
                streamed = sseActions,
                restActions = restData,
                actionDefs = actionNodes.takeIf { it.isArray },
                validations = sscNode.path("validations"),
                rules = sscNode.path("rules").takeIf { it.isArray && it.size() > 0 },
            )
        }
    }
}

/**
 * Where an action is sent: the current view's own server-side type, or — when the action bubbles
 * — the crud orchestrator owning the area (while the view is under its component route), else the
 * type the view was NAVIGATED with (a crud detail's orchestrator), like the web's DOM bubbling up
 * to the mediator's component.
 */
object ActionTargets {
    fun of(
        bubbles: Boolean,
        currentServerSideType: String,
        currentRoute: String,
        orchestratorServerSideType: String,
        orchestratorComponentRoute: String,
        navigationServerSideType: String,
    ): String {
        if (bubbles &&
            orchestratorServerSideType.isNotBlank() &&
            orchestratorServerSideType != currentServerSideType &&
            currentRoute.startsWith(orchestratorComponentRoute)
        ) {
            return orchestratorServerSideType
        }
        // Unowned action on an inner view (e.g. "edit" on a crud detail whose ServerSide is the
        // entity view): bubble to the sst the view was navigated with (the crud orchestrator).
        if (bubbles && navigationServerSideType.isNotBlank() && navigationServerSideType != currentServerSideType) {
            return navigationServerSideType
        }
        return currentServerSideType
    }
}
