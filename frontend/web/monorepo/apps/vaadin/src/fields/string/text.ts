import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** Plain text inputs: text, textarea, rich text, email, password. */

export function renderRichTextField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    return html`
        <vaadin-custom-field
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
        <mateu-rich-text-editor
                .maxlength="${host.field.charLimit}"
                .value="${value}"
                .label="${label}"
                @value-changed="${host.valueChanged}"
                ?autofocus="${host.field.wantsFocus}"
        ></mateu-rich-text-editor>
        </vaadin-custom-field>`
}

export function renderTextareaField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    return html`
        <vaadin-text-area
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                .maxlength="${host.field.charLimit}"
                .value="${value}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
                rows="4"
                style="width: 100%;"
        ></vaadin-text-area>`
}

export function renderEmailField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    return html`
        <vaadin-email-field
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                @value-changed="${host.valueChanged}"
                value="${value}"
                .helperText="${host.helperText()}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-email-field>
    `
}

export function renderPasswordField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    return html`
        <vaadin-password-field
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                @value-changed="${host.valueChanged}"
                value="${value}"
                .helperText="${host.helperText()}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-password-field>
    `
}

/** No stereotype of its own: a text field. */
export function renderTextField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
return html`
    <vaadin-text-field
            placeholder="${host.field?.placeholder ?? nothing}"
            id="${host.field.fieldId}"
            label="${label}"
            @value-changed="${host.valueChanged}"
            value="${value}"
            .helperText="${host.helperText()}"
            ?autofocus="${host.field.wantsFocus}"
            ?required="${host.field.required || nothing}"
            ?disabled="${host.field.disabled}"
            data-colspan="${host.field.colspan}"
            style="${host.field.style}"
    ></vaadin-text-field>
`
}
