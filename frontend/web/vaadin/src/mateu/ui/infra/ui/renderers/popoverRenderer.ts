import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { html } from "lit";
import { popoverRenderer } from "@vaadin/popover/lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderPopover = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Popover
    html`${renderComponent(metadata.content, baseUrl, data)}`

    return html`
        <div id="show-notifications">${renderComponent(metadata.wrapped, baseUrl, data)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${popoverRenderer(popover => {
        console.log('popover', popover)
        return html`${renderComponent(metadata.content, baseUrl, data)}`
    }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-popover>
    `
}