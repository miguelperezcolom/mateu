import {customElement, property, query} from "lit/decorators.js";
import {html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/radio-group'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../shared/apiClients/dtos/Value";
import {RadioGroup} from "@vaadin/radio-group";


@customElement('field-radio-buttons')
export class FieldRadioButtons extends LitElement implements Component {

    @query('vaadin-radio-group')
    radioGroup : RadioGroup | undefined

    isInvalid(): boolean | undefined {
        this.radioGroup?.validate()
        return this.radioGroup?.invalid
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
            value: input.value})
    }

    @property()
    value: number | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    render() {
        return html`
            <vaadin-radio-group label="${this.label}" theme="vertical"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                                placeholder="${this.placeholder}"
            >
                ${this.field!.attributes.filter(a => a.key == 'choice').map(a => a.value as Value).map(v => html`
                    <vaadin-radio-button value=${v.value} label=${v.key}
                                         data-testid="${this.name}-${v.value}"></vaadin-radio-button>
                    `)}
            </vaadin-radio-group>
            `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'field-radio-buttons': FieldRadioButtons
    }
}

