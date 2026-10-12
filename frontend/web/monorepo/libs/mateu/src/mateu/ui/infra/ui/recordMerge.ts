import type RecordMerge from '@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge'
import type { MergeField } from '@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge'

/**
 * The pure model of a RecordMerge (compare and merge), shared by the web element and tested without
 * a DOM: the picks start from what the server chose, a pick is a record id or CUSTOM (a typed
 * value), and the merge sends `_merged` (fieldId → value) + `_choices` (fieldId → record id |
 * "custom") next to the component's own parameters.
 */
export const CUSTOM = 'custom'

export type MergePicks = Record<string, string>

export const valueText = (value: unknown): string =>
    value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)

/** The picks to begin with: the server's `chosen`, else the first record with a value. */
export const initialPicks = (merge: RecordMerge): MergePicks => {
    const picks: MergePicks = {}
    const ids = (merge.records ?? []).map((r) => r.id)
    for (const field of merge.fields ?? []) {
        let chosen = field.chosen && ids.includes(field.chosen) ? field.chosen : undefined
        if (!chosen) {
            const i = (field.values ?? []).findIndex((v) => valueText(v).trim() !== '')
            chosen = ids[i >= 0 ? i : 0]
        }
        if (chosen) picks[field.fieldId] = chosen
    }
    return picks
}

/** The value a row ends up with, given its pick. */
export const mergedValue = (merge: RecordMerge, field: MergeField, picks: MergePicks, custom: Record<string, string>): unknown => {
    const pick = picks[field.fieldId]
    if (pick === CUSTOM) return custom[field.fieldId] ?? ''
    const index = (merge.records ?? []).findIndex((r) => r.id === pick)
    return index >= 0 ? (field.values ?? [])[index] ?? null : null
}

/** The merge action's parameters: the component's own, `_merged` and `_choices`. */
export const mergeParameters = (merge: RecordMerge, picks: MergePicks, custom: Record<string, string>): Record<string, unknown> => {
    const merged: Record<string, unknown> = {}
    const choices: Record<string, string> = {}
    for (const field of merge.fields ?? []) {
        merged[field.fieldId] = mergedValue(merge, field, picks, custom)
        choices[field.fieldId] = picks[field.fieldId] ?? ''
    }
    return { ...(merge.parameters ?? {}), _merged: merged, _choices: choices }
}

/** The rows to show: all, or only those whose values differ. */
export const visibleFields = (merge: RecordMerge, differencesOnly: boolean): MergeField[] =>
    (merge.fields ?? []).filter((f) => !differencesOnly || f.differs)

/** The numbers of the summary line: fields, how many differ, how many were typed by hand. */
export const mergeSummary = (merge: RecordMerge, picks: MergePicks) => ({
    fields: (merge.fields ?? []).length,
    differ: (merge.fields ?? []).filter((f) => f.differs).length,
    custom: Object.values(picks).filter((p) => p === CUSTOM).length,
})
