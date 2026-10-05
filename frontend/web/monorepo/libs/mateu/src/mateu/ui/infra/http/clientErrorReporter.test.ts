import { describe, it, expect, afterEach, vi } from 'vitest'
import {
    clientLogEndpointOf,
    clientLogSender,
    createClientErrorReporter,
    endpointIsMissing,
    failureReportOf,
    redactUrl,
    type ClientErrorLine,
    type ClientLogSend,
} from './clientErrorReporter'

/** Injected clock, timer and sender: no real waiting. */
const fake = (send?: ClientLogSend) => {
    let t = 1_000_000
    const timers: { fn: () => void, at: number }[] = []
    const sent: { url: string, lines: ClientErrorLine[] }[] = []
    const reporter = createClientErrorReporter({
        renderer: 'vaadin',
        now: () => t,
        schedule: (fn, ms) => { const h = { fn, at: t + ms }; timers.push(h); return h },
        cancel: (h) => { const i = timers.indexOf(h as { fn: () => void, at: number }); if (i >= 0) timers.splice(i, 1) },
        send: send ?? ((url, body) => { sent.push({ url, lines: JSON.parse(body) }); return Promise.resolve(204) }),
        userAgent: 'UA',
        pageUrl: () => 'https://app/x?state=s&tab=2#frag',
    })
    const advance = (ms: number) => {
        t += ms
        for (;;) {
            const due = timers.filter((h) => h.at <= t).sort((a, b) => a.at - b.at)[0]
            if (!due) break
            timers.splice(timers.indexOf(due), 1)
            due.fn()
        }
    }
    return { reporter, sent, advance, lines: () => sent.flatMap((s) => s.lines) }
}

const flushPromises = () => new Promise((r) => setTimeout(r, 0))

describe('clientErrorReporter', () => {

    afterEach(() => vi.unstubAllGlobals())

    it('reports a repeated error once, and the repeats in one summary when the window closes', () => {
        const { reporter, sent, advance, lines } = fake()
        const e = { kind: 'unauthorized', status: 401, message: 'Your session is no longer valid.', url: '/mateu/v3/sync/bookings', actionId: 'save' }
        reporter.report(e)
        reporter.report(e)
        advance(2000)
        expect(sent).toHaveLength(1)
        expect(sent[0].url).toBe('/mateu/v3/client-log')
        expect(lines()[0]).toMatchObject({ level: 'error', kind: 'unauthorized', count: 2, route: '/bookings',
            renderer: 'vaadin', userAgent: 'UA', pageUrl: 'https://app/x?state=***&tab=2' })
        advance(1000); reporter.report(e); reporter.report(e); reporter.report(e)
        advance(10000)
        expect(sent).toHaveLength(1)
        advance(60000)
        expect(sent).toHaveLength(2)
        expect(lines()[1].count).toBe(3)
        // once the window is over, the same error is news again
        reporter.report(e); advance(2000)
        expect(lines()).toHaveLength(3)
    })

    it('sends at most 20 lines a minute and counts the rest in the next line', () => {
        const { reporter, advance, lines } = fake()
        for (let i = 0; i < 30; i++) reporter.report({ kind: 'server', status: 500, message: 'm' + i })
        advance(2000)
        expect(lines()).toHaveLength(20)
        advance(61000)
        reporter.report({ kind: 'server', status: 500, message: 'next minute' })
        advance(2000)
        const last = lines()[lines().length - 1]
        expect(last.message).toBe('next minute')
        expect(last.dropped).toBe(10)
    })

    it('never loops: ignores its own endpoint and cancellations, and swallows failed sends', async () => {
        let calls = 0
        const { reporter, advance } = fake(() => {
            calls++
            if (calls === 1) throw new Error('boom')
            return Promise.reject(new Error('offline'))
        })
        reporter.report({ kind: 'offline', url: '/admin/mateu/v3/client-log' })
        reporter.report({ kind: 'cancelled' })
        reporter.report({ kind: 'js-error', message: 'ResizeObserver loop limit exceeded' })
        advance(5000)
        expect(calls).toBe(0)
        reporter.report({ kind: 'server', message: 'a' })
        advance(2000)
        reporter.report({ kind: 'server', message: 'b' })
        advance(2000)
        await flushPromises()
        expect(calls).toBe(2)
    })

    it('turns itself off for the page when the endpoint answers 404', async () => {
        let calls = 0
        const { reporter, advance } = fake(() => { calls++; return Promise.resolve(404) })
        reporter.report({ kind: 'server', message: 'a' })
        advance(2000)
        await flushPromises()
        expect(reporter.isDisabled()).toBe(true)
        reporter.report({ kind: 'server', message: 'b' })
        advance(5000)
        expect(calls).toBe(1)
    })

    it('reads which answers mean "no endpoint here" and which are transient', () => {
        for (const s of [404, 405, 400, 200, 500]) expect(endpointIsMissing(s)).toBe(true)
        for (const s of [undefined, 0, 204, 401, 403, 413, 429, 502, 503, 504]) expect(endpointIsMissing(s)).toBe(false)
    })

    it('truncates message and stack and splits batches under the server limit', () => {
        const { reporter, sent, advance, lines } = fake()
        for (let i = 0; i < 8; i++) reporter.report({ kind: 'js-error', message: i + 'x'.repeat(5000), stack: 'y'.repeat(9000) })
        advance(2000)
        expect(lines()).toHaveLength(8)
        expect(lines().every((l) => l.message!.length === 1001 && l.stack!.length === 4001)).toBe(true)
        expect(sent.length).toBeGreaterThan(1)
        expect(sent.every((s) => JSON.stringify(s.lines).length < 16 * 1024)).toBe(true)
    })

    it('posts only to its own origin and masks secrets in URLs', () => {
        expect(clientLogEndpointOf('', 'https://a')).toBe('/mateu/v3/client-log')
        expect(clientLogEndpointOf('/admin/', 'https://a')).toBe('/admin/mateu/v3/client-log')
        expect(clientLogEndpointOf('https://other', 'https://a')).toBeNull()
        expect(redactUrl('/x?code=abc&q=1#h')).toBe('/x?code=***&q=1')
    })

    it('describes an axios failure by its request, and any other error by its stack', () => {
        const axiosLike = { message: 'Request failed with status code 401', stack: 'axios internals',
            config: { url: '/mateu/v3/sync/x', headers: { traceparent: '00-a-b-01' } }, response: { status: 401 } }
        expect(failureReportOf({ kind: 'unauthorized', message: 'Your session…', status: 401 }, axiosLike, 'save'))
            .toMatchObject({ kind: 'unauthorized', status: 401, url: '/mateu/v3/sync/x', actionId: 'save',
                traceparent: '00-a-b-01', detail: 'Request failed with status code 401', stack: undefined })
        const err = new TypeError('x is undefined')
        expect(failureReportOf({ kind: 'unknown', message: 'Something went wrong.' }, err).stack).toContain('TypeError')
    })

    it('sends with fetch keepalive and the Bearer; sendBeacon only on pagehide without a token', async () => {
        const fetchMock = vi.fn(async () => ({ status: 204 }))
        const beacon = vi.fn(() => true)
        vi.stubGlobal('fetch', fetchMock)
        vi.stubGlobal('navigator', { sendBeacon: beacon })
        expect(await clientLogSender(() => ({ Authorization: 'Bearer T' }))('/mateu/v3/client-log', '[]', { final: true })).toBe(204)
        const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        expect(init.keepalive).toBe(true)
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer T')
        expect(beacon).not.toHaveBeenCalled()
        await clientLogSender(() => ({}))('/mateu/v3/client-log', '[]', { final: true })
        expect(beacon).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})
