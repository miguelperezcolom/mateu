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
import "@vaadin/checkbox"
import "@vaadin/text-area"
import "@vaadin/password-field"
import "@vaadin/date-picker"
import "@vaadin/date-time-picker"
import "@vaadin/time-picker"
import "@vaadin/rich-text-editor"
import "@vaadin/email-field"
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField";


@customElement('mateu-field')
export class MateuField extends LitElement {

    @property()
    field: FormField | undefined = undefined

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
        if (this.field?.dataType == 'string') {
            if (this.field?.stereotype == 'richText') {
                return html`
                    <vaadin-rich-text-editor
                            label="${this.field.label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${this.field.initialValue}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                    ></vaadin-rich-text-editor>`
            }
            if (this.field?.stereotype == 'textarea') {
                return html`
                    <vaadin-text-area
                            label="${this.field.label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${this.field.initialValue}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                    ></vaadin-text-area>`
            }
            if (this.field?.stereotype == 'email') {
                return html`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${this.field.label}"
                            @value-changed="${this.valueChanged}"
                            value="${this.field.initialValue}"
                    ></vaadin-email-field>
                `
            }
            if (this.field?.stereotype == 'password') {
                return html`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${this.field.label}"
                            @value-changed="${this.valueChanged}"
                            value="${this.field.initialValue}"
                    ></vaadin-password-field>
                `
            }
            return html`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-text-field>
`
        }
        if (this.field?.dataType == 'number') {
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-number-field>`
        }
        if (this.field?.dataType == 'integer') {
            return html`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-integer-field>
            `
        }
        if (this.field?.dataType == 'bool') {
            return html `
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-checkbox>
            `
        }
        if (this.field?.dataType == 'date') {
            return html`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-date-picker>`
        }
        if (this.field?.dataType == 'dateTime') {
            return html`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-date-time-picker>`
        }
        if (this.field?.dataType == 'time') {
            return html`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                ></vaadin-time-picker>`
        }
        return html `<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


