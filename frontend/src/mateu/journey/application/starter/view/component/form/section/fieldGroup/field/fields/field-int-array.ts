import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-text-field'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {TextField} from "@vaadin/vaadin-text-field";


@customElement('field-int-array')
export class FieldIntArray extends LitElement implements Component {

    @query('vaadin-text-field')
    textField : TextField | undefined

    isInvalid(): boolean | undefined {
        this.textField?.validate()
        return this.textField?.invalid
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
        if (placeholder) this.placeholder = placeholder
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
    placeholder = 'type 1,2,3,4';

    @property()
    name = '';

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: this.toArray(input.value)})
    }

    toArray(raw: string | undefined): number[] {
        let array: number[] = [];
        if (raw) {
            const tokens = raw.split(',');
            for (let i = 0; i < tokens.length; i++) {
                array[i] = parseInt(tokens[i])
            }
        }
        return array;
    }

    @property()
    value: string | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    render() {
        return html`
            <vaadin-text-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            `
    }

    static styles = css`
        vaadin-text-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-int-array': FieldIntArray
    }
}

