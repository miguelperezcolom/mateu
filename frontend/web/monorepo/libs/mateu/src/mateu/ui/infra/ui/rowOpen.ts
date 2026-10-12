import { rowRouteOf } from './rowRoute.ts'

/**
 * Whole-row click: which listing rows open the record, and which cells keep their own click.
 *
 * <p>A navigable listing (one whose rows open a view — the first column carries `actionId="view"`,
 * the signal every resolver emits for a CRUD / `Navigable` listing — or one that declares a
 * `rowRoute`) opens the record wherever the row is clicked, not only on the identifier link. The
 * exceptions are the cells that have a click of their own: the selection checkbox, inline editors
 * and DISPLAY columns (buttons, links, menus, action groups, components, any column with its own
 * `actionId`). A click there does that column's thing and never opens the row.
 *
 * <p>Pure on purpose: every renderer (vaadin-grid, the Redwood oj-table, React Native, IntelliJ)
 * applies the same rule, and this is its reference.
 */

/** The action id a navigable listing's first column carries: the row-open action. */
export const ROW_OPEN_ACTION_ID = 'view'

/** The part of a column's metadata the rule reads. */
export interface RowOpenColumn {
    id?: string
    dataType?: string | null
    stereotype?: string | null
    actionId?: string | null
    editable?: boolean | null
}

/** The part of a listing's metadata the rule reads. */
export interface RowOpenListing {
    rowRoute?: string | null
    /** Flat column metas (group columns already expanded). */
    columns?: RowOpenColumn[]
}

/** How a navigable row opens: by route (`rowRoute`) or by running the `view` action. */
export type RowOpen =
    | { kind: 'route', template: string }
    | { kind: 'action', actionId: string }

/** What a click on a given row does: navigate to a route, or run an action with the row. */
export type RowOpenTarget =
    | { kind: 'route', route: string }
    | { kind: 'action', actionId: string, parameters: Record<string, unknown> }

const DISPLAY_DATA_TYPES = new Set(['action', 'actionGroup', 'menu', 'component', 'link', 'button'])
const DISPLAY_STEREOTYPES = new Set(['button', 'link', 'html'])

/**
 * How the rows of this listing open, or undefined when the listing is not navigable. A declared
 * `rowRoute` wins: it is addressable, and it is what a listing with no view model has.
 */
export function rowOpenOf(listing: RowOpenListing | undefined | null): RowOpen | undefined {
    if (!listing) return undefined
    if (listing.rowRoute) return { kind: 'route', template: listing.rowRoute }
    if ((listing.columns ?? []).some(c => c?.actionId === ROW_OPEN_ACTION_ID)) {
        return { kind: 'action', actionId: ROW_OPEN_ACTION_ID }
    }
    return undefined
}

/**
 * A column whose cells have a click of their own — so a click in it never opens the row. The
 * row-open column itself (`actionId="view"`) is NOT one: its link and the rest of the row agree.
 * An unknown column (no metadata — the selection column, a details toggle) is treated as one too:
 * when in doubt, a click does not leave the page.
 */
export function isDisplayColumn(column: RowOpenColumn | undefined | null): boolean {
    if (!column) return true
    if (column.editable) return true
    if (column.dataType && DISPLAY_DATA_TYPES.has(column.dataType)) return true
    if (column.stereotype && DISPLAY_STEREOTYPES.has(column.stereotype)) return true
    if (column.actionId && column.actionId !== ROW_OPEN_ACTION_ID) return true
    return false
}

/** Rows that never open: presentation-only group markers, and rows flagged `viewable: false`. */
export function rowOpens(row: unknown): boolean {
    if (row == null || typeof row !== 'object') return false
    const r = row as Record<string, unknown>
    if (r.__mateuGroup) return false
    return r.viewable !== false
}

/** What opening this row does, or undefined when it cannot open (unresolved route, marker row…). */
export function rowOpenTargetOf(
    open: RowOpen | undefined,
    row: unknown,
    state?: Record<string, unknown>,
    data?: Record<string, unknown>,
): RowOpenTarget | undefined {
    if (!open || !rowOpens(row)) return undefined
    if (open.kind === 'route') {
        const route = rowRouteOf(open.template, row, state, data)
        return route ? { kind: 'route', route } : undefined
    }
    return { kind: 'action', actionId: open.actionId, parameters: row as Record<string, unknown> }
}

const INTERACTIVE_TAGS = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|OPTION|DETAILS|SUMMARY)$/
// The vaadin controls (custom elements whose inner <button>/<input> sits in a shadow root the
// composed path may not expose); an avatar, an icon or a layout is NOT one.
const VAADIN_CONTROLS = /^VAADIN-(BUTTON|CHECKBOX|CHECKBOX-GROUP|MENU-BAR|MENU-BAR-BUTTON|CONTEXT-MENU|COMBO-BOX|MULTI-SELECT-COMBO-BOX|SELECT|RADIO-BUTTON|RADIO-GROUP|TEXT-AREA|DETAILS|UPLOAD|GRID-TREE-TOGGLE|GRID-SORTER|[A-Z-]+-FIELD|[A-Z-]+-PICKER)$/
const INTERACTIVE_ROLES = new Set(['button', 'link', 'checkbox', 'menuitem', 'menu', 'menubar', 'switch', 'radio', 'combobox', 'textbox', 'option', 'slider', 'spinbutton', 'tab'])

/** Whether this element acts on its own when clicked (a control, not the row's text). */
export function isInteractiveElement(el: unknown): boolean {
    const e = el as { tagName?: string, getAttribute?: (n: string) => string | null, isContentEditable?: boolean } | null
    if (!e || typeof e.tagName !== 'string') return false
    const tag = e.tagName.toUpperCase()
    if (INTERACTIVE_TAGS.test(tag)) return true
    if (VAADIN_CONTROLS.test(tag)) return true
    if (tag.startsWith('OJ-') && /^OJ-(C-)?(BUTTON|INPUT|SELECT|CHECKBOX|MENU|SWITCH|COMBOBOX)/.test(tag)) return true
    const role = e.getAttribute?.('role')
    if (role && INTERACTIVE_ROLES.has(role)) return true
    if (e.isContentEditable) return true
    return false
}

/**
 * Whether a click with this composed path is the ROW's click. The path is walked from the
 * innermost target up to (not including) `stopAt` — the element listening for row clicks — and
 * any control on the way claims the click for itself.
 */
export function clickBelongsToRow(path: readonly unknown[], stopAt?: unknown): boolean {
    for (const el of path) {
        if (stopAt !== undefined && el === stopAt) break
        if (isInteractiveElement(el)) return false
    }
    return true
}

/**
 * The single decision: does this click on this cell of this row open the row, and how.
 * `column` is the clicked column's metadata (undefined for a column without one).
 */
export function rowClickTarget(args: {
    open: RowOpen | undefined
    row: unknown
    column: RowOpenColumn | undefined | null
    path: readonly unknown[]
    stopAt?: unknown
    state?: Record<string, unknown>
    data?: Record<string, unknown>
}): RowOpenTarget | undefined {
    if (!args.open) return undefined
    if (isDisplayColumn(args.column)) return undefined
    if (!clickBelongsToRow(args.path, args.stopAt)) return undefined
    return rowOpenTargetOf(args.open, args.row, args.state, args.data)
}
