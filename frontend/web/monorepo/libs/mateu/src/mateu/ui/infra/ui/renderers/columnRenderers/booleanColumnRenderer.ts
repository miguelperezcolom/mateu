import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";
import { chromeText } from "@infra/ui/chromeTexts.ts";

/**
 * A boolean cell: a check / a dash. The icon alone is invisible to a screen reader (the cell was
 * announced EMPTY — WCAG 1.1.1), so the glyph is wrapped in role="img" named "Yes" / "No".
 */
export const renderBooleanCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    const value = item[column.path!]
    const iconName = value ? 'vaadin:check' : 'vaadin:minus'
    const color = 'var(--lumo-body-text-color)'
    const name = chromeText(value ? 'yes' : 'no')
    return html`<span role="img" aria-label="${name}" title="${name}" style="display: inline-flex;">${icon(iconName, `height: var(--lumo-icon-size-s, 1rem); width: var(--lumo-icon-size-s, 1rem); color: ${color};`)}</span>`
}
