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
)

object ToolbarSpecs {
    /** The wire buttons a native host toolbar shows; [params] turns a `parameters` node into a map. */
    fun of(buttons: List<JsonNode>, params: (JsonNode) -> Map<String, Any?>): List<ToolbarSpec> =
        buttons.mapNotNull { b ->
            val actionId = b.text("actionId", b.text("id"))
            // "Back to list" (cancel-view) is pointless in the IDE: the listing stays visible in
            // its own tool window while the detail lives in an editor tab.
            if (actionId.isBlank() || actionId == "cancel-view") null else ToolbarSpec(
                actionId = actionId,
                label = b.text("label", actionId),
                disabled = b.bool("disabled"),
                primary = b.text("buttonStyle").equals("Primary", ignoreCase = true),
                parameters = params(b.path("parameters")),
            )
        }
}
