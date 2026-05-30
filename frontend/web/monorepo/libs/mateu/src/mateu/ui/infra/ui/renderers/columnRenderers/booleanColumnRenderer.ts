import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderBooleanCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    const value = item[column.path!]
    //const icon = value?'vaadin:check-circle':'vaadin:close-circle'
    //const icon = value?'vaadin:check-square-o':'vaadin:minus-square-o'
    const icon = value?'vaadin:check':'vaadin:minus'
    //const color = value?'hsl(145, 72%, 30%)':'hsl(3, 85%, 48%)'
    const color = 'var(--lumo-body-text-color)'
    return html`<vaadin-icon 
                    icon="${icon}"
                    style="height: 16px; width: 16px; color: ${color};"
            ></vaadin-icon>`
}