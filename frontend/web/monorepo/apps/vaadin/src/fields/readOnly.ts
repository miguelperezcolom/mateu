import { chromeText } from '@infra/ui/chromeTexts.ts'
import { html, nothing, TemplateResult } from 'lit'
import { isPasswordField, shownReadOnlyValue } from '@infra/ui/passwordMask.ts'
import { safeHtml } from '@infra/ui/safeHtml.ts'
import { Notification } from '@vaadin/notification'
import { evalIfNecessary } from '@infra/ui/renderers/avatarRenderer.ts'
import { displayedValue } from './fieldDisplay'
import type { FieldLabel, FieldValue } from './fieldEvents'
import { requireElement } from '@infra/ui/lazyElements.ts'
import type { MateuField } from './mateu-field'

/** Read-only presentations: plain text, property rows, badges, bulleted lists, rendered markup, the read-only input. */

// A read-only markdown / html field shows the rendered content (sanitised html), not its source.
export function renderReadOnlyMarkupField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    const source = '' + (evalIfNecessary(value, host.state, host.data) ?? '')
    if (host.field.stereotype == 'markdown') requireElement('vaadin-markdown')
    return html`<vaadin-custom-field
            id="${host.field.fieldId}"
            label="${label}"
            .helperText="${host.helperText()}"
            data-colspan="${host.field.colspan}"
            style="${host.field.style ?? ''}"
    >${host.field.stereotype == 'markdown'
        ? html`<vaadin-markdown .content="${source}"></vaadin-markdown>`
        : html`<div>${safeHtml(source)}</div>`}</vaadin-custom-field>`
}

export function renderBadgeField(host: MateuField, _fieldId: string, value: FieldValue, _label: FieldLabel, labelText: string): TemplateResult {
    if (!host.field) return html``
        const on = value === true || value === 'true'
        return html`<vaadin-custom-field
                id="${host.field.fieldId}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field?.colspan}"
                style="${host.field?.style}"
        ><span theme="badge ${on ? 'success' : ''} pill" style="${on ? '' : 'opacity: 0.4;'}">${labelText}</span>
        </vaadin-custom-field>`
}

// Property-list row (@Section(propertyList=true)): plain-text value with the label aligned
// left and the value aligned right, rows separated by a divider line.
export function renderPropertyRowField(host: MateuField, _fieldId: string, value: FieldValue, _label: FieldLabel, labelText: string): TemplateResult {
    if (!host.field) return html``
        let v = evalIfNecessary(value, host.state, host.data)
        // a read-only lookup travels as the field '<field>-label', its LABEL in data (not in
        // the state); a plain field may carry its label the same way — show the label
        const data = (host.data as any) ?? {}
        const fromData = (key: string) => (data[key] !== undefined && data[key] !== null && typeof data[key] !== 'object') ? data[key] : undefined
        if ((v === undefined || v === null || v === '') && fromData(host.field.fieldId) !== undefined) v = fromData(host.field.fieldId)
        const lookupLabel = fromData(host.field.fieldId + '-label')
        if (lookupLabel !== undefined && lookupLabel !== '') v = lookupLabel
        v = shownReadOnlyValue(host.field, v)
        const { isBool, checked, isMoney, display } = displayedValue(v, host.field?.dataType)
        const valueBody = isBool
            ? html`<vaadin-icon icon="${checked ? 'vaadin:check' : 'vaadin:minus'}" role="img" aria-label="${chromeText(checked ? 'yes' : 'no')}" style="height: var(--lumo-icon-size-s, 1rem); width: var(--lumo-icon-size-s, 1rem);"></vaadin-icon>`
            : html`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
        const showLabel = labelText && labelText != 'null'
        return html`<div
                id="${host.field.fieldId}"
                data-colspan="${host.field?.colspan}"
                style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${host.field?.style}"
        >${showLabel ? html`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${labelText}</span>` : nothing}${valueBody}</div>`
}

export function renderBulletedListField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        const v = evalIfNecessary(value, host.state, host.data)
        const items = Array.isArray(v) ? v.map(item => String(item)) : (v != null && v !== '' ? [String(v)] : [])
        return html`<vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field?.colspan}"
                style="${host.field?.style}"
        ><mateu-bulleted-list .items="${items}"></mateu-bulleted-list>
        </vaadin-custom-field>`
}

export function renderPlainTextField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        const v = shownReadOnlyValue(host.field, evalIfNecessary(value, host.state, host.data))
        const { isBool, checked, isMoney, display } = displayedValue(v, host.field?.dataType)
        const body = isBool
            ? html`<vaadin-icon icon="${checked ? 'vaadin:check' : 'vaadin:minus'}" role="img" aria-label="${chromeText(checked ? 'yes' : 'no')}" style="height: var(--lumo-icon-size-s, 1rem); width: var(--lumo-icon-size-s, 1rem);"></vaadin-icon>`
            : host.field?.multiline
                ? html`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${display}</span>`
                : html`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
        // Read-only plain-text fields render as a vaadin-custom-field with the value as its
        // slotted content, so they sit consistently in the form layout (label on top, value below).
        return html`<vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                data-colspan="${host.field?.colspan}"
                style="${isMoney ? 'text-align: right; ' : ''}${host.field?.style}"
        >${body}</vaadin-custom-field>`
}

// A read-only field of a foldout: label above, the value as plain text below (a read-only lookup
// shows its label, which travels in data as '<field>-label'). No input chrome.
export function renderFoldoutReadOnlyField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    let v = evalIfNecessary(value, host.state, host.data)
    const data = (host.data as any) ?? {}
    const fromData = (key: string) => (data[key] !== undefined && data[key] !== null && typeof data[key] !== 'object') ? data[key] : undefined
    if ((v === undefined || v === null || v === '') && fromData(host.field.fieldId) !== undefined) v = fromData(host.field.fieldId)
    const lookupLabel = fromData(host.field.fieldId + '-label')
    if (lookupLabel !== undefined && lookupLabel !== '') v = lookupLabel
    if (v && typeof v === 'object' && 'value' in (v as any)) v = (v as any).value
    // a select/radio/choice: its option's label, not the code
    const option = (host.field as any).options?.find?.((o: any) => o && o.value == v)
    if (option && option.label != null && (lookupLabel === undefined || lookupLabel === '')) v = option.label
    v = shownReadOnlyValue(host.field, v)
    const display = v !== null && v !== undefined && v !== '' ? String(v) : '—'
    return html`<vaadin-custom-field
            id="${host.field.fieldId}"
            class="mateu-readonly-text"
            label="${label}"
            data-colspan="${host.field?.colspan}"
            style="padding-top: 0; padding-bottom: 0; ${host.field?.style ?? ''}"
    ><span style="display: block; line-height: 1.4; font-weight: 500; white-space: pre-wrap; word-break: break-word; color: var(--lumo-body-text-color);">${display}</span></vaadin-custom-field>`
}

export function renderReadOnlyField(host: MateuField, fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        let valueToDisplay = evalIfNecessary(value, host.state, host.data) || host.data[fieldId]
        if (valueToDisplay && (valueToDisplay as any).value) {
            valueToDisplay = (valueToDisplay as any).value
        }
        if ('fileUpload' == host.field.stereotype) {
            // read-only file: the file name (a download link when it is a data URI)
            return html`<vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><mateu-file-upload .fieldId="${host.field.fieldId}" .value="${valueToDisplay}" .editable="${false}"></mateu-file-upload>
            </vaadin-custom-field>`
        }
        if ('image' == host.field.stereotype || 'uploadableImage' == host.field.stereotype
            || 'signature' == host.field.stereotype || 'camera' == host.field.stereotype) {
            return html`<vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    required="${host.field.required || nothing}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><img src="${valueToDisplay}" alt="${label ?? ''}" id="${host.field.fieldId}_img" style="${host.field.style}">
            </vaadin-custom-field>`
        }
        if ('bool' == host.field.dataType || 'boolean' == host.field.dataType) {
            return html`<vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    required="${host.field.required || nothing}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><vaadin-icon icon="${valueToDisplay?'vaadin:check':'vaadin:minus'}" role="img" aria-label="${chromeText(valueToDisplay ? 'yes' : 'no')}" style="height: var(--lumo-icon-size-m, 1.5rem);"></vaadin-icon>
            </vaadin-custom-field>`
        }
        if (isPasswordField(host.field)) {
            // a password is never shown, not even read-only: a fixed mask and nothing to copy
            return html`
            <vaadin-text-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    .value="${shownReadOnlyValue(host.field, valueToDisplay) as string}"
                    readonly
                    style="${host.field.style}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ></vaadin-text-field>`
        }
        const strValue = valueToDisplay != null ? String(valueToDisplay) : ''
        // The copy icon is always rendered and only hidden, never added or removed: a Lit
        // expression as the last child of vaadin-text-field owns everything up to the end of
        // the element, which includes the <input slot="input"> vaadin appends there. Switching
        // that expression from `nothing` to the icon (a value growing past 15 chars after an
        // action) cleared the part and took the input with it — the icon appeared, the text
        // never did.
        return html`
            <vaadin-text-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    .value="${strValue}"
                    readonly
                    style="${host.field.style}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><vaadin-icon
                    slot="suffix"
                    icon="vaadin:copy"
                    title="${chromeText('copy')}" aria-label="${chromeText('copy')}"
                    ?hidden="${strValue.length <= 15}"
                    style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                    @click="${() => copyValue(strValue)}"
            ></vaadin-icon></vaadin-text-field>
`
}

// Copies the read-only field's value to the clipboard and confirms with a short toast.
export function copyValue(value: string) {
    navigator.clipboard.writeText(value)
        .then(() => Notification.show(chromeText('copied'), {
            position: 'bottom-end',
            theme: 'success',
            duration: 2000,
        }))
        .catch(() => {})
}
