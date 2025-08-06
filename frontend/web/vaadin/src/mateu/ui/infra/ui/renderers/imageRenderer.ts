import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Image from "@mateu/shared/apiClients/dtos/componentmetadata/Image";
import { html, nothing } from "lit";

export const renderImage = (component: ClientSideComponent) => {
    const metadata = component.metadata as Image

    return html`
        <img src="${metadata.src}" style="${component.style}" class="${component.cssClasses}"
             slot="${component.slot??nothing}">
            `
}