import { chromeText } from '@infra/ui/chromeTexts.ts'
import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** Images: a URL with its preview, or uploadable (the value is a data URI or a URL). */

/**
 * The image stereotype in an EDITABLE form: the URL input, and under it a contained preview that
 * follows the value. It used to draw only the image, at full size, with nothing to change it — a
 * read-only form or a view still shows just the image (renderReadOnlyField).
 */
export function renderImageField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    const url = typeof value === 'string' ? value.trim() : ''
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        >
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--lumo-space-s); width: 100%;">
                <vaadin-text-field
                        class="mateu-image-url"
                        accessible-name="${label ?? nothing}"
                        placeholder="${host.field.placeholder ?? nothing}"
                        .value="${value ?? ''}"
                        @value-changed="${(e: CustomEvent) => { e.stopPropagation(); host.valueChanged(e) }}"
                        ?autofocus="${host.field.wantsFocus}"
                        style="width: 100%;"
                ></vaadin-text-field>
                ${url ? html`<img
                        class="mateu-image-preview ${host.component?.cssClasses ?? ''}"
                        src="${url}" alt="${label ?? ''}"
                        style="max-width: min(100%, 320px); max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${host.component?.style ?? ''}">`
                    : nothing}
            </div>
        </vaadin-custom-field>
    `
}

export function renderUploadableImageField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    const hasImage = value != null && value !== ''
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                ${hasImage ? html`<img
                        src="${value}" alt="${label ?? ''}"
                        style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${host.field.style ?? ''}"
                        class="${host.component?.cssClasses}">`
                    : html`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                        <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                    </div>`}
                <input type="file" accept="image/*" style="display: none;" @change="${host.imageUpload}">
                <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                    <vaadin-button @click="${host.triggerImageUpload}">
                        <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                        ${hasImage ? chromeText('replace') : chromeText('upload')}
                    </vaadin-button>
                    ${hasImage ? html`<vaadin-button theme="error tertiary" @click="${host.imageDelete}">
                        <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                        ${chromeText('delete')}
                    </vaadin-button>` : nothing}
                </vaadin-horizontal-layout>
            </vaadin-vertical-layout>
        </vaadin-custom-field>
    `
}
