import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Icon from "@mateu/shared/apiClients/dtos/componentmetadata/Icon";
import { html } from "lit";

export const renderIcon = (component: ClientSideComponent) => {
    const metadata = component.metadata as Icon

    return html`
        <vaadin-icon icon="${metadata.icon}" style="${component.style}" class="${component.cssClasses}"></vaadin-icon>
    `
}