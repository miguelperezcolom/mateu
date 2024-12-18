import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/number-field'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {NumberField} from "@vaadin/number-field";

@customElement('field-double')
export class FieldDouble extends LitElement implements Component {

    @query('vaadin-number-field')
    numberField : NumberField | undefined

    isInvalid(): boolean | undefined {
        this.numberField?.validate()
        return this.numberField?.invalid
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
        this.value = value as string;
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
    enabled = true;

    @property()
    field: Field | undefined;

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.value})
    }

    @property()
    value = '';


    render() {
        return html`
            <vaadin-number-field
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                    data-testid="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
                    theme="align-right"
                    autoselect="on"
            ></vaadin-number-field>
        `
    }

    static styles = css`
        vaadin-number-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-double': FieldDouble
    }
}

