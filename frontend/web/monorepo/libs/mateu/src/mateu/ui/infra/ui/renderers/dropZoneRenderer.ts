import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import DropZone from "@mateu/shared/apiClients/dtos/componentmetadata/DropZone";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@infra/ui/mateu-drop-zone.ts";

export const renderDropZone = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => html`
    <mateu-drop-zone
            .zone="${component.metadata as DropZone}"
            style="${component.style??nothing}"
            class="${component.cssClasses??nothing}"
            slot="${component.slot??nothing}"
    >${(component.children ?? []).map((child) => renderComponent(container, child, baseUrl, state, data, appState, appData))}</mateu-drop-zone>
`
