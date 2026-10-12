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

/** The event the grids dispatch (bubbling, composed) whenever the row selection changes. */
export const SELECTION_CHANGED_EVENT = 'mateu-selection-changed'
