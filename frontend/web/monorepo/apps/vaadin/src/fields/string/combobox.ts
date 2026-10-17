import { html, nothing, TemplateResult } from 'lit'
import { ComboBox } from '@vaadin/combo-box'
import { comboBoxRenderer } from '@vaadin/combo-box/lit'
import Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option.ts'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The combobox stereotype, with inline or remote (searched) options. */

export function renderComboboxField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field?.remoteCoordinates) {
        const coords = host.field.remoteCoordinates;

        let selectedItem: Option | undefined = undefined
        if (host.data[host.id] && host.data[host.id].content) {
            selectedItem = host.data[host.id].content.find((item:any) => item.value == value)
        }
        if (!selectedItem && host.comboData) {
            selectedItem = host.comboData.find((item:any) => item.value == value)
        }
        if (!selectedItem && value) {
            selectedItem = {
                value: value,
                label: host.data[host.id + '-label']??value
            } as Option
        }

        const dataProvider = host.remoteComboDataProvider(coords.action)

        return html`
        <vaadin-combo-box
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                item-label-path="label"
                item-id-path="value"
                .dataProvider="${dataProvider}"
                .selectedItem="${selectedItem}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                ?autofocus="${host.field.wantsFocus}"
                ?required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
                style="${host.field.style}"
                @keyup="${(z: KeyboardEvent) => {
                    if (z.key == 'Backspace') {
                        const combo = z.currentTarget as ComboBox
                        const input = combo.inputElement as HTMLInputElement
                        const filter = input.value
                        if (!filter) {
                            combo.value = ''
                        }
                    }
                }}"
                ${comboBoxRenderer(host.comboRenderer, [])}
        ></vaadin-combo-box>
        `
    }
    return html`
        <vaadin-combo-box
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                item-label-path="label"
                item-value-path="value"
                .items="${host.field.options}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                .value="${value}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
                style="${host.field.style}"
                ${comboBoxRenderer(host.comboRenderer, [])}
        ></vaadin-combo-box>
        `
}
