import { describe, expect, it } from 'vitest'
import { listingSearchesOnLoad } from './mateu-table-crud'

// a search-first listing (HeroSearch, SmartSearchPage) has no OnLoad search: it must invite a
// search instead of shimmering a skeleton and then claiming "Nothing here yet."
const within = (triggers: unknown[]) => ({ parentElement: { tagName: 'MATEU-COMPONENT', component: { triggers } } })

describe('listingSearchesOnLoad', () => {
    it('is true when the enclosing component searches on load', () => {
        expect(listingSearchesOnLoad(within([{ type: 'OnLoad', actionId: 'search' }]))).toBe(true)
    })
    it('is false for a search-first listing (no OnLoad search)', () => {
        expect(listingSearchesOnLoad(within([]))).toBe(false)
        expect(listingSearchesOnLoad(within([{ type: 'OnLoad', actionId: 'refresh' }]))).toBe(false)
    })
    it('keeps the old behaviour outside a component', () => {
        expect(listingSearchesOnLoad({})).toBe(true)
    })
})
