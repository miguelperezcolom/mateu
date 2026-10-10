import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Map from "@mateu/shared/apiClients/dtos/componentmetadata/Map";
import { html, nothing } from "lit";

export const renderMap = (component: ClientSideComponent) => {
    const metadata = component.metadata as Map

    return html`
        <mateu-map id="${component.id ?? nothing}"
                   position="${metadata.position ?? nothing}" zoom="${metadata.zoom ?? nothing}"
                   .markers=${metadata.markers ?? []}
                   .markerActionId=${metadata.markerActionId ?? undefined}
                   .tileUrl=${metadata.tileUrl ?? undefined}
                   .attribution=${metadata.attribution ?? undefined}
                   style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
                   slot="${component.slot??nothing}"></mateu-map>
            `
}
