import { customElement, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
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
import "@vaadin/progress-bar"


@customElement('mateu-api-caller')
export class MateuApiCaller extends LitElement {

    @state()
    loading: boolean | undefined

    fetchStarted: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.loading = true
    }

    fetchFinished: EventListenerOrEventListenerObject = (e: Event) => {
        console.log(e)
        e.preventDefault()
        e.stopPropagation()
        this.loading = false
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('backend-called-event', this.fetchStarted)
        this.addEventListener('backend-succeeded-event', this.fetchFinished)
        this.addEventListener('backend-cancelled-event', this.fetchFinished)
        this.addEventListener('backend-failed-event', this.fetchFinished)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-succeeded-event', this.fetchStarted)
        this.removeEventListener('backend-succeeded-event', this.fetchFinished)
        this.removeEventListener('backend-cancelled-event', this.fetchFinished)
        this.removeEventListener('backend-failed-event', this.fetchFinished)
    }


    render() {
        return html`<vaadin-vertical-layout>
                <vaadin-progress-bar indeterminate style="visibility: ${this.loading?'visible':'hidden'};"></vaadin-progress-bar>
                <slot></slot>
            </vaadin-vertical-layout>`
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-api-caller': MateuApiCaller
    }
}


