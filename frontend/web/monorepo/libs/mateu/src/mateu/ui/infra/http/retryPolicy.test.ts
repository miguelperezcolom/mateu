import { describe, it, expect } from 'vitest'
import { isIdempotentAction, MAX_RETRIES, retryDelayMs, shouldRetry } from './retryPolicy'
import { classifyRequestFailure } from './requestPolicy'

const timeout = classifyRequestFailure({ code: 'ECONNABORTED', message: 'timeout of 60000ms exceeded' })
const serverError = classifyRequestFailure({ response: { status: 500 } })
const badRequest = classifyRequestFailure({ response: { status: 400 } })
const offline = classifyRequestFailure({ code: 'ERR_NETWORK' }, { online: false })

describe('isIdempotentAction', () => {

    it('recognises the framework reads', () => {
        // The empty id is the route load — the read whose failure leaves a blank page.
        expect(isIdempotentAction('')).toBe(true)
        expect(isIdempotentAction('__load__')).toBe(true)
        expect(isIdempotentAction('search')).toBe(true)
        expect(isIdempotentAction('_globalsearch')).toBe(true)
        expect(isIdempotentAction('_notifications-list')).toBe(true)
        expect(isIdempotentAction('search-country')).toBe(true)
        expect(isIdempotentAction('_appcontext-search-hotel')).toBe(true)
    })

    it('refuses everything it was not told about — writes are the default', () => {
        expect(isIdempotentAction('save')).toBe(false)
        expect(isIdempotentAction('create')).toBe(false)
        expect(isIdempotentAction('delete')).toBe(false)
        expect(isIdempotentAction('_notifications-read')).toBe(false)
        // An ABSENT id is unknown work and must not be confused with the empty route-load id.
        expect(isIdempotentAction(undefined)).toBe(false)
    })

    it('honours an explicit opt-in from the wire', () => {
        expect(isIdempotentAction('recalculateTotals', true)).toBe(true)
    })

    it('does not let a false flag opt a known read OUT', () => {
        // The flag is an opt-IN. A default-false coming off the wire must not disable the
        // built-in knowledge that a search is a read.
        expect(isIdempotentAction('search', false)).toBe(true)
    })
})

describe('shouldRetry', () => {

    it('retries a transient failure of a read', () => {
        expect(shouldRetry(timeout, 1, { idempotent: true })).toBe(true)
        expect(shouldRetry(serverError, 1, { idempotent: true })).toBe(true)
    })

    it('never retries a write, however transient the failure', () => {
        // The whole point: after a timeout we cannot know whether the server applied the write.
        expect(shouldRetry(timeout, 1, { idempotent: false })).toBe(false)
        expect(shouldRetry(serverError, 1, { idempotent: false })).toBe(false)
    })

    it('never retries a failure that cannot be fixed by repeating', () => {
        expect(shouldRetry(badRequest, 1, { idempotent: true })).toBe(false)
    })

    it('leaves the offline case to the connectivity tracker', () => {
        // Re-sending in 300ms while the network is down only burns the attempt budget.
        expect(shouldRetry(offline, 1, { idempotent: true })).toBe(false)
    })

    it('stops at the attempt budget', () => {
        expect(shouldRetry(timeout, MAX_RETRIES, { idempotent: true })).toBe(true)
        expect(shouldRetry(timeout, MAX_RETRIES + 1, { idempotent: true })).toBe(false)
    })
})

describe('retryDelayMs', () => {

    it('backs off between attempts', () => {
        const mid = () => 0.5
        expect(retryDelayMs(1, mid)).toBeLessThan(retryDelayMs(2, mid))
    })

    it('jitters within ±25% so clients do not resynchronise on a recovering server', () => {
        const lowest = retryDelayMs(1, () => 0)
        const highest = retryDelayMs(1, () => 1)
        expect(lowest).toBe(225)   // 300 * 0.75
        expect(highest).toBe(375)  // 300 * 1.25
    })
})
