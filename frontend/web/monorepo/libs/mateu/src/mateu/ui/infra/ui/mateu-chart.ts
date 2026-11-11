import {css, html, LitElement, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import type {Chart, ChartConfiguration, ChartTypeRegistry, ChartData, ChartOptions} from 'chart.js';
import {chartAlternativeOf} from '@infra/a11y/chartAlternative.ts';
import {chromeTextf} from '@infra/ui/chromeTexts.ts';


@customElement('mateu-chart')
export class MateuChart extends LitElement {

    @property()
    type: string | undefined

    @property()
    data: ChartData | undefined

    @property()
    options: ChartOptions | undefined

    @query('#chart')
    private chartElement!: HTMLCanvasElement;


    private chart: Chart | undefined;

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
        if (this.data) {
            this.createChart(this.data)
        }
    }

    // chart.js (~254 kB with the date-fns adapter) is lazy-loaded so it stays out of the initial bundle.
    private async createChart(data: ChartData) {
        const [{default: LoadedChart}] = await Promise.all([
            import('chart.js/auto'),
            // @ts-ignore side-effect module (registers the date adapter on chart.js); ships no types
            import('chartjs-adapter-date-fns'),
        ])
        // the data may have changed (or been cleared) while the module was loading
        if (data !== this.data) {
            return
        }
        if (this.chart) {
            this.chart.destroy()
        }
        const config: ChartConfiguration = {
            type: this.type as keyof ChartTypeRegistry,
            data: this.data,
            options: this.options
        }
        this.chart = new LoadedChart(this.chartElement, config);
    }

    private handleSlotChange() {
    }

    render() {
        // WCAG 1.1.1: the canvas is an image named by the chart's title, and the numbers it draws
        // travel as a visually-hidden table next to it
        const alt = chartAlternativeOf(this.data, this.options, this.type)
        return html`
            <div class="container">
                <canvas id="chart" role="img" aria-label="${alt.name}"></canvas>
            </div>
            <table class="sr-only">
                <caption>${chromeTextf('chartDataOf', {name: alt.name})}</caption>
                <thead><tr>${alt.table.headers.map((h) => html`<th scope="col">${h}</th>`)}</tr></thead>
                <tbody>${alt.table.rows.map((r) => html`<tr>${r.map((c, i) => i === 0
                    ? html`<th scope="row">${c}</th>` : html`<td>${c}</td>`)}</tr>`)}</tbody>
            </table>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `
    }

    static styles = css`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
    .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0;
    }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-chart': MateuChart
    }
}


