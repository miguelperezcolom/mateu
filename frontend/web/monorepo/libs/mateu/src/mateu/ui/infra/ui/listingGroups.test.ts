import { describe, expect, it } from 'vitest'
import {
    GroupRow,
    buildAggregateFooters,
    formatAggregateValue,
    groupLabelColumnId,
    groupRowCellText,
    interleaveGroupRows,
    isGroupRow,
} from './listingGroups'

const groups = [
    { value: 'A', count: 12, aggregates: { amount: 30.5 } },
    { value: 'B', count: 3, aggregates: { amount: 5 } },
]

const rows = [
    { _rowNumber: 0, cat: 'A', amount: 10 },
    { _rowNumber: 1, cat: 'A', amount: 20.5 },
    { _rowNumber: 2, cat: 'B', amount: 5 },
]

describe('interleaveGroupRows', () => {
    it('inserts a marker row before each contiguous run of the groupBy value', () => {
        const result = interleaveGroupRows(rows, 'cat', groups)
        expect(result).toHaveLength(5)
        expect(isGroupRow(result[0])).toBe(true)
        expect((result[0] as GroupRow).__mateuGroup).toEqual(groups[0])
        expect(result[1]).toBe(rows[0])
        expect(result[2]).toBe(rows[1])
        expect(isGroupRow(result[3])).toBe(true)
        expect((result[3] as GroupRow).__mateuGroup).toEqual(groups[1])
        expect(result[4]).toBe(rows[2])
    })

    it('stamps marker rows with the groupBy id and a synthetic _rowNumber distinct from data rows', () => {
        const result = interleaveGroupRows(rows, 'cat', groups)
        const markers = result.filter(isGroupRow)
        expect(markers.map(m => m.__mateuGroupBy)).toEqual(['cat', 'cat'])
        const dataRowNumbers = rows.map(r => String(r._rowNumber))
        markers.forEach(m => {
            expect(dataRowNumbers).not.toContain(m._rowNumber)
        })
        expect(new Set(markers.map(m => m._rowNumber)).size).toBe(2)
    })

    it('matches group summaries by value across types (numeric row value vs string group value)', () => {
        const numericRows = [
            { year: 2024, amount: 1 },
            { year: 2025, amount: 2 },
        ]
        const yearGroups = [
            { value: '2024', count: 1, aggregates: { amount: 1 } },
            { value: '2025', count: 1, aggregates: { amount: 2 } },
        ]
        const result = interleaveGroupRows(numericRows, 'year', yearGroups)
        expect(result).toHaveLength(4)
        expect((result[0] as GroupRow).__mateuGroup).toEqual(yearGroups[0])
        expect((result[2] as GroupRow).__mateuGroup).toEqual(yearGroups[1])
    })

    it('synthesizes a summary (contiguous run count, no aggregates) when no group entry matches', () => {
        const result = interleaveGroupRows(rows, 'cat', [{ value: 'A', count: 12, aggregates: {} }])
        const bMarker = result[3] as GroupRow
        expect(isGroupRow(bMarker)).toBe(true)
        expect(bMarker.__mateuGroup).toEqual({ value: 'B', count: 1, aggregates: {} })
    })

    it('passes rows through unchanged when there is no groupBy', () => {
        expect(interleaveGroupRows(rows, undefined, groups)).toEqual(rows)
        expect(interleaveGroupRows(rows, '', groups)).toEqual(rows)
    })

    it('passes rows through unchanged when groups are empty or missing', () => {
        expect(interleaveGroupRows(rows, 'cat', [])).toEqual(rows)
        expect(interleaveGroupRows(rows, 'cat', undefined)).toEqual(rows)
    })

    it('handles empty and missing rows', () => {
        expect(interleaveGroupRows([], 'cat', groups)).toEqual([])
        expect(interleaveGroupRows(undefined, 'cat', groups)).toEqual([])
    })

    it('groups null/undefined values under the same run', () => {
        const holed = [{ cat: null, amount: 1 }, { cat: undefined, amount: 2 }]
        const result = interleaveGroupRows(holed, 'cat', groups)
        expect(result).toHaveLength(3)
        expect((result[0] as GroupRow).__mateuGroup).toEqual({ value: '', count: 2, aggregates: {} })
    })
})

describe('isGroupRow', () => {
    it('only recognizes marker rows', () => {
        expect(isGroupRow({ __mateuGroup: groups[0], __mateuGroupBy: 'cat', _rowNumber: '__mateuGroup:0:A' })).toBe(true)
        expect(isGroupRow(rows[0])).toBe(false)
        expect(isGroupRow(null)).toBe(false)
        expect(isGroupRow(undefined)).toBe(false)
        expect(isGroupRow('x')).toBe(false)
    })
})

describe('groupLabelColumnId', () => {
    it('prefers the groupBy column when visible, else the first column', () => {
        expect(groupLabelColumnId('cat', ['name', 'cat', 'amount'])).toBe('cat')
        expect(groupLabelColumnId('hidden', ['name', 'amount'])).toBe('name')
        expect(groupLabelColumnId(undefined, ['name', 'amount'])).toBe('name')
    })
})

describe('groupRowCellText', () => {
    const marker: GroupRow = { __mateuGroup: groups[0], __mateuGroupBy: 'cat', _rowNumber: '__mateuGroup:0:A' }

    it('shows the group value + count in the label column', () => {
        expect(groupRowCellText(marker, { id: 'cat' }, 'cat')).toBe('A (12)')
    })

    it('shows the formatted group aggregate in aggregated columns and nothing elsewhere', () => {
        expect(groupRowCellText(marker, { id: 'amount', dataType: 'money', aggregate: 'sum' }, 'cat')).toBe('30,50')
        expect(groupRowCellText(marker, { id: 'name' }, 'cat')).toBe('')
    })

    it('shows nothing for an aggregated column missing from the group aggregates', () => {
        expect(groupRowCellText(marker, { id: 'qty', aggregate: 'sum' }, 'cat')).toBe('')
    })
})

describe('formatAggregateValue', () => {
    it('formats money like the money cells (de-DE, 2 decimals)', () => {
        expect(formatAggregateValue(1234.5, { dataType: 'money', aggregate: 'sum' })).toBe('1.234,50')
        expect(formatAggregateValue(1234.5, { stereotype: 'money', aggregate: 'avg' })).toBe('1.234,50')
    })

    it('formats count as an integer', () => {
        expect(formatAggregateValue(7.0, { aggregate: 'count' })).toBe('7')
    })

    it('formats other values as locale numbers with max 2 decimals', () => {
        expect(formatAggregateValue(1234.567, { aggregate: 'sum' }))
            .toBe(new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(1234.567))
    })

    it('renders empty for null/undefined', () => {
        expect(formatAggregateValue(null, { aggregate: 'sum' })).toBe('')
        expect(formatAggregateValue(undefined, { aggregate: 'sum' })).toBe('')
    })
})

describe('buildAggregateFooters', () => {
    const cols = [
        { id: 'cat' },
        { id: 'name' },
        { id: 'amount', dataType: 'money', aggregate: 'sum' },
        { id: 'qty', aggregate: 'count' },
    ]
    const listing = {
        page: { totalElements: 15, pageSize: 10, pageNumber: 0, content: [] },
        aggregates: { amount: 1234.5, qty: 15 },
        groups,
    }

    it('formats each aggregated column and labels the first column "Total"', () => {
        const footers = buildAggregateFooters(cols, listing, undefined)
        expect(footers).toEqual({ cat: 'Total', amount: '1.234,50', qty: '15' })
    })

    it('shows the row count when the first column is the group column', () => {
        const footers = buildAggregateFooters(cols, listing, 'cat')
        expect(footers!.cat).toBe('Total (15)')
    })

    it('keeps "Total" when grouped by a non-first column', () => {
        const footers = buildAggregateFooters(cols, listing, 'name')
        expect(footers!.cat).toBe('Total')
    })

    it('returns undefined when the data carries no aggregates or no column aggregates', () => {
        expect(buildAggregateFooters(cols, {}, undefined)).toBeUndefined()
        expect(buildAggregateFooters(cols, undefined, undefined)).toBeUndefined()
        expect(buildAggregateFooters([{ id: 'a' }], listing, undefined)).toBeUndefined()
    })
})
