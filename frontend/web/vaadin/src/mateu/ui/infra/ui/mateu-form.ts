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
import ComponentElement from "@infra/ui/ComponentElement";
import './mateu-field'


@customElement('mateu-form')
export class MateuForm extends ComponentElement {

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
        console.log(this.values)
        console.log(actionId)
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
           
           <vaadin-form-layout>
               ${metadata.sections.map(section => html`

                   ${section.groups.map(group => html`
            
                ${group.fields.map(field => html`

                    <mateu-field .field="${field}"></mateu-field>
                    
                `)}
            
            `)}

               `)}
           </vaadin-form-layout>
           
           <vaadin-horizontal-layout>
               ${metadata?.actions?.map(action => html`
                <vaadin-button
                        data-action-id="${action.id}"
                        @click="${() => this.handleButtonClick(action.id)}"
                >${action.label}</vaadin-button>
`)}
           </vaadin-horizontal-layout>
           <slot></slot>
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


