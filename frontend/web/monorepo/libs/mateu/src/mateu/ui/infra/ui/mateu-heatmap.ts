import { css, html, LitElement } from "lit";
import { customElement, property } from 'lit/decorators.js';
import HeatCell from "@mateu/shared/apiClients/dtos/componentmetadata/HeatCell";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Dependency-free calendar heatmap (GitHub-contributions style): one square per day in week
 * columns, colored by intensity from 0 to the max value, with month labels and a hover tooltip.
 * DS-neutral, dark-mode aware, horizontally scrollable.
 */
@customElement('mateu-heatmap')
export class MateuHeatmap extends LitElement {

    @property({ type: Array })
    cells: HeatCell[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
            overflow-x: auto;
            font-size: var(--lumo-font-size-xs, .72rem);
        }
        .wrap { display: inline-flex; flex-direction: column; gap: .25rem; padding-bottom: .25rem; }
        .months { display: flex; color: var(--lumo-secondary-text-color, #888); height: 1rem; }
        .grid { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr); gap: 2px; }
        .cell {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background: var(--cell, var(--lumo-contrast-10pct, #ebedf0));
        }
        .legend {
            display: flex;
            align-items: center;
            gap: 3px;
            color: var(--lumo-secondary-text-color, #888);
            margin-top: .15rem;
        }
        .legend .cell { width: 10px; height: 10px; }
    `

    private color(value: number, max: number): string {
        if (value <= 0 || max <= 0) {
            return 'var(--lumo-contrast-10pct, #ebedf0)'
        }
        // 4 intensity buckets of the primary color
        const t = value / max
        const bucket = t > 0.75 ? 1 : t > 0.5 ? 0.75 : t > 0.25 ? 0.5 : 0.3
        return `color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(bucket * 100)}%, transparent)`
    }

    render() {
        const cells = this.cells.filter(c => !!c.date)
        if (!cells.length) {
            return html``
        }
        const times = cells.map(c => new Date(c.date + 'T00:00:00').getTime())
        const min = Math.min(...times), max = Math.max(...times)
        // start on the Monday on/before the first date
        const start = new Date(min)
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
        const byDate: Record<string, HeatCell> = {}
        for (const c of cells) byDate[c.date!] = c
        const maxVal = Math.max(...cells.map(c => c.value ?? 0), 1)
        const squares = []
        for (let t = start.getTime(); t <= max; t += DAY) {
            const d = new Date(t)
            const key = d.toISOString().slice(0, 10)
            const cell = byDate[key]
            const value = cell?.value ?? 0
            const row = (d.getDay() + 6) % 7 + 1
            const title = cell?.label ?? `${key}: ${value}`
            squares.push(html`
                <div class="cell" style="grid-row: ${row}; --cell: ${this.color(value, maxVal)};" title="${title}"></div>
            `)
        }
        return html`
            <div class="wrap">
                <div class="grid">${squares}</div>
                <div class="legend">
                    <span>Less</span>
                    <span class="cell" style="--cell: var(--lumo-contrast-10pct, #ebedf0);"></span>
                    <span class="cell" style="--cell: ${this.color(1, 4)};"></span>
                    <span class="cell" style="--cell: ${this.color(2, 4)};"></span>
                    <span class="cell" style="--cell: ${this.color(3, 4)};"></span>
                    <span class="cell" style="--cell: ${this.color(4, 4)};"></span>
                    <span>More</span>
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-heatmap": MateuHeatmap
    }
}
