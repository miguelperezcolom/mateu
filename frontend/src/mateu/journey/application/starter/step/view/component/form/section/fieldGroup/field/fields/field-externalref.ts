import {customElement, property, state, query} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/combo-box'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../../shared/apiClients/dtos/Value";
import {ComboBox, ComboBoxDataProvider} from "@vaadin/combo-box";
import Attribute from "../../../../../../../../../../../shared/apiClients/dtos/Attribute";

@customElement('field-externalref')
export class FieldExternalRef extends LitElement implements Component {

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
        this._attributes = field.attributes;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    onValueChanged(event: ValueChangedEvent): void {
        this.dispatchEvent(new CustomEvent('filterchanged', {
            bubbles: true,
            composed: true,
            detail: event}))
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
        const comboBox = e.target as ComboBox;
        this.onValueChanged({fieldId: this.id, value: comboBox.selectedItem})
    }

    @property()
    value: Value | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    @property()
    _attributes: Attribute[] | undefined;

    @state()
    dataProvider: ComboBoxDataProvider<Value> = async (params, callback) => {
        const itemProvider = this._attributes?.filter(a => a.key == 'itemprovider')[0].value;
        const API = `${this.baseUrl}/itemproviders/${itemProvider}/items`;
        const { filter, page, pageSize } = params;

        const res = await fetch(`${API}?page=${page}&page_size=${pageSize}&search_text=${filter}`);
        if (res.ok) {
            const items = await res.json();
            callback(items.content, items.totalElements);
        }
    };

    protected firstUpdated(_changedProperties: PropertyValues) {
        const comboBox = this.shadowRoot?.querySelector('vaadin-combo-box') as ComboBox;
        comboBox.dataProvider = this.dataProvider;
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
                           id="${this.id}"
                              data-testid="${this.name}"
                           value=${this.value?.value}
                   ?disabled=${!this.enabled}
                                ?required=${this.required}
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${this.placeholder}"
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
        'field-externalref': FieldExternalRef
    }
}

