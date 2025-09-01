import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import FormSection from "@mateu/shared/apiClients/dtos/componentmetadata/FormSection.ts";

export const renderFormSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as FormSection
    return html`<div
                slot="${component.slot??nothing}"
                style="${component.style}" class="${component.cssClasses}"
        >
        <h3>${metadata.title}</h3>
        ${component.children?.map(content => renderComponent(container, content, baseUrl, state, data))}</div>
    `
}