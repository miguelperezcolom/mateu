import { html, TemplateResult } from 'lit'
import { colorInputValue } from '@components/fieldValue'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'
import type { ValueChangedDetail } from '../fieldEvents'

/** The color stereotype: a native colour input (a swatch when read-only). */

export function renderColorField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field.readOnly) {
        return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        ><span role="img" aria-label="${value ?? ''}" style="background-color: ${value}; display: block; height: 20px; width: 40px; margin-top: var(--mateu-swatch-margin-top, 5px); margin-bottom: var(--mateu-swatch-margin-bottom, 24px); border: 1px solid var(--lumo-secondary-text-color)"></span></vaadin-custom-field>
    `
    }
    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <input type="color" aria-label="${label ?? ''}" .value="${colorInputValue(value)}" @input="${(e: Event) => {
                host.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                    detail: {
                        value: (e.target as HTMLInputElement).value,
                        fieldId: host.field!.fieldId
                    },
                    bubbles: true,
                    composed: true
                }))
            }}"/>
        </vaadin-custom-field>
    `
}
