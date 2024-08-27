import {customElement, property, query} from "lit/decorators.js";
import {html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/checkbox-group'
import '@vaadin/vaadin-checkbox'
    import type {CheckboxGroup, CheckboxGroupValueChangedEvent} from '@vaadin/checkbox-group';
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../shared/apiClients/dtos/Value";


@customElement('field-closedlist')
export class FieldClosedList extends LitElement implements Component {

    @query('vaadin-checkbox-group')
    checkboxGroup : CheckboxGroup | undefined

    isInvalid(): boolean | undefined {
        this.checkboxGroup?.validate()
        return this.checkboxGroup?.invalid
    }

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(): void {
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        if (!value) {
            this.value = undefined
            return
        }
        const raw = value as [];
        // @ts-ignore
        this.value = raw.map(v => v.value?v.value:v);
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    name = '';

    @property()
    onChange = (e:CheckboxGroupValueChangedEvent) => {
        if (this.value != e.detail.value) {
            this.onValueChanged({fieldId: this.field!.id,
                value: e.detail.value})
        }
    }

    @property()
    value: unknown[] | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    getValue(v: Value): unknown {
        if (!v || !v.value) {
            return undefined
        }
        // @ts-ignore
        return v.value.value?v.value.value:v.value
    }


    render() {
        return html`
            <vaadin-checkbox-group label="${this.label}" theme="vertical"
                                @value-changed=${this.onChange} 
                                   .value=${this.value}
                           name="${this.name}" 
                           id="${this.name}"
                                   data-testid="${this.name}"
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
            >
                ${this.field!.attributes.filter(a => a.key == 'choice').map(a => a.value as Value).map(v => html`
                    <vaadin-checkbox .value=${this.getValue(v)} .label=${v.key} data-testid="${this.name}-${this.getValue(v)}"></vaadin-checkbox>
                    `)}
            </vaadin-checkbox-group>
            `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'field-closedlist': FieldClosedList
    }
}

