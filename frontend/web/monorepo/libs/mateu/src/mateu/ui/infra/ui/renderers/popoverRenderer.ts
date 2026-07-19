import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { html, LitElement, nothing } from "lit";
import { popoverRenderer } from "@vaadin/popover/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Popover
    return html`
        <div id="show-notifications" slot="${component.slot??nothing}">${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${popoverRenderer(() => html`${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}`, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-popover>
    `
}
