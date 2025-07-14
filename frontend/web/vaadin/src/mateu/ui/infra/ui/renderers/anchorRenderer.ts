import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Anchor from "@mateu/shared/apiClients/dtos/componentmetadata/Anchor";
import { html } from "lit";

export const renderAnchor = (component: ClientSideComponent) => {
    const metadata = component.metadata as Anchor
    return html`<a href="${metadata.url}" style="${component.style}" class="${component.cssClasses}">${metadata.text}</a>`
}