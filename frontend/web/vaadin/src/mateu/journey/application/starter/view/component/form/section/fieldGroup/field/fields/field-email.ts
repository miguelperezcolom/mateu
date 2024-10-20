import {customElement, property, query} from "lit/decorators.js";
import {html, css, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/email-field'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {EmailField} from "@vaadin/email-field";


@customElement('field-email')
export class FieldEmail extends LitElement implements Component {

    @query('vaadin-email-field')
    textField: EmailField | undefined

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
        this.placeholder = placeholder
    }

    setPattern(pattern: string): void {
        this.pattern = pattern
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
    pattern = '';

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
    value: string | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    render() {
        return html`
            <vaadin-email-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
                ?autofocus="${this.field?.wantsFocus}"
                autoselect="on"
                clear-button-visible
            ></vaadin-email-field>
            `
    }


    static styles = css`
        vaadin-email-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-emil': FieldEmail
    }
}

