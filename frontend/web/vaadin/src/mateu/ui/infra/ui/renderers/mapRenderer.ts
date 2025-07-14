import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Map from "@mateu/shared/apiClients/dtos/componentmetadata/Map";
import { html } from "lit";

export const renderMap = (component: ClientSideComponent) => {
    const metadata = component.metadata as Map

    return html`
        <vaadin-map src="${metadata.position}" zoom="${metadata.zoom}"
                    style="${component.style}" class="${component.cssClasses}"></vaadin-map>
            `
}