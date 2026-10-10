package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode

/**
 * A ServerSide component carried by a fragment renders against its own `initialData` OVERLAID with
 * the fragment's `state` (UIFragmentDto.state) — that is where the server puts a reflected view's
 * field values. Reading `initialData` alone (as `loadServerSideComponent` did) rendered those
 * fields EMPTY: a contact card showed "Nombre" and "Email" with no values (IJ-05 in
 * design/ux-review/native-findings.md).
 *
 * Returns the component unchanged when there is nothing to merge; otherwise a copy whose
 * `initialData` carries both, the fragment state winning.
 */
internal fun withFragmentState(component: JsonNode, fragmentState: JsonNode): JsonNode {
    if (component.path("type").asText() != "ServerSide") return component
    if (!fragmentState.isObject || fragmentState.isEmpty) return component
    val copy = component.deepCopy<JsonNode>() as? ObjectNode ?: return component
    val merged = copy.objectNode()
    val initialData = component.path("initialData")
    if (initialData.isObject) merged.setAll<ObjectNode>(initialData as ObjectNode)
    merged.setAll<ObjectNode>(fragmentState as ObjectNode)
    copy.set<JsonNode>("initialData", merged)
    return copy
}
