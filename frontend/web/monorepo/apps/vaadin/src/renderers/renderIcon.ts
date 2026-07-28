import { html, nothing } from "lit";

/**
 * Vaadin adapter icon → <vaadin-icon>. Lives in apps/vaadin so the core stays @vaadin-free; registered by
 * VaadinComponentRenderer's renderIcon hook (the core `icon()` port delegates here). The wire icon names are
 * Vaadin/Lumo iconset names ('vaadin:plus', 'lumo:menu'), which vaadin-icon consumes directly.
 *
 * Some wire names have NO glyph in the Vaadin collection (they exist in other design systems'
 * sets) — those map to the closest Vaadin equivalent so the button never renders empty.
 */
const VAADIN_ICON_ALIASES: Record<string, string> = {
    'vaadin:wifi': 'vaadin:connect',       // tarjeta wifi (no wifi glyph in the vaadin set)
    'vaadin:pen': 'vaadin:pencil',         // firma (pen → pencil)
    'vaadin:automation': 'vaadin:cogs',    // procesos automatizados
}

export const renderVaadinIcon = (icon: string, style?: string, cssClasses?: string) =>
    html`<vaadin-icon icon="${VAADIN_ICON_ALIASES[icon] ?? icon}" style="${style ?? nothing}" class="${cssClasses ?? nothing}"></vaadin-icon>`
