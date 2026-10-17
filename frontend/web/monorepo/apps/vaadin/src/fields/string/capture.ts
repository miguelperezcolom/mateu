import { fieldAttribute } from '@components/mateu-file-upload.ts'
import { html, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import { requireElement } from '@infra/ui/lazyElements.ts'
import type { MateuField } from '../mateu-field'

/** Capture fields: signature pad, camera, generic file upload (values are data URIs). */

export function renderSignatureField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    requireElement('mateu-signature-pad')
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <mateu-signature-pad .fieldId="${host.field.fieldId}" .value="${value}"></mateu-signature-pad>
        </vaadin-custom-field>
    `
}

export function renderCameraField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    requireElement('mateu-camera-capture')
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <mateu-camera-capture .fieldId="${host.field.fieldId}" .value="${value}"></mateu-camera-capture>
        </vaadin-custom-field>
    `
}

export function renderFileUploadField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    // generic file upload: pick-file + name + remove, value = data URI (no preview);
    // the accept attribute travels in the field's generic attributes
    const accept = fieldAttribute(host.field.attributes, 'accept')
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <mateu-file-upload .fieldId="${host.field.fieldId}" .value="${value}" .accept="${accept}"></mateu-file-upload>
        </vaadin-custom-field>
    `
}
