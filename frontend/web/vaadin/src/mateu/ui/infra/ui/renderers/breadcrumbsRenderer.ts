import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, nothing } from "lit";
import Breadcrumbs from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs";

export const renderBreadcrumbs = (component: ClientSideComponent) => {
    const metadata = component.metadata as Breadcrumbs
    return html`<vaadin-horizontal-layout theme="spacing"
                                          slot="${component.slot??nothing}">
        ${metadata.breadcrumbs.map(breadcrumb => html`
            <a href="${breadcrumb.link}">${breadcrumb.text}</a>
            <span>/</span>
        `)}
        <div style="${component.style}" class="${component.cssClasses}">${metadata.currentItemText}</span>
    </vaadin-horizontal-layout>`
}