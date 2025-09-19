import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

export const renderComponentInSlot = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any, slot: string, labelAlreadyRendered: boolean | undefined): TemplateResult => {
    component.slot = slot
    return renderComponent(container, component, baseUrl, state, data, labelAlreadyRendered)
}

export const renderComponent = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any, labelAlreadyRendered?: boolean | undefined): TemplateResult => {
    if (!component) {
        return html``;
    }
    if (component.type == ComponentType.ClientSide ) {
        return componentRenderer.get()!.renderClientSideComponent(container, component as ClientSideComponent, baseUrl, state, data, labelAlreadyRendered)
    }
    return html`
        <mateu-component id="${component.id}" 
                         .component="${component}"
                         baseUrl="${baseUrl}"
                         slot="${component.slot??nothing}"
                         style="${component.style}" 
                         class="${component.cssClasses}"
                         .state="${state}"
                         .data="${data}"
        >
       </mateu-component>`
}