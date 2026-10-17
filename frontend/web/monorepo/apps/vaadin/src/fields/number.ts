import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'
import type { ValueChangedDetail } from './fieldEvents'

/** dataType number / integer. */

export function renderNumberField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        return html`<vaadin-number-field
                placeholder="${host.field?.placeholder ?? nothing}"
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
                    step="${host.field.step || nothing}"
                    ?step-buttons-visible="${host.field.stepButtonsVisible}"
                    min="${host.field.min != null ? host.field.min : nothing}"
                    max="${host.field.max != null ? host.field.max : nothing}"
        ></vaadin-number-field>`
}

export function renderIntegerField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        if (host.field.stereotype == 'stars') {
            let renderValue = value;
            if (isNaN(renderValue)) {
                renderValue = 0
            }
            const values = [1, 2, 3, 4, 5]
            return html`<vaadin-custom-field
                        id="${host.field.fieldId}"
                        label="${label}"
                        .helperText="${host.helperText()}"
                        data-colspan="${host.field.colspan}"
                >${values.map(index => html`
                <vaadin-icon 
                        icon="vaadin:star" 
                        style="cursor: pointer; color: var(${index <= renderValue?'--lumo-warning-color':'--lumo-shade-30pct'});"
                        @click="${() => host.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                            detail: {
                                value: index,
                                fieldId: host.field!.fieldId
                            },
                            bubbles: true,
                            composed: true
                        }))}"
                
                ></vaadin-icon>
            `)}</vaadin-custom-field>`
        }
        if (host.field.stereotype == 'slider') {
            let renderValue = value;
            if (isNaN(renderValue)) {
                renderValue = 0
            }
            return html`
                <vaadin-custom-field
                        id="${host.field.fieldId}"
                        label="${label}"
                        .helperText="${host.helperText()}"
                        data-colspan="${host.field.colspan}"
                ><input type="range" aria-label="${label ?? ''}" @input="${(e: Event) => {
                    host.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
                        detail: {
                            value: (e.target as HTMLInputElement).value,
                            fieldId: host.field!.fieldId
                        },
                        bubbles: true,
                        composed: true
                    }))
                }}" min="${host.field.sliderMin??0}" max="${(host.field.sliderMax)??10}" value="${renderValue??0}"/></vaadin-custom-field>
            `
        }
        return html`
            <vaadin-integer-field
                    placeholder="${host.field?.placeholder ?? nothing}"
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${host.valueChanged}"
                    value="${value}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
                    step="${host.field.step || nothing}"
                    ?step-buttons-visible="${host.field.stepButtonsVisible}"
                    min="${host.field.min != null ? host.field.min : nothing}"
                    max="${host.field.max != null ? host.field.max : nothing}"
            ></vaadin-integer-field>
        `
}
