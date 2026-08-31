import { describe, expect, it } from 'vitest'
import { computePagination } from './pagination'

describe('computePagination', () => {

    it('counts the pages of an ordinary answer', () => {
        const view = computePagination(34220, 10, 0)
        expect(view.totalPages).toBe(3422)
        expect(view.currentPage).toBe(0)
        expect(view.multiPage).toBe(true)
        expect(view.isFirst).toBe(true)
        expect(view.isLast).toBe(false)
    })

    it('rounds the trailing partial page up', () => {
        expect(computePagination(34205, 10, 0).totalPages).toBe(3421)
    })

    it('reports the last page as last', () => {
        const view = computePagination(34220, 10, 3421)
        expect(view.isFirst).toBe(false)
        expect(view.isLast).toBe(true)
    })

    it('a single page is not worth a pager', () => {
        const view = computePagination(7, 10, 0)
        expect(view.totalPages).toBe(1)
        expect(view.multiPage).toBe(false)
    })

    // The bug this exists for: a listing that reports the rows THIS page carries as the page size
    // answers 0 once the requested page is past the end, and `total / 0` used to reach the reader
    // as "Page 3423 of Infinity" with next/last enabled forever.
    it('claims no page count when the page size is zero, and never says Infinity', () => {
        const view = computePagination(34220, 0, 3422)
        expect(view.totalPages).toBeUndefined()
        expect(view.currentPage).toBe(3422)
        expect(view.isLast).toBe(true)
    })

    it('still offers the way back from a page it cannot count', () => {
        const view = computePagination(34220, 0, 3422)
        expect(view.multiPage).toBe(true)
        expect(view.isFirst).toBe(false)
    })

    it('draws no pager on an uncountable first page', () => {
        expect(computePagination(34220, 0, 0).multiPage).toBe(false)
    })

    it('clamps a page beyond the end onto the last real one', () => {
        const view = computePagination(34220, 10, 99999)
        expect(view.currentPage).toBe(3421)
        expect(view.isLast).toBe(true)
    })

    it('survives absent, negative and non-numeric numbers', () => {
        expect(computePagination(undefined, undefined, undefined).totalPages).toBeUndefined()
        expect(computePagination(100, -10, -3)).toMatchObject({ totalPages: undefined, currentPage: 0 })
        expect(computePagination(100, Number.NaN, 0).totalPages).toBeUndefined()
        expect(computePagination(Number.NaN, 10, 0).totalPages).toBe(1)
    })
})
