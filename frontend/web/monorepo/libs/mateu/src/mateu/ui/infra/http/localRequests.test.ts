import { describe, it, expect } from 'vitest'
import { anyListingRows, isListingOwnLoad, isLocalRequest, onLoadBackground } from './localRequests'

describe('requests that must not raise the page busy indicator', () => {
    it('a lookup search, a typed code and a proxied @RestOptions fetch are local', () => {
        expect(isLocalRequest('search-integration')).toBe(true)
        expect(isLocalRequest('search-pmsHotelCode-*')).toBe(true)
        expect(isLocalRequest('code-hotel')).toBe(true)
        expect(isLocalRequest('__restfetch__')).toBe(true)
    })

    it('an action, a navigation or a listing search is what the user started: not local', () => {
        expect(isLocalRequest('save')).toBe(false)
        expect(isLocalRequest('')).toBe(false)
        expect(isLocalRequest(undefined)).toBe(false)
        expect(isLocalRequest('search')).toBe(false)
        expect(isLocalRequest('codesearch-hotel')).toBe(false)
    })
})

describe('a listing drawing its own loading state', () => {
    it('its search while no rows are on screen is local: the skeleton already says "loading"', () => {
        expect(isListingOwnLoad('search', false)).toBe(true)
    })

    it('a re-search over rows still visible is not: nothing else tells the screen is about to change', () => {
        expect(isListingOwnLoad('search', true)).toBe(false)
    })

    it('only the listing read counts', () => {
        expect(isListingOwnLoad('save', false)).toBe(false)
        expect(isListingOwnLoad('', false)).toBe(false)
        expect(isListingOwnLoad(undefined, false)).toBe(false)
    })

    it('rows are found in any listing of the component data', () => {
        expect(anyListingRows(undefined)).toBe(false)
        expect(anyListingRows({})).toBe(false)
        expect(anyListingRows({ crud: { page: { content: [] } }, other: null, x: 3 })).toBe(false)
        expect(anyListingRows({ crud: { page: { content: [{ id: 1 }] } } })).toBe(true)
    })

    it('the OnLoad search that fills a routed listing runs in the background', () => {
        expect(onLoadBackground({ actionId: 'search', background: false }, {})).toBe(true)
        expect(onLoadBackground({ actionId: 'search' }, undefined)).toBe(true)
    })

    it('other OnLoad calls, or a listing already showing rows, keep the trigger flag', () => {
        expect(onLoadBackground({ actionId: 'load', background: false }, {})).toBe(false)
        expect(onLoadBackground({ actionId: 'poll', background: true }, {})).toBe(true)
        expect(onLoadBackground({ actionId: 'load' }, {})).toBeUndefined()
        expect(onLoadBackground({ actionId: 'search', background: false },
            { crud: { page: { content: [{ id: 1 }] } } })).toBe(false)
    })
})
