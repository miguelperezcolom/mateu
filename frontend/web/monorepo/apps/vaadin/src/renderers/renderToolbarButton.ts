import "@vaadin/button"
import "@vaadin/icon"
import "@vaadin/icons"
import { html, nothing, TemplateResult } from "lit"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button"
import { buttonTheme } from "@infra/ui/mateu-content-header"

interface VButton { id?: string; iconOnLeft?: string; iconOnRight?: string; disabled?: boolean }

/** Vaadin adapter toolbar button (mateu-content-header renderToolbarButton hook) — vaadin-button. */
export const renderVaadinToolbarButton = (button: unknown, label: string, onClick: () => void): TemplateResult => {
    const b = button as VButton
    return html`
        <vaadin-button
                data-action-id="${b.id}"
                theme="${buttonTheme(button as Button) || nothing}"
                @click="${onClick}"
                ?disabled="${b.disabled}"
        >${b.iconOnLeft ? html`<vaadin-icon icon="${b.iconOnLeft}"></vaadin-icon>` : nothing}${label}${b.iconOnRight ? html`<vaadin-icon icon="${b.iconOnRight}"></vaadin-icon>` : nothing}</vaadin-button>
    `
}

/** Vaadin adapter prev/next peer-object arrows (mateu-content-header renderPeerNav hook). */
export const renderVaadinPeerNav = (peerNav: { prevLabel?: string, prevRoute?: string, nextLabel?: string, nextRoute?: string }): TemplateResult => html`
    <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
        <vaadin-button theme="tertiary icon" class="peer-nav-prev" title="${peerNav.prevLabel ?? 'Previous'}"
                ?disabled="${!peerNav.prevRoute}"
                @click="${() => { if (peerNav.prevRoute) window.location.href = peerNav.prevRoute }}">
            <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
        </vaadin-button>
        <vaadin-button theme="tertiary icon" class="peer-nav-next" title="${peerNav.nextLabel ?? 'Next'}"
                ?disabled="${!peerNav.nextRoute}"
                @click="${() => { if (peerNav.nextRoute) window.location.href = peerNav.nextRoute }}">
            <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
        </vaadin-button>
    </div>`
