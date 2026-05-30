import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html } from "lit";

export const renderDialog = (component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <mateu-dialog
            .component="${component}"
            baseUrl="${baseUrl}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appdata="${appData}"
        ></mateu-dialog>
            `
}
