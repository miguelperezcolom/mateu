import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/date-picker'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {DatePicker} from "@vaadin/date-picker";


@customElement('field-date')
export class FieldDate extends LitElement implements Component {

    @query('vaadin-date-picker')
    datePicker : DatePicker | undefined

    isInvalid(): boolean | undefined {
        this.datePicker?.validate()
        return this.datePicker?.invalid
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
            <vaadin-date-picker
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                    data-testid="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            ></vaadin-date-picker>
            `
    }

    static styles = css`
        vaadin-date-picker {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-date': FieldDate
    }
}

