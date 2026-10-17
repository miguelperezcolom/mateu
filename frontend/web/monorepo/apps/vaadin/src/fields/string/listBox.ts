import { html, nothing, TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The listBox stereotype. */

export function renderListBoxField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field?.remoteCoordinates) {
        const coords = host.field.remoteCoordinates;
        host.requestRemoteOptions(coords.action)

        return html`
            <vaadin-custom-field
                    label="${label}"
                    .helperText="${host.helperText()}"
                    data-colspan="${host.field.colspan}"
            >
        <vaadin-list-box
                id="${host.field.fieldId}"
                selected="${ifDefined(host.selectedIndex(value))}"
                @selected-changed="${host.listItemSelected}"
                ?autofocus="${host.field.wantsFocus}"
        >
            ${host.data[host.id]?.content?.map((option: any) => html`
                <vaadin-item>${option.description || option.image || option.icon?html`
                    <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                        ${option.icon?html`
                            <vaadin-icon icon="${option.icon}"></vaadin-icon>
                        `:nothing}
                        ${option.image?html`
                                <img src="${option.image}" alt="${option.label}" style="width: 2rem;" />
                            `:nothing}
                        <vaadin-vertical-layout>
                            <span> ${option.label} </span>
                            <span
                                    style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                            >
  ${option.description}
</span>
                        </vaadin-vertical-layout>
                    </vaadin-horizontal-layout>
                `:option.label}</vaadin-item>
            `)}
        </vaadin-list-box>
            </vaadin-custom-field>
        `
    }
    return html`
        <vaadin-custom-field
                label="${label}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
        <vaadin-list-box
                id="${host.field.fieldId}"
                selected="${ifDefined(host.selectedIndex(value))}"
                @selected-changed="${host.listItemSelected}"
                ?autofocus="${host.field.wantsFocus}"
        >
            ${host.field.options?.map(option => html`
                <vaadin-item>${option.description || option.image || option.icon?html`
                    <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                        ${option.icon?html`
                            <vaadin-icon icon="${option.icon}"></vaadin-icon>
                        `:nothing}
                        ${option.image?html`
                                <img src="${option.image}" alt="${option.label}" style="width: 2rem;" />
                            `:nothing}
                        <vaadin-vertical-layout>
                            <span> ${option.label} </span>
                            <span
                                    style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                            >
  ${option.description}
</span>
                        </vaadin-vertical-layout>
                    </vaadin-horizontal-layout>
                `:option.label}</vaadin-item>
            `)}
        </vaadin-list-box>
        </vaadin-custom-field>
    `
}
