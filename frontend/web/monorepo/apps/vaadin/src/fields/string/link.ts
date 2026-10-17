import { html, nothing, TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { safeNavigate } from '@infra/ui/safeNavigate.ts'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The link stereotype. */

export function renderLinkField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field.readOnly) {
        return html`<vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        ><a href="${ifDefined(safeHref(value))}">${value}</a></vaadin-custom-field>`
    }
    return html`
                <vaadin-text-field
                        id="${host.field.fieldId}"
                        placeholder="${host.field.placeholder ?? nothing}"
                        label="${label}"
                        required="${host.field.required || nothing}"
                        @value-changed="${host.valueChanged}"
                        value="${value}"
                        .helperText="${host.helperText()}"
                        ?autofocus="${host.field.wantsFocus}"
                >
                    <vaadin-icon slot="suffix"
                                 icon="vaadin:external-link"
                                 style="cursor: pointer;"
                                 @click="${() => safeNavigate(value, { newTab: true })}"
                    ></vaadin-icon>
                </vaadin-text-field>
    `
}
