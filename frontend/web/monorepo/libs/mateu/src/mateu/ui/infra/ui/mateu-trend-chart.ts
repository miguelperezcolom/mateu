import { css, html, LitElement, nothing, svg } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Dependency-free line/area chart: a single series drawn as an SVG polyline (optionally area-filled)
 * with x-axis labels, min/max dots and per-point hover titles. For rich multi-series charts use the
 * Chart component. DS-neutral, dark-mode aware.
 */
@customElement('mateu-trend-chart')
export class MateuTrendChart extends LitElement {

    @property() heading: string | undefined
    @property({ type: Array }) values: number[] = []
    @property({ type: Array }) labels: string[] = []
    @property() color: string | undefined
    @property({ type: Boolean }) area = false

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `

    render() {
        const vals = this.values
        if (!vals || vals.length < 2) {
            return html``
        }
        const w = 600, h = 160, pad = 8
        const min = Math.min(...vals), max = Math.max(...vals)
        const span = max - min || 1
        const stepX = (w - pad * 2) / (vals.length - 1)
        const pts = vals.map((v, i) => {
            const x = pad + i * stepX
            const y = pad + (h - pad * 2) * (1 - (v - min) / span)
            return [x, y] as const
        })
        const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
        const areaPath = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pts[0][0].toFixed(1)} ${h - pad} Z`
        const color = this.color || 'var(--lumo-primary-color, #1a73e8)'
        const maxI = vals.indexOf(max), minI = vals.indexOf(min)
        return html`
            ${this.heading ? html`<div class="title">${this.heading}</div>` : nothing}
            <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                ${this.area ? svg`<path d="${areaPath}" fill="${color}" opacity="0.12"></path>` : nothing}
                <path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${pts.map((p, i) => (i === maxI || i === minI)
                    ? svg`<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="${color}"><title>${this.labels[i] ?? ''}: ${vals[i]}</title></circle>`
                    : svg`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="transparent"><title>${this.labels[i] ?? ''}: ${vals[i]}</title></circle>`)}
            </svg>
            ${this.labels && this.labels.length
                ? html`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length - 1]}</span></div>`
                : nothing}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-trend-chart": MateuTrendChart
    }
}
