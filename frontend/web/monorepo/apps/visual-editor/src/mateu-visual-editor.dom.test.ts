// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The whole editor element, mounted in jsdom against a fake IDE host (the JCEF channel): what the
// host is told and when. The model under it has its own suites; this pins the wiring.

const posted: any[] = []
let listener: ((e: MessageEvent) => void) | undefined
const host = {
    postMessage: (m: unknown) => posted.push(m),
    addEventListener: (_: 'message', cb: (e: MessageEvent) => void) => { listener = cb },
}
const send = (data: unknown) => listener?.(new MessageEvent('message', { data }))
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0)) }

const PAGE = 'type: Form\ntitle: Orders\ncontent:\n  - type: Text\n    text: Hello\n'

beforeEach(async () => {
    posted.length = 0
    ;(window as any).__mateuHost = host
    ;(window as any).__mateuBaseUrl = ''
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as any
    // jsdom has no CSS.escape (the canvas looks painted nodes up by id with it)
    const css = ((globalThis as any).CSS ??= {})
    css.escape ??= (v: string) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
    await import('./mateu-visual-editor')
})
afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    delete (window as any).__mateuHost
})

async function mount(yaml = PAGE, path = 'orders.yaml') {
    const el = document.createElement('mateu-visual-editor') as any
    document.body.appendChild(el)
    send({ type: 'init', yaml, baseUrl: 'http://127.0.0.1:1', path })
    await settle()
    await el.updateComplete
    return el
}

describe('<mateu-visual-editor> against an IDE host', () => {
    it('says ready, asks for the mount and its images, and renders the file it was given', async () => {
        const el = await mount()
        expect(posted[0]).toEqual({ type: 'ready' })
        expect(posted.map((m) => m.type)).toEqual(expect.arrayContaining(['listFiles', 'listImages']))
        expect(el.shadowRoot).toBeTruthy()
        // opening a file is not an edit: the IDE document is not marked dirty
        expect(posted.filter((m) => m.type === 'contentChanged')).toEqual([])
    })

    it('an out-of-band change reloads the editor, and undo puts the previous text back as an edit', async () => {
        const el = await mount()
        const changed = PAGE.replace('Hello', 'Bye')
        send({ type: 'externalChange', yaml: changed })
        await settle()
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }))
        await el.updateComplete
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1)).toEqual({ type: 'contentChanged', yaml: PAGE })
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true }))
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1)).toEqual({ type: 'contentChanged', yaml: changed })
        // nothing further to redo
        const before = posted.length
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }))
        expect(posted.length).toBe(before)
    })

    it('our own write echoed back by the host is not a new history step', async () => {
        const el = await mount()
        send({ type: 'externalChange', yaml: PAGE })
        await settle()
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }))
        await el.updateComplete
        expect(posted.filter((m) => m.type === 'contentChanged')).toEqual([])
    })

    it('keys typed in a field keep the field\'s own undo', async () => {
        const el = await mount()
        send({ type: 'externalChange', yaml: PAGE.replace('Hello', 'Bye') })
        await settle()
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, composed: true }))
        await el.updateComplete
        expect(posted.filter((m) => m.type === 'contentChanged')).toEqual([])
    })

    it('opens each specs/ui file kind in its own editor', async () => {
        const cases: [string, string, string][] = [
            ['type: Routes\nroutes:\n  - route: ""\n    layout: home.yaml\n', 'routes.yaml', 'routes-editor'],
            ['type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n', 'app.ui.yaml', 'mount-editor'],
            ['type: Sources\nsources: []\n', 'sources.yaml', 'sources-editor'],
            ['type: AppShell\ntitle: Shop\nmenu: []\n', 'app.yaml', 'app-editor'],
            [PAGE, 'orders.yaml', 'editor-canvas'],
        ]
        for (const [yaml, path, tag] of cases) {
            const el = await mount(yaml, path)
            expect(el.shadowRoot.querySelector(tag), `${path} → <${tag}>`).toBeTruthy()
            el.remove()
        }
    })

    it('Delete removes the selected node and hands the host the text with the author\'s comments kept', async () => {
        const commented = '# my page\ntype: Form\ntitle: Orders # the title\ncontent:\n  - type: Text\n    text: Hello\n  - type: Text\n    text: Bye\n'
        const el = await mount(commented)
        el.selectedPath = [0]
        await el.updateComplete
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }))
        await el.updateComplete
        const written = posted.filter((m) => m.type === 'contentChanged').at(-1).yaml
        expect(written).toContain('# my page')
        expect(written).toContain('# the title')
        expect(written).not.toContain('Hello')
        expect(written).toContain('Bye')
        expect(el.selectedPath).toBeNull()
        // and undo brings it back
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', metaKey: true }))
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1).yaml).toBe(commented)
    })

    it('Ctrl+D duplicates the selected node and selects the copy; arrows walk the tree', async () => {
        const el = await mount()
        el.selectedPath = [0]
        await el.updateComplete
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true }))
        await el.updateComplete
        expect(el.selectedPath).toEqual([1])
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1).yaml.match(/text: Hello/g)).toHaveLength(2)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
        expect(el.selectedPath).toEqual([0])
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
        expect(el.selectedPath).toEqual([])
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        expect(el.selectedPath).toEqual([0])
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(el.selectedPath).not.toEqual([0])
    })
})
