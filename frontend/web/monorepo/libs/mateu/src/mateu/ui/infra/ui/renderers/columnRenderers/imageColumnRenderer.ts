import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

export const renderImageCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                _stereotype: string,
                                metadata: GridColumn
) => {
    if (type == 'string') {
        // @ts-ignore
        const src = item[column.path]
        const style = 'max-height: 40px; ' + (metadata.style??'')
        return html`<img src="${src}" style="${style}">`;
    }
    // @ts-ignore
    const img = item[column.path]
    return html`<img src="${img.src}" style="${metadata.style??''}">`;
}