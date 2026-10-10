package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.text

/**
 * App-shell FLOWS (`actions:` with `steps:` on a `type: AppShell`, or `AppShell.actions` in code).
 * The wire App carries every declared action with its steps already lowered to `commands`; a menu
 * leaf whose `RunAction` rule names one runs those commands in the plugin, with no server
 * round-trip. An id the shell does not declare (or declares without steps) is dispatched to the
 * server as before.
 *
 * Pure: it only decides WHAT to do; [AppSession.openMenuEntry] performs the effects. Mirrors the
 * web's libs/mateu `shellFlows.ts` and the RN `core/shellFlows.ts`.
 */
object ShellFlows {

    sealed interface Effect {
        /** In-app navigation to a mount-relative route, like a menu route click. */
        data class Navigate(val route: String) : Effect
        /** A URL (scheme or //host): leaves the app (the system browser). */
        data class Url(val url: String) : Effect
        /** An app-level action dispatched to the server. */
        data class RunAction(val actionId: String) : Effect
        /** A named event on the app event bus. */
        data class Event(val eventName: String, val payload: JsonNode?) : Effect
        /** Close the top overlay, optionally emitting the event it carries. */
        data class CloseOverlay(val eventName: String?, val payload: JsonNode?) : Effect
    }

    /** Whether the menu leaf RUNS rules instead of navigating (a RuleLink). */
    fun isRuleLeaf(item: JsonNode?): Boolean {
        val rules = item?.path("rules") ?: return false
        return rules.isArray && !rules.isEmpty
    }

    /** The ids named by the leaf's RunAction rules, in order. */
    fun ruleActionIds(item: JsonNode?): List<String> {
        val rules = item?.path("rules") ?: return emptyList()
        if (!rules.isArray) return emptyList()
        return rules.filter { it.text("action") == "RunAction" && it.text("actionId").isNotBlank() }
            .map { it.text("actionId") }
    }

    /** The lowered commands of a declared shell flow, or null when the shell declares none. */
    fun flowFor(actions: JsonNode?, actionId: String): JsonNode? {
        if (actions == null || !actions.isArray) return null
        val action = actions.firstOrNull { it.text("id") == actionId } ?: return null
        val commands = action.path("commands")
        return if (commands.isArray && !commands.isEmpty) commands else null
    }

    /** A Navigate destination that is a route of the app (no scheme, no host), without leading slash. */
    fun inAppRoute(destination: String): String? {
        val d = destination.trim()
        if (d.startsWith("//")) return null
        if (Regex("^[a-zA-Z][a-zA-Z0-9+.-]*:").containsMatchIn(d)) return null
        return d.trimStart('/')
    }

    private fun payloadOf(data: JsonNode): JsonNode? {
        val p = if (data.has("payload")) data.path("payload") else data.path("detail")
        return if (p.isMissingNode || p.isNull) null else p
    }

    /** What clicking a rule leaf does, given the shell's declared actions (`App.actions`). */
    fun effects(item: JsonNode, actions: JsonNode?): List<Effect> {
        val out = ArrayList<Effect>()
        for (actionId in ruleActionIds(item)) {
            val commands = flowFor(actions, actionId)
            if (commands == null) {
                out.add(Effect.RunAction(actionId))
                continue
            }
            for (command in commands) {
                val data = command.path("data")
                when (command.text("type")) {
                    "NavigateTo" -> {
                        val destination = if (data.isTextual) data.asText() else data.text("href")
                        if (destination.isBlank()) continue
                        val route = inAppRoute(destination)
                        out.add(if (route != null) Effect.Navigate(route) else Effect.Url(destination))
                    }
                    "RunAction" -> data.text("actionId").takeIf { it.isNotBlank() }?.let { out.add(Effect.RunAction(it)) }
                    "DispatchEvent" -> data.text("eventName").takeIf { it.isNotBlank() }
                        ?.let { out.add(Effect.Event(it, payloadOf(data))) }
                    "CloseModal" -> out.add(
                        Effect.CloseOverlay(data.text("eventName").ifBlank { null }, if (data.isObject) payloadOf(data) else null),
                    )
                    // MarkAsClean / MarkAsDirty: the dirty flag lives on each view's context; the
                    // shell opens a fresh view, so at app scope there is nothing to mark.
                    else -> {}
                }
            }
        }
        return out
    }
}
