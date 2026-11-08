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

/** The LABEL of the option `value` names (a select / radio / enum field read-only), else undefined. */
export const optionLabel = (options: unknown, value: unknown): string | undefined => {
    if (!Array.isArray(options) || value === null || value === undefined || value === '') return undefined
    const option = options.find((o: any) => o && o.value == value)
    return option && option.label !== null && option.label !== undefined ? String(option.label) : undefined
}

/** `{value: label}` of a field's options — what a status chip reads its label from. */
export const optionLabels = (options: unknown): Record<string, string> | undefined => {
    if (!Array.isArray(options) || options.length === 0) return undefined
    const labels: Record<string, string> = {}
    for (const o of options as any[]) if (o && o.value !== undefined && o.value !== null && o.label != null) labels[String(o.value)] = String(o.label)
    return labels
}

/**
 * The text a read-only field shows for `raw`, as a reflected Java form shows it: an amount of money
 * (dataType or stereotype money) formatted in the UI's locale ("249.00"), the option's LABEL for a
 * field with options ("Available", not AVAILABLE), else the value. A definition-only YAML page
 * reads its values from a REST source, so they arrive raw and this is where they become readable.
 */
export const readOnlyText = (raw: unknown, field: { dataType?: string, stereotype?: string, options?: unknown } | undefined): unknown => {
    let v: unknown = raw
    if (v && typeof v === 'object' && 'value' in (v as any) && !isAmount(v)) v = (v as any).value
    const money = field?.dataType === 'money' || field?.stereotype === 'money'
    if (money && v !== null && v !== undefined && v !== '') return formatMoney(v)
    if (isAmount(v)) v = (v as any).value
    return optionLabel(field?.options, v) ?? v
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
export const displayedValue = (raw: unknown, dataType?: string, stereotype?: string, options?: unknown): DisplayedValue => {
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
    } else if (hasValue) {
        // a select / radio read-only: its option's label, not the code
        display = optionLabel(options, v) ?? display
    }
    return { isBool, checked: v === true || v === 'true', isMoney, hasValue, display }
}
