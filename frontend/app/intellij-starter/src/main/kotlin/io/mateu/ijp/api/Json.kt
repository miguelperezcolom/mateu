package io.mateu.ijp.api

import com.fasterxml.jackson.databind.JsonNode

/**
 * Small Kotlin ergonomics over Jackson [JsonNode] so the renderers read the untyped UIIncrement tree
 * concisely (mirrors the accessor names used by the Compose/JavaFX renderers). Jackson already
 * provides `path`/`has`/`asText`/`isArray`/`isObject`/`isNull`/`isMissingNode`.
 */

fun JsonNode?.text(field: String, def: String = ""): String =
    this?.path(field)?.let { if (it.isNull || it.isMissingNode) def else it.asText(def) } ?: def

fun JsonNode?.bool(field: String, def: Boolean = false): Boolean =
    this?.path(field)?.asBoolean(def) ?: def

fun JsonNode?.int(field: String, def: Int = 0): Int =
    this?.path(field)?.asInt(def) ?: def

fun JsonNode?.long(field: String, def: Long = 0): Long =
    this?.path(field)?.asLong(def) ?: def

fun JsonNode?.dbl(field: String, def: Double = 0.0): Double =
    this?.path(field)?.asDouble(def) ?: def

/** The array child [field] as a Kotlin list (empty when absent/not an array). */
fun JsonNode?.arr(field: String): List<JsonNode> {
    val n = this?.path(field) ?: return emptyList()
    return if (n.isArray) n.toList() else emptyList()
}

/** This node's elements as a list (empty when not an array). */
fun JsonNode?.elements(): List<JsonNode> =
    if (this != null && isArray) toList() else emptyList()

fun JsonNode?.isObj(): Boolean = this != null && isObject

fun JsonNode?.isBlankNode(): Boolean = this == null || isNull || isMissingNode

/** Object node → a plain map of its fields (values kept as JsonNode). */
fun JsonNode?.toFieldMap(): Map<String, Any?> {
    if (this == null || !isObject) return emptyMap()
    val out = LinkedHashMap<String, Any?>()
    fields().forEach { (k, v) -> out[k] = v }
    return out
}

/** Display text for a grid cell / plain value: unwrap `{message}`/`{value}` objects. */
fun JsonNode?.displayString(): String {
    if (this == null || isNull || isMissingNode) return ""
    if (isObject) {
        val msg = path("message")
        if (!msg.isMissingNode && !msg.isNull && msg.isValueNode) return msg.asText("")
        val value = path("value")
        if (!value.isMissingNode && !value.isNull) return value.asText("")
        return toString()
    }
    return asText("")
}
