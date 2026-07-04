import {css, html, LitElement, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import type Viewer from "bpmn-js";
import type {BaseViewerOptions} from "bpmn-js/lib/BaseViewer";


@customElement('mateu-bpmn')
export class MateuBpmn extends LitElement {

    @property()
    xml: string | undefined


    @query('#canvas')
    private divElement!: HTMLDivElement;

    private chart: Viewer | undefined;

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.chart) {
            this.chart.destroy()
            this.chart = undefined
        }
        if (this.xml) {
            this.createViewer(this.xml)
        }
    }

    // bpmn-js (~1.6 MB with diagram-js) is lazy-loaded so it stays out of the initial bundle.
    private async createViewer(xml: string) {
        const {default: LoadedViewer} = await import("bpmn-js")
        // the xml may have changed (or been cleared) while the module was loading
        if (xml !== this.xml) {
            return
        }
        if (this.chart) {
            this.chart.destroy()
        }
        const options: BaseViewerOptions = {
            container: this.divElement
        }
        this.chart = new LoadedViewer(options)
        this.chart.importXML(xml)
    }

    private handleSlotChange() {
    }

    render() {
        return html`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
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
        'mateu-bpmn': MateuBpmn
    }
}


