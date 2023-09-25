import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-radio-button'
import '@vaadin/radio-group'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";


@customElement('field-boolean-radio-buttons')
export class FieldBooleanRadioButtons extends LitElement implements Component {

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
            <vaadin-radio-group label="${this.label}" theme="horizontal"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                                placeholder="${this.placeholder}"
            >
                    <vaadin-radio-button value=true label="Yes" data-testid="${this.name}-yes"style="width: 50%;"></vaadin-radio-button>
                    <vaadin-radio-button value=false label="No" data-testid="${this.name}-no" style="width: 49%;"></vaadin-radio-button>
            </vaadin-radio-group>
            `
    }

    static styles = css`
        vaadin-radio-group {
            width: 100%;
        }        
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-boolean-radio-buttons': FieldBooleanRadioButtons
    }
}

