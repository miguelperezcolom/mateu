import { chromeText } from '@infra/ui/chromeTexts.ts'
import { html, nothing, TemplateResult } from 'lit'
import { getThemeForBadgetType } from '@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts'
import Status from '@mateu/shared/apiClients/dtos/componentmetadata/Status.ts'
import { formatMoney } from './fieldDisplay'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'
import type { ValueChangedDetail } from './fieldEvents'

/** dataType money, status and range. */

export function renderMoneyField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        if (host.field.readOnly) {
            const formatted = formatMoney(value)
            return html`<vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><div style="width: 186px; text-align: right;">${formatted}</div></vaadin-custom-field>`
        }
        return html`<mateu-money-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    .value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
        ></mateu-money-field>`
}

export function renderStatusField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        const status = value as Status
        return html`
            <vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    required="${host.field.required || nothing}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            >
                ${status?html`<span theme="badge pill ${getThemeForBadgetType(status.type)}">${status.message}</span>`:html``}                    
            </vaadin-custom-field>
        `
}

export function renderRangeField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        const range = value as {
            from: number
            to: number
        }
        return html`
            <vaadin-custom-field
                    id="${host.field.fieldId}"
                    label="${label}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            ><mateu-range-slider start-value="${range?.from??0}" end-value="${range?.to??0}" 
                               min="${host.field.sliderMin??0}" 
                               max="${(host.field.sliderMax)??10}"
                               step="${host.field.step || nothing}"
                               from-label="${chromeText('rangeFrom')}"
                               to-label="${chromeText('rangeTo')}"
                               @change="${(e: Event) => {
                                   const values = e.target as unknown as {
                                       startValue: number
                                       endValue: number
                                   }
                                   host.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                                       detail: {
                                           value: {
                                               from: values.startValue,
                                               to: values.endValue
                                           },
                                           fieldId: host.field!.fieldId
                                       },
                                       bubbles: true,
                                       composed: true
                                   }))
                               }}"
                               style="min-width: 10rem;"
            ></mateu-range-slider></vaadin-custom-field>
        `
}
