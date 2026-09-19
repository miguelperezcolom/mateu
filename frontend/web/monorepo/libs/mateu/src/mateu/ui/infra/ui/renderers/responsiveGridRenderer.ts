import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ResponsiveGrid from "@mateu/shared/apiClients/dtos/componentmetadata/ResponsiveGrid";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { gridCell } from "@infra/ui/renderers/gridPrimitive.ts";

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
    const columns = metadata.gridTemplateColumns && metadata.gridTemplateColumns.trim().length
        ? metadata.gridTemplateColumns
        : 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))'
    const gap = metadata.gap ?? 'var(--lumo-space-m, 1rem)'
    const spans = metadata.colSpans ?? []
    const gridStyle = `display: grid; grid-template-columns: ${columns}; gap: ${gap}; align-items: start; ${component.style ?? ''}`
    const children = component.children?.map((child, i) =>
        // The shared grid-cell primitive (coherence-plan #9), the same one FormLayout uses.
        gridCell(spans[i], renderComponent(container, child, baseUrl, state, data, appState, appData)))

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
                    .mateu-responsive-grid[data-grid-id="${gridId}"] { grid-template-columns: 1fr !important; }
                }
            </style>
            <div class="mateu-responsive-grid ${component.cssClasses ?? ''}"
                 data-grid-id="${gridId}"
                 style="${gridStyle}"
            >${children}</div>
        </div>
    `
}
