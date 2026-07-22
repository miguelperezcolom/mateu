import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export const renderHtmlCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                _type: string,
                                _stereotype: string
) => {
    const h = item[column.path!]
    return html`${unsafeHTML(h)}`;
}