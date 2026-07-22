import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import { html, nothing } from "lit";

/*
 * Design-system-neutral MessageInput — a native input + Send button (no `@vaadin`). The wire contract is
 * preserved: submitting (Enter or Send) dispatches `action-requested` with { actionId, parameters:{ message } }.
 * The Vaadin adapter overrides it with vaadin-message-input.
 */
export const renderMessageInput = (component: ClientSideComponent) => {
    const metadata = component.metadata as MessageInput
    const doSubmit = (el: HTMLElement) => {
        const input = el.closest('.mateu-message-input')?.querySelector('input') as HTMLInputElement | null
        const value = input?.value ?? ''
        if (!metadata.actionId || !value.trim()) return
        el.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: metadata.actionId, parameters: { message: value } },
            bubbles: true,
            composed: true,
        }))
        if (input) input.value = ''
    }
    return html`
        <div class="mateu-message-input ${component.cssClasses ?? ''}"
             style="display:flex; gap:.5rem; align-items:center; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSubmit(e.currentTarget as HTMLElement) } }}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${(e: Event) => doSubmit(e.currentTarget as HTMLElement)}">Send</button>
        </div>
    `
}
