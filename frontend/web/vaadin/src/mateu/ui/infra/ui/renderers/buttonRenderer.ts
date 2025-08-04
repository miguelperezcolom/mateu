import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html } from "lit";

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

export const renderButton = (component: ClientSideComponent) => {
    const metadata = component.metadata as Button
    return html`<vaadin-button
            data-action-id="${metadata.actionId}"
            @click="${handleButtonClick}"
            style="${component.style}" 
            class="${component.cssClasses}"
    >${metadata.label}</vaadin-button>`
}