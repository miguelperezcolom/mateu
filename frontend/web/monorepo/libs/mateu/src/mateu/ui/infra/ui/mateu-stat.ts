import { css, html, LitElement, nothing, svg } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Dependency-free KPI stat tile: a label, a big value with optional unit, a delta colored by trend
 * (up=green, down=red, flat=grey) and an inline SVG sparkline drawn from the `spark` points. A tile
 * with an actionId is clickable and dispatches the standard action-requested event. DS-neutral,
 * dark-mode aware.
 */
@customElement('mateu-stat')
export class MateuStat extends LitElement {

    @property() label: string | undefined
    @property() value: string | undefined
    @property() unit: string | undefined
    @property() delta: string | undefined
    @property() trend: string | undefined
    @property({ type: Array }) spark: number[] = []
    @property() actionId: string | undefined

    static styles = css`
        :host {
            display: block;
        }
        .tile {
            display: flex;
            flex-direction: column;
            gap: .2rem;
            padding: var(--lumo-space-m, 1rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
            min-width: 0;
        }
        .tile.clickable {
            cursor: pointer;
        }
        .tile.clickable:hover {
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .label {
            font-size: var(--lumo-font-size-s, .8rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .value {
            font-size: 1.9rem;
            font-weight: 700;
            line-height: 1.1;
            color: var(--lumo-body-text-color, #111);
        }
        .unit {
            font-size: 1rem;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
            margin-left: .25rem;
        }
        .foot {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: .5rem;
            margin-top: .25rem;
        }
        .delta {
            font-size: var(--lumo-font-size-s, .8rem);
            font-weight: 600;
        }
        .delta.up { color: var(--lumo-success-color, #12b76a); }
        .delta.down { color: var(--lumo-error-color, #e11d48); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); }
        svg { display: block; }
        @media (prefers-color-scheme: dark) {
            .tile { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `

    private sparkline() {
        const pts = this.spark
        if (!pts || pts.length < 2) {
            return nothing
        }
        const w = 84, h = 30, pad = 2
        const min = Math.min(...pts), max = Math.max(...pts)
        const span = max - min || 1
        const stepX = (w - pad * 2) / (pts.length - 1)
        const coords = pts.map((v, i) => {
            const x = pad + i * stepX
            const y = pad + (h - pad * 2) * (1 - (v - min) / span)
            return [x, y] as const
        })
        const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
        const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${h} L${coords[0][0].toFixed(1)} ${h} Z`
        const color = this.trend === 'down'
            ? 'var(--lumo-error-color, #e11d48)'
            : this.trend === 'flat'
                ? 'var(--lumo-secondary-text-color, #888)'
                : 'var(--lumo-success-color, #12b76a)'
        return svg`
            <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
                <path d="${area}" fill="${color}" opacity="0.12"></path>
                <path d="${line}" fill="none" stroke="${color}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `
    }

    private dispatchAction() {
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
        const trend = this.trend ?? 'up'
        return html`
            <div class="tile ${this.actionId ? 'clickable' : ''}" @click="${() => this.dispatchAction()}">
                ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
                <span class="value">${this.value}${this.unit ? html`<span class="unit">${this.unit}</span>` : nothing}</span>
                <div class="foot">
                    ${this.delta ? html`<span class="delta ${trend}">${trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→'} ${this.delta}</span>` : html`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-stat": MateuStat
    }
}
