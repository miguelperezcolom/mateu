import { describe, it, expect } from 'vitest'
import { classifyRequestFailure, describeRequestFailure } from './requestPolicy'

/** Shapes the way axios reports each condition. */
const axiosError = (over: Record<string, unknown>) => ({ message: '', ...over })

describe('classifyRequestFailure', () => {

    it('treats a deliberate abort as cancelled, with nothing to tell the user', () => {
        const failure = classifyRequestFailure(axiosError({ code: 'ERR_CANCELED' }))
        expect(failure.kind).toBe('cancelled')
        expect(failure.message).toBe('')
        expect(failure.retryable).toBe(false)
    })

    it('reads axios ECONNABORTED as a timeout, not as an abort', () => {
        // axios reuses ECONNABORTED for its own timeout — the case that matters most on a slow link.
        const failure = classifyRequestFailure(
            axiosError({ code: 'ECONNABORTED', message: 'timeout of 60000ms exceeded' }))
        expect(failure.kind).toBe('timeout')
        expect(failure.retryable).toBe(true)
    })

    it('classifies a response-less failure as offline when the browser says so', () => {
        const failure = classifyRequestFailure(axiosError({ code: 'ERR_NETWORK' }), { online: false })
        expect(failure.kind).toBe('offline')
    })

    it('still calls it offline when the browser claims to be online but nothing came back', () => {
        // A dead uplink / captive portal reports onLine === true; the missing response is the truth.
        const failure = classifyRequestFailure(
            axiosError({ code: 'ERR_NETWORK', message: 'Network Error' }), { online: true })
        expect(failure.kind).toBe('offline')
    })

    it('maps 5xx to a retryable server failure carrying the status', () => {
        const failure = classifyRequestFailure({ response: { status: 503 } })
        expect(failure.kind).toBe('server')
        expect(failure.retryable).toBe(true)
        expect(failure.status).toBe(503)
        expect(failure.message).toContain('503')
    })

    it('never offers to retry a rejected request', () => {
        const failure = classifyRequestFailure({ response: { status: 400 } })
        expect(failure.kind).toBe('client')
        expect(failure.retryable).toBe(false)
    })

    it('separates an expired session from a missing target', () => {
        expect(classifyRequestFailure({ response: { status: 401 } }).kind).toBe('unauthorized')
        expect(classifyRequestFailure({ response: { status: 403 } }).kind).toBe('unauthorized')
        expect(classifyRequestFailure({ response: { status: 404 } }).kind).toBe('notFound')
    })

    it('treats 408 and 429 as "come back in a moment"', () => {
        expect(classifyRequestFailure({ response: { status: 408 } }).kind).toBe('timeout')
        expect(classifyRequestFailure({ response: { status: 429 } }).kind).toBe('timeout')
    })

    it('never leaks transport jargon into the user-facing message', () => {
        const raw = ['timeout of 60000ms exceeded', 'Network Error', 'Request failed with status code 500']
        const messages = [
            describeRequestFailure(axiosError({ code: 'ECONNABORTED', message: raw[0] })),
            describeRequestFailure(axiosError({ code: 'ERR_NETWORK', message: raw[1] }), { online: false }),
            describeRequestFailure({ response: { status: 500 }, message: raw[2] }),
        ]
        messages.forEach((message) => {
            expect(message.length).toBeGreaterThan(0)
            raw.forEach((jargon) => expect(message).not.toContain(jargon))
        })
    })

    it('degrades gracefully on a non-error value', () => {
        const failure = classifyRequestFailure(undefined, { online: true })
        expect(failure.kind).toBe('unknown')
        expect(failure.message.length).toBeGreaterThan(0)
    })
})
