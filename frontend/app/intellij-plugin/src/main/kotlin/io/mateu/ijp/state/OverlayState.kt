package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode

/**
 * The state an open overlay renders with — pure, tested headless. A Drawer/Dialog opens with the
 * fragment's state, else its `initialData`; a later state fragment aimed at its id (each progress
 * step of a LongTask's dialog) is MERGED over it; and its header title is interpolated with it
 * (the LongTask dialog's title is `${state.title}`).
 */
object OverlayState {
    fun seed(state: JsonNode?, meta: JsonNode): JsonNode {
        val initialData = meta.path("initialData")
        val base = if (state == null || state.isNull || state.isMissingNode || state.isEmpty) initialData else state
        return if (base.isObject) base.deepCopy<JsonNode>() else JsonNodeFactory.instance.objectNode()
    }

    fun merge(current: JsonNode, update: JsonNode): JsonNode {
        val merged: ObjectNode = if (current.isObject) (current as ObjectNode).deepCopy() else JsonNodeFactory.instance.objectNode()
        if (update.isObject) update.properties().forEach { (k, v) -> merged.set<JsonNode>(k, v) }
        return merged
    }

    fun title(meta: JsonNode, state: JsonNode): String =
        Expressions.interpolate(meta.path("headerTitle").asText(""), mapOf("state" to state))
}
