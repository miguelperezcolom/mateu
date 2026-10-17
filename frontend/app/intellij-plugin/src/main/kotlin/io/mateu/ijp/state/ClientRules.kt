package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.text

/**
 * Applies a component's client rules (RuleMapper wire shape) to the live state — same semantics as
 * the web's applyRules, minus the DOM-bound actions (RunJS / SetCssClass / SetStyle).
 */
object ClientRules {
    /**
     * Mutates [state] (SetStateValue / SetDataValue) and [fieldAttributes] (SetAttributeValue),
     * runs RunAction rules through [runAction], and returns true when a value or attribute changed
     * and the form should re-render.
     */
    fun apply(
        rules: JsonNode,
        state: MutableMap<String, Any?>,
        appState: Map<String, Any?>,
        fieldAttributes: MutableMap<String, MutableMap<String, Any?>>,
        runAction: (String) -> Unit,
    ): Boolean {
        val ctx = mapOf<String, Any?>(
            "state" to state,
            "data" to null,
            "appState" to appState,
            "appData" to emptyMap<String, Any?>(),
        )
        var changed = false
        for (rule in rules) {
            val filter = rule.text("filter")
            val matches = if (filter.isBlank()) true else try {
                Expressions.truthy(Expressions.evaluate(filter, ctx))
            } catch (e: Exception) {
                false
            }
            if (!matches) continue
            fun value(): Any? {
                val expression = rule.text("expression")
                if (expression.isNotBlank()) {
                    try {
                        return Expressions.evaluate(expression, ctx)
                    } catch (e: Exception) { /* fall through to the literal */ }
                }
                val v = rule.path("value")
                return when {
                    v.isMissingNode || v.isNull -> null
                    v.isNumber -> v.asDouble()
                    v.isBoolean -> v.asBoolean()
                    v.isTextual -> v.asText()
                    else -> v
                }
            }
            when (rule.text("action")) {
                "SetStateValue", "SetDataValue" -> {
                    for (fieldName in rule.text("fieldName").split(',')) {
                        val attr = rule.text("fieldAttribute")
                        val key = if (attr.isBlank() || attr == "none") fieldName else "$fieldName.$attr"
                        val v = value()
                        if (state[key] != v) {
                            state[key] = v
                            changed = true
                        }
                    }
                }
                "SetAttributeValue" -> {
                    for (fieldName in rule.text("fieldName").split(',')) {
                        val attr = rule.text("fieldAttribute")
                        if (attr.isBlank() || attr == "none") continue
                        val attrs = fieldAttributes.getOrPut(fieldName) { HashMap() }
                        val v = value()
                        if (attrs[attr] != v) {
                            attrs[attr] = v
                            changed = true
                        }
                    }
                }
                "RunAction" -> {
                    val actionId = rule.text("actionId")
                    if (actionId.isNotBlank()) runAction(actionId)
                }
                // RunJS / SetCssClass / SetStyle are DOM-bound — not applicable on Swing.
            }
            if (rule.text("result") == "Stop") break
        }
        return changed
    }
}
