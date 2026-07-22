import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import MessageList from "@mateu/shared/apiClients/dtos/componentmetadata/MessageList";
import { html, nothing } from "lit";

/**
 * Vaadin adapter MessageInput / MessageList → vaadin-message-input / vaadin-message-list. Live in
 * apps/vaadin so the core stays @vaadin-free; registered by VaadinComponentRenderer (the core renders
 * native equivalents). The wire contract (action-requested on submit) is identical.
 */
export const renderMessageInput = (component: ClientSideComponent) => {
    const metadata = component.metadata as MessageInput
    const submit = (e: CustomEvent) => {
        const value = (e.detail as { value?: string })?.value ?? ''
        if (!metadata.actionId || !value.trim()) return
        ;(e.currentTarget as Element).dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: metadata.actionId, parameters: { message: value } },
            bubbles: true,
            composed: true,
        }))
    }
    return html`
        <vaadin-message-input
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
                @submit="${submit}"
        ></vaadin-message-input>
    `
}

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
