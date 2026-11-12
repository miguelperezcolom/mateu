package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/** A toolbar button published to a native host toolbar (editor header / tool window title). */
data class ToolbarSpec(
    val actionId: String,
    val label: String,
    val disabled: Boolean,
    val primary: Boolean,
    val parameters: Map<String, Any?> = emptyMap(),
    /** A RouteLink button's route: pressing it NAVIGATES there (see [AppContext.pressButton]). */
    val route: String = "",
)

object ToolbarSpecs {
    /** The wire buttons a native host toolbar shows; [params] turns a `parameters` node into a map. */
    fun of(buttons: List<JsonNode>, params: (JsonNode) -> Map<String, Any?>): List<ToolbarSpec> =
        buttons.flatMap(::membersOf).mapNotNull { b ->
            val actionId = b.text("actionId", b.text("id"))
            val route = b.text("route")
            // "Back to list" (cancel-view) is pointless in the IDE: the listing stays visible in
            // its own tool window while the detail lives in an editor tab.
            if ((actionId.isBlank() && route.isBlank()) || actionId == "cancel-view") null else ToolbarSpec(
                actionId = actionId,
                label = b.text("label", actionId),
                disabled = b.bool("disabled"),
                primary = b.text("buttonStyle").equals("Primary", ignoreCase = true),
                parameters = params(b.path("parameters")),
                route = route,
            )
        }

    /**
     * A toolbar entry as the native toolbar's actions: a dropdown group (a Button with `children`
     * and no action) stands for its buttons, a SPLIT button (`split`) for its primary then the rest
     * — the host toolbar folds what does not fit into its own overflow; any other button for itself.
     */
    fun membersOf(b: JsonNode): List<JsonNode> {
        val kids = b.path("children").takeIf { it.isArray }?.filter { it.isObject }.orEmpty()
        if (kids.isEmpty()) return listOf(b)
        if (b.bool("split")) {
            val primary = (b.deepCopy<JsonNode>() as com.fasterxml.jackson.databind.node.ObjectNode).apply { remove("children"); remove("split") }
            return listOf(primary) + kids
        }
        return if (b.text("actionId").isBlank()) kids else listOf(b)
    }
}
