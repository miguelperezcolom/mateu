import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const handleButtonClick = (event: Event, button: Button) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
            parameters: button.parameters
        },
        bubbles: true,
        composed: true
    }))
}

const formatShortcut = (shortcut?: string): string | undefined =>
    shortcut
        ? shortcut.split('+').map(p => p.length <= 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)).join('+')
        : undefined

export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const rawLabel = metadata.label
    const label = rawLabel?.includes('${')
        ? new Function('state', 'data', 'return `' + rawLabel + '`')(state ?? {}, data ?? {})
        : rawLabel
    let theme = '';
    if (metadata.buttonStyle) {
        theme += ' ' + metadata.buttonStyle
    }
    if (metadata.color && metadata.color !== 'none' && metadata.color !== 'normal') {
        theme += ' ' + metadata.color
    }
    if (metadata.size && metadata.size !== 'none' && metadata.size !== 'normal') {
        theme += ' ' + metadata.size
    }
    return html`<vaadin-button
id="${component.id}"
            data-action-id="${metadata.actionId}"
            @click="${(e:any) => handleButtonClick(e, metadata)}"
            style="${component.style}"
            class="${component.cssClasses}"
            theme="${theme}"
            ?disabled="${metadata.disabled}"
            title="${metadata.shortcut ? `${label} (${formatShortcut(metadata.shortcut)})` : nothing}"
            slot="${component.slot??nothing}"
    >${metadata.iconOnLeft?html`<vaadin-icon icon="${metadata.iconOnLeft}"></vaadin-icon>`:nothing}${label}${metadata.iconOnRight?html`<vaadin-icon icon="${metadata.iconOnRight}"></vaadin-icon>`:nothing}</vaadin-button>`
}