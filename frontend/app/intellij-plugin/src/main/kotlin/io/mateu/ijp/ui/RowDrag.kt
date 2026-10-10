package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper

/**
 * Pure model of dragging listing rows onto a DropZone (wire `Crud.dragType` — Java `@DragRows` —
 * and `DropZone`): the transfer payload (the drag type + the dragged rows' ids), its string
 * encoding for the Swing Transferable, the zone's accept check and the drop's action parameters
 * (the zone's `parameters` + `_draggedIds` + `_dragType`, exactly what a web drop sends).
 *
 * Side-effect-free, so it is unit-tested (RowDragTest) independently of the JTable TransferHandler
 * and the drop-zone panel that use it.
 */
object RowDrag {

    data class Payload(val type: String, val ids: List<String>)

    /** The MIME type of the in-JVM flavor the payload travels under (deliberately NOT a text
     *  flavor, so a dragged row is never pasted into an editor as text). */
    const val MIME = "application/x-mateu-rows;class=java.lang.String"

    private const val PREFIX = "mateu-rows:"
    private val mapper = ObjectMapper()

    /** `mateu-rows:<json {type, ids}>`. */
    fun encode(payload: Payload): String =
        PREFIX + mapper.writeValueAsString(mapOf("type" to payload.type, "ids" to payload.ids))

    /** The payload of an encoded string; null for anything that is not one (or has no type). */
    fun decode(encoded: String?): Payload? {
        if (encoded == null || !encoded.startsWith(PREFIX)) return null
        val node = runCatching { mapper.readTree(encoded.substring(PREFIX.length)) }.getOrNull() ?: return null
        val type = node.path("type").asText("")
        if (type.isBlank()) return null
        val ids = node.path("ids").takeIf { it.isArray }?.map { it.asText("") }?.filter { it.isNotEmpty() } ?: emptyList()
        return Payload(type, ids)
    }

    /** The id of a listing row: the first of id / _id / key / uuid present. */
    fun rowId(row: JsonNode?): String {
        if (row == null) return ""
        for (f in listOf("id", "_id", "key", "uuid")) {
            val v = row.get(f)
            if (v != null && !v.isNull && !v.isMissingNode) return v.asText("")
        }
        return ""
    }

    /** The payload of dragging [rows] of a listing with [dragType]; null when the listing is not
     *  draggable or none of the rows has an id. */
    fun payloadOf(dragType: String?, rows: List<JsonNode>): Payload? {
        if (dragType.isNullOrBlank()) return null
        val ids = rows.map(::rowId).filter { it.isNotEmpty() }
        return if (ids.isEmpty()) null else Payload(dragType, ids)
    }

    /** Whether a zone accepting [accept] with action [actionId] takes [payload]. */
    fun accepts(accept: String?, actionId: String?, payload: Payload?): Boolean =
        payload != null && !accept.isNullOrBlank() && accept == payload.type && !actionId.isNullOrBlank()

    /** The drop's action parameters: the zone's parameters + `_draggedIds` + `_dragType`. */
    fun dropParameters(zoneParameters: Map<String, Any?>, payload: Payload): Map<String, Any?> =
        LinkedHashMap(zoneParameters).apply {
            put("_draggedIds", payload.ids.toList())
            put("_dragType", payload.type)
        }
}
