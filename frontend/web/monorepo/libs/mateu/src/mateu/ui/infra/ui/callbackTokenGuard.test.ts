import { describe, it, expect } from 'vitest'
import { fragmentIsCurrent } from './callbackTokenGuard'

describe('fragmentIsCurrent', () => {

    it('drops an answer to an earlier request of the element that fired it', () => {
        // A navigation replaced by a newer one: the element has a new token by the time the slower
        // answer to the first request arrives.
        const ux = { callbackToken: 'second' }
        expect(fragmentIsCurrent(ux, { callbackToken: 'first', initiator: ux })).toBe(false)
        expect(fragmentIsCurrent(ux, { callbackToken: 'second', initiator: ux })).toBe(true)
    })

    it('lets a fragment through to an element other than the one that fired the request', () => {
        // A wizard's "+" on its Guests step: the wizard fires guests_add with its token, and the
        // row editor goes to the list's detail container, which took a token of its own when the
        // Rooms step's editor landed in it. Dropping it left the room editor on screen.
        const wizard = { callbackToken: 'wizard' }
        const container = { callbackToken: 'container' }
        expect(fragmentIsCurrent(container, { callbackToken: 'wizard', initiator: wizard })).toBe(true)
    })

    it('keeps the token check when the message does not say who fired it', () => {
        const element = { callbackToken: 'mine' }
        expect(fragmentIsCurrent(element, { callbackToken: 'other' })).toBe(false)
    })

    it('lets anything through while either side has no token', () => {
        expect(fragmentIsCurrent({ callbackToken: '' }, { callbackToken: 'x' })).toBe(true)
        expect(fragmentIsCurrent({ callbackToken: 'x' }, { callbackToken: '' })).toBe(true)
    })
})
