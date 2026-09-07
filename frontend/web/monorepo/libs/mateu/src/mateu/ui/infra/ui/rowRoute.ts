import { interpolate } from './interpolation.ts'

/**
 * A listing's `rowRoute`: where a row click goes.
 *
 * <p>Without it, the only detail a listing with no view model could offer was `masterDetail` — a
 * pane painted from the row already fetched, which is not addressable, not shareable and gone on
 * reload. A route is all three, and it is what turns a listing into the entrance to a record rather
 * than the whole of it.
 *
 * The template is evaluated with the clicked row in scope as `row`, alongside the listing's own
 * `state` and `data`: `people/${row.id}`.
 */
export function rowRouteOf(
    template: string | undefined,
    row: unknown,
    state?: Record<string, any>,
    data?: Record<string, any>,
): string | undefined {
    if (!template || row == null) return undefined
    const route = interpolate(template, state, data, { row })
    // An unresolved template comes back unchanged, and navigating to a literal "${row.id}" would
    // land on a route nobody declared. Better to do nothing than to leave the user somewhere wrong.
    if (!route || route === template || route.includes('${')) return undefined
    return route
}

/**
 * Navigate, using the pair every shell already honors — the same one the command centre and the
 * menu use. Emitting these rather than touching a router keeps this working on Vaadin, Redwood and
 * the DS shells alike, with no shell-specific glue.
 */
export function navigateToRoute(from: HTMLElement, route: string): void {
    for (const type of ['route-changed', 'navigate-to-requested']) {
        from.dispatchEvent(new CustomEvent(type, { detail: { route }, bubbles: true, composed: true }))
    }
}

/**
 * The row fields a `rowRoute` needs, beyond the visible columns.
 *
 * <p>A row fetched from an external source only carries the columns the listing declares — that is
 * what keeps the payload to what is on screen. But the field that identifies the record is usually
 * NOT one of them: nobody wants an id column, and yet `people/${row.id}` cannot work without it. So
 * the template says which extra fields to carry, and they are fetched alongside the visible ones.
 */
export function rowRouteFields(template: string | undefined): string[] {
    if (!template) return []
    const fields = new Set<string>()
    for (const match of template.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g)) {
        fields.add(match[1])
    }
    return [...fields]
}
