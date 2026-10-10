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
