// The viewer's own ORDER of a reorderable grid's tiles (ResponsiveGrid.reorderable — OPERA's
// dashboard, whose tiles can be dragged). One localStorage entry per origin holding
// {scope: tileKeys}, where the scope is the screen's pathname + the grid id, the same per-route
// granularity columnPrefsStore uses. The server's order stays the default: a tile the viewer has
// not placed yet (a new one) keeps its server position, after the placed ones.

const KEY = 'mateu-tile-order'

const readAll = (): Record<string, string[]> => {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, string[]>
            : {}
    } catch {
        return {}
    }
}

/** The key a tile is remembered by: its id, or its position when it has none. */
export const tileKeyOf = (child: { id?: string | null } | undefined, index: number): string =>
    child?.id ? String(child.id) : '#' + index

/** The saved order of a grid, or null. */
export const readTileOrder = (scope: string): string[] | null => {
    const saved = readAll()[scope]
    return Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : null
}

export const writeTileOrder = (scope: string, keys: string[]) => {
    try {
        const all = readAll()
        all[scope] = keys
        localStorage.setItem(KEY, JSON.stringify(all))
    } catch {
        // storage unavailable (private mode…): the order just won't survive a reload
    }
}

/**
 * The positions to paint the tiles in: the saved keys first, in the saved order (keys that no
 * longer exist are skipped), then the tiles the viewer never placed, in the server's order.
 */
export const orderedTileIndices = (keys: string[], saved: string[] | null): number[] => {
    if (!saved || !saved.length) return keys.map((_, i) => i)
    const placed = saved.map(key => keys.indexOf(key)).filter(i => i >= 0)
    const seen = new Set(placed)
    return [...placed, ...keys.map((_, i) => i).filter(i => !seen.has(i))]
}

/** The order after dropping `moved` where `target` is (before it moving up, after it moving down). */
export const moveTile = (order: string[], moved: string, target: string): string[] => {
    const from = order.indexOf(moved)
    const to = order.indexOf(target)
    if (from < 0 || to < 0 || from === to) return order
    const next = order.filter(key => key !== moved)
    next.splice(to, 0, moved)
    return next
}

/**
 * The grid placement a draggable tile's wrapper must take over — the wrapper, not the tile, is
 * now the grid item: a dashboard panel's col/row span, a scoreboard's full row, else the grid's
 * own span for that child.
 */
export const tileGridStyle = (
    metadata: { type?: string, colSpan?: number, rowSpan?: number } | undefined,
    span: number | undefined,
): string => {
    if (metadata?.type === 'Scoreboard') return 'grid-column: 1 / -1;'
    const col = metadata?.type === 'DashboardPanel' ? metadata.colSpan : span
    const row = metadata?.type === 'DashboardPanel' ? metadata.rowSpan : undefined
    return (col && col > 1 ? `grid-column: span ${col};` : '') + (row && row > 1 ? ` grid-row: span ${row};` : '')
}

/** The order after moving `moved` one place back (-1) or forward (+1): the keyboard way to drag. */
export const moveTileBy = (order: string[], moved: string, delta: number): string[] => {
    const from = order.indexOf(moved)
    const to = from + delta
    if (from < 0 || to < 0 || to >= order.length) return order
    return moveTile(order, moved, order[to])
}
