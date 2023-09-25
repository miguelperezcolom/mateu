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
import '@vaadin/vaadin-icons/vaadin-iconset.js';

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
