import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderImageCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    if (type == 'string') {
        // @ts-ignore
        const src = item[column.path]
        return html`<img src="${src}">`;
    }
    // @ts-ignore
    const img = item[column.path]
    return html`<img src="${img.src}">`;
}