import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html } from "lit";
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog.ts";

export const renderDialog = (component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <mateu-dialog
                id="${(component.metadata as Dialog).id}"
            .component="${component}"
            baseUrl="${baseUrl}"
            .xstate="${state}"
            .xdata="${data}"
            .appState="${appState}"
            .appdata="${appData}"
        ></mateu-dialog>
            `
}
