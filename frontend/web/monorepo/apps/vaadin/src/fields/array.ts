import { html, nothing, TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'
import { asSelectValues, pickedOptionsOf, selectValuesChanged, sourcedOptions } from './string/select'

/** dataType array: multi-selects, checkbox groups, grids, list boxes. */

export function renderArrayField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
        if (host.field?.stereotype == 'choice') {
            return html`
                <vaadin-custom-field
                        id="${host.field.fieldId}"
                        label="${label}"
                        .helperText="${host.helperText()}"
                        required="${host.field.required || nothing}"
                        data-colspan="${host.field.colspan}"
                >
                    <mateu-choice
                            .field="${host.field}"
                            .value="${value}"
                            .state="${host.state}"
                            .data="${host.data}"
                            .appState="${host.appState}"
                            .appdata="${host.appData}"
                    ></mateu-choice>
                    
                </vaadin-custom-field>
                `
        }
        if (host.field?.stereotype == 'grid') {
            return html`
                <vaadin-custom-field
                        label="${label}"
                        .helperText="${host.helperText()}"
                        data-colspan="${host.field.colspan}"
                        style="width: 100%;"
                >
                <mateu-grid
                        id="${host.field.fieldId}"
                    .field="${host.field}"
                    .state="${host.state}"
                    .data="${host.data}"
                        .appState="${host.appState}"
                        .appdata="${host.appData}"
                        data-colspan="${host.field.colspan}"
                ></mateu-grid>
                </vaadin-custom-field>
`
        }
        if (host.field?.stereotype == 'listBox') {
            if (host.field?.remoteCoordinates) {
                const coords = host.field.remoteCoordinates;
                host.requestRemoteOptions(coords.action)

                return html`
                    <vaadin-custom-field
                            label="${label}"
                            .helperText="${host.helperText()}"
                            data-colspan="${host.field.colspan}"
                    >
                <vaadin-list-box multiple
                                 .selectedValues="${ifDefined(host.selectedIndexes(value))}"
                                 @selected-values-changed="${host.listItemsSelected}"
                        id="${host.field.fieldId}"
                        ?autofocus="${host.field.wantsFocus}"
                >
                    ${host.data[host.id]?.content?.map((option: any) => html`
                        <vaadin-item>${option.label}</vaadin-item>
                    `)}
                </vaadin-list-box>
                    </vaadin-custom-field>
                `
            }
            return html`
                <vaadin-custom-field
                        id="${host.field.fieldId}"
                        label="${label}"
                        .helperText="${host.helperText()}"
                        data-colspan="${host.field.colspan}"
                >
                <vaadin-list-box multiple
                                 .selectedValues="${ifDefined(host.selectedIndexes(value))}"
                                 @selected-values-changed="${host.listItemsSelected}"
                                 ?autofocus="${host.field.wantsFocus}"
                                 data-colspan="${host.field.colspan}"
                >
                    ${host.field.options?.map(option => html`
                        <vaadin-item>${option.label}</vaadin-item>
                    `)}
                </vaadin-list-box>
                </vaadin-custom-field>
            `
        }
        if (host.field?.stereotype == 'combobox') {
            if (host.field?.remoteCoordinates) {
                const coords = host.field.remoteCoordinates;

                const dataProvider = host.remoteComboDataProvider(coords.action)

                return html`
                    <vaadin-multi-select-combo-box
                            placeholder="${host.field?.placeholder ?? nothing}"
                        label="${label}"
                        item-label-path="label"
                        item-id-path="value"
                        item-value-path="value"
                        .dataProvider="${dataProvider}"
                        .helperText="${host.helperText()}"
                        .selectedItems="${host.selectedItems(value)}"
                        ?autofocus="${host.field.wantsFocus}"
                        ?required="${host.field.required || nothing}"
                        @selected-items-changed="${host.multiComboBoxValueChanged}"
                        data-colspan="${host.field.colspan}"
                        style="${host.field.style}"
                        auto-expand-horizontally
                        auto-expand-vertically
                        xselected-items-on-top
                ></vaadin-multi-select-combo-box>
                `
            }
            // inline options, or a REST source's (it used to be read by the select only)
            const options = host.field.optionsSource ? sourcedOptions(host) : host.field.options
            return html`
                <vaadin-multi-select-combo-box
                        placeholder="${host.field?.placeholder ?? nothing}"
                        label="${label}"
                        item-label-path="label"
                        item-value-path="value"
                        .items="${options}"
                        .helperText="${host.helperText()}"
                        .selectedItems="${pickedOptionsOf(options, value)}"
                        ?autofocus="${host.field.wantsFocus}"
                        ?required="${host.field.required || nothing}"
                        @selected-items-changed="${host.multiComboBoxValueChanged}"
                        data-colspan="${host.field.colspan}"
                        style="${host.field.style}"
                        auto-expand-horizontally
                        auto-expand-vertically
                        xselected-items-on-top
                ></vaadin-multi-select-combo-box>
                `
        }

        if (host.field?.remoteCoordinates) {
            const coords = host.field.remoteCoordinates;
            host.requestRemoteOptions(coords.action)

            return html`
                <vaadin-checkbox-group
                    id="${host.field.fieldId}"
                    label="${label}"
                    theme="vertical"
                    @value-changed="${host.valueChanged}"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
                    .value="${value}"
                    class="mateu-checkbox-group-${host.field.optionsColumns > 1?'multi-column':''}"
            >
                    ${host.data[host.id]?.content?.map((option: any) => html`
                        <vaadin-checkbox
                                value="${option.value}"
                                label="${option.label}"
                        ></vaadin-checkbox>
                    `
                    )}
            </vaadin-checkbox-group>
                `
        }
        // a multiSelect (and any array field with options): inline, or a REST source's — and the
        // values as strings, since a checkbox's value is one (an id list [5, 11] checked nothing)
        const options = host.field.optionsSource ? sourcedOptions(host) : host.field.options
        return html `
            <vaadin-checkbox-group
                    id="${host.field.fieldId}"
                    label="${label}"
                    @value-changed="${selectValuesChanged(host, options)}"
                    theme="vertical"
                    .helperText="${host.helperText()}"
                    ?autofocus="${host.field.wantsFocus}"
                    ?required="${host.field.required || nothing}"
                    data-colspan="${host.field.colspan}"
                    class="mateu-checkbox-group-${host.field.optionsColumns > 1?'multi-column':''}"
                    .value="${asSelectValues(value)}"
            >
                    ${options?.map(option => html`
                    <vaadin-checkbox 
                            value="${option.value}" 
                            label="${option.label}"
                    ></vaadin-checkbox>
                    `)}
            </vaadin-checkbox-group>
        `
}
