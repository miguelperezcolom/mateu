import { html, nothing, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** The treeSelect stereotype. */

export function renderTreeSelectField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    // Rendered WITHOUT vaadin-custom-field on purpose: custom-field's inputs wrapper is
    // shrink-to-content and unreachable from here, so a slotted child never fills the
    // column. The value round-trips through mateu-vaadin-tree-select's own value-changed
    // event (not custom-field), so we just render the label ourselves and let the host's
    // width: 100% flow straight to the control.
    const helper = host.helperText()
    return html`
        <div class="tree-field" id="${host.field.fieldId}" data-colspan="${host.field.colspan}">
            ${label ? html`
                <span class="tree-field__label">${label}${host.field.required ? html`<span class="tree-field__required"> •</span>` : nothing}</span>` : nothing}
            <mateu-vaadin-tree-select
                    style="width: 100%;"
                    .fieldId="${host.field.fieldId}"
                    .value="${value}"
                    .options="${host.field.options ?? []}"
                    .leavesOnly="${host.field.treeLeavesOnly ?? false}"
            ></mateu-vaadin-tree-select>
            ${helper ? html`<span class="tree-field__helper">${helper}</span>` : nothing}
        </div>
    `
}
