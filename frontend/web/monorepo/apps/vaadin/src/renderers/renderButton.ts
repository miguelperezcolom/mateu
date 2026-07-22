import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { formatShortcut } from "@infra/ui/shortcuts.ts";
import { handleButtonClick } from "@infra/ui/renderers/buttonRenderer.ts";

/**
 * Vaadin adapter Button → vaadin-button (Lumo theme attribute + vaadin-icon). Lives in apps/vaadin so the
 * core stays @vaadin-free; registered by VaadinComponentRenderer (the core renders a native <button>).
 */
export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const label = interpolate(metadata.label, state, data)
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
