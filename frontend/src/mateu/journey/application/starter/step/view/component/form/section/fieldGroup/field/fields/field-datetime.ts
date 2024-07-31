import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/date-time-picker'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import {DateTimePicker} from "@vaadin/date-time-picker";


@customElement('field-datetime')
export class FieldDateTime extends LitElement implements Component {

    @query('vaadin-date-time-picker')
    dateTimePicker : DateTimePicker | undefined

    isInvalid(): boolean | undefined {
        this.dateTimePicker?.validate()
        return this.dateTimePicker?.invalid
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
        this.value = value as Date;
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
    value: Date | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    render() {
        return html`
            <vaadin-date-time-picker
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                    data-testid="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-date-time-picker>
            `
    }

    static styles = css`
        vaadin-date-time-picker {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-datetime': FieldDateTime
    }
}

