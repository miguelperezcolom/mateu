import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
export const renderPage = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, standalone?: boolean) => {
    const metadata = component.metadata as PageComponent
    return html`<mateu-page
            .component="${component}"
            baseUrl="${baseUrl}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appdata="${appData}"
            slot="${component.slot??nothing}"
            style="${component.style}"
            class="${component.cssClasses}"
            ?standalone="${standalone ?? false}"
    >
        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        ${metadata?.buttons?.map(button => html`
                   ${renderComponent(container, {
            id: button.actionId,
            metadata: button,
            type: ComponentType.ClientSide,
            slot: 'buttons'
        } as unknown as ClientSideComponent, undefined, state, data, appState, appData)}
`)}
</mateu-page>
    `
}
