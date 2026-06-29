package io.mateu.compose.ui

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.longOrNull

/**
 * The renderers were written against Jackson's `JsonNode`. To keep them unchanged while moving to a
 * multiplatform JSON model, `JsonNode` is aliased to kotlinx.serialization's [JsonElement] and the
 * small slice of the Jackson API the renderers use is reproduced here as extensions.
 */
typealias JsonNode = JsonElement

/** Shared empty node so renderers never have to deal with nullable receivers. */
val EMPTY: JsonElement = JsonNull

// ── Jackson-shaped predicates ──────────────────────────────────────────────────
val JsonElement.isNull: Boolean get() = this is JsonNull
val JsonElement.isMissingNode: Boolean get() = this is JsonNull
val JsonElement.isObject: Boolean get() = this is JsonObject
val JsonElement.isArray: Boolean get() = this is JsonArray
val JsonElement.isTextual: Boolean get() = this is JsonPrimitive && this.isString

/** Child by name, or [JsonNull] when this isn't an object / the key is absent (like Jackson's path). */
fun JsonElement.path(name: String): JsonElement = (this as? JsonObject)?.get(name) ?: JsonNull

fun JsonElement.has(name: String): Boolean = this is JsonObject && containsKey(name)

/** Object entries (empty when not an object) — mirrors Jackson's `fields()`. */
fun JsonElement.fields(): Set<Map.Entry<String, JsonElement>> = (this as? JsonObject)?.entries ?: emptySet()

/** Elements when this is an array, else empty — mirrors Jackson's `toList()` on array nodes.
 *  Returns the [JsonArray] directly (it already IS a `List<JsonElement>`) — must NOT call `.toList()`,
 *  which would resolve back to this same extension and recurse infinitely. */
fun JsonElement.toList(): List<JsonElement> = (this as? JsonArray) ?: emptyList()

// ── Scalar accessors ───────────────────────────────────────────────────────────
fun JsonElement.asText(default: String = ""): String =
    (this as? JsonPrimitive)?.takeIf { it !is JsonNull }?.content ?: default

fun JsonElement.asBoolean(default: Boolean = false): Boolean =
    (this as? JsonPrimitive)?.booleanOrNull ?: default

fun JsonElement.asInt(default: Int = 0): Int =
    (this as? JsonPrimitive)?.intOrNull ?: default

fun JsonElement.asLong(default: Long = 0): Long =
    (this as? JsonPrimitive)?.longOrNull ?: default

fun JsonElement.asDouble(default: Double = 0.0): Double =
    (this as? JsonPrimitive)?.doubleOrNull ?: default

// ── Field convenience accessors (path + typed read) ─────────────────────────────
fun JsonElement.text(name: String, def: String = ""): String = path(name).asText(def)
fun JsonElement.bool(name: String, def: Boolean = false): Boolean = path(name).asBoolean(def)
fun JsonElement.int(name: String, def: Int = 0): Int = path(name).asInt(def)
fun JsonElement.long(name: String, def: Long = 0): Long = path(name).asLong(def)
fun JsonElement.dbl(name: String, def: Double = 0.0): Double = path(name).asDouble(def)
fun JsonElement.arr(name: String): List<JsonElement> = path(name).toList()
fun JsonElement.isObj(name: String): Boolean = path(name) is JsonObject

/** Node value as a plain display string (handles null / status-and-badge objects). */
fun JsonElement.asDisplayString(): String = when (this) {
    is JsonNull -> ""
    is JsonObject -> {
        val msg = this["message"]
        if (msg is JsonPrimitive && msg !is JsonNull) msg.content else text("value", toString())
    }
    is JsonPrimitive -> if (this is JsonNull) "" else content
    else -> ""
}
