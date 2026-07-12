import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ref } from "lit/directives/ref.js";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";
import { interpolate } from "@infra/ui/interpolation";
import { evalIfNecessary } from "@infra/ui/renderers/avatarRenderer.ts";
import { changed, checkboxChanged } from "@/SapUi5ComponentRenderer.ts";
import { renderStatusValue, renderCellValue } from "@/renderers/renderCellValue.ts";

// ─────────────────────────────────────────────────────────────────────────────
// SAP UI5 form field renderer. Mirrors the dispatch of the reference renderer
// (libs/mateu mateu-field.ts): stereotype badge/plainText first, then read-only,
// then wire dataType (string/number/integer/bool/date/dateTime/time/dateRange/
// array/money/status/range/file), with the string branch dispatching on the
// remaining stereotypes.
// ─────────────────────────────────────────────────────────────────────────────

export const selectChanged = (event: Event) => {
    const element = event.target as HTMLElement
    const selectedOption = (event as CustomEvent).detail?.selectedOption
    const value = selectedOption?.value ?? selectedOption?.textContent?.trim() ?? ''
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value, fieldId: (element as any).id },
        bubbles: true,
        composed: true
    }))
}

export const multiSelectChanged = (event: Event) => {
    const element = event.target as HTMLElement
    const items: any[] = (event as CustomEvent).detail?.items ?? []
    const values = items.map((item: any) => item.dataset?.value ?? item.text)
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: values, fieldId: (element as any).id },
        bubbles: true,
        composed: true
    }))
}

const dispatchValueChanged = (target: EventTarget | null, fieldId: string, value: unknown) => {
    target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value, fieldId },
        bubbles: true,
        composed: true
    }))
}

const dispatchAction = (target: EventTarget | null, actionId: string, parameters: Record<string, unknown>) => {
    target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters },
        bubbles: true,
        composed: true
    }))
}

const stripIconPrefix = (icon: string | undefined): string =>
    (icon ?? '').replace(/^vaadin:/, '').replace(/^lumo:/, '')

// Label + control wrapper used by (almost) every field. Renders the ui5-label on top,
// the control below and the description (helper text) underneath.
const labeled = (
    component: ClientSideComponent,
    metadata: FormField,
    id: string,
    label: unknown,
    control: TemplateResult,
    extraStyle = ''
): TemplateResult => html`
    <div style="${extraStyle}${component.style ?? ''}" data-field-id="${metadata.fieldId ?? nothing}">
        ${label ? html`<ui5-label for="${id}" show-colon ?required="${metadata.required}">${label}</ui5-label>` : nothing}
        ${control}
        ${metadata.description ? html`
            <div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70); margin-top: 0.125rem;">${metadata.description}</div>
        ` : nothing}
    </div>`

const copyIcon = (value: any, readOnly: boolean): TemplateResult | typeof nothing => {
    const str = value != null ? String(value) : ''
    if (!readOnly || str.length <= 15) return nothing
    return html`<ui5-icon
        slot="icon"
        name="copy"
        style="cursor: pointer;"
        @click="${() => navigator.clipboard.writeText(str).catch(() => {})}"
    ></ui5-icon>`
}

const formatMoney = (v: unknown, amountObj: any): string => {
    const num = typeof v === 'number' ? v : parseFloat(String(v))
    if (isNaN(num)) return String(v)
    return (amountObj && amountObj.locale && amountObj.currency)
        ? new Intl.NumberFormat(amountObj.locale, { style: 'currency', currency: amountObj.currency }).format(num)
        : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

// ── Remote options ───────────────────────────────────────────────────────────
// Options for a remote field live in data[componentId] (populated by the backend after an
// action-requested with the field's remote coordinates). If they are not there yet, the
// request is dispatched once per container/field (mirrors mateu-field's lazy fetch).
const requestedRemote = new WeakMap<Element, Set<string>>()

const remoteOptions = (
    container: LitElement,
    metadata: FormField,
    id: string,
    fieldId: string,
    data: any
): Option[] => {
    const bucket = data?.[id] ?? data?.[fieldId]
    const content = bucket?.content ?? (Array.isArray(bucket) ? bucket : undefined)
    if (content) return content
    const action = metadata.remoteCoordinates?.action
    if (action) {
        let requested = requestedRemote.get(container)
        if (!requested) {
            requested = new Set()
            requestedRemote.set(container, requested)
        }
        if (!requested.has(fieldId)) {
            requested.add(fieldId)
            setTimeout(() => dispatchAction(container, action, {
                searchText: '',
                fieldId,
                size: 200,
                page: 0,
                sort: undefined
            }))
        }
    }
    return []
}

const optionsFor = (
    container: LitElement,
    metadata: FormField,
    id: string,
    fieldId: string,
    data: any
): Option[] => metadata.remoteCoordinates
    ? remoteOptions(container, metadata, id, fieldId, data)
    : (metadata.options ?? [])

// ── Option-based controls ────────────────────────────────────────────────────

const renderSelect = (metadata: FormField, id: string, value: any, options: Option[]): TemplateResult => html`
    <ui5-select
        id="${id}"
        ?disabled="${metadata.disabled}"
        @change="${selectChanged}"
        style="width: 100%;"
    >
        ${!metadata.required ? html`<ui5-option value="">-- Select --</ui5-option>` : nothing}
        ${options.map(opt => html`
            <ui5-option value="${opt.value}" ?selected="${value === opt.value}">${opt.label}</ui5-option>
        `)}
    </ui5-select>`

const renderCombobox = (metadata: FormField, id: string, value: any, options: Option[]): TemplateResult => {
    const match = options.find(opt => opt.value === value)
    return html`
        <ui5-combobox
            id="${id}"
            value="${match?.label ?? value ?? ''}"
            ?disabled="${metadata.disabled}"
            ?readonly="${metadata.readOnly}"
            @selection-change="${(e: Event) => {
                const item = (e as CustomEvent).detail?.item
                dispatchValueChanged(e.target, metadata.fieldId, item?.dataset?.value ?? item?.text)
            }}"
            style="width: 100%;"
        >
            ${options.map(opt => html`
                <ui5-cb-item text="${opt.label ?? opt}" data-value="${opt.value ?? opt}"></ui5-cb-item>
            `)}
        </ui5-combobox>`
}

const renderRadioGroup = (metadata: FormField, value: any, options: Option[]): TemplateResult => html`
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 1rem;">
        ${options.map(option => html`
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                ${option.icon ? html`<ui5-icon name="${stripIconPrefix(option.icon)}"></ui5-icon>` : nothing}
                ${option.image ? html`<img src="${option.image}" alt="${option.label}" style="height: 1rem;" />` : nothing}
                <ui5-radio-button
                    name="rg-${metadata.fieldId}"
                    text="${option.label}"
                    ?checked="${value === option.value}"
                    ?disabled="${metadata.disabled}"
                    @change="${(e: Event) => {
                        if ((e.target as any).checked) dispatchValueChanged(e.target, metadata.fieldId, option.value)
                    }}"
                ></ui5-radio-button>
                ${option.description ? html`<span style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${option.description}</span>` : nothing}
            </div>
        `)}
    </div>`

const listSelectionChanged = (fieldId: string, multiple: boolean) => (e: Event) => {
    const items: any[] = (e as CustomEvent).detail?.selectedItems ?? []
    const values = items.map((item: any) => item.dataset?.value)
    dispatchValueChanged(e.target, fieldId, multiple ? values : values[0])
}

const renderListBox = (metadata: FormField, value: any, options: Option[], multiple: boolean): TemplateResult => {
    const isSelected = (opt: Option) => multiple
        ? Array.isArray(value) && value.includes(opt.value)
        : value === opt.value
    return html`
        <ui5-list
            selection-mode="${multiple ? 'Multiple' : 'Single'}"
            @selection-change="${listSelectionChanged(metadata.fieldId, multiple)}"
            style="width: 100%; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem;"
        >
            ${options.map(option => html`
                <ui5-li
                    data-value="${option.value}"
                    ?selected="${isSelected(option)}"
                    description="${option.description ?? nothing}"
                    icon="${option.icon ? stripIconPrefix(option.icon) : nothing}"
                >${option.label}</ui5-li>
            `)}
        </ui5-list>`
}

// Card-per-option chooser (stereotype `choice`, also embedded in `popover`). Single- or
// multi-select depending on the field dataType, like the reference mateu-choice.
const renderChoiceOptions = (metadata: FormField, value: any, options: Option[], multiple: boolean): TemplateResult => html`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${options.map(option => {
            const selected = multiple
                ? Array.isArray(value) && value.includes(option.value)
                : value == option.value
            const newValue = () => {
                if (!multiple) return option.value
                const arr: unknown[] = Array.isArray(value) ? value : []
                return arr.includes(option.value)
                    ? arr.filter(v => v !== option.value)
                    : [...arr, option.value]
            }
            return html`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: 0.5rem; border: 1px solid ${selected ? 'var(--sapButton_Selected_BorderColor, #0064d9)' : 'var(--sapNeutralBorderColor, #e5e5e5)'}; background: ${selected ? 'var(--sapList_SelectionBackgroundColor, #e5f0fa)' : 'transparent'};"
                     @click="${(e: Event) => dispatchValueChanged(e.target, metadata.fieldId, newValue())}"
                >
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${option.icon ? html`<ui5-icon name="${stripIconPrefix(option.icon)}"></ui5-icon>` : nothing}
                        ${option.image ? html`<img src="${option.image}" alt="${option.label}" style="${(option as any).imageStyle ?? 'width: 2rem;'}" />` : nothing}
                        <div>
                            <div>${option.label}</div>
                            ${option.description ? html`
                                <div style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${option.description}</div>
                            ` : nothing}
                        </div>
                    </div>
                </div>`
        })}
    </div>`

const renderCheckboxGroup = (metadata: FormField, value: any, options: Option[]): TemplateResult => {
    const multiColumn = (metadata.optionsColumns ?? 0) > 1
    const toggle = (optionValue: unknown) => (e: Event) => {
        const arr: unknown[] = Array.isArray(value) ? value : []
        const isChecked = (e.target as any).checked
        const next = isChecked
            ? [...arr.filter(v => v !== optionValue), optionValue]
            : arr.filter(v => v !== optionValue)
        dispatchValueChanged(e.target, metadata.fieldId, next)
    }
    return html`
        <div style="display: ${multiColumn ? 'grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem 2rem' : 'flex; flex-direction: column'};">
            ${options.map(option => html`
                <ui5-checkbox
                    text="${option.label}"
                    ?checked="${Array.isArray(value) && value.includes(option.value)}"
                    ?disabled="${metadata.disabled}"
                    ?readonly="${metadata.readOnly}"
                    @change="${toggle(option.value)}"
                ></ui5-checkbox>
            `)}
        </div>`
}

// ── Stars / slider (integer stereotypes) ─────────────────────────────────────

const renderStars = (value: any, fieldId: string, disabled: boolean) => {
    let renderValue = value
    if (isNaN(renderValue)) renderValue = 0
    const stars = [1, 2, 3, 4, 5]
    return html`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${stars.map(index => html`
            <ui5-icon
                name="${index <= renderValue ? 'favorite' : 'unfavorite'}"
                style="cursor: ${disabled ? 'default' : 'pointer'}; color: ${index <= renderValue ? 'var(--sapIndicationColor_5)' : 'var(--sapContent_NonInteractiveIconColor)'}; font-size: 1.5rem;"
                @click="${disabled ? nothing : (e: Event) => dispatchValueChanged(e.target, fieldId, index)}"
            ></ui5-icon>
        `)}
    </div>`
}

// ── Uploadable image (stereotype `uploadableImage`) ─────────────────────────
// The picked file is read client-side into a data URI and stored as the field value, so the
// image travels in the string itself — no upload endpoint (same contract as the reference).

const imageUpload = (fieldId: string) => (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => dispatchValueChanged(input, fieldId, reader.result as string)
    reader.readAsDataURL(file)
    input.value = '' // allow re-selecting the same file
}

const triggerImageUpload = (inputId: string) => (e: Event) => {
    const root = (e.target as HTMLElement).getRootNode() as ParentNode
    const input = root.querySelector(`#${CSS.escape(inputId)}`) as HTMLInputElement | null
    input?.click()
}

const renderUploadableImage = (metadata: FormField, id: string, value: any): TemplateResult => {
    const hasImage = value != null && value !== ''
    const inputId = `${id}_file`
    return html`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${hasImage ? html`
                <img src="${value}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; ${metadata.style ?? ''}">
            ` : html`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--sapNeutralBorderColor, #b3b3b3); border-radius: 0.5rem; color: var(--sapContent_LabelColor, #6a6d70);">
                    <ui5-icon name="picture" style="height: 2rem; width: 2rem;"></ui5-icon>
                </div>
            `}
            <input type="file" id="${inputId}" accept="image/*" style="display: none;" @change="${imageUpload(metadata.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <ui5-button icon="upload" @click="${triggerImageUpload(inputId)}">${hasImage ? 'Replace' : 'Upload'}</ui5-button>
                ${hasImage ? html`
                    <ui5-button design="Transparent" icon="delete"
                        @click="${(e: Event) => dispatchValueChanged(e.target, metadata.fieldId, '')}"
                    >Delete</ui5-button>` : nothing}
            </div>
        </div>`
}

// ── Inline grid (stereotype `grid`) — read-only display ─────────────────────
// Cells go through the shared renderCellValue (status → ui5-tag, bool → icon, money, link,
// action buttons…) — the old local cell renderer only handled booleans, so status objects
// printed as [object Object].

const renderInlineGrid = (metadata: FormField, value: any): TemplateResult => {
    const rows: any[] = Array.isArray(value) ? value : []
    const cols = metadata.columns!.map((c: any) => c.metadata as any)
    // Cell actions bubble as the standard action-requested with the clicked row; the dispatch
    // element is the ui5-table itself, captured via ref (renderCellValue's callback carries no
    // event target).
    const tableRef: { el?: Element } = {}
    const dispatchCellAction = (actionId: string, item: any) =>
        tableRef.el?.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: { _clickedRow: item } }, bubbles: true, composed: true,
        }))
    // overflow-x wrapper + per-column min-width: without them the ui5-table shrinks to its
    // container and responsively pops all but the first columns into popins (the guests grid
    // on /checkin showed 2 of its 11 columns); with a floor per column the table overflows and
    // scrolls horizontally instead, like vaadin-grid and the redwood plain table.
    return html`
        <div style="overflow-x: auto;">
        <ui5-table style="width: 100%; min-width: ${Math.max(cols.length * 7, 24)}rem; margin-top: 0.5rem;" ${ref(el => { tableRef.el = el })}>
            <ui5-table-header-row slot="headerRow">
                ${cols.map((col: any) => html`
                    <ui5-table-header-cell width="${col.width ?? nothing}">${col.label}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${rows.map((item: any, idx: number) => html`
                <ui5-table-row row-key="${item._rowNumber ?? idx}">
                    ${cols.map((col: any) => html`
                        <ui5-table-cell>${renderCellValue(item, col, dispatchCellAction)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>
        </div>`
}

// ── Special top-level fields ─────────────────────────────────────────────────

const renderBadgeField = (component: ClientSideComponent, value: any, labelText: string): TemplateResult => {
    const on = value === true || value === 'true'
    return html`
        <div style="${component.style ?? nothing}">
            <ui5-tag color-scheme="${on ? '8' : nothing}" style="${on ? '' : 'opacity: 0.4;'}">${labelText}</ui5-tag>
        </div>`
}

const renderPlainTextField = (component: ClientSideComponent, metadata: FormField, id: string, value: any, label: unknown, state: any, data: any): TemplateResult => {
    let v: any = evalIfNecessary(value, state, data)
    const amountObj = (v && typeof v === 'object' && 'value' in v) ? v : null
    if (v && v.value) v = v.value
    const isBool = metadata.dataType == 'bool' || v === true || v === false
    const isMoney = metadata.dataType == 'money'
    const hasValue = v !== null && v !== undefined && v !== ''
    let display = hasValue ? String(v) : '—'
    if (isMoney && hasValue) {
        display = formatMoney(v, amountObj)
    }
    const body = isBool
        ? html`<ui5-icon name="${(v === true || v === 'true') ? 'accept' : 'less'}" style="height: 16px; width: 16px;"></ui5-icon>`
        : metadata.multiline
            ? html`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${display}</span>`
            : html`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
    return labeled(component, metadata, id, label, body, isMoney ? 'text-align: right; ' : '')
}

const renderReadOnlyField = (component: ClientSideComponent, metadata: FormField, id: string, value: any, label: unknown, state: any, data: any): TemplateResult => {
    let valueToDisplay: any = evalIfNecessary(value, state, data) || data?.[metadata.fieldId]
    if (valueToDisplay && valueToDisplay.value) {
        valueToDisplay = valueToDisplay.value
    }
    if (metadata.stereotype == 'image' || metadata.stereotype == 'uploadableImage') {
        return labeled(component, metadata, id, label, html`<img src="${valueToDisplay}" id="${id}_img" style="${metadata.style ?? nothing}">`)
    }
    if (metadata.dataType == 'bool') {
        return labeled(component, metadata, id, label, html`<ui5-icon name="${valueToDisplay ? 'accept' : 'less'}" style="height: 20px;"></ui5-icon>`)
    }
    if (metadata.stereotype == 'link') {
        return labeled(component, metadata, id, label, html`<ui5-link href="${valueToDisplay ?? ''}" target="_blank">${valueToDisplay ?? ''}</ui5-link>`)
    }
    if (metadata.stereotype == 'color') {
        return labeled(component, metadata, id, label, html`<span style="background-color: ${valueToDisplay}; display: block; height: 20px; width: 40px; border: 1px solid var(--sapContent_LabelColor, #6a6d70); border-radius: 0.25rem;"></span>`)
    }
    return labeled(component, metadata, id, label, html`
        <ui5-input
            id="${id}"
            readonly
            value="${valueToDisplay ?? ''}"
            style="width: 100%;"
        >${copyIcon(valueToDisplay, true)}</ui5-input>`)
}

// ── String branch (stereotype dispatch) ──────────────────────────────────────

const renderStringField = (container: LitElement, component: ClientSideComponent, metadata: FormField, id: string, value: any, label: unknown, data: any): TemplateResult => {
    const fieldId = metadata.fieldId ?? ''

    if (metadata.stereotype == 'searchable') {
        const searchCode = (e: Event) => dispatchAction(e.currentTarget, 'code-' + fieldId, {
            code: (e.currentTarget as HTMLInputElement).value
        })
        const search = (e: Event) => dispatchAction(e.currentTarget, 'codesearch-' + fieldId, {})
        return labeled(component, metadata, id, label, html`
            <div style="display: flex; gap: 0.33rem; align-items: center;">
                <ui5-input style="width: 5rem;" value="${value ?? ''}" @change="${searchCode}"></ui5-input>
                <ui5-input readonly value="${data?.[fieldId + '-label'] ?? ''}" style="flex: 1;"></ui5-input>
                <ui5-button icon="search" @click="${search}"></ui5-button>
            </div>`)
    }
    if (metadata.stereotype == 'select') {
        const realValue = (value && value.value) ? value.value : value
        return labeled(component, metadata, id, label,
            renderSelect(metadata, id, realValue, optionsFor(container, metadata, id, fieldId, data)))
    }
    if (metadata.stereotype == 'markdown') {
        // mateu-markdown renders parsed markdown (marked + DOMPurify) as plain HTML typography
        // into its light DOM (registered by the shared mateu-component import) — design-system-neutral.
        return labeled(component, metadata, id, label, html`
            <mateu-markdown .content="${value ?? ''}"></mateu-markdown>`)
    }
    if (metadata.stereotype == 'combobox') {
        return labeled(component, metadata, id, label,
            renderCombobox(metadata, id, value, optionsFor(container, metadata, id, fieldId, data)))
    }
    if (metadata.stereotype == 'listBox') {
        return labeled(component, metadata, id, label,
            renderListBox(metadata, value, optionsFor(container, metadata, id, fieldId, data), false))
    }
    if (metadata.stereotype == 'radio') {
        return labeled(component, metadata, id, label,
            renderRadioGroup(metadata, value, optionsFor(container, metadata, id, fieldId, data)))
    }
    if (metadata.stereotype == 'popover') {
        const options = optionsFor(container, metadata, id, fieldId, data)
        const popId = `${id}_popover`
        const openPopover = (e: Event) => {
            const root = (e.target as HTMLElement).getRootNode() as ParentNode
            const pop = root.querySelector(`#${CSS.escape(popId)}`) as any
            if (pop) { pop.opener = e.currentTarget as HTMLElement; pop.open = !pop.open }
        }
        const selectedLabel = options.find(opt => opt.value === value)?.label ?? value ?? ''
        return labeled(component, metadata, id, label, html`
            <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${openPopover}">
                <span>${selectedLabel}</span>
                <ui5-icon name="slim-arrow-down"></ui5-icon>
            </div>
            <ui5-popover id="${popId}" placement="Bottom">
                ${renderChoiceOptions(metadata, value, options, false)}
            </ui5-popover>`)
    }
    if (metadata.stereotype == 'choice') {
        return labeled(component, metadata, id, label,
            renderChoiceOptions(metadata, value, optionsFor(container, metadata, id, fieldId, data), false))
    }
    if (metadata.stereotype == 'richText' || metadata.stereotype == 'richtext') {
        // SAP UI5 web components have no rich-text editor: fall back to a growing textarea
        // (the value round-trips unchanged, only the formatting toolbar is missing).
        return labeled(component, metadata, id, label, html`
            <ui5-textarea
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                @change="${changed}"
                value="${value ?? ''}"
                growing
                growing-max-lines="10"
                style="width: 100%;"
            ></ui5-textarea>`)
    }
    if (metadata.stereotype == 'textarea') {
        return labeled(component, metadata, id, label, html`
            <ui5-textarea
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                @change="${changed}"
                value="${value ?? ''}"
                maxlength="${metadata.charLimit ?? nothing}"
                growing
                growing-max-lines="5"
                style="width: 100%;"
            ></ui5-textarea>`)
    }
    if (metadata.stereotype == 'link') {
        return labeled(component, metadata, id, label, html`
            <ui5-input
                id="${id}"
                ?disabled="${metadata.disabled}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            ><ui5-icon
                slot="icon"
                name="chain-link"
                style="cursor: pointer;"
                @click="${() => value && window.open(value, '_blank')?.focus()}"
            ></ui5-icon></ui5-input>`)
    }
    if (metadata.stereotype == 'icon') {
        // Icon ids arrive as "vaadin:name"; the preview strips the collection prefix.
        return labeled(component, metadata, id, label, html`
            <ui5-input
                id="${id}"
                ?disabled="${metadata.disabled}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            >${value ? html`<ui5-icon slot="icon" name="${stripIconPrefix(value)}"></ui5-icon>` : nothing}</ui5-input>`)
    }
    if (metadata.stereotype == 'html') {
        return labeled(component, metadata, id, label, html`
            <div style="line-height: 20px; margin-top: 5px;">${unsafeHTML('' + (value ?? ''))}</div>`)
    }
    if (metadata.stereotype == 'image') {
        return labeled(component, metadata, id, label, html`
            <img src="${value ?? ''}" style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}">`)
    }
    if (metadata.stereotype == 'uploadableImage') {
        return labeled(component, metadata, id, label, renderUploadableImage(metadata, id, value))
    }
    if (metadata.stereotype == 'color') {
        return labeled(component, metadata, id, label, html`
            <input type="color" value="${value ?? '#000000'}" ?disabled="${metadata.disabled}"
                   style="display: block; height: 2rem; width: 4rem; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem; background: transparent; cursor: pointer;"
                   @input="${(e: Event) => dispatchValueChanged(e.target, fieldId, (e.target as HTMLInputElement).value)}"/>`)
    }

    // Enum / any string field carrying static options → select
    if (metadata.options && metadata.options.length > 0) {
        return labeled(component, metadata, id, label, renderSelect(metadata, id, value, metadata.options))
    }
    // Remote options without an explicit stereotype → combobox
    if (metadata.remoteCoordinates) {
        return labeled(component, metadata, id, label,
            renderCombobox(metadata, id, value, remoteOptions(container, metadata, id, fieldId, data)))
    }

    const inputType = (() => {
        switch (metadata.stereotype) {
            case 'email': return 'Email'
            case 'password': return 'Password'
            case 'url': return 'URL'
            case 'phone': case 'tel': return 'Tel'
            case 'search': return 'Search'
            default: return 'Text'
        }
    })()

    return labeled(component, metadata, id, label, html`
        <ui5-input
            id="${id}"
            type="${inputType}"
            ?disabled="${metadata.disabled}"
            ?readonly="${metadata.readOnly}"
            value="${value ?? ''}"
            @change="${changed}"
            maxlength="${metadata.charLimit ?? nothing}"
            placeholder="${metadata.placeholder ?? nothing}"
            style="width: 100%;"
        >${copyIcon(value, metadata.readOnly)}</ui5-input>`)
}

// ── Main dispatch ────────────────────────────────────────────────────────────

export const renderField = (container: LitElement, component: ClientSideComponent, _baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId ?? ''
    const value = state && fieldId in state ? state[fieldId] : metadata?.initialValue
    const id = component.id || fieldId
    const rawLabelText = metadata.label + ''
    const labelText = interpolate(rawLabelText, state, data)
    const label = (!labelText || labelText == 'null' || labelText == 'undefined') ? undefined : labelText
    const dataType = metadata.dataType
    const stereotype = metadata.stereotype

    if (stereotype == 'badge') {
        return renderBadgeField(component, value, label ?? metadata.fieldId ?? '')
    }
    if (stereotype == 'plainText') {
        return renderPlainTextField(component, metadata, id, value, label, state, data)
    }
    if (metadata.readOnly && stereotype != 'grid' && dataType != 'status' && dataType != 'money') {
        return renderReadOnlyField(component, metadata, id, value, label, state, data)
    }

    // Inline grid (read-only tabular display of a row list)
    if (stereotype == 'grid' && metadata.columns && metadata.columns.length > 0) {
        return labeled(component, metadata, id, label, renderInlineGrid(metadata, value))
    }

    // File upload
    if (dataType == 'file' || stereotype == 'file') {
        return labeled(component, metadata, id, label, html`
            <ui5-file-uploader id="${id}" ?disabled="${metadata.disabled}" @change="${changed}">
                <ui5-button icon="upload">Upload</ui5-button>
            </ui5-file-uploader>`)
    }

    // Dates & times ('datetime'/'LocalDate*' kept as aliases for fluent/YAML-defined UIs)
    if (dataType == 'dateRange') {
        const drValue = value ? `${(value as any).from} - ${(value as any).to}` : ''
        return labeled(component, metadata, id, label, html`
            <ui5-daterange-picker
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${drValue}"
                @change="${(e: Event) => {
                    const picker = e.target as any
                    const fmt = (d: Date | null | undefined) => d
                        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        : undefined
                    const from = fmt(picker.startDateValue)
                    const to = fmt(picker.endDateValue)
                    dispatchValueChanged(e.target, fieldId, from && to ? { from, to } : undefined)
                }}"
                style="width: 100%;"
            ></ui5-daterange-picker>`)
    }
    if (dataType == 'date' || dataType == 'LocalDate') {
        return labeled(component, metadata, id, label, html`
            <ui5-date-picker
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            ></ui5-date-picker>`)
    }
    if (dataType == 'dateTime' || dataType == 'datetime' || dataType == 'LocalDateTime' || dataType == 'ZonedDateTime') {
        return labeled(component, metadata, id, label, html`
            <ui5-datetime-picker
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            ></ui5-datetime-picker>`)
    }
    if (dataType == 'time' || dataType == 'LocalTime') {
        return labeled(component, metadata, id, label, html`
            <ui5-time-picker
                id="${id}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            ></ui5-time-picker>`)
    }

    // Numbers
    if (dataType == 'number' || stereotype == 'currency') {
        return labeled(component, metadata, id, label, html`
            <ui5-input
                id="${id}"
                type="Number"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            >${copyIcon(value, metadata.readOnly)}</ui5-input>`)
    }
    if (dataType == 'integer') {
        if (stereotype == 'stars') {
            return labeled(component, metadata, id, label, renderStars(value, fieldId, metadata.disabled))
        }
        if (stereotype == 'slider') {
            return labeled(component, metadata, id, label, html`
                <ui5-slider
                    id="${id}"
                    min="${metadata.sliderMin ?? 0}"
                    max="${metadata.sliderMax ?? 100}"
                    step="${metadata.step ?? 1}"
                    value="${value ?? 0}"
                    ?disabled="${metadata.disabled}"
                    show-tooltip
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-slider>`)
        }
        if (metadata.stepButtonsVisible) {
            return labeled(component, metadata, id, label, html`
                <ui5-step-input
                    id="${id}"
                    ?disabled="${metadata.disabled}"
                    ?readonly="${metadata.readOnly}"
                    value="${value ?? 0}"
                    min="${metadata.min ?? nothing}"
                    max="${metadata.max ?? nothing}"
                    step="${metadata.step ?? nothing}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-step-input>`)
        }
        return labeled(component, metadata, id, label, html`
            <ui5-input
                id="${id}"
                type="Number"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                value="${value ?? ''}"
                @change="${changed}"
                style="width: 100%;"
            >${copyIcon(value, metadata.readOnly)}</ui5-input>`)
    }

    // Boolean
    if (dataType == 'bool' || dataType == 'boolean' || dataType == 'Boolean') {
        if (stereotype == 'toggle') {
            return html`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${component.style ?? ''}">
                    <ui5-label for="${id}" ?required="${metadata.required}">${label}</ui5-label>
                    <ui5-switch
                        id="${id}"
                        ?checked="${value}"
                        ?disabled="${metadata.disabled}"
                        @change="${checkboxChanged}"
                    ></ui5-switch>
                </div>`
        }
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-checkbox
                    id="${id}"
                    text="${label ?? ''}"
                    ?checked="${value}"
                    ?disabled="${metadata.disabled}"
                    ?readonly="${metadata.readOnly}"
                    @change="${checkboxChanged}"
                ></ui5-checkbox>
            </div>`
    }

    // Multi-value
    if (dataType == 'array') {
        if (stereotype == 'choice') {
            return labeled(component, metadata, id, label,
                renderChoiceOptions(metadata, value, optionsFor(container, metadata, id, fieldId, data), true))
        }
        if (stereotype == 'listBox') {
            return labeled(component, metadata, id, label,
                renderListBox(metadata, value, optionsFor(container, metadata, id, fieldId, data), true))
        }
        if (stereotype == 'combobox') {
            const options = optionsFor(container, metadata, id, fieldId, data)
            const selectedValues: unknown[] = Array.isArray(value) ? value : []
            return labeled(component, metadata, id, label, html`
                <ui5-multi-combobox
                    id="${id}"
                    ?disabled="${metadata.disabled}"
                    ?readonly="${metadata.readOnly}"
                    @selection-change="${multiSelectChanged}"
                    style="width: 100%;"
                >
                    ${options.map((opt: any) => html`
                        <ui5-mcb-item
                            text="${opt.label ?? opt}"
                            data-value="${opt.value ?? opt}"
                            ?selected="${selectedValues.includes(opt.value ?? opt)}"
                        ></ui5-mcb-item>
                    `)}
                </ui5-multi-combobox>`)
        }
        // default: checkbox group
        return labeled(component, metadata, id, label,
            renderCheckboxGroup(metadata, value, optionsFor(container, metadata, id, fieldId, data)))
    }

    // Money
    if (dataType == 'money' || stereotype == 'money') {
        if (metadata.readOnly) {
            const amountObj = (value && typeof value === 'object' && 'value' in value) ? value : null
            const num = amountObj ? (amountObj as any).value : value
            return labeled(component, metadata, id, label, html`
                <div style="min-width: 8rem; text-align: right; font-variant-numeric: tabular-nums;">${value != null ? formatMoney(num, amountObj) : ''}</div>`)
        }
        const amount = (value && typeof value === 'object' && 'value' in value)
            ? value as { value: number, currency: string, locale: string }
            : { value: (typeof value === 'number' ? value : parseFloat(String(value ?? 0)) || 0), currency: 'EUR', locale: 'es-ES' }
        const currencyChanged = (e: Event) => {
            const selectedOption = (e as CustomEvent).detail?.selectedOption
            dispatchValueChanged(e.target, fieldId, { ...amount, currency: selectedOption?.value ?? selectedOption?.textContent?.trim() ?? amount.currency })
        }
        const amountChanged = (e: Event) => {
            const raw = (e.target as HTMLInputElement).value
            dispatchValueChanged(e.target, fieldId, { ...amount, value: raw ? parseFloat(raw) : 0 })
        }
        return labeled(component, metadata, id, label, html`
            <div style="display: flex; gap: 0.25rem;">
                <ui5-select style="width: 6rem;" ?disabled="${metadata.disabled}" @change="${currencyChanged}">
                    ${['EUR', 'USD', 'GBP'].map(c => html`
                        <ui5-option value="${c}" ?selected="${amount.currency === c}">${c}</ui5-option>
                    `)}
                </ui5-select>
                <ui5-input
                    id="${id}"
                    type="Number"
                    ?disabled="${metadata.disabled}"
                    value="${amount.value ?? ''}"
                    @change="${amountChanged}"
                    style="flex: 1; text-align: right;"
                ></ui5-input>
            </div>`)
    }

    // Status badge
    if (dataType == 'status') {
        return labeled(component, metadata, id, label, renderStatusValue(value))
    }

    // Range (from/to slider)
    if (dataType == 'range') {
        const range = value as { from: number, to: number } | undefined
        return labeled(component, metadata, id, label, html`
            <ui5-range-slider
                start-value="${range?.from ?? 0}"
                end-value="${range?.to ?? 0}"
                min="${metadata.sliderMin ?? 0}"
                max="${metadata.sliderMax ?? 10}"
                step="${metadata.step || nothing}"
                ?disabled="${metadata.disabled}"
                @change="${(e: Event) => {
                    const slider = e.target as unknown as { startValue: number, endValue: number }
                    dispatchValueChanged(e.target, fieldId, { from: slider.startValue, to: slider.endValue })
                }}"
                style="min-width: 10rem; width: 100%;"
            ></ui5-range-slider>`)
    }

    // string and anything unknown falls back to the string branch
    return renderStringField(container, component, metadata, id, value, label, data)
}
