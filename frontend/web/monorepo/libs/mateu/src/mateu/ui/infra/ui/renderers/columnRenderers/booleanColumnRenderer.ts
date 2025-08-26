import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderBooleanCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    // @ts-ignore
    const value = item[column.path]
    const icon = value?'vaadin:check-circle':'vaadin:close-circle'
    const color = value?'hsl(145, 72%, 30%)':'hsl(3, 85%, 48%)'
    return html`<vaadin-icon 
                    icon="${icon}"
                    style="height: 16px; width: 16px; color: ${color};"
            ></vaadin-icon>`
}