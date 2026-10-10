/**
 * The tone of a listing row from its @RowStatus field (`Crud.rowStatusField` on the wire): the
 * value names the tone — success, warning, danger (also error), info, neutral; an enum travels as
 * its constant name; a Status value as {type}. Anything else: no tone. Pure; tested.
 */
export type RowTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONES: Record<string, RowTone> = {
    success: 'success', warning: 'warning', danger: 'danger', error: 'danger',
    info: 'info', neutral: 'neutral', none: 'neutral',
}

export const rowToneOf = (row: Record<string, unknown> | undefined, field: string | undefined): RowTone | null => {
    if (!row || !field) return null
    let value: unknown = row[field]
    if (value && typeof value === 'object') value = (value as { type?: unknown; value?: unknown }).type ?? (value as { value?: unknown }).value
    if (value == null) return null
    return TONES[String(value).toLowerCase()] ?? null
}
