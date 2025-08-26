import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderLinkCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    if (type == 'string') {
        // @ts-ignore
        const href = item[column.path]
        return html`<a href="${href}">${href}</a>`;
    }
    // @ts-ignore
    const link = item[column.path]
    return html`<a href="${link.href}">${link.text}</a>`;
}