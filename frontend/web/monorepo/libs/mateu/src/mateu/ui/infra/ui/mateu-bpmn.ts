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
import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';
import Viewer from "bpmn-js";
import {BaseViewerOptions} from "bpmn-js/lib/BaseViewer";


@customElement('mateu-bpmn')
export class MateuBpmn extends LitElement {

    @property()
    xml: string | undefined

    @queryAssignedElements({slot: ''})
    // @ts-ignore
    private scriptElements!: Array<HTMLElement>;

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
            const options: BaseViewerOptions = {
                container: this.divElement
            }
            this.chart = new Viewer(options)
            this.chart.importXML(this.xml)
        }
    }

    private handleSlotChange() {
    }

    render() {
        return html`
            zzz
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


