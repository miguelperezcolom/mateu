import {css, html, LitElement, PropertyValues} from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import "@vaadin/card"
import {customElement, property, query} from 'lit/decorators.js';
import type {Chart, ChartConfiguration, ChartTypeRegistry, ChartData, ChartOptions} from 'chart.js';


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
        return html`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-chart': MateuChart
    }
}


