import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import { html, nothing } from "lit";

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
