import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Dependency-free call-to-action block: an icon, title, description and an optional CTA button. The
 * theme (info|success|warning|danger) tints the background and accent; the CTA dispatches the
 * standard action-requested event. DS-neutral, dark-mode aware.
 */
@customElement('mateu-callout-card')
export class MateuCalloutCard extends LitElement {

    @property() heading: string | undefined
    @property() description: string | undefined
    @property() icon: string | undefined
    @property() ctaLabel: string | undefined
    @property() actionId: string | undefined
    @property() theme: string | undefined

    static styles = css`
        :host { display: block; width: 100%; }
        .callout {
            display: flex; gap: 1rem; align-items: flex-start;
            padding: var(--lumo-space-l, 1.5rem);
            border-radius: var(--lumo-border-radius-l, 14px);
            border-left: 4px solid var(--accent, var(--lumo-primary-color, #1a73e8));
            background: var(--bg, var(--lumo-primary-color-10pct, rgba(26,115,232,.08)));
        }
        .icon { font-size: 1.7rem; line-height: 1; }
        .body { flex: 1; display: flex; flex-direction: column; gap: .35rem; }
        .heading { font-weight: 700; font-size: 1.1rem; color: var(--lumo-body-text-color, #111); }
        .desc { color: var(--lumo-secondary-text-color, #555); line-height: 1.5; }
        .cta {
            align-self: flex-start; margin-top: .5rem;
            border: none; border-radius: var(--lumo-border-radius-m, 8px);
            padding: .55rem 1.1rem; font-weight: 600; cursor: pointer; font-size: .9rem;
            background: var(--accent, var(--lumo-primary-color, #1a73e8)); color: #fff;
        }
        .cta:hover { filter: brightness(.95); }
    `

    private themeVars(): string {
        switch (this.theme) {
            case 'success': return '--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));'
            case 'warning': return '--accent: #f59e0b; --bg: rgba(245,158,11,.12);'
            case 'danger': return '--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));'
            default: return '--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));'
        }
    }

    private cta() {
        if (!this.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon ? html`<span class="icon">${this.icon}</span>` : nothing}
                <div class="body">
                    ${this.heading ? html`<span class="heading">${this.heading}</span>` : nothing}
                    ${this.description ? html`<span class="desc">${this.description}</span>` : nothing}
                    ${this.ctaLabel ? html`<button class="cta" @click="${() => this.cta()}">${this.ctaLabel}</button>` : nothing}
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-callout-card": MateuCalloutCard
    }
}
