import { describe, expect, it } from 'vitest'
import { sameSort, sortAfterChange, sortDirectionOf, sortOfGrid } from './gridSort'

describe('sortOfGrid', () => {
    it('reads the Lit sorter\'s own path and direction (it has no Polymer __data)', () => {
        const grid = { _sorters: [{ path: 'pages', direction: 'desc' }] }
        expect(sortOfGrid(grid)).toEqual([{ fieldId: 'pages', direction: 'descending' }])
    })

    it('still reads the Polymer property bag', () => {
        const grid = { _sorters: [{ __data: { path: 'title', direction: 'asc' } }] }
        expect(sortOfGrid(grid)).toEqual([{ fieldId: 'title', direction: 'ascending' }])
    })

    it('drops sorters with no direction (a header clicked back to unsorted)', () => {
        const grid = { _sorters: [{ path: 'title', direction: null }, { path: 'pages', direction: 'asc' }] }
        expect(sortOfGrid(grid)).toEqual([{ fieldId: 'pages', direction: 'ascending' }])
    })

    it('is empty for a grid without sorters', () => {
        expect(sortOfGrid(undefined)).toEqual([])
        expect(sortOfGrid({})).toEqual([])
    })
})

describe('sortAfterChange', () => {
    it('takes the clicked column from the event even when the grid has not caught up', () => {
        expect(sortAfterChange({ _sorters: [] }, 'pages', 'desc'))
            .toEqual([{ fieldId: 'pages', direction: 'descending' }])
    })

    it('drops the column that went back to unsorted and keeps the others', () => {
        const grid = { _sorters: [{ path: 'pages', direction: 'asc' }, { path: 'title', direction: 'desc' }] }
        expect(sortAfterChange(grid, 'pages', null)).toEqual([{ fieldId: 'title', direction: 'descending' }])
    })
})

describe('sortDirectionOf', () => {
    it('shows the state\'s sort on the column it names', () => {
        const state = { sort: [{ fieldId: 'pages', direction: 'descending' }] }
        expect(sortDirectionOf(state, 'pages')).toBe('desc')
        expect(sortDirectionOf(state, 'title')).toBeNull()
    })

    it('is unsorted without a sort', () => {
        expect(sortDirectionOf({}, 'pages')).toBeNull()
        expect(sortDirectionOf(undefined, 'pages')).toBeNull()
    })
})

describe('sameSort', () => {
    it('tells a re-applied sort from a new one', () => {
        expect(sameSort([{ fieldId: 'a', direction: 'ascending' }], [{ fieldId: 'a', direction: 'ascending' }])).toBe(true)
        expect(sameSort([{ fieldId: 'a', direction: 'ascending' }], [{ fieldId: 'a', direction: 'descending' }])).toBe(false)
        expect(sameSort(undefined, [])).toBe(true)
    })
})
