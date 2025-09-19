import { customElement, property, state } from "lit/decorators.js";
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
import "@vaadin/markdown"
import '@vaadin/item'
import '@polymer/paper-toggle-button'
import "@ui5/webcomponents/dist/ColorPicker.js";
import "@ui5/webcomponents/dist/RangeSlider.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComboBoxDataProvider } from "@vaadin/combo-box";
import './mateu-grid'
import './mateu-choice'
import { ComboBoxLitRenderer, comboBoxRenderer } from "@vaadin/combo-box/lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { popoverRenderer } from "@vaadin/popover/lit";
import { allIcons } from "@infra/ui/allIcons.ts";
import { getThemeForBadgetType } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status.ts";
import { badge } from "@vaadin/vaadin-lumo-styles";


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
    labelAlreadyRendered: boolean | undefined

    @state()
    colorPickerOpened = false

    @state()
    colorPickerValue : string | undefined = undefined


    renderColorPicker = () => {
        const fieldId = this.field?.fieldId!
        const value = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        return html`
            <ui5-color-picker value="${value}" @change="${(e: CustomEvent) => this.colorPickerValue = (e.target as HTMLInputElement).value}">Picker</ui5-color-picker>
        `
    }

    saveColor = () => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.colorPickerValue,
                //@ts-ignore
                fieldId: this.field!.fieldId
            },
            bubbles: true,
            composed: true
        }))
        this.colorPickerOpened = false
    }

    renderColorPickerFooter = () => {
        return html`<vaadin-button @click="${() => this.colorPickerOpened = false}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`
    }

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
    multiComboBoxValueChanged = (e: CustomEvent) => {
        const fieldId = this.field?.fieldId!
        const oldValue = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        let value = undefined
        if (e.detail.value) {
            value = e.detail.value.map((option: any) => option.value)
        }
        if (!this.compareArrays(value, oldValue)) this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: value,
                //@ts-ignore
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.convert(e.detail.value),
                //@ts-ignore
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    selectedItems = (value: any[]) => {
        if (value && value.length > 0) {
            if (this.field?.remoteCoordinates) {
                if (this.data[this.id]
                    && this.data[this.id].content) {
                    return this.data[this.id].content?.filter((option: any) =>
                        value.indexOf(option.value) >= 0)
                }
            } else {
                return this.field?.options?.filter(option =>
                    value.indexOf(option.value) >= 0)
            }
        }
        return []
    }

    selectedIndex = (value: any) => {
        if (value) {
            if (this.field?.remoteCoordinates) {
                if (this.data[this.id]
                    && this.data[this.id].content) {
                    const selectedOption = this.data[this.id].content.find((option: any) => option.value == value)
                    if (selectedOption) {
                        return this.data[this.id].content.indexOf(selectedOption)
                    }
                }
            } else {
                const selectedOption = this.field?.options?.find(option => option.value == value)
                if (selectedOption) {
                    return this.field?.options?.indexOf(selectedOption)
                }
            }
        }
        return undefined
    }

    selectedIndexes = (value: any[]) => {
        if (value && value.length > 0) {
            if (this.field?.remoteCoordinates) {
                if (this.data[this.id]
                    && this.data[this.id].content) {
                    const selectedIndexes = this.data[this.id].content.filter((option: any) =>
                        value.indexOf(option.value) >= 0)
                        .map((option: any) => this.data[this.id].content.indexOf(option))
                    return selectedIndexes
                }
            } else {
                return this.field?.options?.filter(option =>
                    value.indexOf(option.value) >= 0)
                    .map(option => this.field?.options?.indexOf(option))
            }
        }
        return []
    }

    compareArrays = (a: any[], b: any[]) =>
        (this.falsy(a) && this.falsy(b)) || (a && b && a.length === b.length &&
        a.every((element, index) => element === b[index]))

    falsy = (array: any) => !array || array.length == 0

    listItemsSelected = (e: CustomEvent) => {
        const fieldId = this.field?.fieldId!
        const oldValue = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        let value = undefined
        if (e.detail.value) {
            if (this.field?.remoteCoordinates) {
                if (this.data[this.id]
                    && this.data[this.id].content) {
                    value = e.detail.value.map((index:any) => this.data[this.id].content[index].value)
                }
            } else {
                value = e.detail.value.map((index:any) => this.field!.options![index].value)
            }
        }
        if (!this.compareArrays(value, oldValue)) {
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value,
                    //@ts-ignore
                    fieldId: this.field?.fieldId
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    listItemSelected = (e: CustomEvent) => {
        let value = undefined
        if (e.detail.value || e.detail.value == 0) {
            if (this.field?.remoteCoordinates) {
                if (this.data[this.id]
                    && this.data[this.id].content) {
                    const selectedOption = this.data[this.id].content[e.detail.value]
                    if (selectedOption) {
                        value = selectedOption.value
                    }
                }
            } else {
                const selectedOption = this.field!.options![e.detail.value]
                if (selectedOption) {
                    value = selectedOption.value
                }
            }
        }
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                //@ts-ignore
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const fieldId = this.field?.fieldId??''
        return html`<div style="display: block;">
            <div>${this.renderField()}</div>
            ${this.data.errors && this.data.errors[fieldId] && this.data.errors[fieldId].length > 0?html`
                <div><ul>${this.data.errors[fieldId].map((error: string) => html`<li>${error}</li>`)}</ul></div>
            `:nothing}
        </div>`
    }

    fileUploaded = (e:CustomEvent) => {
        const fieldId = this.field?.fieldId??''
        const value = this.state[fieldId] as any[]
        value.push({
            id: e.detail.xhr.responseText,
            name: e.detail.file.name
        })

        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    fileChanged = (e:CustomEvent) => {
        const fieldId = this.field?.fieldId??''
        const newIds = ((e.detail.value as any[])??[]).filter((file: any) => file.id).map((file: any) => file.id)
        const oldIds = ((this.state[fieldId] as any[])??[]).map((file: any) => file.id)
        if (!this.compareArrays(oldIds, newIds)) {
            const newValues = ((e.detail.value as any[])??[]).filter((file: any) => file.id).map((file: any) => {
                return {
                    id: file.id,
                    name: file.name
                }
            })
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value: newValues,
                    fieldId: this.field?.fieldId
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    iconComboboxRenderer: ComboBoxLitRenderer<string> = (icon) => html`
  <div style="display: flex;">
      <vaadin-icon
              icon="${icon}"
              style="height: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
      ></vaadin-icon>
    <div>
      ${icon}
      <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
        ${icon}
      </div>
    </div>
  </div>
`;

    @state()
    private filteredIcons: string[] = [];


    protected override async firstUpdated() {
        this.filteredIcons = allIcons;
    }

    iconFilterChanged = (event: CustomEvent) => {
        this.filteredIcons = allIcons.filter(icon => !event.detail.value || icon.indexOf(event.detail.value) >= 0)
    }

    renderField(): TemplateResult {
        const fieldId = this.field?.fieldId??''
        const value = this.state && fieldId in this.state?this.state[fieldId]:this.field?.initialValue
        const labelText = this.field?.label + '' + (this.field?.required?' (*)':'')
        const label = (this.labelAlreadyRendered || !labelText || labelText == 'null')?nothing:labelText
        if (this.field?.dataType == 'file') {
            const files = value.map((file: { id: string,
                name: string
            }) => {
                return {
                    id: file.id,
                    name: file.name,
                    type: '',
                    uploadTarget: '',
                    complete: true
                }
            })
            return html`
                <vaadin-upload
                        target="/upload"
                        .files="${files}"
                        @upload-success="${this.fileUploaded}"
                        @files-changed="${this.fileChanged}"
                        data-colspan="${this.field.colspan}"
                ></vaadin-upload>
            `
        }
        if (this.field?.dataType == 'string') {
            if (this.field?.stereotype == 'select') {
                if (this.field?.remoteCoordinates) {
                    const coords = this.field.remoteCoordinates;
                    const filter = ''

                    if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                        this.data[this.id] = undefined
                    }
                    if (this.data[this.id]
                        && this.data[this.id].content
                        && this.data[this.id].totalElements) {
                    } else {
                        this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: coords.action,
                                parameters: {
                                    searchText: filter,
                                    fieldId: this.field?.fieldId,
                                    size: 200,
                                    page: 0,
                                    sort: undefined
                                }
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }

                    return html`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `
                }
                return html`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `
            }
            if (this.field?.stereotype == 'markdown') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            .helperText="${this.field.description}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${value}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `
            }
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
                            ?required="${this.field.required || nothing}"
                            .selectedItem="${selectedItem}"
                            data-colspan="${this.field.colspan}"
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
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'listBox') {
                if (this.field?.remoteCoordinates) {
                    const coords = this.field.remoteCoordinates;
                    const filter = ''

                    if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                        this.data[this.id] = undefined
                    }
                    if (this.data[this.id]
                        && this.data[this.id].content
                        && this.data[this.id].totalElements) {
                        /*
                        callback(this.data[this.id].content
                                .slice(page * pageSize, ((page + 1) * pageSize)),
                            this.data[this.id].totalElements)
                         */
                    } else {
                        this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: coords.action,
                                parameters: {
                                    searchText: filter,
                                    fieldId: this.field?.fieldId,
                                    size: 200,
                                    page: 0,
                                    sort: undefined
                                }
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }

                    return html`
                        <vaadin-custom-field
                                label="${label}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${ifDefined(this.selectedIndex(value))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `
                }
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${ifDefined(this.selectedIndex(value))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'radio') {
                if (this.field?.remoteCoordinates) {
                    const coords = this.field.remoteCoordinates;
                    const filter = ''

                    if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                        this.data[this.id] = undefined
                    }
                    if (this.data[this.id]
                        && this.data[this.id].content
                        && this.data[this.id].totalElements) {
                        /*
                        callback(this.data[this.id].content
                                .slice(page * pageSize, ((page + 1) * pageSize)),
                            this.data[this.id].totalElements)
                         */
                    } else {
                        this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: coords.action,
                                parameters: {
                                    searchText: filter,
                                    fieldId: this.field?.fieldId,
                                    size: 200,
                                    page: 0,
                                    sort: undefined
                                }
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }

                    return html`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
                }
                return html`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field.stereotype == 'popover') {
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing">
                            <div>${value}</div>
                            <div id="${this.field.fieldId}_popover">
                                <vaadin-icon icon="vaadin:angle-down"></vaadin-icon>
                            </div>
                        </vaadin-horizontal-layout>
                    <vaadin-popover
                            for="${this.field.fieldId}_popover"
                            theme="arrow no-padding"
                            modal
                            accessible-name-ref="notifications-heading"
                            content-width="300px"
                            position="bottom"
                            ${popoverRenderer(() => html`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${value}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `, [])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'choice') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${value}"
                                .state="${this.state}"
                                .data="${this.data}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `
            }
            if (this.field?.stereotype == 'popover') {
                return html`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            theme="vertical"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field?.stereotype == 'richText') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
                    </vaadin-custom-field>`
            }
            if (this.field?.stereotype == 'textarea') {
                return html`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                            
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
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `
            }
            if (this.field?.stereotype == 'link') {
                if (this.field.readOnly) {
                    return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${value}">${value}</a></vaadin-custom-field>`
                }
                return html`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${label}"
                                    required="${this.field.required || nothing}"
                                    @value-changed="${this.valueChanged}"
                                    value="${value}"
                                    ?autofocus="${this.field.wantsFocus}"
                            >
                                <vaadin-icon slot="suffix" 
                                             icon="vaadin:external-link"
                                             style="cursor: pointer;"
                                             @click="${() => window.open(value, '_blank')?.focus()}"
                                ></vaadin-icon>
                            </vaadin-text-field>
                `
            }
            if (this.field?.stereotype == 'icon') {
                if (this.field.readOnly) {
                    return html`<vaadin-icon
                                             icon="${value}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`
                }
                return html`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${label}"
                                    required="${this.field.required || nothing}"
                                    @value-changed="${this.valueChanged}"
                                    value="${value}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${comboBoxRenderer(this.iconComboboxRenderer, [])}
                    >
                        ${value?html`<vaadin-icon slot="prefix" icon="${value}"></vaadin-icon>`:nothing}
                    </vaadin-combo-box>
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
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `
            }
            if (this.field?.stereotype == 'html') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${unsafeHTML(value)}</div></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'image') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    ><img 
                            src="${value}"
                            style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;"></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'color') {
                if (this.field.readOnly) {
                    return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${value}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    >
                        <input type="color" @input="${(e: Event) => {
                            this.dispatchEvent(new CustomEvent('value-changed', {
                                detail: {
                                    value: (e.target as HTMLInputElement).value,
                                    //@ts-ignore
                                    fieldId: this.field!.fieldId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }}"/>
                        <!--
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                            <span style="background-color: ${value}; display: inline-block; height: 20px; width: 40px; border: 1px solid var(--lumo-secondary-text-color);"></span>
                            <vaadin-button @click="${() => this.colorPickerOpened = true}">Change</vaadin-button>
                        </vaadin-horizontal-layout>
                        -->
                    </vaadin-custom-field>
                    <vaadin-dialog
  header-title="Choose color"
  .opened="${this.colorPickerOpened}"
  @closed="${() => {
                    this.colorPickerOpened = false;
                }}"
  ${dialogRenderer(this.renderColorPicker, [])}
  ${dialogFooterRenderer(this.renderColorPickerFooter, [])}
></vaadin-dialog>
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
                        style="${this.field.style}"
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
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step || nothing}"
                        step-buttons-visible="${this.field.stepButtonsVisible || nothing}"
            ></vaadin-number-field>`
        }
        if (this.field?.dataType == 'integer') {
            if (this.field.stereotype == 'stars') {
                let renderValue = value;
                if (isNaN(renderValue)) {
                    renderValue = 0
                }
                const values = [1, 2, 3, 4, 5]
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    >${values.map(index => html`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${index <= renderValue?'--lumo-warning-color':'--lumo-shade-30pct'});"
                            @click="${() => this.dispatchEvent(new CustomEvent('value-changed', {
                                detail: {
                                    value: index,
                                    //@ts-ignore
                                    fieldId: this.field!.fieldId
                                },
                                bubbles: true,
                                composed: true
                            }))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`
            }
            if (this.field.stereotype == 'slider') {
                let renderValue = value;
                if (isNaN(renderValue)) {
                    renderValue = 0
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${(e: Event) => {
                        this.dispatchEvent(new CustomEvent('value-changed', {
                            detail: {
                                value: (e.target as HTMLInputElement).value,
                                //@ts-ignore
                                fieldId: this.field!.fieldId
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }}" min="${this.field.sliderMin??0}" max="${(this.field.sliderMax)??10}" value="${renderValue??0}"/></vaadin-custom-field>
                `
            }
            return html`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        step="${this.field.step || nothing}"
                        step-buttons-visible="${this.field.stepButtonsVisible || nothing}"
                ></vaadin-integer-field>
            `
        }
        if (this.field?.dataType == 'bool') {
            return html `
                <vaadin-custom-field
                        label="${label}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                >
                    ${this.field.stereotype == 'toggle'?html`
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${value}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    `:html`
                        <vaadin-checkbox
                                id="${this.field.fieldId}"
                                @change="${this.checked}"
                                value="${value}"
                                ?checked=${value}
                                ?autofocus="${this.field.wantsFocus}"
                        ></vaadin-checkbox>
                    `}
                </vaadin-custom-field>
            `
        }
        if (this.field?.dataType == 'date') {
            return html`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`
        }
        if (this.field?.dataType == 'dateTime') {
            return html`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`
        }
        if (this.field?.dataType == 'time') {
            return html`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`
        }
        if (this.field?.dataType == 'array') {
            if (this.field?.stereotype == 'choice') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${value}"
                                .state="${this.state}"
                                .data="${this.data}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `
            }
            if (this.field?.stereotype == 'grid') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            data-colspan="${this.field.colspan}">
                    <mateu-grid
                            id="${this.field.fieldId}"
                        .field="${this.field}"
                        .state="${this.state}"
                        .data="${this.data}"
                            data-colspan="${this.field.colspan}"
                    ></mateu-grid>
                    </vaadin-custom-field>
`
            }
            if (this.field?.stereotype == 'listBox') {
                if (this.field?.remoteCoordinates) {
                    const coords = this.field.remoteCoordinates;
                    const filter = ''

                    if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                        this.data[this.id] = undefined
                    }
                    if (this.data[this.id]
                        && this.data[this.id].content
                        && this.data[this.id].totalElements) {
                        /*
                        callback(this.data[this.id].content
                                .slice(page * pageSize, ((page + 1) * pageSize)),
                            this.data[this.id].totalElements)
                         */
                    } else {
                        this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: coords.action,
                                parameters: {
                                    searchText: filter,
                                    fieldId: this.field?.fieldId,
                                    size: 200,
                                    page: 0,
                                    sort: undefined
                                }
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }

                    return html`
                        <vaadin-custom-field
                                label="${label}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${ifDefined(this.selectedIndexes(value))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple 
                                     .selectedValues="${ifDefined(this.selectedIndexes(value))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `
            }
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


                    return html`
                        <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .dataProvider="${dataProvider}"
                            .helperText="${this.field.description}"
                            .selectedItems="${this.selectedItems(value)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required || nothing}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-multi-select-combo-box>
                    `
                }
                return html`
                    <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            .selectedItems="${this.selectedItems(value)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required || nothing}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-multi-select-combo-box>
                    `
            }

            if (this.field?.remoteCoordinates) {
                const coords = this.field.remoteCoordinates;
                const filter = ''

                if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                    this.data[this.id] = undefined
                }
                if (this.data[this.id]
                    && this.data[this.id].content
                    && this.data[this.id].totalElements) {
                    /*
                    callback(this.data[this.id].content
                            .slice(page * pageSize, ((page + 1) * pageSize)),
                        this.data[this.id].totalElements)
                     */
                } else {
                    this.dispatchEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: coords.action,
                            parameters: {
                                searchText: filter,
                                fieldId: this.field?.fieldId,
                                size: 200,
                                page: 0,
                                sort: undefined
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }

                return html`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-checkbox
                                    value="${option.value}"
                                    label="${option.label}"
                                    checked="${value?.indexOf(option.value) >= 0 || nothing}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `
            }
            return html `
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                >
                    ${this.field.options?.map(option => html`
                        <vaadin-checkbox 
                                value="${option.value}" 
                                label="${option.label}"
                                ?checked="${value?.indexOf(option.value) >= 0}"
                        ></vaadin-checkbox>
                    `)}
                </vaadin-checkbox-group>
            `
        }
        if (this.field?.dataType == 'money') {
            if (this.field.readOnly) {
                const amount = value
                let formatted = amount
                if (amount && amount.locale && amount.currency) {
                    formatted = new Intl.NumberFormat(amount.locale, { style: "currency", currency: amount.currency }).format(
                        amount.value,
                    )
                }
                formatted = new Intl.NumberFormat("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,

                }).format(
                    amount,
                )
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${formatted}</div></vaadin-custom-field>`
            }
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
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
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            style="max-width: 100px;"
                    ></vaadin-select></div></vaadin-number-field>`
        }
        if (this.field?.dataType == 'status') {
            const status = value as Status
            return html`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                >
                    ${status?html`<span theme="badge pill ${getThemeForBadgetType(status.type)}">${status.message}</span>`:html``}                    
                </vaadin-custom-field>
            `
        }
        if (this.field?.dataType == 'range') {
            const range = value as {
                from: number
                to: number
            }
            return html`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${range?.from??0}" end-value="${range?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${(this.field.sliderMax)??10}"
                                   step="${this.field.step || nothing}"
                                   @change="${(e: Event) => {
                                       const values = e.target as unknown as {
                                           startValue: number
                                           endValue: number
                                       }
                                       this.dispatchEvent(new CustomEvent('value-changed', {
                                           detail: {
                                               value: {
                                                   from: values.startValue,
                                                   to: values.endValue
                                               },
                                               //@ts-ignore
                                               fieldId: this.field!.fieldId
                                           },
                                           bubbles: true,
                                           composed: true
                                       }))
                                   }}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `
        }
        return html `<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`
    }

    static styles = css`
        ${badge}
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


