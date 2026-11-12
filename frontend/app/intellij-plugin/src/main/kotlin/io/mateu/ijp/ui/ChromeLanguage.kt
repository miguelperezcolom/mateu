package io.mateu.ijp.ui

import java.util.Locale

/**
 * The language of the plugin's OWN words (task and notice actions, the inbox, ETAs, the version-skew
 * notice) — the web's chromeTexts rule: the locale's language when the plugin speaks it (`pt-BR` and
 * `pt-PT` → `pt`, `de-AT` → `de`), English for any other. The locale is [MoneyValues.uiLocale]: the
 * app's (`AppDto.locale`), else the IDE's.
 */
object ChromeLanguage {
    val LANGUAGES = listOf("en", "es", "fr", "de", "pt", "it")

    fun of(locale: Locale?): String {
        val language = locale?.language?.lowercase().orEmpty()
        return if (language in LANGUAGES) language else "en"
    }

    /** The word of [locale]'s language from a table keyed by language ("en" must be there). */
    fun <T> pick(locale: Locale?, table: Map<String, T>): T = table[of(locale)] ?: table.getValue("en")
}
