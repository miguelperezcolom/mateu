import { describe, expect, it } from 'vitest'
import { isInfiniteListing, mergeListingData } from './listingPages'

const rows = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => ({ n: from + i }))
const answer = (pageNumber: number, pageSize: number, totalElements: number, content: any[]) =>
    ({ page: { pageNumber, pageSize, totalElements, content } })

describe('mergeListingData', () => {

    it('a paged listing shows the page it was answered, not the previous one glued above it', () => {
        // The demo report: Dictionary re-entered from the menu, «next» — twenty rows under a pager
        // promising ten, page 1 on top. The answer for page 2 IS what the reader asked to see.
        const current = { crud: answer(0, 10, 50, rows(0, 10)) }
        const merged = mergeListingData(current, { crud: answer(1, 10, 50, rows(10, 20)) }, () => false)
        expect(merged.crud.page.content.map((r: any) => r.n)).toEqual(rows(10, 20).map(r => r.n))
        expect(merged.crud.page.pageNumber).toBe(1)
        expect(merged.crud.page.totalElements).toBe(50)
    })

    it('two answers for the same page (a reload firing the search twice) never double the rows', () => {
        const current = { crud: answer(2, 10, 50, rows(20, 30)) }
        const merged = mergeListingData(current, { crud: answer(2, 10, 50, rows(20, 30)) }, () => false)
        expect(merged.crud.page.content).toHaveLength(10)
    })

    it('an infinite-scrolling listing appends the next window to the rows before it', () => {
        const current = { crud: answer(0, 10, 50, rows(0, 10)) }
        const merged = mergeListingData(current, { crud: answer(1, 10, 50, rows(10, 20)) }, () => true)
        expect(merged.crud.page.content.map((r: any) => r.n)).toEqual(rows(0, 20).map(r => r.n))
    })

    it('an infinite-scrolling listing answered twice for the same window keeps it once', () => {
        const current = { crud: answer(1, 10, 50, rows(0, 20)) }
        const merged = mergeListingData(current, { crud: answer(1, 10, 50, rows(10, 20)) }, () => true)
        expect(merged.crud.page.content.map((r: any) => r.n)).toEqual(rows(0, 20).map(r => r.n))
    })

    it('keeps every other key it was not answered about, and does not touch the incoming fragment', () => {
        const incoming = { crud: answer(1, 10, 50, rows(10, 20)) }
        const merged = mergeListingData({ other: 1, crud: answer(0, 10, 50, rows(0, 10)) }, incoming, () => true)
        expect(merged.other).toBe(1)
        expect(incoming.crud.page.content).toHaveLength(10)
    })
})

describe('isInfiniteListing', () => {
    const tree = (infiniteScrolling: boolean) => ({
        id: 'ss', type: 'ServerSide', children: [
            { id: 'page', metadata: { type: 'Page' }, children: [
                { id: 'crud', metadata: { type: 'Crud', infiniteScrolling } },
            ] },
        ],
    })
    it('finds the listing by id however deep it sits', () => {
        expect(isInfiniteListing(tree(true), 'crud')).toBe(true)
        expect(isInfiniteListing(tree(false), 'crud')).toBe(false)
    })
    it('a listing it cannot find is paged', () => {
        expect(isInfiniteListing(tree(true), 'other')).toBe(false)
        expect(isInfiniteListing(undefined, 'crud')).toBe(false)
    })
})
