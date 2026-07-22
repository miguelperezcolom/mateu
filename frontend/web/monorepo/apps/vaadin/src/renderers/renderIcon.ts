import { html, nothing } from "lit";

/**
 * Vaadin adapter icon → <vaadin-icon>. Lives in apps/vaadin so the core stays @vaadin-free; registered by
 * VaadinComponentRenderer's renderIcon hook (the core `icon()` port delegates here). The wire icon names are
 * Vaadin/Lumo iconset names ('vaadin:plus', 'lumo:menu'), which vaadin-icon consumes directly.
 */
export const renderVaadinIcon = (icon: string, style?: string, cssClasses?: string) =>
    html`<vaadin-icon icon="${icon}" style="${style ?? nothing}" class="${cssClasses ?? nothing}"></vaadin-icon>`
