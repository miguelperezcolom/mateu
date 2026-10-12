/**
 * What a cell shows for a raw value: the column's declared label for it (`valueLabels` — an enum
 * column's labels, `IN_HOUSE` → "In house", the same the form options use) or the value itself.
 * Display only: the row keeps the raw value, which is what sorting, filtering, selection and
 * editing work on.
 */
export const valueLabel = (value: unknown, labels?: Record<string, string> | null): unknown => {
    if (!labels || value === null || value === undefined) return value
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return value
    const label = labels[String(value)]
    return label !== undefined && label !== null ? label : value
}

/**
 * A raw CONSTANT the screen has no label for ("OUT_OF_STOCK", "IN_PROGRESS") read the way the
 * server humanizes an enum constant (Humanizer: "Out of stock", "In progress") — the enum-label rule
 * for values that arrive WITHOUT labels: a YAML listing, a REST source. Anything that is not a bare
 * constant (mixed case, words, ids with digits only) is left as is.
 */
export const humanizeConstant = (raw: string): string => {
    if (!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(raw) || raw.length < 2) return raw
    const words = raw.toLowerCase().replace(/_/g, ' ').replace(/([a-z])(\d)/g, '$1 $2')
    return words.charAt(0).toUpperCase() + words.slice(1)
}
