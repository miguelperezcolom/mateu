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

/**
 * A server-side component styled as a centred column (`max-width: 900px; margin: auto` — the wizard
 * and form default) takes the width it is GIVEN, capped by its max-width. Without a width, the auto
 * margins switch off the flex stretch and the element shrinks to its content's MIN width — two form
 * columns side by side (~410px) — so on a 390px phone the second column was cut off at the edge and
 * the form never collapsed to one column (WCAG 1.4.10 Reflow; UX review W-V-REFLOW).
 */
export const serverSideStyle = (style?: string): string | undefined => {
    if (!style) return style
    const centred = /margin\s*:\s*(?:0\s+)?auto/.test(style) && /max-width\s*:/.test(style)
    const sized = /(^|[;\s])width\s*:/.test(style)
    return centred && !sized ? `width: 100%; box-sizing: border-box; ${style}` : style
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
                         style="${serverSideStyle(component.style)}"
                         class="${component.cssClasses}"
                         .state="${{...(component.initialData as Record<string, unknown> ?? {}), ...state}}"
                         .data="${{...data}}"
                         .appState="${appState}"
                         .appData="${appData}"
        >
       </mateu-component>`
}
