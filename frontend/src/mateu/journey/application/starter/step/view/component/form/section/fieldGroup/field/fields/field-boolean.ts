import {customElement, property, query} from "lit/decorators.js";
import {html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-checkbox'
import '@vaadin/checkbox-group'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import {CheckboxGroup} from "@vaadin/checkbox-group";


@customElement('field-boolean')
export class FieldBoolean extends LitElement implements Component {

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

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as number;
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
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.checked})
    }

    @property()
    value: number | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    render() {
        return html`
            <vaadin-checkbox-group label="${this.label}" theme="vertical">
                <vaadin-checkbox label="Yes"
            @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}" data-testid="${this.name}"
                           value=${this.value}
                                 ?checked=${this.value}
                   ?disabled=${!this.enabled}
                                 ?required=${this.required}
                                 placeholder="${this.placeholder}"
                ></vaadin-checkbox>
            </vaadin-checkbox-group>
            `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'field-boolean': FieldBoolean
    }
}

