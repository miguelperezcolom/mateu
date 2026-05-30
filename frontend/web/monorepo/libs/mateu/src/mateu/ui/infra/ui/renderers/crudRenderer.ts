import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
export const renderCrud = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, standalone?: boolean) => {
    return html`<mateu-table-crud
            id="${component.id}"
            baseUrl="${baseUrl}"
            .component="${component}"
            .metadata="${component.metadata}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appdata="${appData}"
            style="${component.style}"
            class="${component.cssClasses}"
            slot="${component.slot??nothing}"
            ?standalone="${standalone ?? false}"
    >
        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
    </mateu-table-crud>`
}
