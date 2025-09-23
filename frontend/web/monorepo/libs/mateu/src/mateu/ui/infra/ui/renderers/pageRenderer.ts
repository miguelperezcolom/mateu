import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";

export const renderPage = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as PageComponent
    const mainContent = metadata.mainContent as ClientSideComponent
    return html`<div
                slot="${component.slot??nothing}"
                style="${component.style}" class="${component.cssClasses}"
        ><div><h2>PAGE ${metadata.pageTitle} ${mainContent.metadata?.type}</h2></div>
        <div>${renderComponent(container, metadata.mainContent, baseUrl, state, data)}</div></div>
    `
}