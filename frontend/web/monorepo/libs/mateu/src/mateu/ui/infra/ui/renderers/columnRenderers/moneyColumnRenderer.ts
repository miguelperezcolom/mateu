import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderMoneyCell = (item: any,
                                 model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    // @ts-ignore
    const amount = item[column.path]
    let formatted = amount
    console.log('money', type, stereotype)
    if ('money' == type) {
        formatted = new Intl.NumberFormat(amount.locale, { style: "currency", currency: amount.currency }).format(
            amount.value,
        )
    }
    if ('money' == stereotype) {
        formatted = new Intl.NumberFormat("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,

        }).format(
            amount,
        )
    }
    return html`${formatted}`;
}