import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";
import Chat from "@mateu/shared/apiClients/dtos/componentmetadata/Chat.ts";
import { requireElement } from "@infra/ui/lazyElements.ts";

/**
 * A Chat placed on a page: the same panel as the app's assistant, speaking the same contract — its
 * uploads, the screen it sits on as context, and the app's menu and MCP endpoint (mateu-chat reads
 * those off the shell around it). The agent's navigation goes through the shell like the
 * assistant's (the event bubbles to it; with no shell the panel navigates itself) and a screen it
 * generates lands in the content area. It has nothing to close into, so it shows no ✕.
 */
export const renderChat = (component: ClientSideComponent, state: ComponentState, data: ComponentData) => {
    const metadata = component.metadata as Chat
    requireElement('mateu-chat')
    return html`<mateu-chat sseUrl="${metadata.sseUrl}"
                            .uploadUrl="${metadata.uploadUrl || undefined}"
                            .closable="${false}"
                            .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, componentState: state, componentData: data })}"
                            style="${component.style}"
                            class="${component.cssClasses}"
                            slot="${component.slot??nothing}"></mateu-chat>`
}
