import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

export const renderIconCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                type: string,
                                _stereotype: string
) => {
    const icons = item[column.path!]
    if (type == 'string') {
        return icons.split(',').map((name: any) => icon(name, 'width: 16px;'));
    }
    return icons.split(',').map((entry: any) => icon(entry.icon, 'width: 16px;'));
}
