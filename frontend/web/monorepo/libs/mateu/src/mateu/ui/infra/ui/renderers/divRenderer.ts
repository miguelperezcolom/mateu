import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Div from "@mateu/shared/apiClients/dtos/componentmetadata/Div.ts";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export const renderDiv = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Div
    return html`<div
                slot="${component.slot??nothing}"
                style="${component.style}" class="${component.cssClasses}"
        >${metadata.content?unsafeHTML(metadata.content):nothing}${component.children?.map(content => renderComponent(container, content, baseUrl, state, data))}</div>
    `
}