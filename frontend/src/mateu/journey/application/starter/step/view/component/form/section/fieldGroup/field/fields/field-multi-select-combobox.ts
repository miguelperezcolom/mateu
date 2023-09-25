import {customElement, property} from "lit/decorators.js";
import {html, LitElement, css, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/multi-select-combo-box';
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../../shared/apiClients/dtos/Value";
import {MultiSelectComboBox, MultiSelectComboBoxSelectedItemsChangedEvent} from "@vaadin/multi-select-combo-box";


@customElement('field-multi-select-combobox')
export class FieldMultiSelectCombobox extends LitElement implements Component {

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
        this.value = value as any[];
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
    onChange = (e:MultiSelectComboBoxSelectedItemsChangedEvent<Value>) => {
        this.onValueChanged({
            fieldId: this.field!.id,
            value: e.detail.value})
    }

    @property()
    value: any[] | undefined;

    @property()
    items: any[] | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    connectedCallback() {
        super.connectedCallback();
        this.items = this.field!.attributes.filter(a => a.key == 'choice').map(a => (a.value as Value).value);
    }


    protected firstUpdated(_changedProperties: PropertyValues) {
        const comboBox = this.shadowRoot?.querySelector('vaadin-multi-select-combo-box') as MultiSelectComboBox<Value>;
        comboBox.selectedItems = this.value?this.value:[];
        //console.log('selectedItems', comboBox.selectedItems)
    }


    render() {
        return html`
            <vaadin-multi-select-combo-box 
                             label="${this.label}"
                             name="${this.name}"
                             id="${this.name}"
                             data-testid="${this.name}"
                             ?disabled=${!this.enabled}
                             ?required=${this.required} 
                             .items="${this.items}"
                                           @selected-items-changed=${this.onChange}
            >
            </vaadin-multi-select-combo-box>
            `
    }

    static styles = css`
        vaadin-multi-select-combo-box {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-multi-select-combobox': FieldMultiSelectCombobox
    }
}

