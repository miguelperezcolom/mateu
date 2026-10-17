import { html, nothing, TemplateResult } from 'lit'
import { safeHtml } from '@infra/ui/safeHtml.ts'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import { requireElement } from '@infra/ui/lazyElements.ts'
import type { MateuField } from '../mateu-field'

/** Editable markdown / html: the source with a rendered preview. */

export function renderMarkdownField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    requireElement('vaadin-markdown')
    // editable: the source with a rendered preview (the read-only field renders it)
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                required="${host.field.required || nothing}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        ><mateu-markup-editor
                .value="${value ?? ''}" .label="${typeof label === "string" ? label : ""}" ?required="${host.field.required}"
                @value-changed="${host.markupChanged}"
        ><vaadin-markdown slot="preview" .content="${value ?? ''}"></vaadin-markdown></mateu-markup-editor>
        </vaadin-custom-field>
    `
}

export function renderHtmlField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    // editable: the source with a rendered (sanitised) preview
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        ><mateu-markup-editor
                .value="${value ?? ''}" .label="${typeof label === "string" ? label : ""}" ?required="${host.field.required}"
                @value-changed="${host.markupChanged}"
        ><div slot="preview">${safeHtml('' + (value ?? ''))}</div></mateu-markup-editor></vaadin-custom-field>
    `
}
