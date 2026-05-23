import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, nothing, TemplateResult } from "lit";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { changed, checkboxChanged } from "@/SapUi5ComponentRenderer.ts";

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

const renderStars = (value: any, fieldId: string, disabled: boolean) => {
    let renderValue = value
    if (isNaN(renderValue)) renderValue = 0
    const stars = [1, 2, 3, 4, 5]
    return html`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${stars.map(index => html`
            <ui5-icon
                name="${index <= renderValue ? 'favorite' : 'unfavorite'}"
                style="cursor: ${disabled ? 'default' : 'pointer'}; color: ${index <= renderValue ? 'var(--sapIndicationColor_5)' : 'var(--sapContent_NonInteractiveIconColor)'}; font-size: 1.5rem;"
                @click="${disabled ? nothing : (e: Event) => e.target?.dispatchEvent(new CustomEvent('value-changed', {
                    detail: { value: index, fieldId },
                    bubbles: true,
                    composed: true
                }))}"
            ></ui5-icon>
        `)}
    </div>`
}

const renderGridCell = (item: any, col: any): TemplateResult => {
    const value = item[col.id]
    if (col.dataType === 'bool' || col.dataType === 'boolean') {
        return html`<ui5-icon name="${value ? 'accept' : 'decline'}"></ui5-icon>`
    }
    return html`${value ?? ''}`
}

export const renderField = (component: ClientSideComponent, _baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId ?? ''
    const value = state && fieldId in state ? state[fieldId] : metadata?.initialValue
    const id = component.id || fieldId
    const label = metadata.label
    const required = metadata.required
    const disabled = metadata.disabled
    const readOnly = metadata.readOnly

    // HTML / rich text (read-only display)
    if (metadata.stereotype === 'html' || metadata.stereotype === 'richtext') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label show-colon ?required="${required}">${label}</ui5-label>
                <div style="padding: 0.5rem; border: 1px solid var(--sapField_BorderColor); border-radius: 0.25rem; min-height: 2rem;">${value ?? ''}</div>
            </div>`
    }

    // Textarea
    if (metadata.stereotype === 'textarea') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-textarea
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    @change="${changed}"
                    value="${value ?? ''}"
                    growing
                    growing-max-lines="5"
                ></ui5-textarea>
            </div>`
    }

    // Date
    if (metadata.dataType === 'date' || metadata.dataType === 'LocalDate') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-date-picker
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-date-picker>
            </div>`
    }

    // DateTime
    if (metadata.dataType === 'datetime' || metadata.dataType === 'LocalDateTime' || metadata.dataType === 'ZonedDateTime') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-datetime-picker
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-datetime-picker>
            </div>`
    }

    // Time
    if (metadata.dataType === 'time' || metadata.dataType === 'LocalTime') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-time-picker
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-time-picker>
            </div>`
    }

    // File upload
    if (metadata.dataType === 'file' || metadata.stereotype === 'file') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-file-uploader
                    id="${id}"
                    ?disabled="${disabled}"
                    @change="${changed}"
                >
                    <ui5-button icon="upload">Upload</ui5-button>
                </ui5-file-uploader>
            </div>`
    }

    // Number / decimal / money / currency
    if (metadata.dataType === 'number' || metadata.dataType === 'double' || metadata.dataType === 'float'
        || metadata.dataType === 'decimal' || metadata.dataType === 'BigDecimal'
        || metadata.stereotype === 'money' || metadata.stereotype === 'currency') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-input
                    id="${id}"
                    type="Number"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-input>
            </div>`
    }

    // Integer / long
    if (metadata.dataType === 'integer' || metadata.dataType === 'int' || metadata.dataType === 'long'
        || metadata.dataType === 'Integer' || metadata.dataType === 'Long') {
        if (metadata.stereotype === 'stars') {
            return html`
                <div style="${component.style ?? nothing}">
                    <ui5-label show-colon ?required="${required}">${label}</ui5-label>
                    ${renderStars(value, fieldId, disabled)}
                </div>`
        }
        if (metadata.stereotype === 'slider') {
            return html`
                <div style="${component.style ?? nothing}">
                    <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                    <ui5-slider
                        id="${id}"
                        min="${metadata.sliderMin ?? 0}"
                        max="${metadata.sliderMax ?? 100}"
                        step="${metadata.step ?? 1}"
                        value="${value ?? 0}"
                        ?disabled="${disabled}"
                        show-tooltip
                        @change="${changed}"
                        style="width: 100%;"
                    ></ui5-slider>
                </div>`
        }
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-input
                    id="${id}"
                    type="Number"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-input>
            </div>`
    }

    // Boolean
    if (metadata.dataType === 'bool' || metadata.dataType === 'boolean' || metadata.dataType === 'Boolean') {
        if (metadata.stereotype === 'toggle') {
            return html`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${component.style ?? ''}">
                    <ui5-label for="${id}" ?required="${required}">${label}</ui5-label>
                    <ui5-switch
                        id="${id}"
                        ?checked="${value}"
                        ?disabled="${disabled}"
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
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    @change="${checkboxChanged}"
                ></ui5-checkbox>
            </div>`
    }

    // Inline grid table (stereotype 'grid' with columns)
    if (metadata.stereotype === 'grid' && metadata.columns && metadata.columns.length > 0) {
        const rows: any[] = Array.isArray(value) ? value : []
        const cols = metadata.columns.map((c: any) => c.metadata as any)
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label show-colon ?required="${required}">${label}</ui5-label>
                <ui5-table style="width: 100%; margin-top: 0.5rem;">
                    <ui5-table-header-row slot="headerRow">
                        ${cols.map((col: any) => html`
                            <ui5-table-header-cell width="${col.width ?? nothing}">${col.label}</ui5-table-header-cell>
                        `)}
                    </ui5-table-header-row>
                    ${rows.map((item: any, idx: number) => html`
                        <ui5-table-row row-key="${item._rowNumber ?? idx}">
                            ${cols.map((col: any) => html`
                                <ui5-table-cell>${renderGridCell(item, col)}</ui5-table-cell>
                            `)}
                        </ui5-table-row>
                    `)}
                </ui5-table>
            </div>`
    }

    // Multi-select / Array
    if (metadata.dataType === 'array') {
        const options = metadata.options?.length
            ? metadata.options
            : (data?.[fieldId]?.content ?? data?.[fieldId] ?? [])
        const selectedValues: string[] = Array.isArray(value) ? value : []
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-multi-combobox
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
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
                </ui5-multi-combobox>
            </div>`
    }

    // Reference / Lookup — static options → select
    if (metadata.dataType === 'reference' && metadata.options && metadata.options.length > 0) {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-select
                    id="${id}"
                    ?disabled="${disabled}"
                    @change="${selectChanged}"
                    style="width: 100%;"
                >
                    ${!required ? html`<ui5-option value="">-- Select --</ui5-option>` : nothing}
                    ${metadata.options.map(opt => html`
                        <ui5-option value="${opt.value}" ?selected="${value === opt.value}">${opt.label}</ui5-option>
                    `)}
                </ui5-select>
            </div>`
    }

    // Reference / Lookup — remote options → combobox with data from state
    if (metadata.dataType === 'reference' && metadata.remoteCoordinates) {
        const remoteOptions = data?.[fieldId]?.content ?? data?.[fieldId] ?? []
        const displayValue = (() => {
            if (Array.isArray(remoteOptions) && remoteOptions.length > 0) {
                const match = remoteOptions.find((o: any) =>
                    (o.value ?? o.key ?? o.id) === value
                )
                return match?.label ?? match?.name ?? value ?? ''
            }
            return value ?? ''
        })()
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-combobox
                    id="${id}"
                    value="${displayValue}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    @change="${changed}"
                    filter="None"
                    style="width: 100%;"
                >
                    ${remoteOptions.map((opt: any) => html`
                        <ui5-cb-item
                            text="${opt.label ?? opt.name ?? opt}"
                            data-value="${opt.value ?? opt.key ?? opt.id ?? opt}"
                        ></ui5-cb-item>
                    `)}
                </ui5-combobox>
            </div>`
    }

    // Reference / Lookup — combobox stereotype with static options
    if (metadata.dataType === 'reference' && metadata.stereotype === 'combobox') {
        const options = metadata.options ?? []
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-combobox
                    id="${id}"
                    value="${value ?? ''}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    @change="${changed}"
                    style="width: 100%;"
                >
                    ${options.map((opt: any) => html`
                        <ui5-cb-item text="${opt.label ?? opt}" data-value="${opt.value ?? opt}"></ui5-cb-item>
                    `)}
                </ui5-combobox>
            </div>`
    }

    // Reference — no options, no remote → plain text input
    if (metadata.dataType === 'reference') {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-input
                    id="${id}"
                    ?disabled="${disabled}"
                    ?readonly="${readOnly}"
                    value="${value ?? ''}"
                    @change="${changed}"
                    style="width: 100%;"
                ></ui5-input>
            </div>`
    }

    // Enum — static options via metadata.options
    if (metadata.options && metadata.options.length > 0) {
        return html`
            <div style="${component.style ?? nothing}">
                <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
                <ui5-select
                    id="${id}"
                    ?disabled="${disabled}"
                    @change="${selectChanged}"
                    style="width: 100%;"
                >
                    ${!required ? html`<ui5-option value="">-- Select --</ui5-option>` : nothing}
                    ${metadata.options.map(opt => html`
                        <ui5-option value="${opt.value}" ?selected="${value === opt.value}">${opt.label}</ui5-option>
                    `)}
                </ui5-select>
            </div>`
    }

    // String with specific stereotypes
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

    return html`
        <div style="${component.style ?? nothing}">
            <ui5-label for="${id}" show-colon ?required="${required}">${label}</ui5-label>
            <ui5-input
                id="${id}"
                type="${inputType}"
                ?disabled="${disabled}"
                ?readonly="${readOnly}"
                value="${value ?? ''}"
                @change="${changed}"
                placeholder="${metadata.placeholder ?? nothing}"
                style="width: 100%;"
            ></ui5-input>
        </div>`
}
