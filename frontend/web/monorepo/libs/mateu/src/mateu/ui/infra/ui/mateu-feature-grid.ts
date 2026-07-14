import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import Feature from "@mateu/shared/apiClients/dtos/componentmetadata/Feature";

/**
 * Dependency-free responsive feature grid: cards of icon + title + description. `columns` fixes the
 * column count (0 = auto-fit). A feature with an actionId is clickable and dispatches the standard
 * action-requested event. DS-neutral, dark-mode aware.
 */
@customElement('mateu-feature-grid')
export class MateuFeatureGrid extends LitElement {

    @property({ type: Array }) features: Feature[] = []
    @property({ type: Number }) columns = 0

    static styles = css`
        :host { display: block; width: 100%; }
        .grid {
            display: grid;
            gap: var(--lumo-space-m, 1rem);
        }
        .card {
            display: flex;
            flex-direction: column;
            gap: .35rem;
            padding: var(--lumo-space-m, 1.15rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
        }
        .card.clickable { cursor: pointer; }
        .card.clickable:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .icon {
            width: 2.5rem; height: 2.5rem;
            border-radius: var(--lumo-border-radius-m, 10px);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            display: flex; align-items: center; justify-content: center;
            font-size: 1.4rem;
        }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #111); }
        .desc { color: var(--lumo-secondary-text-color, #666); font-size: var(--lumo-font-size-s, .875rem); }
        @media (prefers-color-scheme: dark) {
            .card { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `

    private clickFeature(feature: Feature) {
        if (!feature.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: feature.actionId },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const cols = this.columns && this.columns > 0
            ? `repeat(${this.columns}, minmax(0, 1fr))`
            : 'repeat(auto-fit, minmax(15rem, 1fr))'
        return html`
            <div class="grid" style="grid-template-columns: ${cols};">
                ${this.features.map(feature => html`
                    <div class="card ${feature.actionId ? 'clickable' : ''}" @click="${() => this.clickFeature(feature)}">
                        ${feature.icon ? html`<span class="icon">${feature.icon}</span>` : nothing}
                        <span class="title">${feature.title}</span>
                        ${feature.description ? html`<span class="desc">${feature.description}</span>` : nothing}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-feature-grid": MateuFeatureGrid
    }
}
