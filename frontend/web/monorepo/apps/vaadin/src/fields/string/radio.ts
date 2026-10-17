import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The radio stereotype, with inline or remote options. */

export function renderRadioField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field?.remoteCoordinates) {
        const coords = host.field.remoteCoordinates;
        host.requestRemoteOptions(coords.action)

        return html`
        <vaadin-radio-group
                id="${host.field.fieldId}"
                label="${label}"
                @value-changed="${host.valueChanged}"
                .value="${value}"
                .helperText="${host.helperText()}"
                theme="horizontal"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        >
            ${host.data[host.id]?.content?.map((option: any) => html`
                <vaadin-radio-button value="${option.value}" label="${option.label}" ?checked="${option && value && option.value === value}">
                    ${option.description || option.image || option.icon?html`
                        <label slot="label">
                            <vaadin-horizontal-layout theme="spacing">
                                ${option.icon?html`
                                    <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                `:nothing}
                                ${option.image?html`
                                    <img src="${option.image}" alt="${option.label}" style="height: 1rem;" />
                                `:nothing}
                                <span>${option.label}</span>
                            </vaadin-horizontal-layout>
                            ${option.description?html`
                                <div>${option.description}</div>
                            `:nothing}
                        </label>
                    `:nothing}
                </vaadin-radio-button>
            `)}
</vaadin-radio-group>
        `
    }
    return html`
        <vaadin-radio-group
                id="${host.field.fieldId}"
                label="${label}"
                @value-changed="${host.valueChanged}"
                .value="${value}"
                .helperText="${host.helperText()}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        >
            ${host.field.options?.map(option => html`
                <vaadin-radio-button value="${option.value}" label="${option.label}">
                    ${option.description || option.image || option.icon?html`
                        <label slot="label">
                            <vaadin-horizontal-layout theme="spacing">
                                ${option.icon?html`
                                    <vaadin-icon icon="${option.icon}"></vaadin-icon>
                                `:nothing}
                                ${option.image?html`
                                    <img src="${option.image}" alt="${option.label}" style="height: 1rem;" />
                                `:nothing}
                                <span>${option.label}</span>
                            </vaadin-horizontal-layout>
                            ${option.description?html`
                                <div>${option.description}</div>
                            `:nothing}
                        </label>
                    `:nothing}
                </vaadin-radio-button>
            `)}
</vaadin-radio-group>
        `
}
