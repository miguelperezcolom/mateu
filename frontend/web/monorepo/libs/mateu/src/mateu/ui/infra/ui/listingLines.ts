/**
 * Multi-line listing rows (`@Line` on a row field → `GridColumn.line` on the wire).
 *
 * A listing with too many columns to fit side by side can put some of them on a second (third…)
 * line of each row. Line 1 is the ordinary columns — header labels, sorting, widths; the columns of
 * the other lines are drawn under it, spanning the row, as secondary «Label: value» pairs. Without
 * any column on a line > 1 nothing changes. Renderer-agnostic: each renderer asks {@link splitLines}
 * which columns go where and draws the extra lines its own way.
 */

/** The bit of a column this module reads (a GridColumn, or a group column — which has no line). */
export interface LineLike {
    line?: number | null
}

/** The 1-based line a column is drawn on: its `line` when > 1, else 1. */
export const lineOf = (column: LineLike | undefined | null): number => {
    const line = column?.line
    return typeof line === 'number' && line > 1 ? Math.floor(line) : 1
}

/** True when at least one column is on a line other than the first. */
export const isMultiLine = (columns: (LineLike | undefined | null)[] | undefined | null): boolean =>
    !!columns?.some(c => lineOf(c) > 1)

export interface SplitLines<T> {
    /** the columns of line 1, in wire order */
    first: T[]
    /** the columns of each further line, lines in ascending order (empty lines skipped), each in wire order */
    extra: T[][]
}

/**
 * Splits the columns (in wire order) by line. `meta` reads the column metadata off a wrapper
 * (e.g. a ClientSideComponent whose `metadata` is the GridColumn); identity by default.
 */
export function splitLines<T>(columns: T[] | undefined | null, meta: (c: T) => LineLike | undefined | null = c => c as any): SplitLines<T> {
    const first: T[] = []
    const byLine = new Map<number, T[]>()
    for (const c of columns ?? []) {
        const line = lineOf(meta(c))
        if (line === 1) {
            first.push(c)
        } else {
            if (!byLine.has(line)) byLine.set(line, [])
            byLine.get(line)!.push(c)
        }
    }
    const extra = [...byLine.keys()].sort((a, b) => a - b).map(line => byLine.get(line)!)
    return { first, extra }
}

/** The columns ordered line by line (stable within a line) — for layouts that show "the first N". */
export function byLine<T>(columns: T[] | undefined | null, meta: (c: T) => LineLike | undefined | null = c => c as any): T[] {
    const { first, extra } = splitLines(columns, meta)
    return [...first, ...extra.flat()]
}

/**
 * The plain text of a cell value for a secondary line: a status ({type, message}) reads as its
 * message, money ({amount, currency}) as "amount currency", an option/label-ish object as its
 * label; null/undefined is empty.
 */
export function lineValueText(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') {
        if (Array.isArray(value)) return value.map(lineValueText).filter(Boolean).join(', ')
        if (value.message !== undefined) return String(value.message ?? '')
        if (value.amount !== undefined) return [value.amount, value.currency].filter(v => v !== undefined && v !== null).join(' ')
        if (value.label !== undefined) return String(value.label ?? '')
        if (value.text !== undefined) return String(value.text ?? '')
        if (value.name !== undefined) return String(value.name ?? '')
        return ''
    }
    if (typeof value === 'boolean') return value ? '✓' : '✗'
    return String(value)
}
