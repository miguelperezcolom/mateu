import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from './fieldEvents'
import { requireElement } from '@infra/ui/lazyElements.ts'
import type { MateuField } from './mateu-field'

/** Dates and times: dateRange, date, dateTime, time. */

export function renderDateRangeField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
    requireElement('vcf-date-range-picker')
        const drValue = value?value.from + ';' + value.to:undefined;
        return html`<vcf-date-range-picker
                id="${host.field.fieldId}"
                label="${label}"
                @value-changed="${(e: CustomEvent) => {
                    if (e.detail.value) {
                        e.detail.value = {
                            from: e.detail.value.split(';')[0],
                            to: e.detail.value.split(';')[1]
                        }
                        // the picker echoes the range it was given: not an edit
                        if (value && value.from == e.detail.value.from && value.to == e.detail.value.to) return
                    }
                    host.valueChanged(e)
                }}"
                value="${drValue}"
                .helperText="${host.helperText()}"
                ?autofocus="${host.field.wantsFocus}"
                ?required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vcf-date-range-picker>`
}

export function renderDateField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        return html`<vaadin-date-picker
                placeholder="${host.field?.placeholder ?? nothing}"
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
        ></vaadin-date-picker>`
}

export function renderDateTimeField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        return html`<vaadin-date-time-picker
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
        ></vaadin-date-time-picker>`
}

export function renderTimeField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        return html`<vaadin-time-picker
                placeholder="${host.field?.placeholder ?? nothing}"
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
        ></vaadin-time-picker>`
}
