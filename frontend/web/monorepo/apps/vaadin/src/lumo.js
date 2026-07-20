import {fieldButton} from '@vaadin/vaadin-lumo-styles/mixins/field-button.js';
import {menuOverlay} from '@vaadin/vaadin-lumo-styles/mixins/menu-overlay.js';
import {overlay} from '@vaadin/vaadin-lumo-styles/mixins/overlay.js';
import {requiredField} from '@vaadin/vaadin-lumo-styles/mixins/required-field.js';
import {badge} from '@vaadin/vaadin-lumo-styles/badge.js';
import {color} from '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import {sizing} from '@vaadin/vaadin-lumo-styles/sizing.js';
import {spacing} from '@vaadin/vaadin-lumo-styles/spacing.js';
import {style} from '@vaadin/vaadin-lumo-styles/style.js';
import {typography} from '@vaadin/vaadin-lumo-styles/typography.js';
import {userColors} from '@vaadin/vaadin-lumo-styles/user-colors.js';
import {utility} from '@vaadin/vaadin-lumo-styles/utility.js';
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
${badge.cssText}
${color.cssText}
${sizing.cssText}
${spacing.cssText}
${style.cssText}
${typography.cssText}
${userColors.cssText}
${utility.cssText}
`;
document.body.appendChild(sheet);
