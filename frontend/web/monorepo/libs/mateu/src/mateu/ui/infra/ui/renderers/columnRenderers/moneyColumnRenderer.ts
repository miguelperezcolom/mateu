import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { formatMoneyValue } from "@infra/ui/moneyFormat.ts";

/**
 * A money cell: an Amount in its own locale/currency, a number declared money with two decimals in
 * the UI's locale (see moneyFormat). Anything else is shown as it came.
 */
export const renderMoneyCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                stereotype: string
) => {
    const amount = item[column.path!]
    const formatted = ('money' == type || 'money' == stereotype) && amount !== null && amount !== undefined && amount !== ''
        ? formatMoneyValue(amount)
        : amount
    return html`${formatted}`;
}
