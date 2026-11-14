// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * A `query` message on the live UI push channel (an agent reading or operating this tab) is
 * answered through `_agent-screen` with the request id, the "An AI agent is operating this screen"
 * notice comes up, and its Stop unpairs the tab and closes the channel — which stays closed until
 * the user connects an agent again.
 */

vi.mock('./agentEvents', () => ({ applyAgentEvent: () => undefined }))
const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({
    mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) },
    mateuCallsInFlight: () => 0,
}))

type Channel = typeof import('./agentChannel')
type Operating = typeof import('./agentOperating')

const app = { agentPush: true, rootRoute: '/ops', serverSideType: 'com.example.Ops' } as never

const sseResponse = (chunks: string[]) => {
    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
        start(controller) { for (const chunk of chunks) controller.enqueue(encoder.encode(chunk)) },
    })
    return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}
const push = (kind: string, event: string, detail?: unknown) =>
    'data: ' + JSON.stringify({ commands: [{ type: 'AgentPush', data: { kind, event, detail } }] }) + '\n\n'

const waitFor = async (condition: () => boolean, ms = 3_000) => {
    const deadline = Date.now() + ms
    while (!condition()) {
        if (Date.now() > deadline) throw new Error('timed out')
        await new Promise((r) => setTimeout(r, 20))
    }
}

let channel: Channel
let operating: Operating
let shell: HTMLElement

beforeEach(async () => {
    vi.resetModules()
    sessionStorage.clear()
    runAction.mockReset()
    runAction.mockResolvedValue({})
    channel = await import('./agentChannel')
    operating = await import('./agentOperating')
    shell = document.createElement('mateu-app')
    ;(shell as unknown as { component: unknown }).component = { metadata: { title: 'Ops' } }
    document.body.appendChild(shell)
})

afterEach(() => {
    channel.syncAgentChannel(undefined, '', shell)
    channel.resetAgentChannel()
    operating.resetAgentOperating()
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('queries on the live UI push channel', () => {
    it('answers describe-screen through _agent-screen, and shows the operating notice', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse([
            push('status', 'mateu-agent-status', { paired: true, agents: ['an agent'] }),
            push('query', 'describe-screen', { requestId: 'r-1' }),
        ])))
        vi.stubGlobal('fetch', fetchMock)
        channel.syncAgentChannel(app, '/base', shell)
        await waitFor(() => runAction.mock.calls.length > 0)
        const [baseUrl, route, , actionId, , , serverSideType, , parameters, , background] = runAction.mock.calls[0]
        expect([baseUrl, route, actionId, serverSideType, background]).toEqual(['/base', '/ops', '_agent-screen', 'com.example.Ops', true])
        expect(parameters).toMatchObject({ requestId: 'r-1', secret: sessionStorage.getItem(channel.AGENT_SECRET_KEY) })
        expect(parameters.sessionId).toBeTruthy()
        expect(parameters.screen).toMatchObject({ focus: 'page', ui: { appTitle: 'Ops' } })
        expect(operating.agentOperating()).toBe(true)
        await waitFor(() => !!document.body.querySelector('mateu-agent-operating'))
    })

    it('a query it cannot read is refused with a code, and an unknown event is ignored', async () => {
        expect(await channel.runQuery(shell, 'run-action', { actionId: 'nope' })).toEqual({ error: { code: 'unknownAction', id: 'nope' } })
        expect(await channel.runQuery(shell, 'paint-it-red', {})).toEqual({ error: { code: 'unsupported' } })
        expect(channel.queryOf({ kind: 'query', event: 'describe-screen', detail: {} })).toBeNull()
        expect(channel.queryOf({ kind: 'query', event: 'other', detail: { requestId: 'x' } })).toBeNull()
    })

    it('Stop unpairs the tab and closes its channel until the user connects an agent again', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse([push('status', 'mateu-agent-status', { paired: true, agents: ['an agent'] })])))
        vi.stubGlobal('fetch', fetchMock)
        channel.syncAgentChannel(app, '', shell)
        await waitFor(() => channel.agentStatus().connected)
        operating.noteAgentQuery()
        await operating.stopAgent()
        expect(runAction.mock.calls.at(-1)?.[3]).toBe('_agent-unpair')
        expect(channel.agentStatus()).toEqual({ connected: false, paired: false, agents: [] })
        expect(channel.agentChannelStopped()).toBe(true)
        expect(operating.agentOperating()).toBe(false)
        // a shell update does not reopen it
        channel.syncAgentChannel(app, '', shell)
        await new Promise((r) => setTimeout(r, 50))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        // connecting an agent again does
        runAction.mockResolvedValue({ fragments: [{ data: { _agentPairing: { code: 'ABCD-EFGH', expiresInSeconds: 300 } } }] })
        const pairing = await channel.pairAgent(app, '', shell)
        expect(pairing.code).toBe('ABCD-EFGH')
        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(channel.agentChannelStopped()).toBe(false)
    })
})
