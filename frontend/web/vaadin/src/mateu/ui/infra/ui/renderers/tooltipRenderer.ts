import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Tooltip from "@mateu/shared/apiClients/dtos/componentmetadata/Tooltip";
import { html } from "lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderTooltip = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Tooltip
    return html`
        <div id="show-notifications">${renderComponent(metadata.wrapped, baseUrl, data)}</div>
        <vaadin-tooltip
                style="${component.style}" class="${component.cssClasses}"
                for="show-notifications" text="${metadata.text}" position="top-start"></vaadin-tooltip>
    `
}