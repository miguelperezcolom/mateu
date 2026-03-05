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
import "@vaadin/grid"
import "@vaadin/card"
import { customElement, property } from 'lit/decorators.js';
import {Amount} from "@mateu/shared/apiClients/dtos/Amount.ts";


@customElement('mateu-money-field')
export class MateuMoneyField extends LitElement {

    @property()
    fieldId?: string

    @property()
    label?: string

    @property()
    state?: any

    @property()
    data?: any

    @property()
    value?: Amount

    @property()
    autoFocus?: boolean

    @property()
    required?: boolean

    @property()
    colspan?: string

    currencyChanged = (e: CustomEvent) => {
        if (!this.value) {
            this.value = {
                value: 0,
                currency: 'EUR',
                locale: 'es-ES'
            } as Amount
        }
        this.value.currency = e.detail.value
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: { ...this.value},
                fieldId: this.fieldId
            }
        }))
    }

    valueChanged = (e: CustomEvent) => {
        if (!this.value) {
            this.value = {
                value: 0,
                currency: 'EUR',
                locale: 'es-ES'
            } as Amount
        }
        if (e.detail.value) {
            this.value.value = e.detail.value?parseFloat(e.detail.value):0
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value: { ...this.value},
                    fieldId: this.fieldId
                }
            }))
        }
    }

    render() {

        return html`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required || nothing}"
                    theme="align-right"
            ><div slot="prefix"><vaadin-select
                    item-label-path="label"
                    item-value-path="value"
                    .items="${[
                        {
                            label: 'Euro',
                            value: 'EUR'
                        },
                        {
                            label: 'US Dollar',
                            value: 'USD'
                        }
                    ]}"
                    @value-changed="${this.currencyChanged}"
                    .value="${this.value?.currency}"
                    style="max-width: 100px;"
                    theme="small"
            ></vaadin-select></div></vaadin-number-field>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-money-field': MateuMoneyField
    }
}


