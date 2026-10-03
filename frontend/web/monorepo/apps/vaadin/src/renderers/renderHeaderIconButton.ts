import "@vaadin/button"
import "@vaadin/icon"
import "@vaadin/icons"
import { html, nothing, TemplateResult } from "lit"
import type { HeaderIconButton } from "@infra/ui/renderers/ComponentRenderer"

/**
 * Vaadin adapter: an icon-only button of the app header's chrome (the chat and theme toggles) as a
 * Lumo `tertiary icon` vaadin-button — Lumo's size, font, hover and focus ring, like every other
 * button of the renderer. The glyph is an outline icon at --lumo-icon-size-m in the header's icon
 * colour; a two-state button carries aria-pressed, which mateu-app's styles paint with the primary
 * colours (.mateu-header-icon-btn[aria-pressed="true"]).
 */
export const renderVaadinHeaderIconButton = (button: HeaderIconButton): TemplateResult => html`
    <vaadin-button theme="tertiary icon" class="mateu-header-icon-btn ${button.cssClasses ?? ''}"
            @click="${button.onClick}"
            title="${button.title ?? button.label}" aria-label="${button.label}"
            aria-pressed="${button.pressed === undefined ? nothing : String(button.pressed)}">
        <vaadin-icon icon="${button.icon}"></vaadin-icon>
    </vaadin-button>`
