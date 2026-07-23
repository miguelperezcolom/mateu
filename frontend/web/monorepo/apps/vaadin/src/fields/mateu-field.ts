import { customElement, property, state } from "lit/decorators.js";
import '@components/mateu-signature-pad.ts';
import './mateu-vaadin-tree-select';
import '@components/mateu-camera-capture.ts';
import '@components/mateu-file-upload.ts';
import { fieldAttribute } from '@components/mateu-file-upload.ts';
import '@components/mateu-bulleted-list.ts';
import {css, html, LitElement, nothing, PropertyValues, TemplateResult} from "lit";
import { interpolate } from '@components/interpolation'
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
import "@vaadin-component-factory/vcf-date-range-picker"
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import {ComboBox, ComboBoxDataProvider} from "@vaadin/combo-box";
import './mateu-grid'
import '@components/mateu-choice'
import './mateu-money-field'
import { ComboBoxLitRenderer, comboBoxRenderer } from "@vaadin/combo-box/lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { popoverRenderer } from "@vaadin/popover/lit";
import { allIcons } from "@infra/ui/allIcons.ts";
import { getThemeForBadgetType } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status.ts";
import { badge } from "@infra/ui/badgeStyles.ts";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {Notification, NotificationPosition} from "@vaadin/notification";
import {evalIfNecessary} from "@infra/ui/renderers/avatarRenderer.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import {TextField} from "@vaadin/text-field";

type ValueChangedDetail = { value: unknown; fieldId: string | undefined }

interface FileLike {
    id: string
    name: string
}


// UI5's ColorPicker/RangeSlider are only needed by the color-picker and range-slider field
// stereotypes. Load them LAZILY (a dynamic import on first use) so every other renderer/field does
// not pull in the whole @ui5/webcomponents library — and its global ui5-announcement-area — just to
// render a text field. Memoized so the modules load at most once per page.
let ui5FieldComponentsPromise: Promise<unknown> | null = null
const ensureUi5FieldComponents = (): Promise<unknown> => {
    if (!ui5FieldComponentsPromise) {
        ui5FieldComponentsPromise = Promise.all([
            import("@ui5/webcomponents/dist/ColorPicker.js"),
            import("@ui5/webcomponents/dist/RangeSlider.js"),
        ])
    }
    return ui5FieldComponentsPromise
}

@customElement('mateu-field')
export class MateuField extends LitElement {

    // Set once the lazily-loaded UI5 field components (color-picker / range-slider) have registered,
    // so the element re-renders and the placed <ui5-*> upgrades.
    @state()
    private ui5FieldComponentsReady = false

    private loadUi5FieldComponents() {
        if (this.ui5FieldComponentsReady) return
        ensureUi5FieldComponents().then(() => { this.ui5FieldComponentsReady = true })
    }

    @property()
    component: ClientSideComponent | undefined = undefined

    @property()
    field: FormField | undefined = undefined

    @property()
    baseUrl: string | undefined = undefined

    @property()
    state: ComponentState = {}

    @property()
    data: ComponentData = {}

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    @property()
    labelAlreadyRendered: boolean | undefined

    @state()
    colorPickerOpened = false

    @state()
    colorPickerValue : string | undefined = undefined

    comboData: Option[] = []

    // The filter of the most recent remote combo search, used to drop out-of-order responses
    // (a slow response for an old filter must not overwrite the results of a newer keystroke).
    private _comboFilter = ''

    /**
     * Shared remote data provider for both the single and multi-select combo boxes. Dispatches the
     * remote search action and feeds the returned options back to the combo, showing any messages
     * and handling an empty result. Guards against out-of-order responses: only the response whose
     * filter still matches the latest keystroke is delivered (pagination of the same filter is
     * unaffected).
     */
    private remoteComboDataProvider(action: string | undefined): ComboBoxDataProvider<Option> {
        return (params, callback) => {
            const { filter, page, pageSize } = params
            const requestFilter = filter ?? ''
            this._comboFilter = requestFilter
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: action,
                    parameters: {
                        searchText: filter,
                        fieldId: this.field?.fieldId,
                        size: pageSize,
                        page,
                        sort: undefined
                    },
                    callback: (uiIncrement: UIIncrement) => {
                        // A newer keystroke has superseded this search — ignore its stale response.
                        if (requestFilter !== this._comboFilter) return
                        uiIncrement?.messages?.forEach(message => {
                            Notification.show(message.text, {
                                position: message.position ? this.mapPosition(message.position) : undefined,
                                theme: message.variant,
                                duration: message.duration
                            })
                        })
                        if (!uiIncrement.fragments || uiIncrement.fragments.length == 0) {
                            this.comboData = []
                            callback([], 0)
                        } else {
                            const data = uiIncrement.fragments![0].data?.[this.id] as Record<string, unknown>
                            this.comboData = data?.content as Option[]
                            callback(data?.content as Option[], data?.totalElements as number)
                        }
                    },
                    callbackonly: true
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    rendered = false

    renderColorPicker = () => {
        this.loadUi5FieldComponents()
        const fieldId = this.field?.fieldId!
        const value = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        return html`
            <ui5-color-picker value="${value}" @change="${(e: CustomEvent) => this.colorPickerValue = (e.target as HTMLInputElement).value}">Picker</ui5-color-picker>
        `
    }

    saveColor = () => {
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: {
                value: this.colorPickerValue,
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
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: {
                value: input.checked,
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
        if (this.rendered) {
            const fieldId = this.field?.fieldId!
            const oldValue = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
            let value: any = undefined
            if (e.detail.value) {
                value = e.detail.value.map((option: any) => option.value)
                if (value && value.length > 0) {
                    if (!this.data[this.id]) {
                        this.data[this.id] = {}
                    }
                    if (!this.data[this.id].content) {
                        this.data[this.id].content = []
                    }
                    if (this.data[this.id]
                        && this.data[this.id].content) {
                        e.detail.value.forEach((item: any) => {
                            if (!this.data[this.id].content?.find((option: any) => item.value == option.value)) {
                                this.data[this.id].content.push(item)
                            }
                        })
                    }
                }
            }
            if (!this.compareArrays(value, oldValue)) this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                detail: {
                    value: value,
                    fieldId: this.field?.fieldId
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    valueChanged = (e: CustomEvent) => {
        if (this.rendered) {
            if (e.detail.value !== undefined && e.detail.value != this.state[this.field!.fieldId]) {
                this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                    detail: {
                        value: this.convert(e.detail.value),
                        fieldId: this.field?.fieldId
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

    selectedItems = (value: any[]) => {
        if (value && value.length > 0) {
            if (this.field?.remoteCoordinates) {
                if (this.comboData
                    && this.comboData.length > 0) {
                    return this.comboData?.filter((option: any) =>
                        value.indexOf(option.value) >= 0)
                }
                if (this.data[this.id]
                    && this.data[this.id].content
                    && this.data[this.id].content.length > 0) {
                    return this.data[this.id].content
                        .filter((option: any) => value.indexOf(option.value) >= 0)
//                        .map(option => this.data[this.id].content.indexOf(option))
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
        if (this.rendered) {
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
                this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                    detail: {
                        value,
                        fieldId: this.field?.fieldId
                    },
                    bubbles: true,
                    composed: true
                }))
            }
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
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: {
                value,
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    mapPosition = (position: string): NotificationPosition => {
        switch(position) {
            case 'topStretch': return 'top-stretch'
            case 'topStart': return 'top-start'
            case 'topCenter': return 'top-center'
            case 'topEnd': return 'top-end'
            case 'middle': return 'middle'
            case 'bottomStart': return 'bottom-start'
            case 'bottomEnd': return 'bottom-end'
            case 'bottomStretch': return 'bottom-stretch'
            case 'bottomCenter': return 'bottom-center'
        }
        return 'bottom-end'
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.rendered = false
    }

    // Navigation icon at the right of the field (@LinkTo / LinkSupplier). href and title are
    // interpolated here against the live state, so the link follows the value as the user types.
    private renderNavLink(): TemplateResult | typeof nothing {
        const link = this.field?.link
        if (!link?.href) return nothing
        const href = interpolate(link.href, this.state, this.data) ?? link.href
        const title = interpolate(link.title, this.state, this.data) || href
        const icon = link.icon || (href.startsWith('http') ? 'vaadin:external-link' : 'vaadin:link')
        // Until measured, approximate label height + half the input; positionNavLink() then
        // centers the icon on the control's real input row once it has been laid out.
        const marginTop = this.navLinkOffset
            ?? 'calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)'
        return html`<a
                data-navlink
                href="${href}"
                title="${title}"
                target="${ifDefined(link.target || undefined)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${marginTop};"
        ><vaadin-icon icon="${icon}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`
    }

    // Vertically centers the nav link icon on the field's input row (the [part=input-field] of the
    // rendered vaadin control), so label above and helper text below don't skew it. The measured
    // offset is state consumed by the template — imperative styling would be undone on re-render.
    private positionNavLink() {
        const anchor = this.renderRoot?.querySelector('a[data-navlink]') as HTMLElement | null
        if (!anchor) return
        // setTimeout, not requestAnimationFrame: rAF is suspended in background tabs.
        setTimeout(() => {
            const row = anchor.parentElement
            const control = row?.firstElementChild?.firstElementChild as HTMLElement | null
            if (!row || !control) return
            const inputPart = (control.shadowRoot?.querySelector('[part="input-field"]') as HTMLElement | null) ?? control
            const inputRect = inputPart.getBoundingClientRect()
            if (inputRect.height === 0) return
            const offset = Math.max(0,
                inputRect.top + inputRect.height / 2 - anchor.offsetHeight / 2 - row.getBoundingClientRect().top)
            const value = `${Math.round(offset)}px`
            if (this.navLinkOffset !== value) {
                this.navLinkOffset = value
            }
        })
    }

    // True when the render*Field branch chosen in the current render pass displays the field's
    // description as the control's own helperText (set via helperText() below). Plain private —
    // it only gates the fallback help div computed within the same render pass.
    private helperShownInControl = false

    // The field's help (@Help / description), interpolated against the live state, for binding as
    // a vaadin control's helperText. Marks the description as consumed so render() doesn't repeat
    // it in the fallback help div below the control.
    private helperText(): string {
        this.helperShownInControl = true
        return evalIfNecessary(this.field?.description ?? '', this.state, this.data) ?? ''
    }

    render() {
        const fieldId = this.field?.fieldId??''
        this.rendered = true
        const navLink = this.renderNavLink()
        // renderField() must run before the fallback help below is decided: the chosen branch
        // marks (via helperText()) whether the control already displays the description.
        this.helperShownInControl = false
        const field = this.renderField()
        const help = this.field?.description && !this.helperShownInControl
            ? evalIfNecessary(this.field.description, this.state, this.data) : undefined
        return html`<div style="display: block;">
            <div style="${navLink !== nothing ? 'display: flex; gap: var(--lumo-space-xs);' : ''}"><div style="flex: 1; min-width: 0;">${field}</div>${navLink}</div>
            ${help?html`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${help}</div>
            `:nothing}
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

        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
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
            this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                detail: {
                    value: newValues,
                    fieldId: this.field?.fieldId
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    // Uploadable image field: opens the hidden file input next to the upload button.
    triggerImageUpload = () => {
        const input = this.renderRoot?.querySelector('input[type="file"]') as HTMLInputElement | null
        input?.click()
    }

    // Reads the chosen image client-side into a data URI and writes it to the field value, so the
    // image travels in the string itself — no upload endpoint required.
    imageUpload = (e: Event) => {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                detail: { value: reader.result as string, fieldId: this.field?.fieldId },
                bubbles: true,
                composed: true
            }))
        }
        reader.readAsDataURL(file)
        input.value = '' // allow re-selecting the same file
    }

    // Clears the field value, removing the image.
    imageDelete = () => {
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: { value: '', fieldId: this.field?.fieldId },
            bubbles: true,
            composed: true
        }))
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

    comboRenderer: ComboBoxLitRenderer<Option> = (option) => html`
        ${option.description || option.image || option.icon?html`
            <vaadin-horizontal-layout theme="spacing">
                ${option.icon?html`<div><vaadin-icon icon="${option.icon}"></vaadin-icon></div>
                                    `:nothing}
                ${option.image?html`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${option.image}"
                            alt="${option.label}"
                    />
                    </div>
                                        `:nothing}
                <div>
                    ${option.label}
                    ${option.description?html`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${option.description}
            </div>
        `:nothing}
                </div>

            </vaadin-horizontal-layout>
                            `:option.label}
`;

    @state()
    private filteredIcons: string[] = [];

    @state()
    private navLinkOffset: string | null = null;


    protected override async firstUpdated() {
        this.filteredIcons = allIcons;
    }

    protected update(changedProperties: PropertyValues) {
        if (changedProperties.has( 'component' ) ) {
            this.rendered = false
        }
        super.update(changedProperties);
    }

    protected override updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        this.positionNavLink()
    }

    iconFilterChanged = (event: CustomEvent) => {
        this.filteredIcons = allIcons.filter(icon => !event.detail.value || icon.indexOf(event.detail.value) >= 0)
    }


    renderField(): TemplateResult {
        const fieldId = this.field?.fieldId??''
        const value = this.state && fieldId in this.state?this.state[fieldId]:this.field?.initialValue
        const rawLabelText = this.field?.label + ''
        const labelText = interpolate(rawLabelText, this.state, this.data)
        const label = (this.labelAlreadyRendered || !labelText || labelText == 'null')?nothing:labelText

        if (this.field?.propertyRow) return this.renderPropertyRowField(fieldId, value, label, labelText)
        if (this.field?.stereotype == 'badge') return this.renderBadgeField(fieldId, value, label, labelText)
        if (this.field?.stereotype == 'plainText') return this.renderPlainTextField(fieldId, value, label, labelText)
        if (this.field?.stereotype == 'bulletedList') return this.renderBulletedListField(fieldId, value, label, labelText)
        if (this.field?.readOnly && !('grid' == this.field.stereotype) && !('status' == this.field.dataType) && !(this.field?.dataType == 'money')) return this.renderReadOnlyField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'file') return this.renderFileField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'string') return this.renderStringField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'number') return this.renderNumberField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'integer') return this.renderIntegerField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'bool') return this.renderBoolField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'dateRange') return this.renderDateRangeField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'date') return this.renderDateField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'dateTime') return this.renderDateTimeField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'time') return this.renderTimeField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'array') return this.renderArrayField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'money') return this.renderMoneyField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'status') return this.renderStatusField(fieldId, value, label, labelText)
        if (this.field?.dataType == 'range') return this.renderRangeField(fieldId, value, label, labelText)
        return html `<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`
    }

    private renderBadgeField(_fieldId: string, value: any, _label: any, labelText: string): TemplateResult {
        if (!this.field) return html``
            const on = value === true || value === 'true'
            return html`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${on ? 'success' : ''} pill" style="${on ? '' : 'opacity: 0.4;'}">${labelText}</span>
            </vaadin-custom-field>`
    }

    // Property-list row (@Section(propertyList=true)): plain-text value with the label aligned
    // left and the value aligned right, rows separated by a divider line.
    private renderPropertyRowField(_fieldId: string, value: any, _label: any, labelText: string): TemplateResult {
        if (!this.field) return html``
            let v = evalIfNecessary(value, this.state, this.data)
            const amountObj = (v && typeof v === 'object' && 'value' in (v as any)) ? (v as any) : null
            if (v && (v as any).value) v = (v as any).value
            const isBool = this.field?.dataType == 'bool' || v === true || v === false
            const isMoney = this.field?.dataType == 'money'
            const hasValue = v !== null && v !== undefined && v !== ''
            let display = hasValue ? String(v) : '—'
            if (isMoney && hasValue) {
                const num = typeof v === 'number' ? v : parseFloat(String(v))
                if (!isNaN(num)) {
                    display = (amountObj && amountObj.locale && amountObj.currency)
                        ? new Intl.NumberFormat(amountObj.locale, { style: 'currency', currency: amountObj.currency }).format(num)
                        : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
                }
            }
            const valueBody = isBool
                ? html`<vaadin-icon icon="${(v === true || v === 'true') ? 'vaadin:check' : 'vaadin:minus'}" style="height: 16px; width: 16px;"></vaadin-icon>`
                : html`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
            const showLabel = labelText && labelText != 'null'
            return html`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${showLabel ? html`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${labelText}</span>` : nothing}${valueBody}</div>`
    }

    private renderBulletedListField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            const v = evalIfNecessary(value, this.state, this.data)
            const items = Array.isArray(v) ? v.map(item => String(item)) : (v != null && v !== '' ? [String(v)] : [])
            return html`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${label}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${items}"></mateu-bulleted-list>
            </vaadin-custom-field>`
    }

    private renderPlainTextField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            let v = evalIfNecessary(value, this.state, this.data)
            const amountObj = (v && typeof v === 'object' && 'value' in (v as any)) ? (v as any) : null
            if (v && (v as any).value) v = (v as any).value
            const isBool = this.field?.dataType == 'bool' || v === true || v === false
            const isMoney = this.field?.dataType == 'money'
            const hasValue = v !== null && v !== undefined && v !== ''
            let display = hasValue ? String(v) : '—'
            if (isMoney && hasValue) {
                const num = typeof v === 'number' ? v : parseFloat(String(v))
                if (!isNaN(num)) {
                    display = (amountObj && amountObj.locale && amountObj.currency)
                        ? new Intl.NumberFormat(amountObj.locale, { style: 'currency', currency: amountObj.currency }).format(num)
                        : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
                }
            }
            const body = isBool
                ? html`<vaadin-icon icon="${(v === true || v === 'true') ? 'vaadin:check' : 'vaadin:minus'}" style="height: 16px; width: 16px;"></vaadin-icon>`
                : this.field?.multiline
                    ? html`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${display}</span>`
                    : html`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
            // Read-only plain-text fields render as a vaadin-custom-field with the value as its
            // slotted content, so they sit consistently in the form layout (label on top, value below).
            return html`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${label}"
                    data-colspan="${this.field?.colspan}"
                    style="${isMoney ? 'text-align: right; ' : ''}${this.field?.style}"
            >${body}</vaadin-custom-field>`
    }

    private renderReadOnlyField(fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            let valueToDisplay = evalIfNecessary(value, this.state, this.data) || this.data[fieldId]
            if (valueToDisplay && (valueToDisplay as any).value) {
                valueToDisplay = (valueToDisplay as any).value
            }
            if ('fileUpload' == this.field.stereotype) {
                // read-only file: the file name (a download link when it is a data URI)
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${valueToDisplay}" .editable="${false}"></mateu-file-upload>
                </vaadin-custom-field>`
            }
            if ('image' == this.field.stereotype || 'uploadableImage' == this.field.stereotype
                || 'signature' == this.field.stereotype || 'camera' == this.field.stereotype) {
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        required="${this.field.required || nothing}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${valueToDisplay}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`
            }
            if ('bool' == this.field.dataType) {
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        required="${this.field.required || nothing}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${valueToDisplay?'vaadin:check':'vaadin:minus'}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`
            }
            const strValue = valueToDisplay != null ? String(valueToDisplay) : ''
            return html`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        value="${valueToDisplay}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${strValue.length > 15 ? html`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${() => this.copyValue(strValue)}"
                ></vaadin-icon>` : nothing}</vaadin-text-field>
`
    }

    // Copies the read-only field's value to the clipboard and confirms with a short toast.
    private copyValue(value: string) {
        navigator.clipboard.writeText(value)
            .then(() => Notification.show('Copied', {
                position: 'bottom-end',
                theme: 'success',
                duration: 2000,
            }))
            .catch(() => {})
    }

    private renderFileField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            const files = value?.map((file: FileLike) => {
                return {
                    id: file.id,
                    name: file.name,
                    type: '',
                    uploadTarget: '',
                    complete: true
                }
            })??[]
            return html`
                <vaadin-custom-field
                        label="${label}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${files}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `
    }

    private renderStringField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            if (this.field?.stereotype == 'searchable') {

                const searchCode = (e: CustomEvent) => {
                    this.dispatchEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: 'code-' + this.field?.fieldId,
                            parameters: {
                                code: (e.currentTarget as TextField).value
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }

                const search = (_e: CustomEvent) => {
                    this.dispatchEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: 'codesearch-' + this.field?.fieldId,
                            parameters: {
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }

                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${searchCode}" value="${value}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId + '-label']}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${search}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `
            }
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

                    let realValue = value
                    if (value && value.value) {
                        realValue = value.value
                    }

                    return html`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${realValue}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `
                }
                let realValue = value
                if (value && value.value) {
                    realValue = value.value
                }
                return html`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${realValue}"
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
                            .helperText="${this.helperText()}"
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

                    let selectedItem: Option | undefined = undefined
                    if (this.data[this.id] && this.data[this.id].content) {
                        selectedItem = this.data[this.id].content.find((item:any) => item.value == value)
                    }
                    if (!selectedItem && this.comboData) {
                        selectedItem = this.comboData.find((item:any) => item.value == value)
                    }
                    if (!selectedItem && value) {
                        selectedItem = {
                            value: value,
                            label: this.data[this.id + '-label']??value
                        } as Option
                    }

                    const dataProvider = this.remoteComboDataProvider(coords.action)

                    return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${dataProvider}"
                            .selectedItem="${selectedItem}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${(z: KeyboardEvent) => {
                                if (z.key == 'Backspace') {
                                    const combo = z.currentTarget as ComboBox
                                    const input = combo.inputElement as HTMLInputElement
                                    const filter = input.value
                                    if (!filter) {
                                        combo.value = ''
                                    }
                                }
                            }}"
                            ${comboBoxRenderer(this.comboRenderer, [])}
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
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${comboBoxRenderer(this.comboRenderer, [])}
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
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${ifDefined(this.selectedIndex(value))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-item>${option.description || option.image || option.icon?html`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${option.icon?html`
                                        <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                    `:nothing}
                                    ${option.image?html`
                                            <img src="${option.image}" alt="${option.label}" style="width: 2rem;" />
                                        `:nothing}
                                    <vaadin-vertical-layout>
                                        <span> ${option.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${option.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `
                }
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${ifDefined(this.selectedIndex(value))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.description || option.image || option.icon?html`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${option.icon?html`
                                        <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                    `:nothing}
                                    ${option.image?html`
                                            <img src="${option.image}" alt="${option.label}" style="width: 2rem;" />
                                        `:nothing}
                                    <vaadin-vertical-layout>
                                        <span> ${option.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${option.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:option.label}</vaadin-item>
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
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}" ?checked="${option && value && option.value === value}">
                                ${option.description || option.image || option.icon?html`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${option.icon?html`
                                                <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                            `:nothing}
                                            ${option.image?html`
                                                <img src="${option.image}" alt="${option.label}" style="height: 1rem;" />
                                            `:nothing}
                                            <span>${option.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${option.description?html`
                                            <div>${option.description}</div>
                                        `:nothing}
                                    </label>
                                `:nothing}
                            </vaadin-radio-button>
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
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}">
                                ${option.description || option.image || option.icon?html`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${option.icon?html`
                                                <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                            `:nothing}
                                            ${option.image?html`
                                                <img src="${option.image}" alt="${option.label}" style="height: 1rem;" />
                                            `:nothing}
                                            <span>${option.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${option.description?html`
                                            <div>${option.description}</div>
                                        `:nothing}
                                    </label>
                                `:nothing}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field.stereotype == 'popover') {
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required || nothing}"
                            .helperText="${this.helperText()}"
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
                            .helperText="${this.helperText()}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${value}"
                                .state="${this.state}"
                                .data="${this.data}"
                                .appState="${this.appState}"
                                .appdata="${this.appData}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `
            }
            if (this.field?.stereotype == 'richText') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
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
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`
            }
            if (this.field?.stereotype == 'email') {
                return html`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            value="${value}"
                            .helperText="${this.helperText()}"
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
                            .helperText="${this.helperText()}"
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
                                    .helperText="${this.helperText()}"
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
                                    .helperText="${this.helperText()}"
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
                            .helperText="${this.helperText()}"
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
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${unsafeHTML('' + value)}</div></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'image') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${value}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'treeSelect') {
                // Rendered WITHOUT vaadin-custom-field on purpose: custom-field's inputs wrapper is
                // shrink-to-content and unreachable from here, so a slotted child never fills the
                // column. The value round-trips through mateu-vaadin-tree-select's own value-changed
                // event (not custom-field), so we just render the label ourselves and let the host's
                // width: 100% flow straight to the control.
                const helper = this.helperText()
                return html`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${label ? html`
                            <span class="tree-field__label">${label}${this.field.required ? html`<span class="tree-field__required"> •</span>` : nothing}</span>` : nothing}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${value}"
                                .options="${this.field.options ?? []}"
                                .leavesOnly="${this.field.treeLeavesOnly ?? false}"
                        ></mateu-vaadin-tree-select>
                        ${helper ? html`<span class="tree-field__helper">${helper}</span>` : nothing}
                    </div>
                `
            }
            if (this.field?.stereotype == 'signature') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${value}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'camera') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${value}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'fileUpload') {
                // generic file upload: pick-file + name + remove, value = data URI (no preview);
                // the accept attribute travels in the field's generic attributes
                const accept = fieldAttribute(this.field.attributes, 'accept')
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${value}" .accept="${accept}"></mateu-file-upload>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'uploadableImage') {
                const hasImage = value != null && value !== ''
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${hasImage ? html`<img
                                    src="${value}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style ?? ''}"
                                    class="${this.component?.cssClasses}">`
                                : html`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${hasImage ? 'Replace' : 'Upload'}
                                </vaadin-button>
                                ${hasImage ? html`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>` : nothing}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'color') {
                if (this.field.readOnly) {
                    return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${value}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                    >
                        <input type="color" @input="${(e: Event) => {
                            this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                                detail: {
                                    value: (e.target as HTMLInputElement).value,
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
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`
    }

    private renderNumberField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step || nothing}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min != null ? this.field.min : nothing}"
                        max="${this.field.max != null ? this.field.max : nothing}"
            ></vaadin-number-field>`
    }

    private renderIntegerField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            if (this.field.stereotype == 'stars') {
                let renderValue = value;
                if (isNaN(renderValue)) {
                    renderValue = 0
                }
                const values = [1, 2, 3, 4, 5]
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${values.map(index => html`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${index <= renderValue?'--lumo-warning-color':'--lumo-shade-30pct'});"
                            @click="${() => this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                                detail: {
                                    value: index,
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
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${(e: Event) => {
                        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                            detail: {
                                value: (e.target as HTMLInputElement).value,
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
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step || nothing}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min != null ? this.field.min : nothing}"
                        max="${this.field.max != null ? this.field.max : nothing}"
                ></vaadin-integer-field>
            `
    }

    private renderBoolField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            if (this.field.stereotype == 'toggle') {
                return html `
                    <vaadin-custom-field
                            label="${label}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${value}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `
            }
            // A plain checkbox carries its label at its side (the standard affordance), not
            // floating above like an input label.
            return html `
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${label}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${value}"
                        ?checked=${value}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `
    }

    private renderDateRangeField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            const drValue = value?value.from + ';' + value.to:undefined;
            return html`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${label}"
                    @value-changed="${(e: CustomEvent) => {
                        if (e.detail.value) {
                            e.detail.value = {
                                from: e.detail.value.split(';')[0],
                                to: e.detail.value.split(';')[1]
                            }
                        }
                        this.valueChanged(e)
                    }}"
                    value="${drValue}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required || nothing}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`
    }

    private renderDateField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            return html`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`
    }

    private renderDateTimeField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            return html`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`
    }

    private renderTimeField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            return html`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`
    }

    private renderArrayField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            if (this.field?.stereotype == 'choice') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required || nothing}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${value}"
                                .state="${this.state}"
                                .data="${this.data}"
                                .appState="${this.appState}"
                                .appdata="${this.appData}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `
            }
            if (this.field?.stereotype == 'grid') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                            style="width: 100%;"
                    >
                    <mateu-grid
                            id="${this.field.fieldId}"
                        .field="${this.field}"
                        .state="${this.state}"
                        .data="${this.data}"
                            .appState="${this.appState}"
                            .appdata="${this.appData}"
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
                                .helperText="${this.helperText()}"
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
                            .helperText="${this.helperText()}"
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

                    const dataProvider = this.remoteComboDataProvider(coords.action)

                    return html`
                        <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${dataProvider}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(value)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required || nothing}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `
                }
                return html`
                    <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(value)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required || nothing}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
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
                    if (!this.rendered) setTimeout(() => {
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
                    })
                }

                return html`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        .value="${value}"
                        class="mateu-checkbox-group-${this.field.optionsColumns > 1?'multi-column':''}"
                >
                        ${this.data[this.id]?.content?.map((option: any) => html`
                            <vaadin-checkbox
                                    value="${option.value}"
                                    label="${option.label}"
                            ></vaadin-checkbox>
                        `
                        )}
                </vaadin-checkbox-group>
                    `
            }
            return html `
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns > 1?'multi-column':''}"
                        .value="${value}"
                >
                        ${this.field.options?.map(option => html`
                        <vaadin-checkbox 
                                value="${option.value}" 
                                label="${option.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `
    }

    private renderMoneyField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            if (this.field.readOnly) {
                const amount = value
                let formatted = amount
                if (amount && amount.locale && amount.currency) {
                    formatted = new Intl.NumberFormat(amount.locale, { style: "currency", currency: amount.currency }).format(
                        amount.value,
                    )
                } else {
                    formatted = new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,

                    }).format(
                        amount,
                    )
                }
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${formatted}</div></vaadin-custom-field>`
            }
            return html`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        .value="${value}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required || nothing}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`
    }

    private renderStatusField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            const status = value as Status
            return html`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        required="${this.field.required || nothing}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${status?html`<span theme="badge pill ${getThemeForBadgetType(status.type)}">${status.message}</span>`:html``}                    
                </vaadin-custom-field>
            `
    }

    private renderRangeField(_fieldId: string, value: any, label: any, _labelText: string): TemplateResult {
        if (!this.field) return html``
            this.loadUi5FieldComponents()
            const range = value as {
                from: number
                to: number
            }
            return html`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        .helperText="${this.helperText()}"
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
                                       this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                                           detail: {
                                               value: {
                                                   from: values.startValue,
                                                   to: values.endValue
                                               },
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

    static styles = css`
        ${badge}

        /* Fields fill the whole column width by default. Date, checkbox, numeric and money inputs
           are the exception — they keep their natural (narrower) width so a date/amount doesn't
           stretch across the column. (vaadin inputs default to a fixed width, hence the explicit
           width: 100% on the stretchy ones.) */
        :host {
            display: block;
            width: 100%;
        }
        :host vaadin-text-field,
        :host vaadin-text-area,
        :host vaadin-combo-box,
        :host vaadin-multi-select-combo-box,
        :host vaadin-select,
        :host vaadin-email-field,
        :host vaadin-password-field,
        :host vaadin-custom-field {
            width: 100%;
        }
        /* A field spanning several columns (host colspan attribute, set when colspan > 1) stretches
           every input — including the naturally-narrow date/numeric ones — to fill the columns. */
        :host([colspan]) vaadin-date-picker,
        :host([colspan]) vaadin-date-time-picker,
        :host([colspan]) vaadin-time-picker,
        :host([colspan]) vaadin-number-field,
        :host([colspan]) vaadin-integer-field {
            width: 100%;
        }

        /* Tree-select field wrapper (rendered without vaadin-custom-field — see the treeSelect
           branch). Its own label mimics the vaadin field label density. */
        .tree-field {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .tree-field__label {
            align-self: flex-start;
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            line-height: var(--mateu-label-line-height, 1);
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            color: var(--lumo-secondary-text-color);
        }
        .tree-field__required {
            color: var(--lumo-required-field-indicator-color, var(--lumo-primary-text-color));
        }
        .tree-field__helper {
            padding-top: 0.25rem;
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
        }

        .mateu-checkbox-group-multi-column::part(group-field) {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem 3rem;
        }

        /* Field-label density. Defaults reproduce the standard look; a page can compress all of
           them at once by setting the --mateu-label-* variables (e.g. via the @Compact preset). */
        vaadin-text-field::part(label),
        vaadin-text-area::part(label),
        vaadin-combo-box::part(label),
        vaadin-multi-select-combo-box::part(label),
        vaadin-select::part(label),
        vaadin-date-picker::part(label),
        vaadin-time-picker::part(label),
        vaadin-number-field::part(label),
        vaadin-email-field::part(label),
        vaadin-password-field::part(label),
        vaadin-custom-field::part(label) {
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            line-height: var(--mateu-label-line-height, 1.2);
            /* Let long labels wrap onto several lines instead of truncating with an ellipsis
               (e.g. "Tiempo esperando" / "Tipo hab. contratada" in a dense multi-column form). */
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            height: auto;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


