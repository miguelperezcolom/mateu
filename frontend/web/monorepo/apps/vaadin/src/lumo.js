// Vaadin 25 removed the Lumo token JS modules (color, typography, sizing, spacing, style, badge,
// user-colors, utility, font-icons) — Lumo now ships as pre-assembled CSS, which also carries every
// component's shadow styles (the `@media lumo_components_*` blocks Vaadin injects into each shadow
// root). We import those stylesheets as inline strings (`?inline`) and inject them at runtime into
// the global <style> below, so the styles apply wherever mateu-vaadin.js is loaded, without
// depending on an extracted <link>.
//
// NOT imported any more: the Lumo `.js` mixins (field-button, menu-overlay, overlay,
// required-field). They are deprecated (each one logs "Lumo .js mixins are deprecated and will be
// removed in V26" in every page's console) and their cssText targeted `[part=…]` / `:host`
// selectors that only exist inside shadow roots, so injected at document level they matched
// nothing — the components get those styles from lumo.css above.
import lumoCss from '@vaadin/vaadin-lumo-styles/dist/lumo.css?inline';
import utilityCss from '@vaadin/vaadin-lumo-styles/dist/utility.css?inline';
import '@vaadin/icons/vaadin-iconset.js';

import {css, registerStyles} from '@vaadin/vaadin-themable-mixin/register-styles.js';

// Mateu @Section cards render borderless (like a plain div) in the Vaadin renderer.
// Every section card carries the `mateu-section` marker class (SectionFormRenderer); we keep
// the <vaadin-card> element intact — the @Toc index, scrollspy and sticky logic still enumerate
// `vaadin-card.mateu-section` in the DOM — and only strip the card chrome through the card's own
// custom properties. This is injected into every vaadin-card's shadow DOM (the cards live inside
// mateu-component's shadow root, which no document stylesheet reaches), scoped to section cards,
// and is specific to the Vaadin app.
//
// The registration necessarily comes AFTER vaadin-card is defined: the bundler hoists the Vaadin
// vendor chunk (which defines every component, and holds registerStyles itself) ahead of this
// module's body. registerStyles then still restyles the finalized class and its instances, but
// warns "The custom element definition for vaadin-card was finalized before a style module was
// registered" on every page. That warning is expected here, so it is silenced for THIS call only —
// with the switch the warning itself names — and the previous value is restored right after, so a
// late registration anywhere else still warns.
const vaadinGlobal = (window.Vaadin = window.Vaadin || {});
const suppressedBefore = vaadinGlobal.suppressPostFinalizeStylesWarning;
vaadinGlobal.suppressPostFinalizeStylesWarning = true;
try {
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
} finally {
  vaadinGlobal.suppressPostFinalizeStylesWarning = suppressedBefore;
}

const sheet = document.createElement('style')
sheet.innerHTML = `
${lumoCss}
${utilityCss}
`;
document.body.appendChild(sheet);

// ── Theming isolation for embedding ──────────────────────────────────────────────────────────
// The block above declares Lumo's --lumo-*/--vaadin-* tokens at DOCUMENT scope (:where(:root)).
// That is fine when Mateu owns the page, but shadow DOM does NOT stop custom properties from
// inheriting across the boundary — so an embedded Mateu app would inherit whatever tokens a host
// page declares on its own :root, repainting every component.
//
// The firewall is PROXIMITY: re-emit Lumo's ROOT token blocks scoped to the <mateu-ui>/<mateu-ux>
// container. The container is a CLOSER ancestor than the host's :root, so every element inside
// resolves each token from the container and the host's value can never win. `mateu-ui` mirrors
// the document `theme` attribute (libs/mateu themeScope), so the scoped dark palette tracks it.
// This only ADDS a nearer declaration of the same values, so a standalone app is unchanged.
function scopedRootTokens(cssText, scopes) {
  const list = scopes.split(',').map((s) => s.trim());
  const scoped = (suffix) => list.map((s) => s + suffix).join(',');
  const rules = [`${scoped('')}{color-scheme:light dark}`];
  const grab = (selector, suffix) => {
    // Lumo's root token blocks are FLAT declaration lists, so a block runs to the next `}`.
    const re = new RegExp(
        selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'g');
    let m;
    while ((m = re.exec(cssText)) !== null) {
      const decls = m[1].trim();
      if (decls) rules.push(`${scoped(suffix)}{${decls}}`);
    }
  };
  grab(':where(:host),:where(:root)', '');
  grab(':host,:root', '');
  grab(':host([theme~=dark]),[theme~=dark]', '[theme~=dark]');
  grab(':host([theme~=light-dark]),[theme~=light-dark]', '[theme~=light-dark]');
  return rules.join('\n');
}

const scopedSheet = document.createElement('style');
scopedSheet.setAttribute('data-mateu-theme-scope', '');
scopedSheet.textContent = scopedRootTokens(lumoCss, 'mateu-ui,mateu-ux');
document.head.appendChild(scopedSheet);
