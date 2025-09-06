import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const customFieldRenderer = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as CustomField

    return html`
        <vaadin-custom-field label="${metadata.label}"
                             style="${component.style}" 
                             class="${component.cssClasses}"
                             slot="${component.slot??nothing}">
            ${renderComponent(container, metadata.content, baseUrl, state, data)}
        </vaadin-custom-field>
            `
}
