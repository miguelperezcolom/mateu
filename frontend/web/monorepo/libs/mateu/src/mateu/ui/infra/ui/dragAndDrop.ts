/**
 * Dragging listing rows onto a drop zone (`@DragRows(type)` + `DropZone`): the pure part, tested in
 * vitest. The rows travel as a JSON array of ids under a MIME type derived from the drag type, so a
 * zone can tell — while the drag is still over it, before it may read the data — whether what comes
 * is its kind.
 */
export const dragMimeOf = (type?: string | null) =>
    type ? 'application/x-mateu-' + String(type).toLowerCase().replace(/[^a-z0-9.+-]/g, '-') : ''

/** The ids in the drag data (a JSON array of ids, or of rows with an `id`). */
export const draggedIdsOf = (json: string): string[] => {
    let rows: unknown
    try { rows = JSON.parse(json) } catch { return [] }
    const list = Array.isArray(rows) ? rows : [rows]
    return list.map((r) => {
        if (r == null) return null
        if (typeof r !== 'object') return String(r)
        const o = r as Record<string, unknown>
        const d = (o.data && typeof o.data === 'object' ? o.data : o) as Record<string, unknown>
        const id = d.id ?? o.key
        return id == null ? null : String(id)
    }).filter((id): id is string => id != null)
}

/** The parameters of the drop action: the zone's own, plus what was dragged. */
export const dropParamsOf = (zoneParams: Record<string, unknown> | undefined, ids: string[], type: string) =>
    ({ ...(zoneParams ?? {}), _draggedIds: ids, _dragType: type })

/**
 * Without dragging (WCAG 2.1.1 Keyboard, 2.5.7 Dragging Movements): a listing with `@DragRows`
 * PUBLISHES the ids of its selected rows under its drag type, and every drop zone accepting that
 * type offers a "Move the selected rows here" button that runs the same drop action with them.
 * Process-wide, by type: the last listing that published wins (one listing per type on a screen).
 */
export const DRAG_SELECTION_EVENT = 'mateu-drag-selection-changed'

const selections = new Map<string, string[]>()

/** A listing's current selection for its drag type ([] clears it). */
export const publishDragSelection = (type: string | null | undefined, ids: string[]) => {
    if (!type) return
    const previous = selections.get(type) ?? []
    if (previous.length === ids.length && previous.every((id, i) => id === ids[i])) return
    if (ids.length) selections.set(type, [...ids])
    else selections.delete(type)
    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent(DRAG_SELECTION_EVENT, { detail: { type, ids: [...ids] } }))
    }
}

/** The ids a listing of that drag type has selected now. */
export const draggableSelectionOf = (type: string | null | undefined): string[] =>
    (type ? selections.get(type) : undefined) ?? []
