import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { safeHtml } from "@infra/ui/safeHtml.ts";

export const renderHtmlCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                _type: string,
                                _stereotype: string
) => {
    const h = item[column.path!]
    return html`${safeHtml(h)}`;
}