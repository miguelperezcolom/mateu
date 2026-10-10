package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * The badge type of a status cell — the plugin twin of libs/mateu statusColumnRenderer.toStatus.
 * A Mateu backend sends `{type, message}` (its type is used as is); a REST API sends a plain word.
 * For a plain word, a declared tone for the VALUE (a field type's `tones: {OPEN: warning}`, carried
 * on GridColumn.tones) wins; otherwise the word's usual meaning (`AVAILABLE` → success …) decides.
 * Returns `SUCCESS | WARNING | DANGER | INFO | NONE` (or the object's own type).
 */
object StatusTones {

    private val SUCCESS_WORDS = setOf(
        "AVAILABLE", "ACTIVE", "RUNNING", "SUCCEEDED", "SUCCESS", "OK", "ENABLED",
        "READY", "HEALTHY", "COMPLETED", "DONE", "ATTACHED", "UP",
    )
    private val WARNING_WORDS = setOf(
        "PROVISIONING", "UPDATING", "PENDING", "STARTING", "STOPPING",
        "IN_PROGRESS", "TERMINATING", "DELETING", "CREATING", "MOVING", "WAITING", "ACCEPTED", "WARNING",
        "DEGRADED", "RESTORING", "SCALING",
    )
    private val DANGER_WORDS = setOf(
        "FAILED", "TERMINATED", "ERROR", "DELETED", "STOPPED", "DISABLED",
        "UNHEALTHY", "DOWN", "CANCELED", "CANCELLED", "REJECTED", "INACTIVE",
    )

    /** A tone name (`success | warning | danger | error | info | neutral`) as a status type. */
    fun typeOfTone(tone: String?): String? = when (tone?.trim()?.lowercase()) {
        "success" -> "SUCCESS"
        "warning" -> "WARNING"
        "danger", "error" -> "DANGER"
        "info" -> "INFO"
        "neutral", "none" -> "NONE"
        else -> null
    }

    /** The column's `tones` map (value → tone) off its metadata; empty when absent. */
    fun tonesOf(columnMetadata: JsonNode?): Map<String, String> {
        val t = columnMetadata?.get("tones") ?: return emptyMap()
        if (!t.isObject) return emptyMap()
        return t.properties().associate { (k, v) -> k to v.asText("") }
    }

    /** The badge type for a status cell's value. */
    fun statusType(value: JsonNode?, tones: Map<String, String> = emptyMap()): String {
        if (value == null || value.isNull || value.isMissingNode) return "NONE"
        if (value.isObject) return value.path("type").asText("")
        val message = value.asText("")
        val declared = tones[message] ?: tones[message.trim().uppercase()]
        typeOfTone(declared)?.let { return it }
        val word = message.trim().uppercase().replace(Regex("[\\s-]+"), "_")
        return when (word) {
            in SUCCESS_WORDS -> "SUCCESS"
            in WARNING_WORDS -> "WARNING"
            in DANGER_WORDS -> "DANGER"
            else -> "NONE"
        }
    }
}
