import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";

export const renderIconCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                _stereotype: string
) => {
    if (type == 'string') {
        const icons = item[column.path!]
        return icons.split(',').map((icon: any) => html`<vaadin-icon icon="${icon}" style="width: 16px;"></vaadin-icon>`);
    }
    const icons = item[column.path!]
    return icons.split(',').map((icon: any) => html`<vaadin-icon icon="${icon.icon}" style="width: 16px;"></vaadin-icon>`);
}