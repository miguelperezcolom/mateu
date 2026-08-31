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
import { numericCommitValue } from '@components/fieldValue'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"


@customElement('mateu-money-field')
export class MateuMoneyField extends LitElement {

    @property()
    fieldId?: string

    @property()
    label?: string

    @property()
    state?: ComponentState

    @property()
    data?: ComponentData

    @property()
    value?: Amount

    @property()
    autoFocus?: boolean

    @property()
    required?: boolean

    @property()
    colspan?: string

    @property()
    helperText?: string

    private static readonly EMPTY = { value: 0, currency: 'EUR', locale: 'es-ES' } as Amount

    private commit = (amount: Amount) => {
        this.value = amount
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: { ...amount },
                fieldId: this.fieldId
            }
        }))
    }

    currencyChanged = (e: CustomEvent) => {
        const current = this.value ?? MateuMoneyField.EMPTY
        if (!e.detail.value || e.detail.value === current.currency) return
        this.commit({ ...current, currency: e.detail.value })
    }

    valueChanged = (e: CustomEvent) => {
        const current = this.value ?? MateuMoneyField.EMPTY
        // An EMPTIED amount used to be dropped here, because '' is falsy: the field showed nothing
        // while the state kept the previous figure, so what the user saw and what would be saved
        // disagreed silently — and clearing an amount is exactly what someone does when it turns
        // out not to apply. An Amount holds a primitive on the server, so cleared means zero, and
        // committing it is what makes the field say what will be stored.
        const amount = numericCommitValue(e.detail.value, false) ?? 0
        if (amount === current.value) return
        this.commit({ ...current, value: amount })
    }

    render() {

        return html`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
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


