import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderHtmlCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    const h = item[column.path!]
    return html`${unsafeHTML(h)}`;
}