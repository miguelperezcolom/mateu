package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/**
 * Compare and merge (wire `RecordMerge`) — the pure model, same rules as the web's
 * `libs/mateu/.../recordMerge.ts`: the picks start from the server's `chosen` (else the first record
 * with a value), a pick is a record id or [CUSTOM] (a typed value), and the merge action receives
 * the component's own `parameters` plus `_merged` (fieldId → value) and `_choices` (fieldId →
 * record id | "custom"). No Swing, so it is unit-testable; `renderRecordMerge` paints it.
 */
object RecordMerges {

    const val CUSTOM = "custom"

    data class Record(val id: String, val label: String, val caption: String?)

    data class Field(
        val fieldId: String,
        val label: String,
        /** One value per record, in the records' order (wire JSON nodes; null = absent). */
        val values: List<JsonNode?>,
        val chosen: String?,
        val editable: Boolean,
        val differs: Boolean,
    )

    fun recordsOf(metadata: JsonNode): List<Record> =
        metadata.arr("records").mapIndexed { i, r ->
            Record(r.text("id").ifBlank { "record$i" }, r.text("label").ifBlank { "Record ${i + 1}" },
                r.text("caption").ifBlank { null })
        }

    fun fieldsOf(metadata: JsonNode): List<Field> {
        val n = recordsOf(metadata).size
        return metadata.arr("fields").map { f ->
            val values = f.path("values").let { v -> (0 until n).map { i -> v.get(i)?.takeIf { !it.isNull } } }
            Field(
                fieldId = f.text("fieldId"),
                label = f.text("label").ifBlank { f.text("fieldId") },
                values = values,
                chosen = f.text("chosen").ifBlank { null },
                editable = f.bool("editable"),
                differs = f.bool("differs"),
            )
        }
    }

    /** A value as the user reads it: text as is, anything else as its JSON. */
    fun valueText(value: JsonNode?): String = when {
        value == null || value.isNull || value.isMissingNode -> ""
        value.isValueNode -> value.asText()
        else -> value.toString()
    }

    /** The picks to begin with. */
    fun initialPicks(records: List<Record>, fields: List<Field>): MutableMap<String, String> {
        val ids = records.map { it.id }
        val picks = LinkedHashMap<String, String>()
        for (field in fields) {
            val chosen = field.chosen?.takeIf { it in ids }
                ?: ids.getOrNull(field.values.indexOfFirst { valueText(it).isNotBlank() }.takeIf { it >= 0 } ?: 0)
            if (chosen != null) picks[field.fieldId] = chosen
        }
        return picks
    }

    /** The value a row ends up with (a JSON node, a typed string, or null). */
    fun mergedValue(records: List<Record>, field: Field, picks: Map<String, String>, custom: Map<String, String>): Any? {
        val pick = picks[field.fieldId]
        if (pick == CUSTOM) return custom[field.fieldId] ?: ""
        val index = records.indexOfFirst { it.id == pick }
        return if (index >= 0) field.values.getOrNull(index) else null
    }

    /** The merge action's parameters: the component's own, `_merged` and `_choices`. */
    fun mergeParameters(
        metadata: JsonNode,
        records: List<Record>,
        fields: List<Field>,
        picks: Map<String, String>,
        custom: Map<String, String>,
        jsonToValue: (JsonNode) -> Any?,
    ): Map<String, Any?> {
        val out = LinkedHashMap<String, Any?>()
        val own = metadata.path("parameters")
        if (own.isObject) own.properties().forEach { (k, v) -> out[k] = jsonToValue(v) }
        val merged = LinkedHashMap<String, Any?>()
        val choices = LinkedHashMap<String, String>()
        for (field in fields) {
            val v = mergedValue(records, field, picks, custom)
            merged[field.fieldId] = if (v is JsonNode) jsonToValue(v) else v
            choices[field.fieldId] = picks[field.fieldId] ?: ""
        }
        out["_merged"] = merged
        out["_choices"] = choices
        return out
    }

    fun visibleFields(fields: List<Field>, differencesOnly: Boolean): List<Field> =
        fields.filter { !differencesOnly || it.differs }

    /** "7 fields: 4 differ; 1 typed by hand". */
    fun summary(fields: List<Field>, picks: Map<String, String>): String {
        val differ = fields.count { it.differs }
        val custom = picks.values.count { it == CUSTOM }
        return "${fields.size} fields: $differ differ; $custom typed by hand"
    }

    /** The accessible name of a pick, as the web: "Use value from Profile 1021 for Email". */
    fun pickName(record: String, field: String) = "Use value from $record for $field"
}
