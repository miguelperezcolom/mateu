package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextArea
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.text
import javax.swing.JComponent

/**
 * A READ-ONLY field shows its value as text, not as a disabled input.
 *
 * A record's view mode used to render every field as a greyed-out input: the theme's disabled text
 * colour reaches about 2:1 against the field background (WCAG 1.4.3 asks 4.5:1 for content), the
 * values could not be selected or copied (a locator, an e-mail), and the screen read as "you may not
 * use this" rather than "this is the record" — Silver's *Form Design Patterns*: read-only values are
 * text. The web renders them as text too. A merely DISABLED field (a rule, `disabled`) keeps the
 * disabled control: there the input IS the message.
 */
object ReadOnlyValues {

    /** Stereotypes drawn by their own widget even when read-only (a picture, stars, a colour…). */
    private val OWN_WIDGET = setOf(
        "searchable", "combobox", "treeSelect", "radio", "multiSelect", "slider", "stars", "color",
        "uploadableImage", "camera", "signature", "image", "link", "markdown", "html", "richText",
        "badge", "plainText", "grid", "bulletedList",
    )

    private val BOOL_TYPES = setOf("bool", "boolean", "Boolean")

    /** What an empty value reads as. */
    const val EMPTY = "—"

    /**
     * The text a read-only field shows, or null when the field keeps its own widget (checkboxes,
     * pictures, lookups, options fetched from a source, references and amounts have their own path).
     */
    fun textOf(metadata: JsonNode, rawValue: JsonNode): String? {
        val dataType = metadata.text("dataType", "string")
        val stereotype = metadata.text("stereotype")
        if (stereotype in OWN_WIDGET || dataType in BOOL_TYPES || dataType == "reference" || dataType == "array") return null
        if (metadata.path("optionsSource").isObject || metadata.path("remoteCoordinates").isObject) return null
        if (MoneyValues.isAmount(rawValue)) return null
        if (dataType == "money" || stereotype in setOf("money", "currency")) return null
        val value = if (rawValue.isNull || rawValue.isMissingNode) "" else rawValue.asText("")
        if (value.isBlank()) return EMPTY
        if (stereotype == "password") return "••••••••"
        val options = metadata.path("options")
        if (options.isArray) {
            options.firstOrNull { it.text("value") == value }?.let { return it.text("label", value) }
        }
        if (dataType in NUMBER_TYPES) return numberText(value)
        if (DateValues.isDateType(dataType)) return DateValues.text(value)
        return value
    }

    private val NUMBER_TYPES = setOf("number", "double", "float", "decimal", "BigDecimal", "integer", "int", "long", "Integer", "Long")

    /**
     * A number as a person reads it in the UI's locale: grouped, no trailing ".0" (the JS client and
     * Jackson hand a whole double over as `77.0`), the decimals it has (up to 6). Not a number → as is.
     */
    fun numberText(raw: String, locale: java.util.Locale = MoneyValues.uiLocale()): String {
        val n = raw.trim().toBigDecimalOrNull() ?: return raw
        val fmt = java.text.NumberFormat.getNumberInstance(locale)
        fmt.maximumFractionDigits = 6
        return fmt.format(n.stripTrailingZeros())
    }

    /**
     * A read-only boolean: "✓" when true, "—" when false (the web's read-only checkbox), in the
     * label colour — a disabled checkbox drew its caption at ~2:1 (D-19). The screen reader hears
     * "Yes" / "No", not the glyph.
     */
    fun booleanComponent(value: Boolean): JComponent = JBLabel(plain(if (value) "✓" else EMPTY)).apply {
        foreground = com.intellij.util.ui.UIUtil.getLabelForeground()
        border = JBUI.Borders.empty(2, 0)
        accessibleContext.accessibleDescription = if (value) "Yes" else "No"
    }

    /** Whether the value reads better as wrapped lines than as one label. */
    fun isMultiline(metadata: JsonNode, text: String) = metadata.text("stereotype") == "textarea" || text.contains('\n')

    /** The value as a selectable, copyable text in the theme's ordinary label colour. */
    fun component(text: String, multiline: Boolean): JComponent {
        // One path for every value: a non-editable text area sits flush with its caption (a text
        // field adds the L&F's inner padding), wraps a long value and stays selectable/copyable.
        if (text != EMPTY) {
            return JBTextArea(text).apply {
                isEditable = false
                isOpaque = false
                lineWrap = true
                wrapStyleWord = true
                border = JBUI.Borders.empty(2, 0)
                font = JBUI.Fonts.label()
                foreground = com.intellij.util.ui.UIUtil.getLabelForeground()
                caretPosition = 0
            }
        }
        return JBLabel(plain(text)).apply {
            foreground = ToneColors.secondaryText()
            accessibleContext.accessibleDescription = "Empty"
            border = JBUI.Borders.empty(2, 0)
        }
    }
}
