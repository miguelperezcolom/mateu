import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ResponsiveGrid from "@mateu/shared/apiClients/dtos/componentmetadata/ResponsiveGrid";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { gridCell } from "@infra/ui/renderers/gridPrimitive.ts";
import { moveTile, moveTileBy, orderedTileIndices, readTileOrder, tileGridStyle, tileKeyOf, writeTileOrder } from "@infra/tileOrderStore.ts";
import { chromeText } from '@infra/ui/chromeTexts.ts'

const TILE_MIME = 'application/x-mateu-tile'

/**
 * A REORDERABLE grid (OPERA's dashboard: tiles that can be dragged): each tile in a draggable
 * wrapper that takes over its grid placement, painted in the viewer's saved order. Drop a tile on
 * another to put it there; with the keyboard, Alt+←/→ on a focused tile moves it one place. The
 * order is kept per screen + grid (tileOrderStore) and the grid re-renders in place — no round trip.
 */
const reorderableChildren = (
    container: LitElement,
    component: ClientSideComponent,
    render: (index: number) => unknown,
    spans: number[],
) => {
    const children = component.children ?? []
    const scope = (typeof location !== 'undefined' ? location.pathname : '') + '#' + (component.id ?? 'grid')
    const keys = children.map((child, i) => tileKeyOf(child as { id?: string }, i))
    const indices = orderedTileIndices(keys, readTileOrder(scope))
    const order = indices.map(i => keys[i])
    const save = (next: string[]) => {
        if (next === order) return
        writeTileOrder(scope, next)
        container.requestUpdate()
    }
    return indices.map(i => {
        const key = keys[i]
        const metadata = (children[i] as ClientSideComponent).metadata as { type?: string, colSpan?: number, rowSpan?: number }
        return html`<div class="mateu-tile" draggable="true" tabindex="0" data-tile-key="${key}"
                         aria-roledescription="draggable tile"
                         title="${chromeText('dragToRearrange')}"
                         style="min-width: 0; cursor: grab; ${tileGridStyle(metadata, spans[i])}"
                         @dragstart=${(e: DragEvent) => {
                             e.dataTransfer?.setData(TILE_MIME, scope + '\n' + key)
                             if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
                         }}
                         @dragover=${(e: DragEvent) => {
                             if (e.dataTransfer?.types.includes(TILE_MIME)) e.preventDefault()
                         }}
                         @drop=${(e: DragEvent) => {
                             const [fromScope, moved] = (e.dataTransfer?.getData(TILE_MIME) ?? '').split('\n')
                             if (fromScope !== scope || !moved) return
                             e.preventDefault()
                             save(moveTile(order, moved, key))
                         }}
                         @keydown=${(e: KeyboardEvent) => {
                             if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
                             if (e.target !== e.currentTarget) return
                             e.preventDefault()
                             save(moveTileBy(order, key, e.key === 'ArrowLeft' ? -1 : 1))
                             const host = e.currentTarget as HTMLElement
                             requestAnimationFrame(() => (host.parentElement?.querySelector(`[data-tile-key="${CSS.escape(key)}"]`) as HTMLElement | null)?.focus())
                         }}
        >${render(i)}</div>`
    })
}

/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). Paints a CSS grid whose
 * column tracks come resolved from the tracks' hug/fixed/fill intent (grid-template-columns, e.g.
 * "auto 1fr 15rem"); children are placed on it in order, a child spanning `colSpans[i]` tracks.
 * When no columns are declared it falls back to a responsive auto-fit.
 *
 * `stackBelow` makes it genuinely responsive: below that CONTAINER width the grid collapses to a
 * single column (a ratio layout — 64%/36% zones — keeps its ratio on wide and stacks on narrow),
 * done with a CSS container query on a scoped `data-grid-id`, NOT a flex fallback. Container queries
 * respond to the grid's own container, so a grid inside a narrow panel stacks even on a wide page.
 * Design-system neutral (Lumo vars with fallbacks).
 */
export const renderResponsiveGrid = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
) => {
    const metadata = component.metadata as ResponsiveGrid
    const areas = metadata.gridTemplateAreas
    const explicitCols = metadata.gridTemplateColumns && metadata.gridTemplateColumns.trim().length
    // In areas mode without explicit tracks, the named areas define the grid (columns default to
    // auto) — forcing an auto-fit template here would conflict with the areas and void them.
    const columns = explicitCols
        ? metadata.gridTemplateColumns
        : (areas && areas.trim().length ? null : 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))')
    const gap = metadata.gap ?? 'var(--lumo-space-m, 1rem)'
    const spans = metadata.colSpans ?? []
    const stickyAreas = metadata.stickyAreas ?? []
    const colStyle = columns ? ` grid-template-columns: ${columns};` : ''
    const areaStyle = areas && areas.trim().length ? ` grid-template-areas: ${areas};` : ''
    const gridStyle = `display: grid;${colStyle} gap: ${gap}; align-items: start;${areaStyle} ${component.style ?? ''}`
    const reorderable = !!metadata.reorderable && !(areas && areas.trim().length)
    const children = reorderable
        ? reorderableChildren(container, component,
            (i) => renderComponent(container, component.children![i], baseUrl, state, data, appState, appData), spans)
        : component.children?.map((child, i) => {
        const rendered = renderComponent(container, child, baseUrl, state, data, appState, appData)
        // Named-slot template (coherence-plan #7): a child whose slot matches a grid area is placed
        // there; a child with no slot flows into the implicit overflow. Otherwise the shared
        // grid-cell primitive (#9) applies the column span (the same one FormLayout uses).
        if (areas && child.slot) {
            // A slot listed in stickyAreas is pinned while the rest of the grid scrolls (coherence
            // -plan #7): the wrapper stretches to the row height and sticks near the top — this is
            // what lets a two-region screen template replace the bespoke sticky ContentLayout.
            const sticky = stickyAreas.includes(child.slot)
                ? ' position: sticky; top: 1rem; align-self: start; height: fit-content;'
                : ''
            return html`<div style="grid-area: ${child.slot}; min-width: 0;${sticky}">${rendered}</div>`
        }
        return gridCell(spans[i], rendered)
    })

    if (!metadata.stackBelow) {
        return html`
            <div class="mateu-responsive-grid ${component.cssClasses ?? ''}"
                 style="${gridStyle}"
                 slot="${component.slot ?? nothing}"
            >${children}</div>
        `
    }

    // Responsive: a container query stacks the grid to one column below `stackBelow`. The rule is
    // scoped to this grid by a data-grid-id so it never leaks to other grids on the page.
    const gridId = component.id ?? 'mateu-grid'
    return html`
        <div style="container-type: inline-size;" slot="${component.slot ?? nothing}">
            <style>
                @container (max-width: ${metadata.stackBelow}) {
                    .mateu-responsive-grid[data-grid-id="${gridId}"] {
                        grid-template-columns: 1fr !important;
                        /* a named-slot template names N columns per row; on one track that would be a
                           mismatch (and void the areas) — drop the areas so the slots stack in order. */
                        grid-template-areas: none !important;
                    }
                }
            </style>
            <div class="mateu-responsive-grid ${component.cssClasses ?? ''}"
                 data-grid-id="${gridId}"
                 style="${gridStyle}"
            >${children}</div>
        </div>
    `
}
