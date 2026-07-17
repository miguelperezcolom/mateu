// Client-side persistence of USER COLUMN PERSONALIZATION on listings: which columns are hidden
// and in what order they show. One localStorage entry per origin holding {scope: ColumnPrefs},
// where the scope is the listing's pathname — the same per-route granularity savedViewsStore and
// the URL-filter sync use. Purely client-side: no wire changes, the server keeps sending the full
// column set and the renderers apply the prefs before drawing.

export interface ColumnPrefs {
    /** ids of the columns the user chose to hide */
    hidden: string[]
    /** column ids in the order the user wants; ids not listed keep their original relative order, appended after */
    order: string[]
}

const KEY = 'mateu-column-prefs'

const readAll = (): Record<string, ColumnPrefs> => {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, ColumnPrefs>
            : {}
    } catch {
        return {}
    }
}

const writeAll = (prefs: Record<string, ColumnPrefs>) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(prefs))
    } catch {
        // storage unavailable (private mode…): prefs just won't survive a reload
    }
}

const sanitize = (prefs: ColumnPrefs | undefined): ColumnPrefs | undefined => {
    if (!prefs || typeof prefs !== 'object') return undefined
    const onlyStrings = (value: unknown): string[] =>
        Array.isArray(value) ? value.filter(entry => typeof entry === 'string') : []
    return { hidden: onlyStrings(prefs.hidden), order: onlyStrings(prefs.order) }
}

export const readColumnPrefs = (scope: string): ColumnPrefs | undefined => sanitize(readAll()[scope])

export const writeColumnPrefs = (scope: string, prefs: ColumnPrefs) => {
    const all = readAll()
    const clean = sanitize(prefs)!
    if (clean.hidden.length === 0 && clean.order.length === 0) {
        delete all[scope]
    } else {
        all[scope] = clean
    }
    writeAll(all)
}

export const clearColumnPrefs = (scope: string) => {
    const all = readAll()
    delete all[scope]
    writeAll(all)
}

// ── applying the prefs to a column list ──────────────────────────────────────

/** The subset of GridColumn/GridGroupColumn metadata the prefs logic needs. */
export interface ColumnLike {
    id?: string
    identifier?: boolean
    dataType?: string
}

/**
 * Identity/action columns MUST stay: the identifier column drives row selection/navigation and
 * the action/select/menu columns carry the row buttons. They are never hidden (even if a corrupt
 * store lists them) and the chooser doesn't offer them.
 */
export const isProtectedColumn = (col: ColumnLike | undefined): boolean => {
    if (!col) return false
    return !!col.identifier
        || col.dataType === 'action'
        || col.dataType === 'actionGroup'
        || col.dataType === 'menu'
        || col.id === 'select'
        || col.id === 'menu'
}

/**
 * Returns `columns` with the prefs applied: hidden columns dropped (protected ones never), then
 * reordered — ids in `prefs.order` first (in that order), columns not mentioned appended in their
 * original relative order; ids in the prefs that no longer exist are ignored. With no effective
 * prefs the ORIGINAL array is returned (identity preserved, so property-diffing consumers don't
 * re-render). `metaOf` extracts the column metadata when the entries are wrappers (the wire shape:
 * ClientSideComponent children whose metadata is the GridColumn); by default the entry itself is
 * the metadata.
 */
export const applyColumnPrefs = <T extends { id?: string }>(
    columns: T[],
    prefs: ColumnPrefs | undefined,
    metaOf: (col: T) => ColumnLike = col => col as unknown as ColumnLike,
): T[] => {
    const clean = sanitize(prefs)
    if (!clean || (clean.hidden.length === 0 && clean.order.length === 0)) return columns

    const idOf = (col: T): string | undefined => metaOf(col)?.id ?? col.id

    const hidden = new Set(clean.hidden)
    const visible = columns.filter(col => {
        const id = idOf(col)
        return !id || !hidden.has(id) || isProtectedColumn(metaOf(col))
    })

    if (clean.order.length === 0) {
        return visible.length === columns.length ? columns : visible
    }

    const byId = new Map<string, T>()
    visible.forEach(col => {
        const id = idOf(col)
        if (id && !byId.has(id)) byId.set(id, col)
    })
    const ordered: T[] = []
    const pushed = new Set<T>()
    clean.order.forEach(id => {
        const col = byId.get(id)
        if (col && !pushed.has(col)) {
            ordered.push(col)
            pushed.add(col)
        }
    })
    // unknown/new columns (and id-less ones) append in their original order
    visible.forEach(col => {
        if (!pushed.has(col)) {
            ordered.push(col)
            pushed.add(col)
        }
    })

    const unchanged = ordered.length === columns.length && ordered.every((col, ix) => col === columns[ix])
    return unchanged ? columns : ordered
}
