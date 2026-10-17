// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Play on Redwood: this element is the running Redwood app's backend. The app (in the frame) posts
// `call`s and route changes; the element answers from the files (no bundle loaded here → the empty
// increment, or a "needs a backend" answer for an action), forwards to the preview backend when there
// is one, reports routes, and says plainly when Redwood could not start.

beforeAll(async () => { await import('./redwood-play') })
afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals(); vi.useRealTimers() })

const settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0)) }

async function play(props: Record<string, unknown> = {}) {
    const el = document.createElement('redwood-play') as any
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    const frame = el.shadowRoot.querySelector('iframe') as HTMLIFrameElement
    const toFrame: any[] = []
    // jsdom gives a frame inside a shadow root no browsing context: stand in for the app's window
    const appWindow = { postMessage: (m: unknown) => { toFrame.push(m) } }
    Object.defineProperty(frame, 'contentWindow', { configurable: true, get: () => appWindow })
    const fromFrame = (data: unknown) => window.dispatchEvent(new MessageEvent('message', { data, source: appWindow as any }))
    return { el, frame, toFrame, fromFrame }
}

describe('<redwood-play>', () => {
    it('frames the Redwood page in play mode at the route it was opened on', async () => {
        const { frame } = await play({ route: 'orders' })
        const url = new URL(frame.src)
        expect(url.searchParams.get('play')).toBe('1')
        expect(url.hash).toBe('#/orders')
    })

    it('answers the app\'s calls itself when there is no backend: the bootstrap empty, an action as "needs a backend"', async () => {
        const { el, toFrame, fromFrame } = await play()
        fromFrame({ mateuPreview: 'call', id: 1, url: '/mateu/v3/components/_/action', body: {} })
        fromFrame({ mateuPreview: 'call', id: 2, url: '/mateu/v3/sync/orders', body: { actionId: 'save' } })
        await settle()
        expect(toFrame.map((m) => [m.mateuPreview, m.id, m.status])).toEqual([['answer', 1, 200], ['answer', 2, 200]])
        expect(JSON.stringify(toFrame[1].json)).toContain('save')
        // the first call means the app is up: the booting notice is gone
        await el.updateComplete
        expect(el.shadowRoot.querySelector('.booting')).toBeNull()
    })

    it('forwards what it cannot answer to the preview backend, and says 503 when that is down', async () => {
        const fetch = vi.fn(async () => new Response('{"ok":true}', { status: 201 }))
        vi.stubGlobal('fetch', fetch)
        const { toFrame, fromFrame } = await play({ baseUrl: 'http://backend/' })
        fromFrame({ mateuPreview: 'call', id: 7, url: '/mateu/v3/sync/orders', body: { actionId: 'save', x: 1 } })
        await settle()
        expect(fetch).toHaveBeenCalledWith('http://backend/mateu/v3/sync/orders', expect.objectContaining({ method: 'POST', body: JSON.stringify({ actionId: 'save', x: 1 }) }))
        expect(toFrame[0]).toMatchObject({ mateuPreview: 'answer', id: 7, status: 201, json: { ok: true } })
        fetch.mockRejectedValueOnce(new Error('down'))
        fromFrame({ mateuPreview: 'call', id: 8, url: '/mateu/v3/sync/orders', body: { actionId: 'save' } })
        await settle()
        expect(toFrame[1]).toMatchObject({ id: 8, status: 503 })
    })

    it('reports the app\'s route, and moves the app when Play asks for another one (not for the same)', async () => {
        const { el, toFrame, fromFrame } = await play({ route: '' })
        const routes: string[] = []
        el.addEventListener('play-route', (e: CustomEvent) => routes.push(e.detail.route))
        fromFrame({ mateuPreview: 'route', route: '#/orders?page=2' })
        expect(routes).toEqual(['orders?page=2'])
        el.route = 'orders?page=2'
        await el.updateComplete
        expect(toFrame).toEqual([])
        el.route = 'users'
        await el.updateComplete
        expect(toFrame).toEqual([{ mateuPreview: 'navigate', route: 'users' }])
    })

    it('ignores messages from anything but its frame', async () => {
        const { toFrame } = await play()
        window.dispatchEvent(new MessageEvent('message', { data: { mateuPreview: 'call', id: 1, url: '/mateu/v3/components/x', body: {} } }))
        await settle()
        expect(toFrame).toEqual([])
    })

    it('says why Redwood did not start: a script that would not load, the app unavailable, or nothing at all', async () => {
        const a = await play()
        a.fromFrame({ mateuPreview: 'boot-failed', url: 'https://static.oracle.com/x.js' })
        await a.el.updateComplete
        expect(a.el.shadowRoot.querySelector('[role=alert]').textContent).toContain('This script could not be loaded: https://static.oracle.com/x.js')
        expect(a.el.shadowRoot.querySelector('iframe')).toBeNull()
        a.el.remove()

        const b = await play()
        b.fromFrame({ mateuPreview: 'unavailable', reason: '404' })
        await b.el.updateComplete
        expect(b.el.shadowRoot.querySelector('[role=alert]').textContent).toContain('The app could not be loaded (404)')
        b.el.remove()

        vi.useFakeTimers()
        const c = document.createElement('redwood-play') as any
        document.body.appendChild(c)
        vi.advanceTimersByTime(46_000)
        await c.updateComplete
        expect(c.shadowRoot.querySelector('[role=alert]').textContent).toContain('Nothing answered after 45 s')
    })
})
