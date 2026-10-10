import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { isNodeIdStamping, stampNodeId } from "@infra/ui/renderers/nodeIdStamp.ts";

interface RoutedContainer extends LitElement {
    route: string
    consumedRoute: string
}

export const renderComponentInSlot = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, slot: string, labelAlreadyRendered: boolean | undefined): TemplateResult => {
    component.slot = slot
    return renderComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
}

export const renderComponent = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered?: boolean | undefined): TemplateResult => {
    if (!component) {
        return html``;
    }
    if (component.type == ComponentType.ClientSide ) {
        const painted = componentRenderer.get()!.renderClientSideComponent(container, component as ClientSideComponent, baseUrl, state, data, appState, appData, labelAlreadyRendered)
        // the visual editor maps a canvas click back to its node through this id (editor only)
        return isNodeIdStamping() && component.id ? html`${stampNodeId(component.id, painted)}` : painted
    }
    const route = (container as RoutedContainer).route
    const consumedRoute = (container as RoutedContainer).consumedRoute
    return html`
        <mateu-component id="${component.id}"
                         .component="${component}"
                        route="${route}"
                         consumedRoute="${consumedRoute}"
                         baseUrl="${baseUrl}"
                         slot="${component.slot??nothing}"
                         style="${component.style}"
                         class="${component.cssClasses}"
                         .state="${{...(component.initialData as Record<string, unknown> ?? {}), ...state}}"
                         .data="${{...data}}"
                         .appState="${appState}"
                         .appData="${appData}"
        >
       </mateu-component>`
}
