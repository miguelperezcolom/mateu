import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Tooltip from "@mateu/shared/apiClients/dtos/componentmetadata/Tooltip";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderTooltip = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Tooltip
    return html`
        <div id="show-notifications">${renderComponent(container, metadata.wrapped, baseUrl, state, data)}</div>
        <vaadin-tooltip
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot??nothing}"
                for="show-notifications" text="${metadata.text}" position="top-start"></vaadin-tooltip>
    `
}