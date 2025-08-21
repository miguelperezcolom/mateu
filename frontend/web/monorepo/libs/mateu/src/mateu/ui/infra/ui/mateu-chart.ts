import { css, html, LitElement, PropertyValues } from "lit";
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
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import Chart, { type ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ChartData, ChartOptions } from "chart.js";


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

    @queryAssignedElements({slot: ''})
    // @ts-ignore
    private scriptElements!: Array<HTMLElement>;

    private chart: Chart | undefined;

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
        if (this.data) {
            const config: ChartConfiguration = {
                type: this.type as keyof ChartTypeRegistry,
                data: this.data,
                options: this.options
            }
            this.chart = new Chart(this.chartElement, config);
        }
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


