import { html, nothing, TemplateResult } from 'lit'
import { comboBoxRenderer } from '@vaadin/combo-box/lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The icon stereotype: an icon picker (the icon alone when read-only). */

export function renderIconField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field.readOnly) {
        return html`<vaadin-icon
                                 icon="${value}"
                                 data-colspan="${host.field.colspan}"
        ></vaadin-icon>`
    }
    return html`
        <vaadin-combo-box
                        id="${host.field.fieldId}"
                        placeholder="${host.field.placeholder ?? nothing}"
                        label="${label}"
                        required="${host.field.required || nothing}"
                        @value-changed="${host.valueChanged}"
                        value="${value}"
                        .helperText="${host.helperText()}"
                        ?autofocus="${host.field.wantsFocus}"
                        data-colspan="${host.field.colspan}"
                item-label-path="displayName"
                style="--vaadin-combo-box-overlay-width: 16em"
                        .filteredItems="${host.filteredIcons}"
                @filter-changed="${host.iconFilterChanged}"
                ${comboBoxRenderer(host.iconComboboxRenderer, [])}
        >
            ${value?html`<vaadin-icon slot="prefix" icon="${value}"></vaadin-icon>`:nothing}
        </vaadin-combo-box>
    `
}
