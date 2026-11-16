import { describe, expect, it } from 'vitest'
import { listingEmptyMessage } from './listingEmptyMessage'

/** ListingData.emptyStateMessage travels in the search answer's data, next to the page. */
describe('the message an empty listing shows', () => {
    it('is the one the search answer carries in the data', () => {
        const data = { crud: { page: { content: [] }, emptyStateMessage: 'Pick a warehouse on the header' } }
        expect(listingEmptyMessage(data, {}, 'crud')).toBe('Pick a warehouse on the header')
    })

    it('falls back to a message in the state', () => {
        expect(listingEmptyMessage({ crud: { page: { content: [] } } }, { crud: { emptyStateMessage: 'From state' } }, 'crud'))
            .toBe('From state')
    })

    it('prefers the data over the state', () => {
        expect(listingEmptyMessage({ crud: { emptyStateMessage: 'Data' } }, { crud: { emptyStateMessage: 'State' } }, 'crud'))
            .toBe('Data')
    })

    it('reads the state under another id when the component id differs from the listing id', () => {
        expect(listingEmptyMessage({}, { comp: { emptyStateMessage: 'State' } }, 'crud', 'comp')).toBe('State')
    })

    it('is none when nothing says anything, or only blanks', () => {
        expect(listingEmptyMessage(undefined, undefined, 'crud')).toBeUndefined()
        expect(listingEmptyMessage({ crud: { emptyStateMessage: null } }, {}, 'crud')).toBeUndefined()
        expect(listingEmptyMessage({ crud: { emptyStateMessage: '  ' } }, {}, 'crud')).toBeUndefined()
        expect(listingEmptyMessage({}, {}, undefined)).toBeUndefined()
    })
})
