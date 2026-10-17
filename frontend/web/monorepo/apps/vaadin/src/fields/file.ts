import { html, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'
import type { FileLike } from './fieldEvents'

/** dataType file: the vaadin-upload. */

export function renderFileField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
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
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            >
                <vaadin-upload
                        target="/upload"
                        .files="${files}"
                        @upload-success="${host.fileUploaded}"
                        @files-changed="${host.fileChanged}"
                ></vaadin-upload>
            </vaadin-custom-field>
        `
}
