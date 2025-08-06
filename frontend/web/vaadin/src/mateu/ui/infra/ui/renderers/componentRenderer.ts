import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, nothing, TemplateResult } from "lit";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { renderClientSideComponent } from "@infra/ui/renderers/renderComponents";

export const renderComponentInSlot = (component: Component, baseUrl: string | undefined, state: any, data: any, slot: string): TemplateResult => {
    component.slot = slot
    return renderComponent(component, baseUrl, state, data)
}

export const renderComponent = (component: Component, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    if (component.type == ComponentType.ClientSide ) {
        return renderClientSideComponent(component as ClientSideComponent, baseUrl, state, data)
    }
    return html`
        <mateu-component id="${component.id}" 
                                     .component="${component}"
                                     .state="${state}"
                                     .data="${data}"
                                     baseUrl="${baseUrl}"
                         slot="${component.slot??nothing}"
                         style="${component.style}" class="${component.cssClasses}">
       </mateu-component>`
}