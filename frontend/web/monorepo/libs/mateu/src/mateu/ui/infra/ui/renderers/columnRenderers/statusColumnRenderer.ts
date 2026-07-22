import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType.ts";

export const renderStatusCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    const status = item[column.path!]
    return status?html`<span theme="badge pill ${getThemeForBadgetType(status.type)}">${status.message}</span>`:html``
}

export const getThemeForBadgetType = (type: StatusType): string => {
    switch (type) {
        case StatusType.SUCCESS: return 'success';
        case StatusType.WARNING: return 'warning';
        case StatusType.DANGER: return 'error';
        case StatusType.NONE: return 'contrast';
    }
    return '';
}