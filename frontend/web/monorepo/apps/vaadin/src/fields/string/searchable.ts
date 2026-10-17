import { chromeText } from '@infra/ui/chromeTexts.ts'
import { html, nothing, TemplateResult } from 'lit'
import { TextField } from '@vaadin/text-field'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** A single-valued @Searchable string: code input + label + search button. */

export function renderSearchableField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``

    const searchCode = (e: CustomEvent) => {
        host.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'code-' + host.field?.fieldId,
                parameters: {
                    code: (e.currentTarget as TextField).value
                }
            },
            bubbles: true,
            composed: true
        }))
    }

    const search = (_e: CustomEvent) => {
        host.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'codesearch-' + host.field?.fieldId,
                parameters: {
                }
            },
            bubbles: true,
            composed: true
        }))
    }

    return html`
        <vaadin-custom-field
                id="${host.field.fieldId}"
                label="${label}"
                required="${host.field.required || nothing}"
                .helperText="${host.helperText()}"
                data-colspan="${host.field.colspan}"
        >
            <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                <vaadin-text-field style="width: 4rem;" accessible-name="${(host.field.label ?? host.field.fieldId) + ' — ' + chromeText('code')}" @change="${searchCode}" value="${value}"></vaadin-text-field>
                <vaadin-text-field readonly="" accessible-name="${host.field.label ?? host.field.fieldId}" value="${host.data[host.field.fieldId + '-label']}"></vaadin-text-field>
                <vaadin-button theme="icon" aria-label="${chromeText('search')}" @click="${search}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
            </vaadin-horizontal-layout>
        </vaadin-custom-field>
    `
}
