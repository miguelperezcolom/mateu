import { describe, expect, it } from 'vitest'
import { showsPreSearch } from './listingPreSearch'

/** The smart search page's pre-search content (Redwood smart filter search `dashboard` slot). */
describe('the listing pre-search content', () => {
    const preSearch = [{ id: 'recent' }]

    it('stands in for the results until the first search answers', () => {
        expect(showsPreSearch({ preSearch }, undefined)).toBe(true)
        expect(showsPreSearch({ preSearch }, { page: { content: [{ id: 1 }] } })).toBe(false)
    })

    it('does not come back for a later empty result', () => {
        expect(showsPreSearch({ preSearch }, { page: { content: [] } })).toBe(false)
    })

    it('is absent unless the listing declares some', () => {
        expect(showsPreSearch({}, undefined)).toBe(false)
        expect(showsPreSearch({ preSearch: [] }, undefined)).toBe(false)
        expect(showsPreSearch({ preSearch: null }, undefined)).toBe(false)
        expect(showsPreSearch(undefined, undefined)).toBe(false)
    })
})
