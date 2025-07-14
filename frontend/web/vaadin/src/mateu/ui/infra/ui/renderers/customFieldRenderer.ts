import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField";
import { html } from "lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const customFieldRenderer = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as CustomField

    return html`
        <vaadin-custom-field label="${metadata.label}"
                             style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.content, baseUrl, data)}
        </vaadin-custom-field>
            `
}
