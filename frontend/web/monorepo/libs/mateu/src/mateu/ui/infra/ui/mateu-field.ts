import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
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
import "@vaadin/list-box"
import '@vaadin/item'
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComboBoxDataProvider } from "@vaadin/combo-box";
import './mateu-grid'


@customElement('mateu-field')
export class MateuField extends LitElement {

    @property()
    field: FormField | undefined = undefined

    @property()
    baseUrl: string | undefined = undefined

    @property()
    state: any | undefined = undefined

    @property()
    data: any | undefined = undefined

    @property()
    checked = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: input.checked,
                //@ts-ignore
                fieldId: this.field!.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    convert = (value: string): any => {
        if (this.field?.dataType == 'integer') {
            return parseInt(value)
        }
        return value
    }

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.convert(e.detail.value),
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    selectedIndex = () => {
        if (this.field?.initialValue) {
            const value = this.field.initialValue
            const selectedOption = this.field.options?.find(option => option.value == value)
            if (selectedOption) {
                return this.field.options?.indexOf(selectedOption)
            }
        }
        return undefined
    }

    listItemSelected = (e: CustomEvent) => {
        let value = undefined
        if (e.detail.value) {
            const selectedOption = this.field!.options![e.detail.value]
            if (selectedOption) {
                value = selectedOption.value
            }
        }
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const fieldId = this.field?.fieldId??''
        return html`<div>
            <div>${this.renderField()}</div>
            ${this.data.errors && this.data.errors[fieldId] && this.data.errors[fieldId].length > 0?html`
                <div><ul>${this.data.errors[fieldId].map((error: string) => html`<li>${error}</li>`)}</ul></div>
            `:nothing}
        </div>`
    }

    renderField(): TemplateResult {
        const fieldId = this.field?.fieldId??''
        const value = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        if (this.field?.dataType == 'file') {
            return html`
                <vaadin-upload
                        target="/api/fileupload"
                ></vaadin-upload>
            `
        }
        const label = this.field?.label + '' + (this.field?.required?' (*)':'')
        if (this.field?.dataType == 'string') {
            if (this.field?.stereotype == 'select') {
                return html`
                    <vaadin-select
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-select>
                `
            }
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'listBox') {
                return html`
                    <vaadin-list-box ?selected="${this.selectedIndex()}"
                                     @value-changed="${this.listItemSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>                
                `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group 
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            theme="vertical"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field?.stereotype == 'richText') {
                return html`
                    <vaadin-rich-text-editor
                            label="${label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>`
            }
            if (this.field?.stereotype == 'textarea') {
                return html`
                    <vaadin-text-area
                            label="${label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-text-area>`
            }
            if (this.field?.stereotype == 'email') {
                return html`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-email-field>
                `
            }
            if (this.field?.stereotype == 'password') {
                return html`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-password-field>
                `
            }
            if (this.field?.stereotype == 'html') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${unsafeHTML(value)}</div></vaadin-custom-field>
                `
            }
            return html`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?disabled="${this.field.disabled}"
                ></vaadin-text-field>
`
        }
        if (this.field?.dataType == 'number') {
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-number-field>`
        }
        if (this.field?.dataType == 'integer') {
            return html`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
                ></vaadin-integer-field>
            `
        }
        if (this.field?.dataType == 'bool') {
            return html `
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${label}"
                        @change="${this.checked}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
                ></vaadin-checkbox>
            `
        }
        if (this.field?.dataType == 'date') {
            return html`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-date-picker>`
        }
        if (this.field?.dataType == 'dateTime') {
            return html`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-date-time-picker>`
        }
        if (this.field?.dataType == 'time') {
            return html`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-time-picker>`
        }
        if (this.field?.dataType == 'array') {
            if (this.field?.stereotype == 'grid') {
                return html`
                    <mateu-grid
                            id="${this.field.fieldId}"
                        .field="${this.field}"
                        .state="${this.state}"
                        .data="${this.data}"
                    ></mateu-grid>
`
            }
            if (this.field?.stereotype == 'listBox') {
                return html`aaa
                    <vaadin-list-box multiple ?selected="${this.selectedIndex()}"
                                     @value-changed="${this.listItemSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>                
                `
            }
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                    ></vaadin-multi-select-combo-box>
                    `
            }
            return html `
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        theme="vertical"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
                >
                    ${this.field.options?.map(option => html`
                        <vaadin-checkbox value="${option.value}" label="${option.label}"></vaadin-checkbox>
                    `)}
                </vaadin-checkbox-group>
            `
        }
        if (this.field?.dataType == 'reference') {
            if (this.field?.stereotype == 'combobox') {
                if (this.field?.remoteCoordinates) {

                    const coords = this.field.remoteCoordinates;

                    const dataProvider: ComboBoxDataProvider<any> = (params, callback) => {
                        const { filter, page, pageSize } = params;
                        if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                            this.data[this.id] = undefined
                        }
                        if (this.data[this.id]
                            && this.data[this.id].content
                            && (this.data[this.id].totalElements <= (page + 1) * pageSize
                                ||
                                this.data[this.id].content.length >= (page + 1) * pageSize)) {
                            callback(this.data[this.id].content
                                    .slice(page * pageSize, ((page + 1) * pageSize)),
                                this.data[this.id].totalElements)
                        } else {
                            this.dispatchEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: coords.action,
                                    parameters: {
                                        searchText: filter,
                                        fieldId: this.field?.fieldId,
                                        size: pageSize,
                                        page,
                                        sort: undefined
                                    },
                                    callback: () => {
                                        if (this.data[this.id] && this.data[this.id].content) {
                                            callback(this.data[this.id].content
                                                    .slice(page * pageSize, ((page + 1) * pageSize)),
                                                this.data[this.id].totalElements)
                                        }
                                    }
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
                    };

                    let selectedItem = value
                    if (this.data[this.id] && this.data[this.id].content) {
                        selectedItem = this.data[this.id].content.find((item:any) => item.value == value)
                    }

                    console.log(this.id, value, this.data[this.id])

                    return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${dataProvider}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                            .selectedItem="${selectedItem}"
                    ></vaadin-combo-box>
                    `
                }
                return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .selectedItem="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'listBox') {
                return html`aaa
                    <vaadin-list-box ?selected="${this.selectedIndex()}"
                                     @value-changed="${this.listItemSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>                
                `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group 
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            theme="vertical"
                            ?required="${this.field.required}"
                    >
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


