import type FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts'

/**
 * In-memory evaluation of a listing's declared filters over rows fetched from an external endpoint.
 *
 * A server-driven listing has `CrudStore.find` to answer a search; a listing whose rows come from
 * somebody else's REST endpoint has nobody to ask, so the conditions the filter bar collects have to
 * be applied here or the bar is decoration. The semantics deliberately mirror the server's default
 * (`CrudStore.find`): strings match by case-insensitive containment, everything else by equality,
 * ranges are inclusive, and a multi-select is an IN.
 *
 * The state keys are the filter bar's contract, not an invention of this module: `<fieldId>` for a
 * plain value, `<fieldId>_from`/`<fieldId>_to` for a range, and a multi-select that is an array on a
 * live client but a comma-joined string once restored from the URL.
 *
 * Nothing here is specific to a design system or to how the rows were fetched, so proxied and direct
 * listings filter identically.
 */

/** A filter with no value set imposes no condition — that is what makes the bar additive. */
const blank = (value: unknown): boolean =>
    value === undefined || value === null || value === '' || (typeof value === 'number' && Number.isNaN(value))

const isRange = (field: FormField): boolean =>
    field.stereotype === 'dateRange' || field.stereotype === 'numberRange'

const isMulti = (field: FormField): boolean => field.stereotype === 'multiSelect'

const isBoolean = (field: FormField): boolean =>
    field.dataType === 'boolean' || field.dataType === 'bool'
    || field.stereotype === 'checkbox' || field.stereotype === 'toggle'

/** Array on a live client, comma-joined string after a URL restore — the filter bar writes both. */
const multiValues = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw.map(String)
    if (typeof raw === 'string' && raw !== '') return raw.split(',').map(v => v.trim()).filter(v => v)
    return []
}

/**
 * Compare within a range. Which comparison applies is decided by the FILTER, not by the cell: a
 * `numberRange` compares numerically and a cell that is not a number falls outside every range —
 * SWAPI's `height` is `"172"` for Luke and `"unknown"` for R2-D2, and letting the cell decide made
 * `"unknown"` pass a `>= 0` range as text. A `dateRange` compares as text, which is exactly right
 * for ISO-8601.
 */
const withinRange = (cell: unknown, from: unknown, to: unknown, numeric: boolean): boolean => {
    if (numeric) {
        const value = Number(cell)
        if (cell === '' || cell == null || Number.isNaN(value)) return false
        if (!blank(from) && value < Number(from)) return false
        if (!blank(to) && value > Number(to)) return false
        return true
    }
    const text = cell == null ? '' : String(cell)
    if (text === '') return false
    if (!blank(from) && text < String(from)) return false
    if (!blank(to) && text > String(to)) return false
    return true
}

/** Does one row satisfy one declared filter, given the current filter state? */
const matchesFilter = (row: Record<string, unknown>, field: FormField, state: Record<string, any>): boolean => {
    const id = field.fieldId
    if (!id) return true
    const cell = row[id]

    if (isRange(field)) {
        const from = state[`${id}_from`]
        const to = state[`${id}_to`]
        if (blank(from) && blank(to)) return true
        return withinRange(cell, from, to, field.stereotype === 'numberRange')
    }

    if (isMulti(field)) {
        const wanted = multiValues(state[id])
        if (wanted.length === 0) return true
        return wanted.includes(String(cell ?? ''))
    }

    const value = state[id]
    if (blank(value)) return true

    if (isBoolean(field)) {
        const wanted = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true'
        const actual = typeof cell === 'boolean' ? cell : String(cell ?? '').toLowerCase() === 'true'
        return wanted === actual
    }

    // An option list is a pick, not a prefix: "male" must not also match "female".
    if ((field.options?.length ?? 0) > 0) return String(cell ?? '') === String(value)

    return String(cell ?? '').toLowerCase().includes(String(value).toLowerCase())
}

/**
 * Reduce fetched rows by the free-text search and every declared filter. `columnIds` is what the
 * free-text search scans — the same columns the user can see, so a hit is always visible in the
 * result.
 */
export function filterExternalRows(
    rows: Record<string, unknown>[],
    columnIds: string[],
    filters: FormField[] | undefined,
    state: Record<string, any>,
): Record<string, unknown>[] {
    const searchText = String(state?.searchText ?? '').trim().toLowerCase()
    const declared = (filters ?? []).filter(f => f?.fieldId)
    if (searchText === '' && declared.length === 0) return rows
    return rows.filter(row => {
        if (searchText !== '' && !columnIds.some(id => String(row[id] ?? '').toLowerCase().includes(searchText))) {
            return false
        }
        return declared.every(field => matchesFilter(row, field, state ?? {}))
    })
}
