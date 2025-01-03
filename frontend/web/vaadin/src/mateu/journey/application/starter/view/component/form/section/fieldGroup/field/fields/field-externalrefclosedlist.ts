import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/combo-box'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../shared/apiClients/dtos/Value";
import {PropertyValues} from "lit/development";
import {ComboBox} from "@vaadin/combo-box";


@customElement('field-externalrefclosedlist')
export class FieldExternalRefClosedList extends LitElement implements Component {

    @query('vaadin-combo-box')
    comboBox : ComboBox | undefined

    isInvalid(): boolean | undefined {
        this.comboBox?.validate()
        return this.comboBox?.invalid
    }

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(): void {
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        this.value = value as Value;
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
    value: Value | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    items: Value[] | undefined;

    connectedCallback() {
        super.connectedCallback();
        this.items = this.field!.attributes.filter(a => a.key == 'choice').map(a => a.value as Value);
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        const comboBox = this.shadowRoot?.querySelector('vaadin-combo-box') as ComboBox;
        comboBox.selectedItem = this.value;
        // @ts-ignore
        comboBox.value = this.value?.value;
        comboBox.invalid = false
    }

    render() {
        return html`
            <vaadin-combo-box label="${this.label}" theme="vertical"
                                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                              data-testid="${this.name}"
                           value=${this.value?.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                              .items="${this.items}"
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${this.placeholder}"
                              helper-text="${this.field?.description}"
            >
            </vaadin-combo-box>
            `
    }

    static styles = css`
        vaadin-combo-box {
            width: 100%;
        }
    `


}

declare global {
    interface HTMLElementTagNameMap {
        'field-externalrefclosedlist': FieldExternalRefClosedList
    }
}

