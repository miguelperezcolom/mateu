import { describe, expect, it } from 'vitest'
import {
    columnWeight,
    compactColumns,
    PX_PER_UNIT,
    railColumns,
    selectColumnLayout,
    selectFiltersLayout,
} from './weightEngine'
import GridColumn from '@mateu/shared/apiClients/dtos/componentmetadata/GridColumn'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts'

const col = (overrides: Partial<GridColumn> = {}): GridColumn =>
    ({ weight: null, ...overrides }) as GridColumn

const field = (overrides: Partial<FormField> = {}): FormField =>
    ({ ...overrides }) as FormField

describe('columnWeight', () => {
    it('uses the explicit weight when present', () => {
        expect(columnWeight(col({ weight: 7.5, stereotype: 'image' }))).toBe(7.5)
    })

    it('weighs by stereotype before dataType', () => {
        expect(columnWeight(col({ stereotype: 'icon', dataType: 'number' }))).toBe(1.0)
        expect(columnWeight(col({ stereotype: 'image' }))).toBe(4.0)
        expect(columnWeight(col({ stereotype: 'html' }))).toBe(5.0)
        expect(columnWeight(col({ stereotype: 'richText' }))).toBe(5.0)
        expect(columnWeight(col({ stereotype: 'markdown' }))).toBe(5.0)
        expect(columnWeight(col({ stereotype: 'textarea' }))).toBe(5.0)
        expect(columnWeight(col({ stereotype: 'link' }))).toBe(2.5)
        expect(columnWeight(col({ stereotype: 'combobox' }))).toBe(2.0)
        expect(columnWeight(col({ stereotype: 'select' }))).toBe(2.0)
    })

    it('weighs by dataType when there is no known stereotype', () => {
        expect(columnWeight(col({ dataType: 'bool' }))).toBe(1.0)
        expect(columnWeight(col({ dataType: 'status' }))).toBe(1.5)
        expect(columnWeight(col({ dataType: 'integer' }))).toBe(1.5)
        expect(columnWeight(col({ dataType: 'number' }))).toBe(2.0)
        expect(columnWeight(col({ dataType: 'date' }))).toBe(2.0)
        expect(columnWeight(col({ dataType: 'money' }))).toBe(2.0)
        expect(columnWeight(col({ dataType: 'dateTime' }))).toBe(2.5)
        expect(columnWeight(col({ dataType: 'dateRange' }))).toBe(2.5)
    })

    it('falls back to the default text weight', () => {
        expect(columnWeight(col())).toBe(3.0)
        expect(columnWeight(col({ dataType: 'string' }))).toBe(3.0)
    })
})

describe('selectColumnLayout', () => {
    it('returns table for no columns', () => {
        expect(selectColumnLayout([], 500)).toBe('table')
    })

    it('returns table when everything fits (ratio <= 1)', () => {
        // 4 text columns → 12 units → needs 12 * 76 = 912px
        const cols = [col(), col(), col(), col()]
        expect(selectColumnLayout(cols, 12 * PX_PER_UNIT)).toBe('table')
    })

    it('returns masterDetail when heavily overweight (ratio > 1.6)', () => {
        // 12 units in ~7 units of width → r ≈ 1.7
        const cols = [col(), col(), col(), col()]
        expect(selectColumnLayout(cols, 7 * PX_PER_UNIT)).toBe('masterDetail')
    })

    it('returns masterDetail when there are more than 10 columns, however light', () => {
        const cols = Array.from({ length: 11 }, () => col({ dataType: 'bool' })) // 11 units
        // slightly overweight so it doesn't fit as a table
        expect(selectColumnLayout(cols, 10 * PX_PER_UNIT)).toBe('masterDetail')
    })

    it('returns list when a light compact subset exists (identifier/priority ≤ 2)', () => {
        const cols = [
            col({ identifier: true }),                    // 3.0, compact
            col({ priority: 1, dataType: 'money' }),      // 2.0, compact
            col({ priority: 5 }),                         // 3.0
            col({ priority: 5 }),                         // 3.0
        ]
        // total 11 units; width for r ≈ 1.29 (between 1 and 1.6)
        expect(selectColumnLayout(cols, 8.5 * PX_PER_UNIT)).toBe('list')
    })

    it('returns cards when there is no compact subset but an image column', () => {
        const cols = [
            col({ stereotype: 'image' }), // 4.0
            col({ priority: 9 }),         // 3.0
            col({ priority: 9 }),         // 3.0
        ]
        // total 10 units; r ≈ 1.25
        expect(selectColumnLayout(cols, 8 * PX_PER_UNIT)).toBe('cards')
    })

    it('returns cards for 4-8 plain columns without compact subset', () => {
        const cols = [col({ priority: 9 }), col({ priority: 9 }), col({ priority: 9 }), col({ priority: 9 })]
        // total 12 units; r ≈ 1.26
        expect(selectColumnLayout(cols, 9.5 * PX_PER_UNIT)).toBe('cards')
    })

    it('falls back to masterDetail when nothing else applies', () => {
        // 3 plain columns, no compact subset, no image/html → not list, not cards
        const cols = [col({ priority: 9 }), col({ priority: 9 }), col({ priority: 9 })]
        // total 9 units; r ≈ 1.29
        expect(selectColumnLayout(cols, 7 * PX_PER_UNIT)).toBe('masterDetail')
    })
})

describe('compactColumns', () => {
    it('keeps identifier columns and priority ≤ 2 columns, sorted by priority', () => {
        const id = col({ identifier: true, priority: 2 })
        const first = col({ priority: 1 })
        const dropped = col({ priority: 3 })
        const noPriority = col()
        expect(compactColumns([dropped, id, noPriority, first])).toEqual([first, id])
    })

    it('returns an empty array when no column qualifies', () => {
        expect(compactColumns([col({ priority: 3 }), col()])).toEqual([])
    })
})

describe('railColumns', () => {
    it('uses the compact set when priorities are declared', () => {
        const first = col({ priority: 1 })
        const dropped = col({ priority: 3 })
        expect(railColumns([dropped, first])).toEqual([first])
    })

    it('falls back to the first columns when nothing is marked — never a blank rail', () => {
        const a = col(), b = col(), c = col(), d = col()
        expect(railColumns([a, b, c, d])).toEqual([a, b, c])
    })
})

describe('selectFiltersLayout', () => {
    it('returns inline for no filters', () => {
        expect(selectFiltersLayout([])).toBe('inline')
    })

    it('returns inline while the total weight stays ≤ 4', () => {
        // bool (1.0) + status (1.5) + integer (1.5) = 4.0
        expect(selectFiltersLayout([
            field({ dataType: 'bool' }),
            field({ dataType: 'status' }),
            field({ dataType: 'integer' }),
        ])).toBe('inline')
    })

    it('returns popover for a moderate set', () => {
        // 2 text filters = 6.0 → > 4, < 8, fewer than 6 filters
        expect(selectFiltersLayout([field(), field()])).toBe('popover')
    })

    it('returns drawer when the total weight exceeds 8', () => {
        // 3 text filters = 9.0
        expect(selectFiltersLayout([field(), field(), field()])).toBe('drawer')
    })

    it('returns drawer for 6 or more filters even if light', () => {
        const filters = Array.from({ length: 6 }, () => field({ dataType: 'bool' })) // 6.0 total
        expect(selectFiltersLayout(filters)).toBe('drawer')
    })

    it('weighs dateRange and listBox with the 1.5 factor', () => {
        // dateRange = 3.75, listBox (text base 3.0) = 4.5 → total 8.25 > 8 → drawer
        expect(selectFiltersLayout([
            field({ dataType: 'dateRange' }),
            field({ stereotype: 'listBox' }),
        ])).toBe('drawer')
        // dateRange alone = 3.75 ≤ 4 → inline
        expect(selectFiltersLayout([field({ dataType: 'dateRange' })])).toBe('inline')
    })
})
