import {customElement, property, state} from "lit/decorators.js";
import {html, LitElement, css, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/multi-select-combo-box';
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../../shared/apiClients/dtos/Value";
import {
    ComboBoxDataProvider,
    ComboBoxDataProviderParams,
} from "@vaadin/combo-box";
import {MultiSelectComboBox, MultiSelectComboBoxSelectedItemsChangedEvent} from "@vaadin/multi-select-combo-box";


@customElement('field-externalref-checkboxes')
export class FieldExternalrefCheckboxes extends LitElement implements Component {

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
        this.value = value as Value[];
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
    value: Value[] | undefined;

    @property()
    items: Value[] | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    @state()
    dataProvider: ComboBoxDataProvider<Value> = async (params, callback) => {
        const itemProvider = this.field?.attributes.filter(a => a.key == 'itemprovider')[0].value;
        const API = `${this.baseUrl}/itemproviders/${itemProvider}/items`;
        const { filter, page, pageSize } = params;

        const count = await this.getCount(params)

        const res = await fetch(`${API}?page=${page}&page_size=${pageSize}&search_text=${filter}`);
        if (res.ok) {
            const result = await res.json();
            callback(result, count);
        }
    };

    private async getCount(params: ComboBoxDataProviderParams):Promise<number> {
        const itemProvider = this.field?.attributes.filter(a => a.key == 'itemprovider')[0].value;
        const API = `${this.baseUrl}/itemproviders/${itemProvider}/count`;
        const { filter } = params;

        const res = await fetch(`${API}?search_text=${filter}`);
        if (res.ok) {
            const size = parseInt(await res.text());
            return size;
        }
        return 0;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        const comboBox = this.shadowRoot?.querySelector('vaadin-multi-select-combo-box') as MultiSelectComboBox<Value>;
        comboBox.dataProvider = this.dataProvider;
        comboBox.selectedItems = this.value?this.value:[];
    }


    render() {
        return html`
            <vaadin-multi-select-combo-box .selectedValues="${this.value}"
                             label="${this.label}"
                             name="${this.name}"
                             id="${this.name}"
                                           data-testid="${this.name}"
                             ?disabled=${!this.enabled}
                             ?required=${this.required}
                             item-label-path="key"
                                           item-id-path="value"
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
        'field-externalref-checkboxes': FieldExternalrefCheckboxes
    }
}

