import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { html, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderDetails = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details summary="${metadata.title}" opened style="${component.style}" class="${component.cssClasses}"
                        slot="${component.slot??nothing}">
            ${renderComponent(metadata.content, baseUrl, state, data)}
        </vaadin-details>
            `
}