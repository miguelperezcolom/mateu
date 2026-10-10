import { html } from "lit";
import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType.ts";

export const renderStatusCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                 tones?: Record<string, string> | null,
                                 valueLabels?: Record<string, string> | null) => {
    const status = toStatus(item[column.path!], tones, valueLabels)
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
export const toStatus = (value: unknown, tones?: Record<string, string> | null,
                         valueLabels?: Record<string, string> | null): { type: StatusType, message: string } | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    if (typeof value === 'object') return value as { type: StatusType, message: string }
    const raw = String(value)
    // the tone is picked by the RAW value; the badge reads as the column's label for it (an enum's)
    const status = toRawStatus(raw, tones)
    const label = valueLabels ? valueLabels[raw] : undefined
    return label !== undefined && label !== null ? { ...status, message: label } : status
}

const toRawStatus = (message: string, tones?: Record<string, string> | null): { type: StatusType, message: string } => {
    // A declared tone for this VALUE (a field type's `tones: {OPEN: warning}`) wins over the word.
    const declared = tones ? (tones[message] ?? tones[message.trim().toUpperCase()]) : undefined
    const toned = declared ? statusTypeOfTone(declared) : undefined
    if (toned) return { type: toned, message }
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
/** A tone name (`success | warning | danger | error | info | neutral`, like @RowStatus) as a status. */
export const statusTypeOfTone = (tone: string): StatusType | undefined => {
    switch (String(tone).trim().toLowerCase()) {
        case 'success': return StatusType.SUCCESS
        case 'warning': return StatusType.WARNING
        case 'danger': case 'error': return StatusType.DANGER
        case 'info': return StatusType.INFO
        case 'neutral': case 'none': return StatusType.NONE
    }
    return undefined
}
