// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const rendered: unknown[] = []
vi.mock('./builtInRenderTarget', () => ({
    renderScreenInShell: (_origin: unknown, request: unknown) => { rendered.push(request); return Promise.resolve() },
}))
const navigated: string[] = []
vi.mock('./rowRoute', () => ({ navigateToRoute: (_from: unknown, route: string) => { navigated.push(route) } }))

import './mateu-chat'
import type { MateuChat } from './mateu-chat'
import { claimEvent } from './chatEvents'

/**
 * The UI events of the agent's stream, as the panel handles them: dispatched out of it as they
 * arrive, and the ones nobody takes done by the panel itself — a generated screen no page subscribes
 * to goes to the shell's built-in render target, a navigation outside a shell is made directly.
 */

Element.prototype.scrollTo = () => {}
const enc = new TextEncoder()
const sse = (payload: unknown) => `data:${JSON.stringify(payload)}\n\n`

function liveResponse() {
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const body = new ReadableStream<Uint8Array>({ start(c) { controller = c } })
    return {
        response: new Response(body, { status: 200 }),
        write: (text: string) => controller.enqueue(enc.encode(text)),
        close: () => controller.close(),
    }
}

const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)) }

function chat(parent: Node = document.body): MateuChat {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/agent'
    parent.appendChild(el)
    return el
}

afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    rendered.length = 0
    navigated.length = 0
})

describe('mateu-chat, the events of the stream', () => {
    it('renders an unclaimed render-screen MID-STREAM, and leaves a claimed one to its subscriber', async () => {
        const live = liveResponse()
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(live.response)))
        const el = chat()
        const sending = el.send(new CustomEvent('submit', { detail: { value: 'a check-in screen' } }))
        live.write(sse({ event: 'render-screen', detail: { yaml: 'type: Text\ntext: hi', target: 'drawer' } }))
        await settle()
        // the stream is still open: the screen is already on its way
        expect(rendered).toEqual([{ yaml: 'type: Text\ntext: hi', target: 'drawer' }])

        const claimer = (e: Event) => claimEvent(e)
        document.addEventListener('render-screen', claimer)
        live.write(sse({ event: 'render-screen', detail: { yaml: 'type: Card' } }))
        live.write(sse({ event: 'render-screen', detail: { nothing: true } }))
        live.write('data:Here it is.\n\n')
        live.close()
        await sending
        document.removeEventListener('render-screen', claimer)
        expect(rendered).toHaveLength(1)
        expect((el as unknown as { items: { text: string }[] }).items.at(-1)?.text).toBe('Here it is.')
    })

    it('a navigation the shell takes is the shell\'s; one nobody takes is made by the panel', async () => {
        const live = liveResponse()
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(live.response)))
        const el = chat()
        const shellTook: unknown[] = []
        const shell = (e: Event) => { e.preventDefault(); shellTook.push((e as CustomEvent).detail) }
        el.addEventListener('navigation-requested', shell)
        const sending = el.send(new CustomEvent('submit', { detail: { value: 'open bookings' } }))
        const detail = { route: '/bookings', consumedRoute: '', actionId: '', baseUrl: '/b', serverSideType: 'x.Home', uriPrefix: '' }
        live.write(sse({ event: 'navigation-requested', detail }))
        await settle()
        el.removeEventListener('navigation-requested', shell)
        live.write(sse({ event: 'navigation-requested', detail: { route: '/orders' } }))
        live.write(sse({ event: 'close-requested' }))
        live.close()
        await sending
        expect(shellTook).toEqual([detail])
        expect(navigated).toEqual(['/orders'])
    })

    it('a Chat on a page has no ✕ and ignores close-requested; the custom events go out as they are', async () => {
        const live = liveResponse()
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(live.response)))
        const el = chat()
        el.closable = false
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('.chat-close')).toBeNull()
        const heard: string[] = []
        document.addEventListener('close-requested', () => heard.push('close'))
        document.addEventListener('highlight-row', e => heard.push('highlight ' + (e as CustomEvent).detail.id))
        const sending = el.send(new CustomEvent('submit', { detail: { value: 'x' } }))
        live.write(sse({ event: 'close-requested' }))
        live.write(sse({ event: 'highlight-row', detail: { id: 7 } }))
        live.close()
        await sending
        expect(heard).toEqual(['highlight 7'])
    })

    it('sends the current route, and a Chat inside an app uses the app\'s menu and MCP endpoint', async () => {
        const fetchMock = vi.fn(() => Promise.resolve(new Response('data:ok\n\n', { status: 200 })))
        vi.stubGlobal('fetch', fetchMock)
        const app = document.createElement('mateu-app') as HTMLElement & { component?: unknown }
        app.attachShadow({ mode: 'open' })
        app.component = { metadata: { mcpUrl: '/mcp', menu: [{ label: 'Bookings', route: '/bookings', consumedRoute: '', submenus: [] }] } }
        document.body.appendChild(app)
        const el = chat(app.shadowRoot!)
        await el.send(new CustomEvent('submit', { detail: { value: 'hi' } }))
        const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1].body)
        expect(body.currentRoute).toBe(window.location.pathname)
        expect(body.mcpUrl).toBe(new URL('/mcp', window.location.origin).href)
        expect(body.menuContext[0].path).toEqual(['Bookings'])
    })
})
