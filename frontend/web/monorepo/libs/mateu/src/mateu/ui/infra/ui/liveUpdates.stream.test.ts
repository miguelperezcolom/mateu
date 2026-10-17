// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The live-updates stream of `@App(liveUpdates)` against a mocked SSE endpoint: one tab leads and
 * holds the stream, the header values it pushes land in the store, a clean end reconnects, a failure
 * backs off, a tab that loses the lead (or an app that turns the flag off) lets go.
 *
 * The module keeps its stream in module state, so every test imports a FRESH copy.
 */

type Live = typeof import('./liveUpdates')
type Values = typeof import('./headerValues')

const app = (over: Record<string, unknown> = {}) => ({
    liveUpdates: true, rootRoute: '/ops', serverSideType: 'com.example.Ops', ...over,
}) as never

/** An SSE response whose body is the given chunks, ending after the last one (or held open). */
const sseResponse = (chunks: string[], { hold = false } = {}) => {
    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
            if (!hold) controller.close()
        },
    })
    return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

const event = (commands: unknown[]) => 'data: ' + JSON.stringify({ commands }) + '\n\n'

let live: Live
let values: Values

const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve()
    await new Promise((r) => setTimeout(r, 0))
}

beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    live = await import('./liveUpdates')
    values = await import('./headerValues')
})

afterEach(() => {
    live.syncLiveUpdates(undefined, '')
    window.dispatchEvent(new Event('pagehide'))
    values.resetHeaderValues()
    localStorage.clear()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('the live-updates stream', () => {
    it('the leading tab opens ONE stream on the app-level SSE action and applies the header values it pushes', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse([
            event([{ type: 'UpdateHeaderValue', data: { id: 'businessDate', value: '2026-10-18' } }]),
            ': heartbeat\n\n',
            'data: not json\n\n',
        ], { hold: true })))
        vi.stubGlobal('fetch', fetchMock)
        values.seedHeaderValues([{ id: 'businessDate', label: 'Business date', value: '2026-10-17' }] as never)

        live.syncLiveUpdates(app(), 'http://host/app')
        await flush()

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
        expect(url).toBe('http://host/app/mateu/v3/sse/ops')
        expect(init.method).toBe('POST')
        expect((init.headers as Record<string, string>).Accept).toBe('text/event-stream')
        const body = JSON.parse(init.body as string)
        expect(body).toMatchObject({ actionId: '_live-updates', serverSideType: 'com.example.Ops', route: '/ops' })
        // this tab is the leader
        expect(JSON.parse(localStorage.getItem(live.LEADER_KEY)!).tab).toBeTruthy()
        expect(values.headerValuesList().find((v) => v.id === 'businessDate')?.value).toBe('2026-10-18')

        // syncing again with the same app does not open a second stream
        live.syncLiveUpdates(app(), 'http://host/app')
        await flush()
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('an app without a root route streams on the _no_route path', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse([], { hold: true })))
        vi.stubGlobal('fetch', fetchMock)
        live.syncLiveUpdates(app({ rootRoute: '' }), '')
        await flush()
        expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('/mateu/v3/sse/_no_route')
    })

    it('another tab that holds a fresh lead keeps this one off the stream', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse([], { hold: true })))
        vi.stubGlobal('fetch', fetchMock)
        localStorage.setItem(live.LEADER_KEY, JSON.stringify({ tab: 'other-tab', at: Date.now() }))
        live.syncLiveUpdates(app(), '')
        await flush()
        expect(fetchMock).not.toHaveBeenCalled()
        // and leaving does not remove the OTHER tab's lead
        live.syncLiveUpdates(undefined, '')
        expect(JSON.parse(localStorage.getItem(live.LEADER_KEY)!).tab).toBe('other-tab')
    })

    it('reconnects after the server ends the stream, and backs off after a failure', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
        const fetchMock = vi.fn()
            .mockImplementationOnce(() => Promise.resolve(sseResponse([event([])])))  // clean end
            .mockImplementationOnce(() => Promise.resolve(new Response('nope', { status: 503 }))) // failure
            .mockImplementation(() => Promise.resolve(sseResponse([], { hold: true })))
        vi.stubGlobal('fetch', fetchMock)

        live.syncLiveUpdates(app(), '')
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchMock).toHaveBeenCalledTimes(1)

        // a clean end: back in a second
        await vi.advanceTimersByTimeAsync(live.reconnectDelay(0))
        expect(fetchMock).toHaveBeenCalledTimes(2)

        // a 503: not back after one second, back after the first back-off step
        await vi.advanceTimersByTimeAsync(1_000)
        expect(fetchMock).toHaveBeenCalledTimes(2)
        await vi.advanceTimersByTimeAsync(live.reconnectDelay(1))
        expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('turning liveUpdates off aborts the stream and gives up the lead', async () => {
        let signal: AbortSignal | undefined
        vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => {
            signal = init.signal as AbortSignal
            return Promise.resolve(sseResponse([], { hold: true }))
        }))
        live.syncLiveUpdates(app(), '')
        await flush()
        expect(signal?.aborted).toBe(false)

        live.syncLiveUpdates(app({ liveUpdates: false }), '')
        expect(signal?.aborted).toBe(true)
        expect(localStorage.getItem(live.LEADER_KEY)).toBeNull()
    })

    it('another app (a different server-side type) restarts the stream', async () => {
        const signals: AbortSignal[] = []
        const fetchMock = vi.fn((_url: string, init: RequestInit) => {
            signals.push(init.signal as AbortSignal)
            return Promise.resolve(sseResponse([], { hold: true }))
        })
        vi.stubGlobal('fetch', fetchMock)
        live.syncLiveUpdates(app(), '')
        await flush()
        live.syncLiveUpdates(app({ serverSideType: 'com.example.Other' }), '')
        await flush()
        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(signals[0].aborted).toBe(true)
        expect(JSON.parse((fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body as string).serverSideType)
            .toBe('com.example.Other')
    })

    it('a tab whose lead is taken over stops streaming at the next heartbeat', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
        let signal: AbortSignal | undefined
        vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => {
            signal = init.signal as AbortSignal
            return Promise.resolve(sseResponse([], { hold: true }))
        }))
        live.syncLiveUpdates(app(), '')
        await vi.advanceTimersByTimeAsync(0)
        expect(signal?.aborted).toBe(false)
        // another tab claims the lead (e.g. this one was asleep past STALE_MS)
        localStorage.setItem(live.LEADER_KEY, JSON.stringify({ tab: 'other-tab', at: Date.now() + 60_000 }))
        await vi.advanceTimersByTimeAsync(live.HEARTBEAT_MS)
        expect(signal?.aborted).toBe(true)
    })

    it('closing the page gives up the lead', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(sseResponse([], { hold: true }))))
        live.syncLiveUpdates(app(), '')
        await flush()
        expect(localStorage.getItem(live.LEADER_KEY)).not.toBeNull()
        window.dispatchEvent(new Event('pagehide'))
        expect(localStorage.getItem(live.LEADER_KEY)).toBeNull()
    })
})
