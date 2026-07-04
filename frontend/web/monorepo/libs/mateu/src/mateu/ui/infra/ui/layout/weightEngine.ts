import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";

export const PX_PER_UNIT = 76

export type ResolvedGridLayout = 'table' | 'list' | 'cards' | 'masterDetail' | 'tree'
export type ResolvedFiltersLayout = 'inline' | 'popover' | 'drawer' | 'dialog'

/** Weight table (1u ≈ 76px) — mirrors WeightEstimator.base() on the Java side. */
export function columnWeight(col: GridColumn): number {
    if (col.weight != null) return col.weight
    const s = col.stereotype ?? ''
    if (s === 'icon') return 1.0
    if (s === 'image') return 4.0
    if (s === 'html' || s === 'richText' || s === 'markdown' || s === 'textarea') return 5.0
    if (s === 'link') return 2.5
    if (s === 'combobox' || s === 'select') return 2.0
    const t = col.dataType ?? ''
    if (t === 'bool') return 1.0
    if (t === 'status' || t === 'integer') return 1.5
    if (t === 'number' || t === 'date' || t === 'money') return 2.0
    if (t === 'dateTime' || t === 'dateRange') return 2.5
    return 3.0
}

/** Selects column-display layout given columns and available container width in px. */
export function selectColumnLayout(cols: GridColumn[], availableWidthPx: number): ResolvedGridLayout {
    if (cols.length === 0) return 'table'

    const totalWeight = cols.reduce((s, c) => s + columnWeight(c), 0)
    const units = availableWidthPx / PX_PER_UNIT
    const r = totalWeight / units

    if (r <= 1.0) return 'table'

    const compact = cols.filter(c => c.identifier || (c.priority ?? Number.MAX_SAFE_INTEGER) <= 2)
    const compactWeight = compact.reduce((s, c) => s + columnWeight(c), 0)

    if (r > 1.6 || cols.length > 10) return 'masterDetail'

    if (compact.length > 0 && compactWeight <= 8.0) return 'list'

    const hasImageOrHtml = cols.some(c => c.stereotype === 'image' || c.stereotype === 'html')
    if (hasImageOrHtml || (compact.length === 0 && cols.length >= 4 && cols.length <= 8)) return 'cards'

    return 'masterDetail'
}

/** Returns columns to show in compact (list/masterDetail) mode, sorted by priority. */
export function compactColumns(cols: GridColumn[]): GridColumn[] {
    return cols
        .filter(c => c.identifier || (c.priority ?? Number.MAX_SAFE_INTEGER) <= 2)
        .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
}

// ── Filter layout ──────────────────────────────────────────────────────────────

function filterWeight(field: FormField): number {
    const t = (field as any).dataType ?? ''
    const s = (field as any).stereotype ?? ''
    let base: number
    if (s === 'combobox' || s === 'select') base = 2.0
    else if (t === 'bool') base = 1.0
    else if (t === 'status' || t === 'integer') base = 1.5
    else if (t === 'number' || t === 'date' || t === 'money') base = 2.0
    else if (t === 'dateTime') base = 2.5
    else base = 3.0
    if (t === 'dateRange') return 2.5 * 1.5
    if (s === 'listBox') return base * 1.5
    return base
}

/** Resolves 'auto' filtersLayout to a concrete value. */
export function selectFiltersLayout(
    filters: FormField[],
): ResolvedFiltersLayout {
    if (filters.length === 0) return 'inline'
    const total = filters.reduce((s, f) => s + filterWeight(f), 0)
    if (total <= 4.0) return 'inline'
    if (filters.length >= 6 || total > 8.0) return 'drawer'
    return 'popover'
}
