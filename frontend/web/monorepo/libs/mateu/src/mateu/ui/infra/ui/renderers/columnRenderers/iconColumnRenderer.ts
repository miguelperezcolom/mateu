import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderIconCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    if (type == 'string') {
        // @ts-ignore
        const icons = item[column.path]
        return icons.split(',').map((icon: any) => html`<vaadin-icon icon="${icon}" style="width: 16px;"></vaadin-icon>`);
    }
    // @ts-ignore
    const icons = item[column.path]
    return icons.split(',').map((icon: any) => html`<vaadin-icon icon="${icon.icon}" style="width: 16px;"></vaadin-icon>`);
}