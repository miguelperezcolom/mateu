import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
export const renderDetails = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Details

    // DS-neutral Details — a native <details>/<summary> disclosure (no `@vaadin`). The Vaadin adapter
    // overrides Details with vaadin-details (Lumo styling).
    return html`
        <details
                ?open="${metadata.opened}"
                style="${component.style}"
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            <summary>${renderComponent(container, metadata.summary, baseUrl, state, data, appState, appData)}</summary>
            ${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}
        </details>
            `
}