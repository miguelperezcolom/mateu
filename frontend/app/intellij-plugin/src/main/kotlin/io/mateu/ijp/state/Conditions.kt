package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode

/**
 * A validation / trigger condition evaluated against the live state: the expression parser first,
 * and the legacy `state['x'] <op> number` / `state['x']` matcher as the safety net for syntax the
 * parser doesn't cover. An unrecognised condition holds.
 */
object Conditions {
    private val COMPARISON: java.util.regex.Pattern =
        java.util.regex.Pattern.compile("state\\['([^']+)'\\]\\s*(>=|<=|==|!=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)")
    private val TRUTHY: java.util.regex.Pattern =
        java.util.regex.Pattern.compile("state\\['([^']+)'\\]")

    fun holds(condition: String, state: Map<String, Any?>, appState: Map<String, Any?>): Boolean {
        try {
            return Expressions.truthy(Expressions.evaluate(condition, mapOf("state" to state, "appState" to appState)))
        } catch (e: Exception) {
            // legacy regex matcher as the safety net for syntax the parser doesn't cover
        }
        return legacyHolds(condition, state)
    }

    /** The pre-parser matcher, on its own (what [holds] falls back to when the parser throws). */
    internal fun legacyHolds(condition: String, state: Map<String, Any?>): Boolean {
        val cond = condition.trim()
        val c = COMPARISON.matcher(cond)
        if (c.matches()) {
            val left = toDouble(state[c.group(1)])
            val right = c.group(3).toDouble()
            return when (c.group(2)) {
                ">=" -> left >= right
                "<=" -> left <= right
                ">" -> left > right
                "<" -> left < right
                "==" -> left == right
                "!=" -> left != right
                else -> true
            }
        }
        val t = TRUTHY.matcher(cond)
        if (t.matches()) return truthy(state[t.group(1)])
        return true
    }

    internal fun truthy(v: Any?): Boolean = when (v) {
        null -> false
        is JsonNode -> when {
            v.isNull || v.isMissingNode -> false
            v.isTextual -> v.asText().isNotBlank()
            v.isNumber -> v.asDouble() != 0.0
            v.isBoolean -> v.asBoolean()
            else -> !v.isEmpty
        }
        is String -> v.isNotBlank()
        is Number -> v.toDouble() != 0.0
        is Boolean -> v
        else -> true
    }

    internal fun toDouble(v: Any?): Double = try {
        when (v) {
            is JsonNode -> if (v.isNumber) v.asDouble() else if (v.isTextual) v.asText().toDouble() else 0.0
            is Number -> v.toDouble()
            is String -> v.toDouble()
            else -> 0.0
        }
    } catch (e: NumberFormatException) {
        0.0
    }
}
