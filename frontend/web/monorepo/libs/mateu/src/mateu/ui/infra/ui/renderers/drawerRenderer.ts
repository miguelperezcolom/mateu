import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html } from "lit";
import Drawer from "@mateu/shared/apiClients/dtos/componentmetadata/Drawer.ts";

export const renderDrawer = (component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <mateu-drawer
                id="${(component.metadata as Drawer).id}"
            .component="${component}"
            baseUrl="${baseUrl}"
            .xstate="${state}"
            .xdata="${data}"
            .appState="${appState}"
            .appdata="${appData}"
        ></mateu-drawer>
            `
}
