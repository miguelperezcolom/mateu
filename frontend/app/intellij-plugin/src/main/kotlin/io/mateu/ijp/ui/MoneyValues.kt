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
    /**
     * The app's locale (`AppDto.locale`, the server's Translator), remembered when the shell arrives;
     * null goes back to the IDE's. A bare number declared money is written in it — it used to be
     * hard-wired to de-DE, so an English app read "1.234,50" (mirrors libs/mateu moneyFormat).
     */
    @Volatile
    var appLocale: Locale? = null
        private set

    fun setAppLocale(tag: String?) {
        appLocale = tag?.trim()?.takeIf { it.isNotEmpty() }?.let { Locale.forLanguageTag(it.replace('_', '-')) }
    }

    /** The UI's locale: the app's, else the IDE's. */
    fun uiLocale(): Locale = appLocale ?: Locale.getDefault()

    /** A money number with exactly two decimals in [locale] (default: the UI's). */
    fun numberText(n: Double, locale: Locale = uiLocale()): String {
        val fmt = NumberFormat.getNumberInstance(locale)
        fmt.minimumFractionDigits = 2
        fmt.maximumFractionDigits = 2
        return fmt.format(n)
    }

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

    /** Read-only text: formatted with the amount's OWN locale (else the UI's) and currency. */
    fun text(raw: JsonNode): String {
        val n = raw.path("value").takeIf { it.isNumber || it.isTextual }?.asText()?.toDoubleOrNull() ?: return inputText(raw)
        // its own locale wins; without one, the UI's
        val locale = raw.path("locale").asText("").takeIf { it.isNotBlank() }
            ?.let { Locale.forLanguageTag(it.replace('_', '-')) } ?: uiLocale()
        val currency = raw.path("currency").asText("")
        val symbol = runCatching { Currency.getInstance(currency).getSymbol(locale) }.getOrNull()
        return if (symbol != null) "${numberText(n, locale)} $symbol" else numberText(n, locale)
    }
}
