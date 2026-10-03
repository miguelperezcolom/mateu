/**
 * A MULTI-valued @Searchable field (a List, Set or array of ids): what the renderers draw and what
 * they write back. The server sends the ids in state[field] and, in data, `field-labels`
 * ({id → label}) for the chips and `field-label` (the labels joined) for the read-only text. A
 * pick in the selector modal answers the merged ids (the server merges, deduplicates and keeps
 * order); removing a chip is client-side only.
 *
 * Shared by the Vaadin renderer; the Redwood core (apps/redwood/poc/reduceContexts.mjs) mirrors it.
 */

export interface SearchableChip {
    id: unknown
    label: string
}

/** Whether a field is a multi-valued @Searchable. */
export const isSearchableMulti = (field: { stereotype?: string, dataType?: string } | undefined): boolean =>
    !!field && field.stereotype == 'searchable' && field.dataType == 'array'

/** The field's own id: a read-only view travels as `<field>-label` (its text, in data). */
export const searchableBaseFieldId = (fieldId: string): string =>
    fieldId.endsWith('-label') ? fieldId.substring(0, fieldId.length - '-label'.length) : fieldId

/** The ids the field holds, whatever shape they arrived in (array, Set, a single id, nothing). */
export const searchableIds = (value: unknown): unknown[] => {
    if (value == null || value === '') return []
    if (Array.isArray(value)) return value.filter(id => id != null && id !== '')
    if (value instanceof Set) return [...value].filter(id => id != null && id !== '')
    return [value]
}

/** One chip per id, labelled from the `{id → label}` map (an id with no label shows as itself). */
export const searchableChips = (ids: unknown[], labels: unknown): SearchableChip[] => {
    const map = labels && typeof labels === 'object' ? labels as Record<string, unknown> : {}
    return ids.map(id => {
        const label = map[String(id)]
        return { id, label: label != null && label !== '' ? String(label) : String(id) }
    })
}

/** The ids without `id` (compared as text: a JSON number and its string are the same id). */
export const removeSearchableId = (ids: unknown[], id: unknown): unknown[] =>
    ids.filter(other => String(other) !== String(id))
