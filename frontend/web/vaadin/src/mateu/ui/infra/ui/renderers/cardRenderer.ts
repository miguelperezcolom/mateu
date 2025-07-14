import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import { html } from "lit";

export const renderCard = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Card
    return html`
        <vaadin-card style="${component.style}" class="${component.cssClasses}">
            <div slot="title">Lapland</div>
            <!-- tag::[] -->
            <div slot="subtitle">The Exotic North</div>
            <!-- end::[] -->
            <div>Lapland is the northern-most region of Finland and an active outdoor destination.</div>
        </vaadin-card>
    `
}