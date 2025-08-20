import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { html, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderDetails = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details 
                ?opened="${metadata.opened}" 
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            <vaadin-details-summary slot="summary">
            ${renderComponent(metadata.summary, baseUrl, state, data)}
            </vaadin-details-summary>
            ${renderComponent(metadata.content, baseUrl, state, data)}
        </vaadin-details>
            `
}