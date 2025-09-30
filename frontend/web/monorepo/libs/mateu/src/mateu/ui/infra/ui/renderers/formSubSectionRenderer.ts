import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import FormSubSection from "@mateu/shared/apiClients/dtos/componentmetadata/FormSubSection.ts";

export const renderFormSubSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) => {
    const metadata = component.metadata as FormSubSection
    return html`
        <div
                slot="${component.slot??nothing}"
                style="${component.style}" class="${component.cssClasses}"
        >
        <h4>${metadata.title}</h4>
        ${component.children?.map(content => renderComponent(container, content, baseUrl, state, data, appState, appData))}</div>
    `
}