import { html } from "lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType.ts";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';

export const renderStatusCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    // @ts-ignore
    const status = item[column.path]
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