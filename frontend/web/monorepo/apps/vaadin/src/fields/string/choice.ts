import { html, nothing, TemplateResult } from 'lit'
import { popoverRenderer } from '@vaadin/popover/lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The choice stereotype, inline or in a popover. */

export function renderPopoverField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    return html`<vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                required="${host.field.required || nothing}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <vaadin-horizontal-layout theme="spacing">
                <div>${value}</div>
                <div id="${host.field.fieldId}_popover">
                    <vaadin-icon icon="vaadin:angle-down"></vaadin-icon>
                </div>
            </vaadin-horizontal-layout>
        <vaadin-popover
                for="${host.field.fieldId}_popover"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${popoverRenderer(() => html`
                    <mateu-event-interceptor .target="${host}">
                    <mateu-choice
                            .field="${host.field}"
                            .value="${value}"
                    ></mateu-choice>
                    </mateu-event-interceptor>
                `, [])}
        ></vaadin-popover>
        </vaadin-custom-field>
    `
}

export function renderChoiceField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
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
