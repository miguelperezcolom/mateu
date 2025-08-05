import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";

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
    let theme = '';
    if (metadata.buttonStyle) {
        theme += ' ' + metadata.buttonStyle
    }
    if (metadata.size) {
        theme += ' ' + metadata.size
    }
    return html`<vaadin-button
            data-action-id="${metadata.actionId}"
            @click="${handleButtonClick}"
            style="${component.style}" 
            class="${component.cssClasses}"
            theme="${theme}"
            ?disabled="${metadata.disabled}"
    >${metadata.iconOnLeft?html`<vaadin-icon icon="${metadata.iconOnLeft}"></vaadin-icon>`:nothing}${metadata.label}${metadata.iconOnRight?html`<vaadin-icon icon="${metadata.iconOnRight}"></vaadin-icon>`:nothing}</vaadin-button>`
}