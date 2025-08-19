import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList";
import { html, nothing } from "lit";
import { virtualListRenderer } from "@vaadin/virtual-list/lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderVirtualList = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as VirtualList

    const renderer = (item: any) => html`
            ${renderComponent(item, baseUrl, state, data)}
`

    return html`
        <vaadin-virtual-list
                .items="${metadata.page.items}"
                ${virtualListRenderer(renderer, [])}
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        ></vaadin-virtual-list>
    `
}