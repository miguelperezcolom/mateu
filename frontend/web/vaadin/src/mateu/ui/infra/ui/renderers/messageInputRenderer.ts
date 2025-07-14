import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import { html } from "lit";

export const renderMessageInput = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as MessageInput
    return html`
        <vaadin-message-input style="${component.style}" class="${component.cssClasses}"></vaadin-message-input>
    `
}