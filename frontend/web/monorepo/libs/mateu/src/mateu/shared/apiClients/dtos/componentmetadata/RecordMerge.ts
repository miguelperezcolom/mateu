import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

/** A column of a RecordMerge: one of the records compared. */
export interface MergeRecord {
    id: string
    label: string
    caption?: string | null
}

/** A row of a RecordMerge: one value per record (records' order). */
export interface MergeField {
    fieldId: string
    label: string
    values: unknown[]
    /** the record picked to begin with (the server always fills it) */
    chosen?: string | null
    /** also offers a free-text value */
    editable?: boolean
    /** the values are not all the same */
    differs?: boolean
}

/** Compare and merge: records side by side, a pick per field, then the merge action. */
export default interface RecordMerge extends ComponentMetadata {
    title?: string | null
    records: MergeRecord[]
    fields: MergeField[]
    mergeActionId?: string | null
    mergeLabel?: string | null
    parameters?: Record<string, unknown> | null
    differencesOnly?: boolean
}
