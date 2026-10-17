import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { html, nothing, TemplateResult } from 'lit'
import { removeSearchableId, searchableBaseFieldId, searchableChips, searchableIds } from '@components/searchableMulti'
import type { FieldLabel, FieldValue } from './fieldEvents'
import type { MateuField } from './mateu-field'
import type { ValueChangedDetail } from './fieldEvents'

/** A multi-valued @Searchable: chips + «Add». */

/**
 * A multi-valued @Searchable field: one chip per id (labelled from data `<field>-labels`), a
 * remove button on each and an «Add» button that opens the selector (`codesearch-<field>`) —
 * whose pick answers the merged ids. Read-only: the chips alone.
 */
export function renderSearchableMultiField(host: MateuField, fieldId: string, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    const readOnly = !!host.field.readOnly
    const baseId = searchableBaseFieldId(fieldId)
    const ids = searchableIds(host.state && baseId in host.state ? host.state[baseId] : value)
    const chips = searchableChips(ids, host.data?.[baseId + '-labels'])
    const fallbackText = host.data?.[baseId + '-label']
    const remove = (id: unknown) => {
        host.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: {
                value: removeSearchableId(ids, id),
                fieldId: baseId
            },
            bubbles: true,
            composed: true
        }))
    }
    const search = () => {
        host.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'codesearch-' + baseId,
                parameters: {}
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
            <div class="searchable-multi" role="list">
                ${chips.map(chip => html`<span class="searchable-chip" role="listitem" theme="badge pill">
                    <span>${chip.label}</span>
                    ${readOnly ? nothing : html`<vaadin-button
                            theme="icon tertiary-inline small"
                            aria-label="${chromeTextf('removeNamed', { name: chip.label })}"
                            title="${chromeText('remove')}"
                            @click="${() => remove(chip.id)}"
                    ><vaadin-icon icon="vaadin:close-small"></vaadin-icon></vaadin-button>`}
                </span>`)}
                ${readOnly && chips.length == 0 && fallbackText ? html`<span>${fallbackText}</span>` : nothing}
                ${readOnly ? nothing : html`<vaadin-button
                        theme="small tertiary"
                        class="searchable-add"
                        @click="${search}"
                ><vaadin-icon icon="lumo:search" slot="prefix"></vaadin-icon>${chromeText('add')}</vaadin-button>`}
            </div>
        </vaadin-custom-field>
    `
}
