import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MicroFrontend from "@mateu/shared/apiClients/dtos/componentmetadata/MicroFrontend";
import { html, nothing } from "lit";
import { nanoid } from "nanoid";

export const renderMicroFrontend = (component: ClientSideComponent) => {
    const metadata = component.metadata as MicroFrontend

    return html`
        <mateu-api-caller>
        <mateu-ux baseUrl="${metadata.baseUrl}"  
                  route="${metadata.route}" 
                  consumedRoute="${metadata.consumedRoute}" 
                  id="${nanoid()}"
                  style="${component.style}" class="${component.cssClasses}"
                  slot="${component.slot??nothing}"
        ></mateu-ux>
        </mateu-api-caller>
            `
}