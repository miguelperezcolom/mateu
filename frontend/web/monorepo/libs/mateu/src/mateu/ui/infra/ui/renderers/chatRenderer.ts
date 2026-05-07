import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";
import Chat from "@mateu/shared/apiClients/dtos/componentmetadata/Chat.ts";

export const renderChat = (component: ClientSideComponent, _state: any, _data: any) => {
    const metadata = component.metadata as Chat
    return html`<mateu-chat sseUrl="${metadata.sseUrl}"
                            style="${component.style}" 
                            class="${component.cssClasses}" 
                            slot="${component.slot??nothing}"></mateu-chat>`
}