import { customElement, property, state } from "lit/decorators.js";
import '@components/mateu-signature-pad.ts';
import './mateu-vaadin-tree-select';
import '@components/mateu-camera-capture.ts';
import '@components/mateu-file-upload.ts';
import '@components/mateu-bulleted-list.ts';
import '@components/mateu-markup-editor.ts';
import '@components/mateu-range-slider.ts';
import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import { interpolate } from '@components/interpolation'
import { isNoOpCommit, numericCommitValue } from '@components/fieldValue'
import { isSearchableMulti } from '@components/searchableMulti'
import { isInside, readOnlyAsPlainText } from '@infra/ui/foldoutGeometry.ts'
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
import "@infra/ui/mateu-rich-text-editor"
import "@vaadin/email-field"
import "@vaadin/upload"
import "@vaadin/list-box"
import "@vaadin/markdown"
import '@vaadin/item'
import "@vaadin-component-factory/vcf-date-range-picker"
import { mateuFieldStyles } from './mateu-field.styles'
import { renderStringField } from './string'
import { renderReadOnlyMarkupField, renderBadgeField, renderPropertyRowField, renderBulletedListField, renderPlainTextField, renderFoldoutReadOnlyField, renderReadOnlyField } from './readOnly'
import { renderSearchableMultiField } from './searchableMulti'
import { renderFileField } from './file'
import { renderNumberField, renderIntegerField } from './number'
import { renderBoolField } from './bool'
import { renderDateRangeField, renderDateField, renderDateTimeField, renderTimeField } from './date'
import { renderArrayField } from './array'
import { renderMoneyField, renderStatusField, renderRangeField } from './money'
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComboBoxDataProvider } from "@vaadin/combo-box";
import './mateu-grid'
import '@components/mateu-choice'
import './mateu-money-field'
import { ComboBoxLitRenderer } from "@vaadin/combo-box/lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { allIcons } from "@infra/ui/allIcons.ts";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {Notification, NotificationPosition} from "@vaadin/notification";
import {evalIfNecessary} from "@infra/ui/renderers/avatarRenderer.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import {announce} from "@infra/a11y/announcer.ts";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { humanizeFieldId } from '@infra/ui/humanize.ts'

import type { ValueChangedDetail } from './fieldEvents'

/** Stereotypes whose own branch draws their read-only form (see renderField). */
const OWN_READ_ONLY = new Set(['link', 'icon', 'color'])

export { offersItsOptions } from './string/select'


@customElement('mateu-field')
export class MateuField extends LitElement {

    // A read-only field (a record's view page, foldout or not) reads as label + plain value — what
    // Redwood draws — not as a read-only input with its dashed box. inFoldout is kept for styling.
    @state()
    private inFoldout = false

    connectedCallback() {
        super.connectedCallback()
        this.inFoldout = isInside(this, 'mateu-vaadin-foldout')
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
    remoteComboDataProvider(action: string | undefined): ComboBoxDataProvider<Option> {
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

    // The remote options of this field (select, radio, list box, checkbox group) were asked for:
    // once per field, not once per render. A render is not a reason to ask again — the control
    // re-renders on its own state (validity, nav-link offset), and an answer with no options
    // (totalElements 0) used to be re-requested on every one of them. Reset when the field changes.
    private remoteOptionsRequested = false

    requestRemoteOptions(action: string | undefined) {
        const loaded = this.data[this.id]
        if (loaded?.content && loaded?.totalElements) return
        if (this.remoteOptionsRequested) return
        this.remoteOptionsRequested = true
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: action,
                parameters: {
                    searchText: '',
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
            return numericCommitValue(value, true)
        }
        // A number field's control speaks strings ("19.95"); the state holds numbers — a rule
        // comparing `state.price > 10` or a server-side type check should never meet the string.
        if (this.field?.dataType == 'number') {
            return numericCommitValue(value, false)
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
            // An empty control over a state that never held the field is announcing nothing. Taking
            // it as an edit is what let an untouched form start writing to itself.
            if (e.detail.value !== undefined
                && !isNoOpCommit(e.detail.value, this.state[this.field!.fieldId])) {
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

    /** The markdown/html editor's own value-changed: re-announced as this field's (with its id). */
    markupChanged = (e: CustomEvent) => {
        e.stopPropagation()
        this.valueChanged(e)
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
        // the list box announces its initial selection too: that is the current value, not an edit
        if (isNoOpCommit(value, this.state?.[this.field?.fieldId ?? ''])) return
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
                href="${ifDefined(safeHref(href))}"
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
    helperText(): string {
        this.helperShownInControl = true
        return evalIfNecessary(this.field?.description ?? '', this.state, this.data) ?? ''
    }

    /** Validation messages the server sent for this field, if any. */
    private fieldErrors(): string[] {
        const fieldId = this.field?.fieldId ?? ''
        const errors = this.data?.errors?.[fieldId]
        return Array.isArray(errors) ? errors.filter((e: unknown) => !!e) : []
    }

    /**
     * The rendered control, when it is one that owns a validity state (every vaadin field does).
     * Found by property probing rather than by tag name so it keeps working as branches are added
     * and as controls are swapped for other design systems' equivalents.
     */
    private validatableControl(): (HTMLElement & { invalid?: boolean, errorMessage?: string }) | null {
        const candidates = this.renderRoot.querySelectorAll<HTMLElement>('*')
        for (const el of candidates) {
            if ('invalid' in el && 'errorMessage' in el) {
                return el as HTMLElement & { invalid?: boolean, errorMessage?: string }
            }
        }
        return null
    }

    /** The last error text pushed into the control, so a repeat render does not re-announce it. */
    private lastAnnouncedError = ''

    /**
     * Puts the server's validation result ON the control.
     *
     * Until this existed the errors were painted as a detached `<ul>` beside the field: visible,
     * but with no relationship to the input. The control kept `aria-invalid="false"`, nothing
     * pointed at the message, and a screen-reader user pressing Save heard nothing at all — the
     * single worst accessibility defect in the framework, because forms are what Mateu generates.
     *
     * Setting `invalid`/`errorMessage` hands the job to the design system, which already knows how
     * to wire `aria-invalid` and `aria-describedby` inside its own shadow root — something no
     * amount of markup out here could do across that boundary.
     */
    private applyValidationState() {
        const errors = this.fieldErrors()
        const control = this.validatableControl()
        if (!control) {
            this.lastAnnouncedError = errors.join('. ')
            return
        }
        const message = errors.join('. ')
        control.errorMessage = message
        control.invalid = errors.length > 0
        // Announce a newly-arrived error. The control's own aria-describedby covers a user who
        // walks back to the field; this covers the far more common case of pressing Save and
        // staying where they are.
        if (message && message !== this.lastAnnouncedError) {
            const label = (this.field?.label ?? '').toString().trim()
            announce(label ? `${label}: ${message}` : message, { politeness: 'assertive' })
        }
        this.lastAnnouncedError = message
    }

    render() {
        this.rendered = true
        const navLink = this.renderNavLink()
        // renderField() must run before the fallback help below is decided: the chosen branch
        // marks (via helperText()) whether the control already displays the description.
        this.helperShownInControl = false
        const field = this.renderField()
        const help = this.field?.description && !this.helperShownInControl
            ? evalIfNecessary(this.field.description, this.state, this.data) : undefined
        const errors = this.fieldErrors()
        // The list is only for controls with no validity state of their own (a plain-text or
        // custom branch). When the control HAS one, applyValidationState() puts the message
        // inside it, and repeating it here would have a screen reader read it twice.
        const showErrorList = errors.length > 0 && !this.controlOwnsValidity
        return html`<div style="display: block;">
            <div style="${navLink !== nothing ? 'display: flex; gap: var(--lumo-space-xs);' : ''}"><div style="flex: 1; min-width: 0;">${field}</div>${navLink}</div>
            ${help?html`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${help}</div>
            `:nothing}
            ${showErrorList?html`
                <div role="alert"><ul>${errors.map((error: string) => html`<li>${error}</li>`)}</ul></div>
            `:nothing}
        </div>`
    }

    /** Whether the rendered control displays its own validation message (set after each render). */
    @state()
    private controlOwnsValidity = false

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
    filteredIcons: string[] = [];

    @state()
    private navLinkOffset: string | null = null;


    protected override async firstUpdated() {
        this.filteredIcons = allIcons;
    }

    protected update(changedProperties: PropertyValues) {
        if (changedProperties.has( 'component' ) ) {
            this.rendered = false
        }
        if (changedProperties.has('field')) {
            this.remoteOptionsRequested = false
        }
        super.update(changedProperties);
    }

    protected override updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        this.positionNavLink()
        this.applyValidationState()
        this.nameUnlabelledControl()
        // Whether the control displays its own message decides if the fallback list is rendered.
        // It can only be known after the control exists, so it feeds the NEXT render — which Lit
        // schedules because it is @state.
        this.controlOwnsValidity = !!this.validatableControl()
    }

    /**
     * A field declared with a HIDDEN label (`@Label("")` — a record switcher, a search box that the
     * page explains around it) still needs an accessible name: without one a screen reader announced
     * a bare "edit text" (WCAG 4.1.2; UX review W-V-RECORD-SWITCH). The control gets the field's
     * humanized id as its name; a visible label always wins.
     */
    private nameUnlabelledControl() {
        const label = this.field?.label
        if (!this.field || (typeof label === 'string' && label.trim())) return
        const control = this.validatableControl() as (HTMLElement & { accessibleName?: string, label?: string }) | null
        if (!control || !('accessibleName' in control) || control.accessibleName || control.label) return
        control.accessibleName = humanizeFieldId(this.field.fieldId ?? '')
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

        if (this.field?.propertyRow) return renderPropertyRowField(this, fieldId, value, label, labelText)
        if (this.field?.stereotype == 'badge') return renderBadgeField(this, fieldId, value, label, labelText)
        if (this.field?.stereotype == 'plainText') return renderPlainTextField(this, fieldId, value, label, labelText)
        if (this.field?.stereotype == 'bulletedList') return renderBulletedListField(this, fieldId, value, label, labelText)
        // a multi-valued @Searchable (List / Set / array of ids): chips + «Add» — read-only too
        if (isSearchableMulti(this.field)) return renderSearchableMultiField(this, fieldId, value, label)
        if (readOnlyAsPlainText(this.field, this.inFoldout)) return renderFoldoutReadOnlyField(this, value, label)
        if (this.field?.readOnly && (this.field.stereotype == 'markdown' || this.field.stereotype == 'html')) return renderReadOnlyMarkupField(this, value, label)
        // link, icon and color draw their own read-only form (a link, the icon, a swatch) in their
        // branch below: the generic read-only text field showed the raw url / icon name / hex
        if (this.field?.readOnly && !('grid' == this.field.stereotype) && !('status' == this.field.dataType) && !(this.field?.dataType == 'money')
            && !OWN_READ_ONLY.has(this.field.stereotype ?? '')) return renderReadOnlyField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'file') return renderFileField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'string') return renderStringField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'number') return renderNumberField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'integer') return renderIntegerField(this, fieldId, value, label, labelText)
        // Java emits dataType 'bool', the .NET/Python ports emit 'boolean' — accept both, so a
        // boolean field renders as a checkbox whichever backend served it (see design/conformance-findings.md).
        if (this.field?.dataType == 'bool' || this.field?.dataType == 'boolean')
            return renderBoolField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'dateRange') return renderDateRangeField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'date') return renderDateField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'dateTime') return renderDateTimeField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'time') return renderTimeField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'array') return renderArrayField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'money') return renderMoneyField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'status') return renderStatusField(this, fieldId, value, label, labelText)
        if (this.field?.dataType == 'range') return renderRangeField(this, fieldId, value, label, labelText)
        return html `<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`
    }

    static styles = mateuFieldStyles
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


