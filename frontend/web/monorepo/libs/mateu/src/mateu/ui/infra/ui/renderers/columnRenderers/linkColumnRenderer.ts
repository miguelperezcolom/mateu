import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'

type XColumn = VaadinGridColumn & { xcolumn?: GridColumn }

/**
 * A cell that RUNS an action is a button, not an `<a href="javascript:…">` (which a strict CSP
 * blocks and which is not a link): styled like a link so the grid reads the same.
 */
export const LINK_BUTTON_STYLE = 'background:none;border:none;padding:0;margin:0;font:inherit;cursor:pointer;'
    + 'color:var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));text-decoration:underline;text-align:start;'

const handleClick = (vaadinColumn: VaadinGridColumn,column: GridColumn, item: any) => {
    vaadinColumn.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: column.actionId,
            parameters: item
        },
        bubbles: true,
        composed: true
    }))
}

export const renderLinkCell = (item: any,
                                 _model: GridItemModel<any>,
                                 vaadinColumn: VaadinGridColumn,
                                type: string,
                                _stereotype: string,
                               _column: GridColumn
) => {
    const column = (vaadinColumn as XColumn).xcolumn ?? _column
    if (column.text) {
        if (column.actionId) {
            return html`<button type="button" class="mateu-link-button" style="${LINK_BUTTON_STYLE}" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${column.text}</button>`;
        }
        const href = item[vaadinColumn.path!]
        return html`<a href="${ifDefined(safeHref(href))}">${column.text}</a>`;
    }
    if (type == 'string') {
        if (column.actionId) {
            const text = item[vaadinColumn.path!]
            return html`<button type="button" class="mateu-link-button" style="${LINK_BUTTON_STYLE}" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${text}</button>`;
        }
        const href = item[vaadinColumn.path!]
        return html`<a href="${ifDefined(safeHref(href))}">${href}</a>`;
    }
    const link = item[vaadinColumn.path!]
    return html`<a href="${ifDefined(safeHref(link?.href))}">${link?.text}</a>`;
}
