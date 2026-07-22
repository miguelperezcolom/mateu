import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Notification from "@mateu/shared/apiClients/dtos/componentmetadata/Notification";
import { html, nothing } from "lit";

/**
 * Design-system-neutral Notification renderer: an inline message strip (title + text) styled with
 * Lumo vars + fallbacks — no `@vaadin`. The Vaadin adapter overrides ComponentMetadataType.
 * Notification with a vaadin-notification overlay for full fidelity.
 */
export const renderNotification = (component: ClientSideComponent) => {
    const metadata = component.metadata as Notification
    return html`
        <div
            role="status"
            slot="${component.slot ?? nothing}"
            class="${component.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${component.style}"
        >
            ${metadata.title ? html`<strong>${metadata.title}</strong>` : nothing}
            ${metadata.text ? html`<span>${metadata.text}</span>` : nothing}
        </div>
    `
}
