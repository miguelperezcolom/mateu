import {fieldButton} from '@vaadin/vaadin-lumo-styles/mixins/field-button.js';
import {menuOverlay} from '@vaadin/vaadin-lumo-styles/mixins/menu-overlay.js';
import {overlay} from '@vaadin/vaadin-lumo-styles/mixins/overlay.js';
import {requiredField} from '@vaadin/vaadin-lumo-styles/mixins/required-field.js';
// Vaadin 25 removed the Lumo token JS modules (color, typography, sizing, spacing, style, badge,
// user-colors, utility, font-icons) — Lumo now ships as pre-assembled CSS. We import those
// stylesheets as inline strings (`?inline`) and inject them at runtime into the global <style>
// below, exactly like the old per-module `cssText` injection — so the styles apply wherever
// mateu-vaadin.js is loaded, without depending on an extracted <link>. (The mixins above still
// ship in v25 — deprecated, to be removed in V26 — and carry component-level styles.)
import lumoCss from '@vaadin/vaadin-lumo-styles/dist/lumo.css?inline';
import utilityCss from '@vaadin/vaadin-lumo-styles/dist/utility.css?inline';
import '@vaadin/icons/vaadin-iconset.js';
import {css, registerStyles} from '@vaadin/vaadin-themable-mixin/register-styles.js';

// Mateu @Section cards render borderless (like a plain div) in the Vaadin renderer.
// Every section card carries the `mateu-section` marker class (SectionFormRenderer); we keep
// the <vaadin-card> element intact — the @Toc index, scrollspy and sticky logic still enumerate
// `vaadin-card.mateu-section` in the DOM — and only strip the card chrome through the card's own
// custom properties. This is injected into every vaadin-card's shadow DOM (which the app-level
// index.css cannot reach), scoped to section cards, and is specific to the Vaadin app.
registerStyles(
    'vaadin-card',
    css`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `,
);

const sheet = document.createElement('style')
sheet.innerHTML = `
${fieldButton.cssText}
${menuOverlay.cssText}
${overlay.cssText}
${requiredField.cssText}
${lumoCss}
${utilityCss}
`;
document.body.appendChild(sheet);
