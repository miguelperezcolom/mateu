/**
 * Row actions stay on screen: a listing's per-row actions (a `ColumnAction` / `ColumnActionGroup`
 * column, a menu column, a button column) come LAST, so on a listing with many columns they sat
 * past the horizontal scroll and the user had to scroll sideways to act on a row. By default the
 * TRAILING run of row-action columns is pinned to the grid's end edge (vaadin-grid `frozen-to-end`,
 * Redwood `oj-table` `frozen: 'end'`), so the rest of the row scrolls under it.
 *
 * Only the trailing run: a frozen-to-end column in the middle of the row would not move to the
 * end, it would overlap its neighbours. A column that declares `frozen` (to the start) keeps it and
 * stops the run; a column group stops it too; a listing made only of action columns pins nothing
 * (there is nothing to scroll under them). Applied AFTER the column chooser's order and hidden
 * columns, so it pins whatever is last on screen. Done here, not on the wire, so it holds whatever
 * backend drew the listing (the wire's `frozenToEnd: true` is honoured as it was).
 *
 * Pure on purpose: the Redwood renderer mirrors it (apps/redwood/poc/core/listing.mjs).
 */

/** The part of a column's metadata the rule reads. */
export interface RowActionColumnLike {
    type?: string
    dataType?: string | null
    stereotype?: string | null
    actionId?: string | null
    editable?: boolean | null
    frozen?: boolean | null
    frozenToEnd?: boolean | null
}

const ROW_ACTION_DATA_TYPES = new Set(['action', 'actionGroup', 'menu'])

/** The action id a navigable listing's first column carries: opening the row is not a row action. */
const ROW_OPEN_ACTION_ID = 'view'

/** A column whose cells are the row's own actions (not data, not the row-open link, not an editor). */
export const isRowActionColumn = (c: RowActionColumnLike | null | undefined): boolean => {
    if (!c || c.type === 'GridGroupColumn' || c.editable) return false
    if (c.dataType && ROW_ACTION_DATA_TYPES.has(c.dataType)) return true
    if (c.stereotype === 'button') return c.actionId !== ROW_OPEN_ACTION_ID
    return !!c.actionId && c.actionId !== ROW_OPEN_ACTION_ID
}

interface ColumnNode { metadata?: RowActionColumnLike }

// one pinned copy per wire node: a NEW column object on every render makes vaadin-grid's column
// renderers run again (the same reason columnSizing.ts memoizes)
const memo = new WeakMap<object, ColumnNode>()
const pinned = (n: ColumnNode): ColumnNode => {
    let out = memo.get(n)
    if (!out) {
        out = { ...n, metadata: { ...n.metadata, frozenToEnd: true } }
        memo.set(n, out)
    }
    return out
}

/** How many columns, counted from the end, are the trailing run of row actions to pin. */
export const trailingRowActionCount = (columns: RowActionColumnLike[]): number => {
    let count = 0
    for (let i = columns.length - 1; i >= 0; i--) {
        const c = columns[i]
        if (!isRowActionColumn(c) || c?.frozen) break
        count++
    }
    // only action columns: nothing scrolls under them, pinning would only take the width away
    return count === columns.length ? 0 : count
}

/**
 * The listing's columns (wire nodes) with the trailing run of row-action columns frozen to the
 * end. Returns the same array when there is nothing to pin.
 */
export const withRowActionsPinnedToEnd = <N extends object>(columns: N[]): N[] => {
    const nodes = (columns ?? []) as ColumnNode[]
    const count = trailingRowActionCount(nodes.map(n => n?.metadata ?? {}))
    if (count === 0) return columns
    return nodes.map((n, i) => i >= nodes.length - count && !n.metadata?.frozenToEnd ? pinned(n) : n) as N[]
}

/** Whether the listing's last column is pinned to the end (so a column drawn after it must be too). */
export const endsPinned = (columns: { metadata?: RowActionColumnLike }[]): boolean =>
    !!columns?.length && !!columns[columns.length - 1]?.metadata?.frozenToEnd
