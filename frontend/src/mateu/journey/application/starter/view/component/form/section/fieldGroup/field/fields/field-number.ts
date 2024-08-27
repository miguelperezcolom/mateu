import {customElement, property, state, query} from "lit/decorators.js";
import {ifDefined} from 'lit/directives/if-defined.js';
import {css, html, LitElement, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/integer-field'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {IntegerField} from "@vaadin/integer-field";

@customElement('field-number')
export class FieldNumber extends LitElement implements Component {

    @query('vaadin-integer-field')
    integerField : IntegerField | undefined

    isInvalid(): boolean | undefined {
        this.integerField?.validate()
        return this.integerField?.invalid
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

    @state()
    min: string | undefined;

    @state()
    max: string | undefined;

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has("field")) {
            this.field?.validations.forEach(f => {
                if ('Min' == f.type) {
                    this.min = f.data
                }
                if ('Max' == f.type) {
                    this.max = f.data
                }
            })
        }
    }


    render() {
        return html`
            <vaadin-integer-field
                    label="${this.label}"
                    @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                    data-testid="${this.name}"
                           value=${this.value}
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    step-buttons-visible
                    min="${ifDefined(this.min)}"
                    max="${ifDefined(this.max)}"
                    placeholder="${this.placeholder}"
            ></vaadin-integer-field>
        `
    }

    static styles = css`
        vaadin-integer-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-number': FieldNumber
    }
}

