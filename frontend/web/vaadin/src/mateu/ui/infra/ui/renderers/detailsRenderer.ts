import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { html } from "lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderDetails = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details summary="${metadata.title}" opened style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.content, baseUrl, data)}
        </vaadin-details>
            `
}