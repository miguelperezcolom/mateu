import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

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
    // @ts-ignore
    const column = vaadinColumn.xcolumn??_column
    if (column.text) {
        if (column.actionId) {
            // @ts-ignore
            return html`<a href="javascript: void(0);" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${column.text}</a>`;
        }
        // @ts-ignore
        const href = item[vaadinColumn.path]
        return html`<a href="${href}">${column.text}</a>`;
    }
    if (type == 'string') {
        if (column.actionId) {
            // @ts-ignore
            const text = item[vaadinColumn.path]
            return html`<a href="javascript: void(0);" @click="${(_e: any) => handleClick(vaadinColumn, column, item)}">${text}</a>`;
        }
        // @ts-ignore
        const href = item[vaadinColumn.path]
        return html`<a href="${href}">${href}</a>`;
    }
    // @ts-ignore
    const link = item[vaadinColumn.path]
    return html`<a href="${link.href}">${link.text}</a>`;
}