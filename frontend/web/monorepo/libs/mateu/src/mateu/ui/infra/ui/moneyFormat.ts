/**
 * How the web renderers write an amount of money — ONE rule, so a listing cell, a read-only field,
 * a group total and a ledger line never disagree.
 *
 * - An `Amount` (a value carrying its own `locale` and `currency`) is written in ITS locale and
 *   currency: "€89.50", "89,50 €".
 * - A bare number declared money (stereotype / dataType `money`) gets two decimals, grouped the way
 *   the UI's LOCALE groups them: the app's (`AppDto.locale`, mirrored on `<html lang>` by
 *   `applyUiLanguage`), else the browser's — "1,234.50" in an English app, "1.234,50" in a German one.
 *
 * It used to be hard-wired to de-DE, so an English app showed "1.234,50".
 */

/** The UI's locale: the page's language (the app's, see applyUiLanguage), else the browser's, else English. */
export const uiLocale = (): string =>
    (typeof document !== 'undefined' && document.documentElement?.lang)
    || (typeof navigator !== 'undefined' && navigator.language)
    || 'en'

const formatters = new Map<string, Intl.NumberFormat>()

const twoDecimals = (locale: string): Intl.NumberFormat => {
    let formatter = formatters.get(locale)
    if (!formatter) {
        try {
            formatter = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        } catch {
            // a malformed language tag (a server locale such as "en_GB") must not break a page
            formatter = new Intl.NumberFormat(locale.replace(/_/g, '-').split('@')[0] || 'en', {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
            })
        }
        formatters.set(locale, formatter)
    }
    return formatter
}

/** A money number with two decimals in the given locale (default: the UI's). Not a finite number → ''. */
export const formatMoneyNumber = (value: number, locale: string = uiLocale()): string => {
    if (!Number.isFinite(value)) return ''
    try {
        return twoDecimals(locale).format(value)
    } catch {
        return twoDecimals('en').format(value)
    }
}

/** An `Amount` on the wire: a value with its own locale and currency. */
export interface AmountLike {
    value: number | string
    locale?: string
    currency?: string
}

export const isAmount = (v: unknown): v is AmountLike =>
    !!v && typeof v === 'object' && 'value' in (v as Record<string, unknown>)

/**
 * Any money value as text: an Amount in its own locale/currency (its locale alone, or its currency
 * alone, still win over the UI's), a number or numeric string with two decimals in the UI's locale.
 * Non-numeric input comes back as-is; null/undefined as ''.
 */
export const formatMoneyValue = (raw: unknown, locale: string = uiLocale()): string => {
    const amount = isAmount(raw) ? raw : undefined
    const value = amount ? amount.value : raw
    if (value === null || value === undefined || value === '') return value == null ? '' : String(value)
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(num)) return String(value)
    const own = amount?.locale || locale
    if (amount?.currency) {
        try {
            return new Intl.NumberFormat(own, { style: 'currency', currency: amount.currency }).format(num)
        } catch {
            // an unknown currency code: the number, then the code
            return `${formatMoneyNumber(num, own)} ${amount.currency}`
        }
    }
    return formatMoneyNumber(num, own)
}
