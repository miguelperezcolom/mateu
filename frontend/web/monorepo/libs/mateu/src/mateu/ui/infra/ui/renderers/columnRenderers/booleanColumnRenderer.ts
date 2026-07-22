import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

export const renderBooleanCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    const value = item[column.path!]
    const iconName = value ? 'vaadin:check' : 'vaadin:minus'
    const color = 'var(--lumo-body-text-color)'
    return icon(iconName, `height: 16px; width: 16px; color: ${color};`)
}
