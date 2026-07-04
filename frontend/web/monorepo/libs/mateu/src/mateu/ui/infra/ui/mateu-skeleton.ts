import { css, html, LitElement } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Shimmering loading placeholder. Variants mimic common shapes: text (lines of copy),
 * card (a tile), grid (table rows), form (label + field pairs). count repeats the shape.
 */
@customElement('mateu-skeleton')
export class MateuSkeleton extends LitElement {

    @property()
    variant: 'text' | 'card' | 'grid' | 'form' = 'text'

    @property({ type: Number })
    count = 3

    static styles = css`
        :host {
            display: block;
            flex: 1 1 0;
            min-width: 6rem;
            width: 100%;
        }
        .bone {
            background: linear-gradient(90deg,
                var(--lumo-contrast-10pct, rgba(0,0,0,.08)) 25%,
                var(--lumo-contrast-5pct, rgba(0,0,0,.04)) 37%,
                var(--lumo-contrast-10pct, rgba(0,0,0,.08)) 63%);
            background-size: 400% 100%;
            animation: shimmer 1.4s ease infinite;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        @keyframes shimmer {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
        }
        .line { height: 1em; margin: .5em 0; }
        .line:nth-child(3n) { width: 80%; }
        .line:nth-child(3n+1) { width: 95%; }
        .line:nth-child(3n+2) { width: 60%; }
        .card { height: 9rem; }
        .row { height: 2.25rem; margin: .4em 0; }
        .form-pair { display: flex; flex-direction: column; gap: .35em; margin: .9em 0; }
        .label { height: .8em; width: 30%; }
        .field { height: 2.25em; width: 100%; }
    `

    render() {
        const items = Array.from({ length: Math.max(1, this.count) })
        if (this.variant == 'card') {
            return html`${items.map(() => html`<div class="bone card" style="margin: .5em 0;"></div>`)}`
        }
        if (this.variant == 'grid') {
            return html`${items.map(() => html`<div class="bone row"></div>`)}`
        }
        if (this.variant == 'form') {
            return html`${items.map(() => html`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`
        }
        return html`${items.map(() => html`<div class="bone line"></div>`)}`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-skeleton": MateuSkeleton
    }
}
