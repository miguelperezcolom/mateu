import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
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
import Field from "@mateu/shared/apiClients/dtos/componentmetadata/Field";


@customElement('mateu-field')
export class MateuField extends LitElement {

    @property()
    field: Field | undefined = undefined

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: e.detail.value,
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            ${this.field?.dataType == 'string'?html`
                <vaadin-text-field 
                        id="${this.field.fieldId}" 
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-text-field>
            `:nothing}
            ${this.field?.dataType == 'number'?html`
                <vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-number-field>
            `:nothing}
            ${this.field?.dataType == 'integer'?html`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-integer-field>
            `:nothing}
            <slot></slot>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


