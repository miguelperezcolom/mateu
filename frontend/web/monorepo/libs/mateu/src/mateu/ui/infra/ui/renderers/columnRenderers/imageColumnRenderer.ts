import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

export const renderImageCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                _stereotype: string,
                                metadata: GridColumn
) => {
    if (type == 'string') {
        const src = item[column.path!]
        const style = 'max-height: 40px; ' + (metadata.style??'')
        return html`<img src="${src}" style="${style}">`;
    }
    const img = item[column.path!]
    return html`<img src="${img.src}" style="${metadata.style??''}">`;
}