package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * What a READ-ONLY field shows — the plugin twin of the web's read-only field (libs/mateu
 * statusColumnRenderer.toStatus + the Vaadin read-only branches). A definition-only YAML page has
 * no server mapping its values, so its record page read "249" and "AVAILABLE" where the listing
 * read "249.00" and "Available": an amount (dataType OR stereotype money) is formatted in the UI's
 * locale ([MoneyValues]), a value among the field's `options` shows the option's LABEL, and a
 * status is a tone chip ([StatusTones] words). Pure: no Swing.
 */
object ReadOnlyFieldDisplay {

    private val MONEY_STEREOTYPES = setOf("money", "currency")

    fun isMoney(metadata: JsonNode): Boolean =
        metadata.path("dataType").asText("") == "money" || metadata.path("stereotype").asText("") in MONEY_STEREOTYPES

    /** The label of the option whose value equals [value] (as text, so 3 matches "3"), else null. */
    fun optionLabel(metadata: JsonNode, value: String): String? {
        if (value.isEmpty()) return null
        val options = metadata.path("options")
        if (!options.isArray) return null
        val option = options.firstOrNull { it.path("value").asText("") == value } ?: return null
        val label = option.path("label")
        return if (label.isNull || label.isMissingNode) null else label.asText("")
    }

    /** The text of a read-only (non-status) field: money formatted, an option's label, else as is. */
    fun text(metadata: JsonNode, raw: JsonNode?): String {
        if (raw == null || raw.isNull || raw.isMissingNode) return ""
        if (MoneyValues.isAmount(raw)) return MoneyValues.text(raw)
        val value = if (raw.isObject) raw.path("message").asText(raw.path("value").asText("")) else raw.asText("")
        if (value.isEmpty()) return ""
        if (isMoney(metadata)) return formatMoney(value)
        return optionLabel(metadata, value) ?: value
    }

    /** `OUT_OF_STOCK` / `OutOfStock` / `out-of-stock` → "Out of stock" (Java's enum humanizer). */
    fun humanizeConstant(raw: String): String {
        val words = raw
            .replace(Regex("[_\\-\\s]+"), " ")
            .replace(Regex("([a-z0-9])([A-Z])"), "$1 $2")
            .replace(Regex("([A-Za-z])(\\d)"), "$1 $2")
            .trim()
            .lowercase()
        return if (words.isEmpty()) raw else words.replaceFirstChar { it.uppercase() }
    }

    /**
     * A status value as a chip (label, badge type): a Mateu `{type, message}` keeps its own; a plain
     * word reads as its option label, else as words, toned by its usual meaning. null = nothing.
     */
    fun status(metadata: JsonNode, raw: JsonNode?): Pair<String, String>? {
        if (raw == null || raw.isNull || raw.isMissingNode) return null
        if (raw.isObject) return raw.path("message").asText(raw.path("value").asText("")) to StatusTones.statusType(raw)
        val value = raw.asText("")
        if (value.isEmpty()) return null
        // camel case splits first (InProgress → IN_PROGRESS) so the word sets read it
        val word = value.replace(Regex("([a-z0-9])([A-Z])"), "$1_$2")
        return (optionLabel(metadata, value) ?: humanizeConstant(value)) to
            StatusTones.statusType(com.fasterxml.jackson.databind.node.TextNode(word))
    }
}
