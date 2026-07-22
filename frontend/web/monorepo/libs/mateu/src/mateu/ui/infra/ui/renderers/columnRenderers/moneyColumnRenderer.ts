import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";

export const renderMoneyCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    const amount = item[column.path!]
    let formatted = amount
    if ('money' == type && amount && amount.locale && amount.currency) {
        formatted = new Intl.NumberFormat(amount.locale, { style: "currency", currency: amount.currency }).format(
            amount.value,
        )
    } else if ('money' == stereotype) {
        formatted = new Intl.NumberFormat("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,

        }).format(
            amount,
        )
    }
    return html`${formatted}`;
}