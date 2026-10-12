/**
 * The sort a listing asks the server for, read off the grid's active sorters.
 *
 * <p>It used to read `sorter.__data.path` — the Polymer property bag the old `vaadin-grid-sorter`
 * had. The Lit-based sorter has no `__data`, so the first header click threw a TypeError and the
 * sort never reached the server. The sorter's own `path`/`direction` properties are what both
 * generations expose; `__data` stays as a fallback.
 */
const DIRECTIONS: Record<string, string> = {
    asc: 'ascending',
    desc: 'descending',
}

type SorterLike = {
    path?: string
    direction?: string | null
    __data?: { path?: string; direction?: string | null }
}

export const sortOfGrid = (grid: unknown): { fieldId: string; direction: string }[] => {
    const sorters = ((grid as { _sorters?: SorterLike[] } | undefined)?._sorters ?? [])
    return sorters
        .map(sorter => ({
            fieldId: sorter.path ?? sorter.__data?.path,
            direction: sorter.direction ?? sorter.__data?.direction,
        }))
        .filter((s): s is { fieldId: string; direction: string } => !!s.fieldId && !!s.direction)
        .map(s => ({ fieldId: s.fieldId, direction: DIRECTIONS[s.direction] ?? s.direction }))
}

/**
 * The listing's sort after one column's sorter changed: that column takes the direction the event
 * reports (first, as the latest choice; out when it went back to unsorted), the others keep what
 * the grid says. The column's own `direction-changed` can fire before the grid has updated its
 * sorter list, so the event — not the grid — is the truth for the column that was clicked.
 */
export const sortAfterChange = (
    grid: unknown,
    path: string | undefined,
    direction: string | null | undefined,
): { fieldId: string; direction: string }[] => {
    const others = sortOfGrid(grid).filter(s => s.fieldId !== path)
    if (!path || !direction) return others
    return [{ fieldId: path, direction: DIRECTIONS[direction] ?? direction }, ...others]
}

const SHORT: Record<string, string> = {
    ascending: 'asc',
    descending: 'desc',
    asc: 'asc',
    desc: 'desc',
}

/**
 * The direction a column's sorter shows, read off the listing's own state — the canonical sort,
 * the one in the URL and in every search request.
 *
 * <p>The grid itself cannot keep it: a search empties the rows, the listing paints its skeleton,
 * and the table comes back as a NEW grid whose sorters all read "unsorted". The arrow vanished
 * after every header click and the next click asked for ascending again, so a column could never
 * be sorted descending.
 */
export const sortDirectionOf = (state: unknown, columnId: string | undefined): string | null => {
    const sort = (state as { sort?: { fieldId?: string; direction?: string }[] } | undefined)?.sort
    if (!columnId || !Array.isArray(sort)) return null
    const entry = sort.find(s => s?.fieldId === columnId)
    return entry?.direction ? SHORT[entry.direction] ?? null : null
}

/** Whether two sorts are the same request (a sorter re-set from state must not search again). */
export const sameSort = (a: unknown, b: unknown): boolean =>
    JSON.stringify(Array.isArray(a) ? a : []) === JSON.stringify(Array.isArray(b) ? b : [])
