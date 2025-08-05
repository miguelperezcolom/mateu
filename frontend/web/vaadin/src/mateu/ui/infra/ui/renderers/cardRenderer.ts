import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import { html, nothing } from "lit";

export const renderCard = (component: ClientSideComponent) => {
    const metadata = component.metadata as Card
    let theme = '';

    return html`
        <vaadin-card
                style="${component.style}" 
                class="${component.cssClasses}" 
                theme="${theme}"
        >
            ${metadata.image?html`<img slot="media" width="100" src="${metadata.image}" alt="" />`:nothing}
            ${metadata.title?html`<div slot="title">${metadata.title}</div>`:nothing}
            ${metadata.subtitle?html`<div slot="subtitle">${metadata.subtitle}</div>`:nothing}
            <div>
                ${metadata.content?html`<div>${metadata.content}</div>`:nothing}
            </div>
        </vaadin-card>
    `
}