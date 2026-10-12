/**
 * Where a column's values line up when the server names no alignment: numbers and amounts to the
 * END, so magnitudes compare at a glance and decimals line up (NN/g, "Data tables"; Fiori, Carbon
 * and Material all right-align numeric columns); booleans centred under their header; everything
 * else at the start. A declared `align` always wins.
 */
const NUMERIC = new Set(['integer', 'number', 'double', 'decimal', 'long', 'float', 'money'])

export const columnAlign = (declared: string | undefined | null, dataType: string | undefined | null): string | undefined => {
    if (declared) return declared
    if (dataType && NUMERIC.has(dataType)) return 'end'
    if (dataType === 'bool' || dataType === 'boolean') return 'center'
    return undefined
}

/**
 * A numeric cell in the page's locale: thousands grouped ("80,000" / "80.000"), at most two
 * decimals. Grouping starts at five digits (`useGrouping: 'min2'`), so a year or a 4-digit code
 * (2026, 1200) is not turned into "2,026". Anything that is not a finite number is left as is.
 */
export const formatNumberCell = (value: unknown, dataType: string | undefined | null, locale?: string): unknown => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return value
    if (!dataType || !NUMERIC.has(dataType) || dataType === 'money') return value
    try {
        return new Intl.NumberFormat(locale || undefined, {
            maximumFractionDigits: dataType === 'integer' || dataType === 'long' ? 0 : 2,
            useGrouping: 'min2' as unknown as boolean,
        }).format(value)
    } catch {
        return value
    }
}
