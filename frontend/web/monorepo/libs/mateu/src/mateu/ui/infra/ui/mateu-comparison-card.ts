import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Dependency-free two-value comparison: an optional title, a left and right label+value, and a
 * delta chip (colored by trend up=green/down=red/flat=grey) between them. DS-neutral, dark-mode
 * aware.
 */
@customElement('mateu-comparison-card')
export class MateuComparisonCard extends LitElement {

    @property() heading: string | undefined
    @property() leftLabel: string | undefined
    @property() leftValue: string | undefined
    @property() rightLabel: string | undefined
    @property() rightValue: string | undefined
    @property() delta: string | undefined
    @property() trend: string | undefined

    static styles = css`
        :host { display: block; width: 100%; }
        .card {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 14px);
            padding: var(--lumo-space-m, 1.25rem);
            background: var(--lumo-base-color, #fff);
        }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #222); margin-bottom: .75rem; }
        .row { display: flex; align-items: center; gap: 1rem; }
        .side { flex: 1; text-align: center; }
        .label { font-size: var(--lumo-font-size-xs, .72rem); text-transform: uppercase; letter-spacing: .04em; color: var(--lumo-secondary-text-color, #888); }
        .value { font-size: 1.9rem; font-weight: 800; color: var(--lumo-body-text-color, #111); line-height: 1.1; margin-top: .15rem; }
        .mid { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: .2rem; color: var(--lumo-secondary-text-color, #888); }
        .arrow { font-size: 1.2rem; }
        .delta {
            font-weight: 700; font-size: .85rem; border-radius: 999px; padding: .1rem .55rem;
        }
        .delta.up { color: var(--lumo-success-color, #12b76a); background: var(--lumo-success-color-10pct, rgba(18,183,106,.12)); }
        .delta.down { color: var(--lumo-error-color, #e11d48); background: var(--lumo-error-color-10pct, rgba(225,29,72,.12)); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); background: var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        @media (prefers-color-scheme: dark) { .card { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    `

    render() {
        const trend = this.trend ?? 'flat'
        const arrow = trend === 'up' ? '→' : trend === 'down' ? '→' : '→'
        return html`
            <div class="card">
                ${this.heading ? html`<div class="title">${this.heading}</div>` : nothing}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel ? html`<div class="label">${this.leftLabel}</div>` : nothing}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${arrow}</span>
                        ${this.delta ? html`<span class="delta ${trend}">${trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''} ${this.delta}</span>` : nothing}
                    </div>
                    <div class="side">
                        ${this.rightLabel ? html`<div class="label">${this.rightLabel}</div>` : nothing}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-comparison-card": MateuComparisonCard
    }
}
