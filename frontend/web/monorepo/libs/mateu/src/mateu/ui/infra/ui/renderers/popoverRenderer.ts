import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { html, LitElement, nothing } from "lit";
import { popoverRenderer } from "@vaadin/popover/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Popover
    html`${renderComponent(container, metadata.content, baseUrl, state, data)}`

    return html`
        <div id="show-notifications">${renderComponent(container, metadata.wrapped, baseUrl, state, data)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${component.slot??nothing}"
                ${popoverRenderer(popover => {
        console.log('popover', popover)
        return html`${renderComponent(container, metadata.content, baseUrl, state, data)}`
    }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-popover>
    `
}