import { GroupSummary, ListingData } from "@mateu/shared/apiClients/dtos/ListingData";

/**
 * LISTING AGGREGATES + ROW GROUPING — shared, renderer-agnostic logic.
 *
 * The wire contract: crud metadata carries `groupBy` (the row field id the listing is
 * grouped by; rows arrive pre-sorted so groups are contiguous) and grid columns may carry
 * `aggregate` ('sum'|'avg'|'min'|'max'|'count'); the search result (`data[crudId]`, see
 * ListingData) carries `aggregates` (whole-filtered-set totals per aggregated column) and
 * `groups` (per-group summaries, in listing order).
 *
 * Every renderer reuses the same walk (interleaveGroupRows) and the same cell/footer text
 * computation (groupRowCellText / buildAggregateFooters); each renderer only styles its own
 * group/totals rows with its design system's idiom.
 */

/** The minimal column shape the aggregate helpers need (GridColumn satisfies it). */
export interface AggregatableColumn {
    id: string
    dataType?: string
    stereotype?: string
    aggregate?: string
}

/**
 * Marker row interleaved between the data rows wherever a new group starts. Renderers must
 * treat these as presentation-only: never selectable, never clickable, never editable.
 */
export interface GroupRow {
    __mateuGroup: GroupSummary
    /** The field id the listing is grouped by (so cell renderers can find the label column). */
    __mateuGroupBy: string
    /** Synthetic row id, distinct from any data row's (grids key rows by _rowNumber). */
    _rowNumber: string
}

export const isGroupRow = (row: unknown): row is GroupRow =>
    !!row && typeof row === 'object' && '__mateuGroup' in (row as object)

const groupKey = (value: unknown): string => String(value ?? '')

/**
 * Walks the (pre-sorted) page rows and inserts a GroupRow marker each time the value of the
 * `groupBy` field changes. Markers are per-page and computed client-side, so pagination and
 * everything else stays untouched. Group summaries are matched by value (string-compared,
 * so a numeric row value matches the group's string value); a run with no matching summary
 * gets one synthesized from the page rows (count of the contiguous run, no aggregates).
 * No groupBy / no groups → the rows pass through unchanged.
 */
export const interleaveGroupRows = <T>(
    rows: T[] | undefined | null,
    groupBy: string | undefined | null,
    groups: GroupSummary[] | undefined | null,
): (T | GroupRow)[] => {
    const source = rows ?? []
    if (!groupBy || !groups || groups.length === 0) return source
    const result: (T | GroupRow)[] = []
    let lastKey: string | undefined
    let started = false
    source.forEach((row, index) => {
        const key = groupKey((row as Record<string, unknown>)?.[groupBy])
        if (!started || key !== lastKey) {
            const summary = groups.find(g => groupKey(g.value) === key)
                ?? {
                    value: key,
                    count: source.filter(r => groupKey((r as Record<string, unknown>)?.[groupBy]) === key).length,
                    aggregates: {},
                }
            result.push({ __mateuGroup: summary, __mateuGroupBy: groupBy, _rowNumber: `__mateuGroup:${index}:${key}` })
            started = true
            lastKey = key
        }
        result.push(row)
    })
    return result
}

/**
 * Formats an aggregate value like the matching cells do: money dataType/stereotype → the
 * money-cell format (de-DE, 2 decimals); count → integer; anything else → locale number
 * with max 2 decimals.
 */
export const formatAggregateValue = (
    value: number | null | undefined,
    column: Pick<AggregatableColumn, 'dataType' | 'stereotype' | 'aggregate'>,
): string => {
    if (value == null) return ''
    if (column.dataType === 'money' || column.stereotype === 'money') {
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    }
    if (column.aggregate === 'count') {
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value))
    }
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
}

/**
 * The column that shows the group label (`value (count)`): the groupBy column when visible,
 * else the first column.
 */
export const groupLabelColumnId = (
    groupBy: string | undefined | null,
    columnIds: (string | undefined)[],
): string | undefined =>
    groupBy && columnIds.includes(groupBy) ? groupBy : columnIds.find(id => !!id)

/**
 * Text of a group header row cell for the given column: the group value + `(count)` in the
 * label column, that group's formatted aggregate in each aggregated column, empty elsewhere.
 */
export const groupRowCellText = (
    row: GroupRow,
    column: AggregatableColumn,
    labelColumnId: string | undefined,
): string => {
    const group = row.__mateuGroup
    if (column.id === labelColumnId) return `${group.value} (${group.count})`
    if (column.aggregate) return formatAggregateValue(group.aggregates?.[column.id], column)
    return ''
}

/**
 * Footer texts per column id for the totals row pinned at the bottom of the table:
 * each aggregated column shows its formatted whole-filtered-set total; the first column
 * shows "Total" — or `Total (rowCount)` when the first column is the group column.
 * Returns undefined when there is nothing to total (no aggregates in the data, or no
 * aggregated column), meaning: render no totals row at all.
 */
export const buildAggregateFooters = (
    cols: AggregatableColumn[],
    listing: ListingData | undefined | null,
    groupBy: string | undefined | null,
): Record<string, string> | undefined => {
    const aggregates = listing?.aggregates
    if (!aggregates || !cols.some(c => c.aggregate)) return undefined
    const footers: Record<string, string> = {}
    cols.forEach(c => {
        if (c.aggregate && aggregates[c.id] != null) {
            footers[c.id] = formatAggregateValue(aggregates[c.id], c)
        }
    })
    const first = cols[0]
    if (first && footers[first.id] === undefined) {
        const totalRows = listing?.page?.totalElements
        footers[first.id] = groupBy && first.id === groupBy && totalRows != null
            ? `Total (${totalRows})`
            : 'Total'
    }
    return footers
}
