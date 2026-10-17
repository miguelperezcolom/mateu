import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'

/** dataType bool / boolean: checkbox or switch. */

export function renderBoolField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        if (host.field.stereotype == 'toggle') {
            return html `
                <vaadin-custom-field
                        label="${label}"
                        .helperText="${host.helperText()}"
                        ?required="${host.field.required || nothing}"
                        data-colspan="${host.field.colspan}"
                >
                    <label class="mateu-switch">
                        <input type="checkbox" role="switch" id="${host.field.fieldId}"
                               aria-label="${label}"
                               ?disabled=${host.field.disabled}
                               .checked=${!!value}
                               @change=${host.checked}>
                        <span class="track" aria-hidden="true"></span>
                    </label>
                </vaadin-custom-field>
            `
        }
        // A plain checkbox carries its label at its side (the standard affordance), not
        // floating above like an input label.
        return html `
            <vaadin-checkbox
                    id="${host.field.fieldId}"
                    label="${label}"
                    .helperText="${host.helperText()}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
                    @change="${host.checked}"
                    value="${value}"
                    ?checked=${value}
                    ?autofocus="${host.field.wantsFocus}"
            ></vaadin-checkbox>
        `
}
