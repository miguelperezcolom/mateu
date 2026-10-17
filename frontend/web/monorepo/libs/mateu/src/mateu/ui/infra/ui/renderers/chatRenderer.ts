import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";
import Chat from "@mateu/shared/apiClients/dtos/componentmetadata/Chat.ts";
import { requireElement } from "@infra/ui/lazyElements.ts";

export const renderChat = (component: ClientSideComponent, _state: ComponentState, _data: ComponentData) => {
    const metadata = component.metadata as Chat
    requireElement('mateu-chat')
    return html`<mateu-chat sseUrl="${metadata.sseUrl}"
                            style="${component.style}" 
                            class="${component.cssClasses}" 
                            slot="${component.slot??nothing}"></mateu-chat>`
}