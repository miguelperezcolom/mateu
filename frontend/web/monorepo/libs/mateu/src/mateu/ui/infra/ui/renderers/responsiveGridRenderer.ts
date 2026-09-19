import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ResponsiveGrid from "@mateu/shared/apiClients/dtos/componentmetadata/ResponsiveGrid";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). Paints a CSS grid whose
 * column tracks come resolved from the tracks' hug/fixed/fill intent (grid-template-columns, e.g.
 * "auto 1fr 15rem"); children are placed on it in order. Design-system neutral (Lumo vars with
 * fallbacks). When no columns are declared it falls back to a responsive auto-fit.
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
    return html`
        <div class="mateu-responsive-grid ${component.cssClasses ?? ''}"
             style="display: grid; grid-template-columns: ${columns}; gap: ${gap}; align-items: start; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}"
        >
            ${component.children?.map(child =>
                renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}
