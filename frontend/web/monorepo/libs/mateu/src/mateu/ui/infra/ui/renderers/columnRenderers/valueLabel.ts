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
