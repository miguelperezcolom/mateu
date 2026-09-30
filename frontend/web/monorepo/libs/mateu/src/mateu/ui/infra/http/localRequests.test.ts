import { describe, it, expect } from 'vitest'
import { isLocalRequest } from './localRequests'

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
