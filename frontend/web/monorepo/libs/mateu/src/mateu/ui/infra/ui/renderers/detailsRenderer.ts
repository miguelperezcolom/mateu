import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderDetails = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details 
                ?opened="${metadata.opened}" 
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            <vaadin-details-summary slot="summary">
            ${renderComponent(container, metadata.summary, baseUrl, state, data, appState, appData)}
            </vaadin-details-summary>
            ${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}
        </vaadin-details>
            `
}