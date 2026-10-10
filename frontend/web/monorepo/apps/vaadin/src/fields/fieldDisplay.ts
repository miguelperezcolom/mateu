/**
 * How a read-only field shows its value — the pure part of mateu-field's plain-text, property-row
 * and read-only money renderings, which used to repeat the same unwrap/format logic inline.
 */

/** An `Amount` on the wire: a value with its own locale and currency. */
export interface AmountLike {
    value: number | string
    locale?: string
    currency?: string
}

const isAmount = (v: unknown): v is AmountLike =>
    !!v && typeof v === 'object' && 'value' in (v as Record<string, unknown>)

/**
 * A money amount as text: in its own locale/currency when it carries them, else with two decimals
 * (de-DE grouping, the framework's historical default). Non-numeric input comes back as-is.
 */
export const formatMoney = (raw: unknown): string => {
    const amount = isAmount(raw) ? raw : undefined
    const value = amount ? amount.value : raw
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (value === null || value === undefined || value === '' || isNaN(num)) return value == null ? '' : String(value)
    if (amount?.locale && amount.currency) {
        return new Intl.NumberFormat(amount.locale, { style: 'currency', currency: amount.currency }).format(num)
    }
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

export interface DisplayedValue {
    /** A boolean is drawn as an icon, not as text. */
    isBool: boolean
    /** For a boolean: whether it is on. */
    checked: boolean
    isMoney: boolean
    hasValue: boolean
    /** The text to show: the formatted value, or an em dash when there is none. */
    display: string
}

/**
 * The value a read-only field displays: an `Amount`/`{value}` unwrapped, booleans recognised (by
 * data type or by value), money formatted, and an em dash for "no value".
 */
export const displayedValue = (raw: unknown, dataType?: string): DisplayedValue => {
    let v: unknown = raw
    const amount = isAmount(v) ? v : undefined
    if (amount && amount.value) v = amount.value
    const isBool = dataType === 'bool' || v === true || v === false
    const isMoney = dataType === 'money'
    const hasValue = v !== null && v !== undefined && v !== ''
    let display = hasValue ? String(v) : '—'
    if (isMoney && hasValue) {
        const num = typeof v === 'number' ? v : parseFloat(String(v))
        if (!isNaN(num)) display = formatMoney(amount ? { ...amount, value: num } : num)
    }
    return { isBool, checked: v === true || v === 'true', isMoney, hasValue, display }
}
