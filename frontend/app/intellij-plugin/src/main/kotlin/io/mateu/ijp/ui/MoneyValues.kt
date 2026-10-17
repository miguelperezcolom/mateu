package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.ObjectNode
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

/**
 * A field typed `Amount` travels as an OBJECT `{value, currency, locale}`: the web's money field
 * edits its `value` and keeps the rest. Read as plain text it was "" (Jackson's asText of an
 * object), so the field showed nothing and the first keystroke replaced the whole Amount with a
 * bare number. Pure — mirrors React Native's moneyInputText / moneyInputCommit / moneyText.
 */
object MoneyValues {
    fun isAmount(raw: JsonNode?): Boolean = raw != null && raw.isObject && raw.has("value")

    /** What the input shows: the amount's number; "" when unset. */
    fun inputText(raw: JsonNode): String {
        val v = raw.path("value")
        return if (v.isNull || v.isMissingNode) "" else v.asText("")
    }

    /** What the input commits: the same Amount with the new value (a cleared amount is 0, as on the web). */
    fun commit(raw: JsonNode, text: String): ObjectNode {
        val copy = (raw as ObjectNode).deepCopy()
        val n = text.trim().replace(',', '.').toDoubleOrNull() ?: 0.0
        copy.set<JsonNode>("value", JsonNodeFactory.instance.numberNode(n))
        return copy
    }

    /** Read-only text: formatted with the amount's OWN locale and currency. */
    fun text(raw: JsonNode): String {
        val n = raw.path("value").takeIf { it.isNumber || it.isTextual }?.asText()?.toDoubleOrNull() ?: return inputText(raw)
        val locale = raw.path("locale").asText("").ifBlank { "de-DE" }.let { Locale.forLanguageTag(it) }
        val fmt = NumberFormat.getNumberInstance(locale)
        fmt.minimumFractionDigits = 2
        fmt.maximumFractionDigits = 2
        val currency = raw.path("currency").asText("")
        val symbol = runCatching { Currency.getInstance(currency).getSymbol(locale) }.getOrNull()
        return if (symbol != null) "${fmt.format(n)} $symbol" else fmt.format(n)
    }
}
