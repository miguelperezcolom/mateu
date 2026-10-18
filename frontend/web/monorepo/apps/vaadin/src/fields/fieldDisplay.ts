/**
 * How a read-only field shows its value — the pure part of mateu-field's plain-text, property-row
 * and read-only money renderings, which used to repeat the same unwrap/format logic inline.
 */

import { formatMoneyValue, isAmount } from '@infra/ui/moneyFormat.ts'
export type { AmountLike } from '@infra/ui/moneyFormat.ts'

/**
 * A money amount as text: in its own locale/currency when it carries them, else with two decimals
 * grouped the way the UI's locale groups them (the app's, else the browser's — see moneyFormat).
 * Non-numeric input comes back as-is.
 */
export const formatMoney = (raw: unknown): string => formatMoneyValue(raw)

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
export const displayedValue = (raw: unknown, dataType?: string, stereotype?: string): DisplayedValue => {
    let v: unknown = raw
    const amount = isAmount(v) ? v : undefined
    if (amount && amount.value) v = amount.value
    const isBool = dataType === 'bool' || v === true || v === false
    // money is said either way: dataType money (an Amount, or a number in plain-text context) or
    // the money stereotype on a plain number (a read-only view of an editable money field)
    const isMoney = dataType === 'money' || stereotype === 'money'
    const hasValue = v !== null && v !== undefined && v !== ''
    let display = hasValue ? String(v) : '—'
    if (isMoney && hasValue) {
        const num = typeof v === 'number' ? v : parseFloat(String(v))
        if (!isNaN(num)) display = formatMoney(amount ? { ...amount, value: num } : num)
    }
    return { isBool, checked: v === true || v === 'true', isMoney, hasValue, display }
}
