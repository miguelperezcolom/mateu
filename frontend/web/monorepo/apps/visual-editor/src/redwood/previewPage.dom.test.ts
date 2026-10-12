// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adaptIndexHtml, bootRedwoodPreview, deferredScripts, installPlayBridge, isPlayPage, replayDeferred } from './previewPage'
import { PREVIEW_KEY } from '../canvas/redwoodProtocol'

// The Redwood canvas page (an iframe): booting the packaged VB app the way the generated controller
// would, and — in Play — standing in for its backend by asking the editor.

/** Everything the page tells its editor (window.parent is the window itself in a top-level jsdom). */
let told: any[]
beforeEach(() => {
    told = []
    vi.spyOn(window, 'postMessage').mockImplementation(((m: unknown) => { told.push(m) }) as any)
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    history.replaceState(null, '', '/')
})
afterEach(() => vi.restoreAllMocks())

const PACKAGED = `<!doctype html><html lang="en"><head><base href="/"><title>AQUIELTITULODELAPAGINA</title>
<script>vbInitConfig = { BASE_URL: '/_redwood/' }</script></head>
<body class="oj-web"><div id="app"></div>
<script type="text/mateu-deferred" data-src="https://static.oracle.com/require.js" data-x="1"></script>
<script type="text/mateu-deferred">window.__inline = (window.__inline || 0) + 1</script>
<script type="text/mateu-deferred" data-src="https://static.oracle.com/runtime.js"></script>
</body></html>`

describe('booting the packaged Redwood app', () => {
    it('re-anchors the page under the prefix it is served from', () => {
        const html = adaptIndexHtml(PACKAGED.replace("BASE_URL: '/_redwood/'", "BASE_URL: '_redwood/'"), '/redwood/')
        expect(html).toContain('<base href="/redwood/">')
        expect(html).toContain("BASE_URL: '/redwood/_redwood/'")
    })

    it('replays the parked boot scripts IN ORDER, each waiting for the previous one', () => {
        document.body.innerHTML = PACKAGED.slice(PACKAGED.indexOf('<div id="app">'), PACKAGED.indexOf('</body>'))
        expect(deferredScripts(document)).toHaveLength(3)
        const failed = vi.fn()
        replayDeferred(document, failed)
        const live = () => Array.from(document.querySelectorAll('script'))
        // the first (external) one is live and nothing after it yet
        expect(live()[0].getAttribute('src')).toBe('https://static.oracle.com/require.js')
        expect(live()[0].getAttribute('data-x')).toBe('1')
        expect(live()[0].type).toBe('')
        expect(live()[1].type).toBe('text/mateu-deferred')
        live()[0].dispatchEvent(new Event('load'))
        // the inline one and the next external one are promoted
        expect(live()[1].type).toBe('')
        expect(live()[1].text).toContain('window.__inline')
        expect(live()[2].getAttribute('src')).toBe('https://static.oracle.com/runtime.js')
        live()[2].dispatchEvent(new Event('error'))
        expect(failed).toHaveBeenCalledWith('https://static.oracle.com/runtime.js')
        expect(deferredScripts(document)).toHaveLength(0)
    })

    it('says the renderer is unavailable — to the editor and on the page — when there is no _index.html', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 404 })))
        await bootRedwoodPreview('/redwood/', false)
        expect(told).toContainEqual({ [PREVIEW_KEY]: 'unavailable', reason: 'HTTP 404' })
        expect(document.querySelector('[role="alert"]')!.textContent).toMatch(/not available here.*\/redwood\/_index\.html/s)
        expect((window as any).__mateuEditorPreview).toBe(true)
        vi.unstubAllGlobals()
    })

    it('mounts the page under the prefix and reports a boot script that cannot load', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(PACKAGED)))
        await bootRedwoodPreview('/redwood/', false)
        expect(document.head.firstElementChild!.outerHTML).toBe('<base href="/redwood/">')
        expect(document.body.classList.contains('oj-web')).toBe(true)
        expect(document.documentElement.getAttribute('lang')).toBe('en')
        const first = document.querySelector('script[src="https://static.oracle.com/require.js"]')!
        first.dispatchEvent(new Event('error'))
        expect(told).toContainEqual({ [PREVIEW_KEY]: 'boot-failed', url: 'https://static.oracle.com/require.js' })
        expect(document.querySelector('[role="alert"]')!.textContent).toMatch(/static\.oracle\.com/)
        vi.unstubAllGlobals()
    })

    it('tells a Play frame from a canvas by its query', () => {
        expect(isPlayPage({ search: '?play=1' })).toBe(true)
        expect(isPlayPage({ search: '' })).toBe(false)
    })
})

describe('Play: the editor is the backend', () => {
    const fromEditor = (data: unknown, source: unknown = window) =>
        window.dispatchEvent(new MessageEvent('message', { data, source: source as Window }))

    // first: every bridge installed patches history for good, so later ones would report too
    it("reports the app's route changes once, and moves the app when the editor navigates", () => {
        window.fetch = vi.fn() as any
        installPlayBridge(window)
        history.pushState(null, '', '#/orders')
        history.replaceState(null, '', '#/orders')
        expect(told.filter((m) => m[PREVIEW_KEY] === 'route')).toEqual([{ [PREVIEW_KEY]: 'route', route: 'orders' }])
        fromEditor({ [PREVIEW_KEY]: 'navigate', route: '/customers/7' })
        expect(location.hash).toBe('#/customers/7')
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        // asked for by the editor: not reported back as news
        expect(told.filter((m) => m[PREVIEW_KEY] === 'route')).toHaveLength(1)
    })

    it("routes the app's /mateu/v3 calls to the editor and answers them with its reply", async () => {
        const real = vi.fn(async () => new Response('real'))
        window.fetch = real as any
        installPlayBridge(window)
        const pending = window.fetch('/mateu/v3/sync/orders', { method: 'POST', body: JSON.stringify({ route: '/orders', actionId: '' }) })
        await Promise.resolve()
        const call = told.find((m) => m[PREVIEW_KEY] === 'call')
        expect(call).toMatchObject({ id: 1, url: '/mateu/v3/sync/orders', body: { route: '/orders', actionId: '' } })
        fromEditor({ [PREVIEW_KEY]: 'answer', id: 1, status: 200, json: { fragments: [] } })
        const res = await pending
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({ fragments: [] })
        // anything else still goes to the network
        expect(await (await window.fetch('/assets/x.css')).text()).toBe('real')
        expect(real).toHaveBeenCalledTimes(1)
    })

    it('ignores answers from any window but the editor', async () => {
        window.fetch = vi.fn() as any
        installPlayBridge(window)
        let settled = false
        window.fetch('/mateu/v3/sync/x', { method: 'POST', body: 'not json' }).then(() => { settled = true })
        await Promise.resolve()
        fromEditor({ [PREVIEW_KEY]: 'answer', id: 1, status: 200, json: {} }, {})
        await new Promise((r) => setTimeout(r, 0))
        expect(settled).toBe(false)
        expect(told.find((m) => m[PREVIEW_KEY] === 'call').body).toEqual({})
    })

})
