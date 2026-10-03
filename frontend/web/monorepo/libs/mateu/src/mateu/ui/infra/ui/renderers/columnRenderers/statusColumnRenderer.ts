import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType.ts";

export const renderStatusCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn) => {
    const status = toStatus(item[column.path!])
    return status?html`<span theme="badge pill ${getThemeForBadgetType(status.type)}">${status.message}</span>`:html``
}

// Lifecycle words a REST API commonly answers with, by the badge they read as. Upper-cased,
// separators folded to `_`, so `Available`, `in-progress` and `IN_PROGRESS` all land.
const SUCCESS_WORDS = new Set(['AVAILABLE', 'ACTIVE', 'RUNNING', 'SUCCEEDED', 'SUCCESS', 'OK', 'ENABLED',
    'READY', 'HEALTHY', 'COMPLETED', 'DONE', 'ATTACHED', 'UP'])
const WARNING_WORDS = new Set(['PROVISIONING', 'UPDATING', 'PENDING', 'STARTING', 'STOPPING',
    'IN_PROGRESS', 'TERMINATING', 'DELETING', 'CREATING', 'MOVING', 'WAITING', 'ACCEPTED', 'WARNING',
    'DEGRADED', 'RESTORING', 'SCALING'])
const DANGER_WORDS = new Set(['FAILED', 'TERMINATED', 'ERROR', 'DELETED', 'STOPPED', 'DISABLED',
    'UNHEALTHY', 'DOWN', 'CANCELED', 'CANCELLED', 'REJECTED', 'INACTIVE'])

/**
 * A status cell's value as `{type, message}`. A Mateu backend sends that shape; a REST API sends a
 * plain word (`"AVAILABLE"`), which used to paint an EMPTY badge — the static-UI case, where nobody
 * maps the API's response. A plain word is shown as is, with the badge its usual meaning gives it.
 */
export const toStatus = (value: unknown): { type: StatusType, message: string } | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    if (typeof value === 'object') return value as { type: StatusType, message: string }
    const message = String(value)
    const word = message.trim().toUpperCase().replace(/[\s-]+/g, '_')
    const type = SUCCESS_WORDS.has(word) ? StatusType.SUCCESS
        : WARNING_WORDS.has(word) ? StatusType.WARNING
        : DANGER_WORDS.has(word) ? StatusType.DANGER
        : StatusType.NONE
    return { type, message }
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