import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

type XColumn = VaadinGridColumn & { xcolumn?: GridColumn }

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
            return html`<a href="javascript: void(0);" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${column.text}</a>`;
        }
        const href = item[vaadinColumn.path!]
        return html`<a href="${href}">${column.text}</a>`;
    }
    if (type == 'string') {
        if (column.actionId) {
            const text = item[vaadinColumn.path!]
            return html`<a href="javascript: void(0);" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${text}</a>`;
        }
        const href = item[vaadinColumn.path!]
        return html`<a href="${href}">${href}</a>`;
    }
    const link = item[vaadinColumn.path!]
    return html`<a href="${link.href}">${link.text}</a>`;
}
