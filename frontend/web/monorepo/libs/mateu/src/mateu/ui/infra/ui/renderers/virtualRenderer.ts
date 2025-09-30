import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList";
import { html, LitElement, nothing } from "lit";
import { virtualListRenderer } from "@vaadin/virtual-list/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderVirtualList = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) => {
    const metadata = component.metadata as VirtualList

    const renderer = (item: any) => html`
            ${renderComponent(container, item, baseUrl, state, data, appState, appData)}
`

    return html`
        <vaadin-virtual-list
                .items="${metadata.page.content}"
                ${virtualListRenderer(renderer, [])}
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        ></vaadin-virtual-list>
    `
}