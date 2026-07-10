import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageList from "@mateu/shared/apiClients/dtos/componentmetadata/MessageList";
import { html, nothing } from "lit";

export const renderMessageList = (component: ClientSideComponent) => {
    const metadata = component.metadata as MessageList
    const items = (metadata.items ?? []).map(item => ({
        text: item.text,
        time: item.time,
        userName: item.userName,
        userImg: item.userImg,
        userAbbr: item.userAbbr,
        userColorIndex: item.userColorIndex,
    }))
    return html`
        <vaadin-message-list
                markdown
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
                .items="${items}"
        ></vaadin-message-list>
    `
}
