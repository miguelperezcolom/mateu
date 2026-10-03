// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-chat'
import type { MateuChat } from './mateu-chat'

// jsdom lays nothing out, so it has no scrolling; the chat scrolls to its last message.
Element.prototype.scrollTo = () => {}

const enc = new TextEncoder()
const sse = (payload: unknown) => `data:${typeof payload === 'string' ? payload : JSON.stringify(payload)}\n\n`

/** A response whose body the test writes to as it goes, to look at the panel mid-answer. */
function liveResponse() {
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const body = new ReadableStream<Uint8Array>({ start(c) { controller = c } })
    return {
        response: new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
        write: (text: string) => controller.enqueue(enc.encode(text)),
        close: () => controller.close(),
    }
}

function chat(): MateuChat {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/ai/api/agent/stream'
    ;(el as unknown as { menu: unknown[] }).menu = []
    document.body.appendChild(el)
    return el
}

const items = (el: MateuChat) => (el as unknown as { items: { text: string }[] }).items
const tokens = (el: MateuChat) => (el as unknown as { tokenUsage: unknown }).tokenUsage
const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)) }

afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

describe('mateu-chat, with an agent that streams and reports its progress', () => {
    it('shows the pieces as they come, what the agent is doing, and then the clean whole answer', async () => {
        const live = liveResponse()
        vi.stubGlobal('fetch', vi.fn((url: string) => url === '/ai/api/agent/stream'
            ? Promise.resolve(live.response)
            : Promise.reject(new Error('no local agent'))))
        const el = chat()
        const navigations: unknown[] = []
        el.addEventListener('navigation-requested', e => navigations.push((e as CustomEvent).detail))

        const sending = el.send(new CustomEvent('submit', { detail: { value: '¿reservas?' } }))
        live.write(sse({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }))
        live.write(sse({ event: 'agent-status', detail: { phase: 'thinking', text: 'Pensando…' } }))
        live.write(sse({ event: 'agent-delta', detail: { text: 'Voy a ' } }))
        live.write(sse({ event: 'agent-delta', detail: { text: 'mirar.' } }))
        live.write(sse({ event: 'agent-tool', detail: { name: 'booking_findBookings', server: 'booking', kind: 'mcp', phase: 'start' } }))
        await settle()
        await el.updateComplete

        expect(items(el).at(-1)?.text).toBe('Voy a mirar.')
        const root = el.shadowRoot!
        expect(root.querySelector('.loading-text')?.textContent).toContain('Llamando a booking_findBookings…')
        expect(root.querySelector('.tool-step.running .tool-step-name')?.textContent).toBe('booking_findBookings')
        // the zero placeholder is not a count
        expect(tokens(el)).toBeUndefined()

        live.write(sse({ event: 'agent-tool', detail: { name: 'booking_findBookings', server: 'booking', kind: 'mcp', phase: 'end', ms: 1200 } }))
        live.write(':keep-alive\n\n')
        live.write(sse({ event: 'agent-delta', detail: { text: '\n\nTienes 3.' } }))
        await settle()
        await el.updateComplete
        expect(items(el).at(-1)?.text).toBe('Voy a mirar.\n\nTienes 3.')
        expect(root.querySelector('.tool-step.done .tool-step-time')?.textContent).toBe('1,2 s')
        expect(root.querySelector('.loading-text')?.textContent).toContain('Respondiendo…')

        live.write(sse({ inputTokens: 250, outputTokens: 30, totalTokens: 280 }))
        live.write(sse({ event: 'navigation-requested', detail: { route: '/bookings' } }))
        live.write('data:Tienes 3 reservas.\ndata:\ndata:- MRU01\n\n')
        live.close()
        await sending

        // the final text REPLACES what was streamed; the progress goes with the turn
        expect(items(el).at(-1)?.text).toBe('Tienes 3 reservas.\n\n- MRU01')
        expect(tokens(el)).toEqual({ inputTokens: 250, outputTokens: 30, totalTokens: 280 })
        expect(navigations).toEqual([{ route: '/bookings' }])
        await el.updateComplete
        expect(root.querySelector('.tool-steps')).toBeNull()
        expect(root.querySelector('.loading-bar')).toBeNull()
    })

    it('still reads an agent that sends its answer a line per event, as agents always have', async () => {
        vi.stubGlobal('fetch', vi.fn((url: string) => url === '/ai/api/agent/stream'
            ? Promise.resolve(new Response('data: ## Estado\n\ndata: \n\ndata:   - anidado\n\n{', { status: 200 }))
            : Promise.reject(new Error('no local agent'))))
        const el = chat()

        await el.send(new CustomEvent('submit', { detail: { value: 'hola' } }))

        // the stray '{' at the end is not an event: no blank line ever completed it... and no
        // `data:` field either, so nothing is added
        expect(items(el).at(-1)?.text).toBe('## Estado\n\n  - anidado')
    })
})
