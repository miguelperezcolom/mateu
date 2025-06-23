import { customElement, property } from "lit/decorators.js";
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
import "@vaadin/checkbox"
import "@vaadin/text-area"
import "@vaadin/password-field"
import "@vaadin/date-picker"
import "@vaadin/date-time-picker"
import "@vaadin/time-picker"
import "@vaadin/rich-text-editor"
import "@vaadin/email-field"
import "@vaadin/upload"
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
        if (this.field?.dataType == 'file') {
            return html`
                <vaadin-upload
                        target="/api/fileupload"></vaadin-upload>
            `
        }
        if (this.field?.dataType == 'string') {
            if (this.field?.stereotype == 'select') {
                return html`
                    <vaadin-select
                            label="${this.field.label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                    ></vaadin-select>
                `
            }
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-combo-box
                            label="${this.field.label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group 
                            label="${this.field.label}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                            theme="vertical">
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
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
        if (this.field?.dataType == 'array') {
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-multi-select-combo-box
                            label="${this.field.label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                    ></vaadin-multi-select-combo-box>
                    `
            }
            return html `
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${this.field.label}"
                        @value-changed="${this.valueChanged}"
                        value="${this.field.initialValue}"
                        theme="vertical"
                >
                    ${this.field.options?.map(option => html`
                        <vaadin-checkbox value="${option.value}" label="${option.label}"></vaadin-checkbox>
                    `)}
                </vaadin-checkbox-group>
            `
        }
        if (this.field?.dataType == 'reference') {
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-combo-box
                            label="${this.field.label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group 
                            label="${this.field.label}"
                            @value-changed="${this.valueChanged}"
                            .value="${this.field.initialValue}"
                            theme="vertical">
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
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


