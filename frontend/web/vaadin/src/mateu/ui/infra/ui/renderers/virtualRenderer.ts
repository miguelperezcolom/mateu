import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList";
import { html, nothing } from "lit";
import { virtualListRenderer } from "@vaadin/virtual-list/lit";

export const renderVirtualList = (component: ClientSideComponent) => {
    const metadata = component.metadata as VirtualList

    const renderer = (item: any) => html`
            ${JSON.stringify(item)}
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