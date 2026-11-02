/**
 * The locale the UI writes dates in — the date pickers (Vaadin's dateLocale) and the calendar
 * (mateu-calendar) read the same one, so a picker and the calendar next to it never disagree.
 *
 * It is the UI's language — `<html lang>`, which `applyUiLanguage` sets from the server's
 * `AppDto.locale`, else the browser's — refined by `navigator.language` when that one is the same
 * language with a region (`es` + `es-MX`, `en` + `en-GB`). A malformed tag falls back to en-US.
 */
export const uiLocale = (): string => {
    const htmlLang = (typeof document !== 'undefined' && document.documentElement?.lang) || ''
    const browser = (typeof navigator !== 'undefined' && navigator.language) || ''
    let locale = htmlLang || browser || 'en-US'
    if (htmlLang && browser && browser.toLowerCase().startsWith(htmlLang.toLowerCase() + '-')) locale = browser
    try {
        return Intl.getCanonicalLocales(locale)[0] ?? 'en-US'
    } catch {
        return 'en-US'
    }
}
