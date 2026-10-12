import {css, html, LitElement, PropertyValues} from "lit";
import {customElement, property, query, state} from 'lit/decorators.js';
import { chromeTextf } from '@infra/ui/chromeTexts';
import type Viewer from "bpmn-js";
import type {BaseViewerOptions} from "bpmn-js/lib/BaseViewer";


@customElement('mateu-bpmn')
export class MateuBpmn extends LitElement {

    @property()
    xml: string | undefined


    @query('#canvas')
    private divElement!: HTMLDivElement;

    private chart: Viewer | undefined;

    /** Why the last diagram could not be imported (shown instead of a blank box), if it could not. */
    @state()
    private failure: string | undefined

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('xml')) this.failure = undefined
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (!_changedProperties.has('xml')) return
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
        // A rejected import (malformed XML, or a process with no diagram interchange — "no diagram
        // to display") used to escape as an unhandled rejection and leave an empty box: say why.
        try {
            await this.chart.importXML(xml)
        } catch (e) {
            if (xml === this.xml) this.failure = (e as Error)?.message ?? String(e)
        }
    }

    private handleSlotChange() {
    }

    render() {
        return html`
            ${this.failure ? html`<div class="failure" role="status">${chromeTextf('diagramUnavailable', { reason: this.failure })}</div>` : ''}
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
        .failure {
            color: var(--lumo-error-text-color, #b91c1c);
            font-size: var(--lumo-font-size-s, 0.875rem);
            margin-bottom: var(--lumo-space-s, 0.5rem);
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-bpmn': MateuBpmn
    }
}


