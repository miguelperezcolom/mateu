/**
 * The selection guard of a listing toolbar button (a bulk action): DISABLED while no row is
 * selected, instead of answering the click with an error toast — prevent the error rather than
 * report it. The server-side gate stays as the backstop.
 *
 * The guard is read off the BUTTON (`rowsSelectedRequired`, set by the server for every
 * `@ListToolbarButton`). Looking the advertised action up by the button's actionId is only a
 * fallback for older servers: the two ids are not always the same string (an `@Action` method is
 * also advertised under its nested-form id), and the page header that renders a plain listing's
 * toolbar has no advertised-actions list of its own to look in.
 */

export interface GatedButton {
    actionId?: string
    rowsSelectedRequired?: boolean
}

export interface AdvertisedAction {
    id?: string
    rowsSelectedRequired?: boolean
}

/** Whether this button's action needs selected rows. */
export const requiresSelection = (
    button: GatedButton,
    advertised?: ReadonlyArray<AdvertisedAction | null | undefined>,
): boolean => {
    if (button.rowsSelectedRequired) return true
    const action = advertised?.find(a => a?.id === button.actionId)
    return !!action?.rowsSelectedRequired
}

/** Whether a selection value (the listing's `crud_selected_items`) holds at least one row. */
export const hasSelection = (selection: unknown): boolean =>
    Array.isArray(selection) && selection.length > 0

/** The button as it must render: disabled when it needs a selection and there is none. */
export const withSelectionGate = <B extends GatedButton & { disabled?: boolean }>(
    button: B,
    selection: unknown,
    advertised?: ReadonlyArray<AdvertisedAction | null | undefined>,
): B => !hasSelection(selection) && requiresSelection(button, advertised)
    ? { ...button, disabled: true }
    : button

/**
 * The selection as it stands once the listing shows `rows`: each selected row that is still there,
 * as the row object now on screen, and none that is gone.
 *
 * A listing refreshed in place (a delete, its Undo, a row action — the server's listing-changed
 * event) keeps its selection, and the grid tells rows apart by their position (`_rowNumber`): the
 * row that moved into a deleted one's place showed selected, Delete stayed enabled, and after the
 * Undo the restored row came back selected. A selected row object still among `rows` stays as it
 * is; any other is matched by its id (`idField`) and replaced by the row now on screen, or dropped
 * when there is none (or no id to match it by).
 */
export const selectionStillOnScreen = (
    selection: unknown,
    rows: ReadonlyArray<Record<string, unknown>> | undefined,
    idField: string | undefined,
): Record<string, unknown>[] => {
    if (!hasSelection(selection) || !rows) return []
    const onScreen = new Set(rows)
    const byId = new Map<string, Record<string, unknown>>()
    if (idField) {
        rows.forEach(row => {
            const id = row?.[idField]
            if (id != null) byId.set(String(id), row)
        })
    }
    const kept: Record<string, unknown>[] = []
    ;(selection as Array<Record<string, unknown> | null | undefined>).forEach(selected => {
        if (!selected) return
        const id = idField ? selected[idField] : undefined
        const row = onScreen.has(selected) ? selected : id == null ? undefined : byId.get(String(id))
        if (row && !kept.includes(row)) kept.push(row)
    })
    return kept
}

/** Whether two selections hold the same row objects, in the same order. */
export const sameSelection = (a: unknown, b: unknown): boolean => {
    const left = Array.isArray(a) ? a : []
    const right = Array.isArray(b) ? b : []
    return left.length === right.length && left.every((row, i) => row === right[i])
}

/** The event the grids dispatch (bubbling, composed) whenever the row selection changes. */
export const SELECTION_CHANGED_EVENT = 'mateu-selection-changed'
