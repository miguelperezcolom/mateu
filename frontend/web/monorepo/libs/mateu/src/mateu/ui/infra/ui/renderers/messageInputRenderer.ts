import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import { html, nothing } from "lit";

export const renderMessageInput = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as MessageInput
    return html`
        <vaadin-message-input style="${component.style}" class="${component.cssClasses}"
                              slot="${component.slot??nothing}"></vaadin-message-input>
    `
}