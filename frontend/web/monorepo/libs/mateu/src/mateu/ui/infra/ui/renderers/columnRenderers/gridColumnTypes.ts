/**
 * DS-neutral stand-ins for the vaadin-grid renderer callback types, so the column renderers stay
 * free of `@vaadin` imports (they are `import type` only — erased at build — but still couple the
 * core to Vaadin at the source level and on the core-clean ratchet).
 *
 * At runtime the grid still passes its own objects (vaadin's GridItemModel and the
 * vaadin-grid-column element); these are structural supertypes covering exactly what the
 * renderers read (`item`, `index`, the column's `path`, and any `xcolumn` payload attached to it).
 */

export interface GridItemModel<T> {
    item: T
    index: number
    selected?: boolean
    expanded?: boolean
    level?: number
    detailsOpened?: boolean
}

/** The column element the grid passes to a body/header renderer (a plain HTMLElement at runtime). */
export type GridColumnElement = HTMLElement & { path?: string | null }
