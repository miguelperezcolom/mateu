import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import './mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";


@customElement('mateu-form')
export class MateuForm extends MetadataDrivenElement {

    values: Record<string, any> = {}

    valueChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                value: any,
                fieldId: string
            }
            if (e.type == 'value-changed') {
                this.values[detail.fieldId] = detail.value
            }
        }
    }

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                userData: this.values,
                actionId,
                serverSideType: this.serverSideType,
                initiatorComponentId: this.id,
                initiator: this
            },
            bubbles: true,
            composed: true
        }))
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('value-changed', this.valueChangedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('value-changed', this.valueChangedListener)
    }

    render() {
        const metadata = this.metadata as Form
        return html`
           <h2>${metadata?.title}</h2>
           <p>${metadata?.subtitle}</p>
           
           <vaadin-horizontal-layout theme="spacing">
               ${metadata?.toolbar?.map(button => html`
                <vaadin-button
                        data-action-id="${button.id}"
                        @click="${() => this.handleButtonClick(button.actionId)}"
                >${button.label}</vaadin-button>
`)}
           </vaadin-horizontal-layout>
           <slot></slot>
           <vaadin-horizontal-layout theme="spacing">
               ${metadata?.buttons?.map(button => html`
                <vaadin-button
                        data-action-id="${button.id}"
                        @click="${() => this.handleButtonClick(button.actionId)}"
                >${button.label}</vaadin-button>
`)}
           </vaadin-horizontal-layout>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}


