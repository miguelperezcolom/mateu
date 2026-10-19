// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The live UI push channel against a mocked SSE endpoint: the tab opens ONE stream on the app-level
 * `_agent-channel` action with its UI session id + secret, a status message reaches the pairing
 * store, every other message goes through the shared agent-event handling from the shell, a clean
 * periodic end reconnects at once, a failure backs off, and the app turning push off closes it.
 * Pairing and unpairing run the sync actions with the same session id + secret.
 *
 * The module keeps its stream in module state, so every test imports a FRESH copy.
 */

const applied: { origin: unknown, name: string, detail: unknown }[] = []
vi.mock('./agentEvents', () => ({
    applyAgentEvent: (origin: unknown, name: string, detail: unknown) => { applied.push({ origin, name, detail }) },
}))
const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))

type Channel = typeof import('./agentChannel')

const app = (over: Record<string, unknown> = {}) => ({
    agentPush: true, rootRoute: '/ops', serverSideType: 'com.example.Ops', ...over,
}) as never

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

const push = (kind: string, event: string, detail?: unknown) =>
    'data: ' + JSON.stringify({ commands: [{ type: 'AgentPush', data: { kind, event, detail } }] }) + '\n\n'

const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve()
    await new Promise((r) => setTimeout(r, 0))
}
/** With faked timers: microtasks only (a stream's reads settle on them). */
const settle = async () => { for (let i = 0; i < 50; i++) await Promise.resolve() }

let channel: Channel
let shell: HTMLElement

beforeEach(async () => {
    vi.resetModules()
    sessionStorage.clear()
    applied.length = 0
    runAction.mockReset()
    channel = await import('./agentChannel')
    shell = document.createElement('mateu-app')
    document.body.appendChild(shell)
})

afterEach(() => {
    channel.syncAgentChannel(undefined, '', shell)
    channel.resetAgentChannel()
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('the live UI push channel', () => {
    it('opens one stream per tab on _agent-channel and applies what it carries', async () => {
        window.history.replaceState(null, '', '/ops/bookings?page=2')
        const fetchMock = vi.fn((_url: string, _init: RequestInit) => Promise.resolve(sseResponse([
            push('status', 'mateu-agent-status', { paired: true, agents: ['ana'] }),
            push('render', 'render-screen', { yaml: 'type: Text', target: 'dialog' }),
            push('navigate', 'navigation-requested', { route: '/orders', consumedRoute: '' }),
            push('event', 'highlight-row', { id: 7 }),
            push('event', 'close-requested'),
            'data: \n\n',
        ], { hold: true })))
        vi.stubGlobal('fetch', fetchMock)
        const seen: unknown[] = []
        channel.subscribeAgentStatus((s) => seen.push(s))

        channel.syncAgentChannel(app(), '/base', shell)
        channel.syncAgentChannel(app(), '/base', shell) // every shell update: no second stream
        await flush()

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/base/mateu/v3/sse/ops')
        const body = JSON.parse(init.body as string)
        expect(body).toMatchObject({ actionId: '_agent-channel', serverSideType: 'com.example.Ops', route: '/ops' })
        expect(body.parameters).toEqual({
            sessionId: sessionStorage.getItem('__mateu_sesion_id'),
            secret: sessionStorage.getItem(channel.AGENT_SECRET_KEY),
            route: '/ops/bookings?page=2',
            renderer: 'vaadin',
        })
        expect(body.parameters.sessionId).toBeTruthy()
        expect(body.parameters.secret).toMatch(/^[0-9a-f]{64}$/)

        expect(channel.agentStatus()).toEqual({ connected: true, paired: true, agents: ['ana'] })
        expect(seen.at(-1)).toEqual({ connected: true, paired: true, agents: ['ana'] })
        // the status is not dispatched; the chat's own close is never the channel's
        expect(applied).toEqual([
            { origin: shell, name: 'render-screen', detail: { yaml: 'type: Text', target: 'dialog' } },
            { origin: shell, name: 'navigation-requested', detail: { route: '/orders', consumedRoute: '' } },
            { origin: shell, name: 'highlight-row', detail: { id: 7 } },
        ])
    })

    it('reconnects at once after the periodic end, and backs off after a failure', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
        const answers: (() => Promise<Response>)[] = [
            () => Promise.resolve(sseResponse([push('status', 'mateu-agent-status', { paired: false, agents: [] })])),
            () => Promise.reject(new Error('down')),
            () => Promise.resolve(sseResponse([], { hold: true })),
        ]
        const fetchMock = vi.fn(() => answers.shift()!())
        vi.stubGlobal('fetch', fetchMock)

        channel.syncAgentChannel(app(), '', shell)
        // the first stream lives long enough to be a normal end
        vi.setSystemTime(Date.now() + 10_000)
        await settle()
        expect(channel.agentStatus().connected).toBe(false)
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchMock).toHaveBeenCalledTimes(2) // at once
        await settle()
        await vi.advanceTimersByTimeAsync(1_000)
        expect(fetchMock).toHaveBeenCalledTimes(2) // backing off
        await vi.advanceTimersByTimeAsync(1_100)
        expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('a stream refused right away is not hammered', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const fetchMock = vi.fn(() => Promise.resolve(new Response('nope', { status: 500 })))
        vi.stubGlobal('fetch', fetchMock)
        channel.syncAgentChannel(app(), '', shell)
        await settle()
        await vi.advanceTimersByTimeAsync(1_900)
        expect(fetchMock).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(200)
        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('closes when the app turns push off, and does not open without it', async () => {
        let aborted = false
        const fetchMock = vi.fn((_u: string, init: RequestInit) => {
            init.signal?.addEventListener('abort', () => { aborted = true })
            return Promise.resolve(sseResponse([push('status', 'mateu-agent-status', { paired: true, agents: [] })], { hold: true }))
        })
        vi.stubGlobal('fetch', fetchMock)
        channel.syncAgentChannel(app({ agentPush: false }), '', shell)
        await flush()
        expect(fetchMock).not.toHaveBeenCalled()

        channel.syncAgentChannel(app(), '', shell)
        await flush()
        expect(channel.agentStatus().paired).toBe(true)
        channel.syncAgentChannel(app({ agentPush: false }), '', shell)
        await flush()
        expect(aborted).toBe(true)
        expect(channel.agentStatus()).toEqual({ connected: false, paired: false, agents: [] })
    })

    it('pairs and unpairs with the same UI session id and secret', async () => {
        runAction.mockResolvedValueOnce({ fragments: [{ data: { _agentPairing: { code: 'K7QX-M2PA', expiresInSeconds: 120 } } }] })
        const from = document.createElement('div')
        const pairing = await channel.pairAgent(app(), '/base', from)
        expect(pairing).toEqual({ code: 'K7QX-M2PA', expiresInSeconds: 120 })
        const args = runAction.mock.calls[0]
        expect(args.slice(0, 7)).toEqual(['/base', '/ops', '', '_agent-pair', 'mateu-agent-connect', undefined, 'com.example.Ops'])
        expect(args[8]).toEqual({ sessionId: sessionStorage.getItem('__mateu_sesion_id'), secret: channel.channelSecret() })

        runAction.mockResolvedValueOnce({ fragments: [{ data: {} }] })
        await expect(channel.pairAgent(app(), '/base', from)).rejects.toThrow()

        runAction.mockResolvedValueOnce({ fragments: [{ data: { _agentPairing: null } }] })
        await channel.unpairAgent(app(), '/base', from)
        expect(runAction.mock.calls[2][3]).toBe('_agent-unpair')
        expect(channel.agentStatus().paired).toBe(false)
    })
})
