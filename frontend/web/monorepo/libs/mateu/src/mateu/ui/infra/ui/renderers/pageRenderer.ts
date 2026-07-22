import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import Fab from "@mateu/shared/apiClients/dtos/componentmetadata/Fab.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

export const renderPage = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, standalone?: boolean) => {
    const metadata = component.metadata as PageComponent
    const fabs: Fab[] = (metadata as any)?.fabs ?? []
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
        ${fabs.map((fab, idx) => html`
            <button class="page-fab" style="position: fixed; bottom: ${1.5 + idx * 4}rem; right: 5.5rem;"
                @click="${() => container.dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId: fab.actionId },
                    bubbles: true,
                    composed: true
                }))}"
                title="${fab.label}">
                ${icon(fab.icon)}
            </button>
        `)}
</mateu-page>
    `
}
