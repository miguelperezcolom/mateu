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
    // jsdom has no ResizeObserver (the page header watches its own size)
    ;(globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
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

    it('a route\'s state: seed is shown and edited in the routes editor (it used to be invisible)', async () => {
        const el = await mount('type: Routes\nroutes:\n  - route: page\n    layout: page.yaml\n    state:\n      greeting: Hola\n', 'routes.yaml')
        const editor = el.shadowRoot.querySelector('routes-editor')
        await editor.updateComplete
        const input = [...editor.shadowRoot.querySelectorAll('input')].find((i: HTMLInputElement) => i.value === 'greeting=Hola') as HTMLInputElement
        expect(input, 'the State cell shows the seed').toBeTruthy()
        input.value = 'greeting=Hello, tone=warm'
        input.dispatchEvent(new Event('change'))
        await settle()
        const written = posted.filter((m) => m.type === 'contentChanged').at(-1).yaml
        expect(written).toContain('greeting: Hello')
        expect(written).toContain('tone: warm')
    })

    it('a route\'s appState: seed is shown and edited in its own column, apart from state:', async () => {
        const el = await mount('type: Routes\nroutes:\n  - route: page\n    layout: page.yaml\n    appState:\n      hotel: h1\n', 'routes.yaml')
        const editor = el.shadowRoot.querySelector('routes-editor')
        await editor.updateComplete
        const input = [...editor.shadowRoot.querySelectorAll('input')].find((i: HTMLInputElement) => i.value === 'hotel=h1') as HTMLInputElement
        expect(input, 'the App state cell shows the seed').toBeTruthy()
        input.value = 'hotel=h2'
        input.dispatchEvent(new Event('change'))
        await settle()
        const written = posted.filter((m) => m.type === 'contentChanged').at(-1).yaml
        expect(written).toMatch(/appState:\n\s+hotel: h2/)
        expect(written).not.toMatch(/^\s+state:/m)
    })

    it('components.yaml opens as the business component catalogue, not as an empty page', async () => {
        const el = await mount('components:\n  - name: Agency\n    component: {type: Notice, text: hi}\n', 'components.yaml')
        expect(el.shadowRoot.querySelector('editor-canvas')).toBeNull()
        expect(el.shadowRoot.textContent).toContain('Business components')
        expect(el.shadowRoot.textContent).toContain('Agency')
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

const MOUNT_FILES = (renderer = 'vaadin', orders = PAGE) => [
    { path: 'project.yaml', content: `type: Project\nrenderer: ${renderer}\n` },
    { path: 'app.ui.yaml', content: 'type: UI\nbasePath: /\nhome: orders\nroutes:\n  - routes.yaml\n' },
    { path: 'routes.yaml', content: 'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n  - route: orders\n    layout: orders.yaml\n  - route: users\n    layout: users.yaml\n' },
    { path: 'app.yaml', content: 'type: AppShell\ntitle: Shop\nvariant: MENU_ON_TOP\nmenu:\n  - type: RouteLink\n    label: Orders\n    route: orders\n  - type: Menu\n    label: Admin\n    submenu:\n      - type: RouteLink\n        label: Users\n        route: users\n' },
    { path: 'orders.yaml', content: orders },
    { path: 'users.yaml', content: 'type: Form\ntitle: Users\n' },
]

describe('<mateu-visual-editor> — the project\'s renderer, Play, page settings', () => {
    it('the canvas always paints with the project\'s renderer: no per-page switch, and an old session peek is ignored', async () => {
        sessionStorage.setItem('mateu-visual-editor-renderer-peek', 'vaadin')
        const el = await mount()
        send({ type: 'files', files: MOUNT_FILES('redwood') })
        await settle()
        await el.updateComplete
        const root = el.shadowRoot as ShadowRoot
        // the toolbar names the renderer; it does not offer another one
        expect(root.querySelector('.toolbar .renderer')?.textContent).toContain('Redwood')
        expect(root.querySelector('.toolbar select, .toolbar ve-select.renderer')).toBeNull()
        expect(el.projectRenderer).toBe('redwood')
        // the canvas follows it (jsdom cannot load the Vaadin chunk Redwood's canvas sits on, so it falls
        // back to the DS-neutral one — what it never does is stay on Vaadin, the old peek)
        expect((root.querySelector('editor-canvas') as any).renderer).not.toBe('vaadin')
        expect(sessionStorage.getItem('mateu-visual-editor-renderer-peek')).toBeNull()
    })

    it('no native <select> is left anywhere in the editor (the IDE paints its popup light and clipped)', async () => {
        const el = await mount()
        send({ type: 'files', files: MOUNT_FILES() })
        await settle()
        const all: Element[] = []
        const walk = (r: ParentNode) => r.querySelectorAll('*').forEach((e) => { all.push(e); if (e.shadowRoot) walk(e.shadowRoot) })
        walk(el.shadowRoot)
        expect(all.filter((e) => e.tagName === 'SELECT')).toEqual([])
        expect(all.some((e) => e.tagName === 'VE-SELECT')).toBe(true)
    })

    it('keys pressed on one of the editor\'s dropdowns are the dropdown\'s, not the canvas\'s (Delete does not delete the node)', async () => {
        const el = await mount()
        el.selectedPath = [0]
        await el.updateComplete
        const select = el.shadowRoot.querySelector('ve-select') as HTMLElement
        const trigger = select.shadowRoot!.querySelector('button') as HTMLButtonElement
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, composed: true }))
        await el.updateComplete
        expect(el.selectedPath).toEqual([0])
        expect(posted.filter((m) => m.type === 'contentChanged')).toEqual([])
    })

    it('Play keeps the running app when the same files arrive again (the IDE re-pushes them after any file event)', async () => {
        const el = await mount(PAGE, 'orders.yaml')
        send({ type: 'files', files: MOUNT_FILES() })
        await settle()
        el.view = 'play'
        await el.updateComplete
        await settle()
        const play = el.shadowRoot.querySelector('mount-play') as any
        await play.updateComplete
        await settle()
        const ux = play.shadowRoot.querySelector('mateu-ux')
        expect(ux).toBeTruthy()
        // the host pushes the very same files (new arrays), and the image list: nothing to reload
        send({ type: 'files', files: MOUNT_FILES() })
        send({ type: 'images', images: [] })
        await settle()
        await play.updateComplete
        expect(play.shadowRoot.querySelector('mateu-ux')).toBe(ux)
        // a real change (another file of the mount, edited elsewhere) does reload it
        send({ type: 'files', files: MOUNT_FILES().map((f) => (f.path === 'users.yaml' ? { ...f, content: 'type: Form\ntitle: People\n' } : f)) })
        await settle()
        await play.updateComplete
        await settle()
        await play.updateComplete
        expect(play.shadowRoot.querySelector('mateu-ux')).not.toBe(ux)
    })

    it('the page\'s Properties offer pageType (empty = inferred) and write it to the definition', async () => {
        const el = await mount()
        el.selectedPath = []
        await el.updateComplete
        const props = el.shadowRoot.querySelector('editor-properties') as any
        await props.updateComplete
        const select = props.shadowRoot.querySelector('ve-select.page-type') as any
        expect(select).toBeTruthy()
        expect(select.value).toBe('')
        expect([...select.querySelectorAll('option')].map((o: HTMLOptionElement) => o.textContent)).toEqual(
            ['inferred', 'landing', 'collection', 'detail', 'form', 'process', 'dashboard'])
        select.value = 'form'
        select.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await el.updateComplete
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1).yaml).toContain('pageType: form')
        // a child node is not the page: no page section
        el.selectedPath = [0]
        await el.updateComplete
        await props.updateComplete
        expect(props.shadowRoot.querySelector('ve-select.page-type')).toBeNull()
    })

    it('a Form\'s Properties carry the page header editor, and its edits reach the file', async () => {
        const el = await mount('type: Form\ntitle: Orders\nbadges:\n  - {label: VIP, color: success}\ncontent:\n  - type: Text\n    text: Hello\n')
        el.selectedPath = []
        await el.updateComplete
        const props = el.shadowRoot.querySelector('editor-properties') as any
        await props.updateComplete
        const header = props.shadowRoot.querySelector('page-header-editor') as any
        expect(header).toBeTruthy()
        await header.updateComplete
        // the header keys are edited there — not listed as "edited on the canvas", not repeated as text
        expect(props.shadowRoot.querySelector('.muted')?.textContent ?? '').not.toMatch(/badges|kpis|banners|fabs|peerNav|recordSwitcher/)
        const overline = header.shadowRoot.querySelector('input.overline') as HTMLInputElement
        overline.value = 'Sales'
        overline.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await el.updateComplete
        const yaml = posted.filter((m) => m.type === 'contentChanged').at(-1).yaml
        expect(yaml).toContain('overline: Sales')
        expect(yaml).toContain('  - {label: VIP, color: success}')
        // a child that is not a Form gets no page header
        el.selectedPath = [0]
        await el.updateComplete
        await props.updateComplete
        expect(props.shadowRoot.querySelector('page-header-editor')).toBeNull()
    })

    it('the app shell editor writes the header extras', async () => {
        const el = await mount('type: AppShell\ntitle: Shop\nmenu: []\n', 'app.yaml')
        const app = el.shadowRoot.querySelector('app-editor') as any
        await app.updateComplete
        const extras = app.shadowRoot.querySelector('app-header-extras') as any
        expect(extras).toBeTruthy()
        await extras.updateComplete
        extras.shadowRoot.querySelector('button[data-add=headerActions]').click()
        await el.updateComplete
        const yaml = posted.filter((m) => m.type === 'contentChanged').at(-1).yaml
        expect(yaml).toContain('headerActions:')
        expect(yaml).toContain('title: Shop')
    })

    it('an icon property is free text plus a picker of the project\'s icons', async () => {
        const el = await mount('type: Form\ntitle: Orders\ncontent:\n  - type: Button\n    label: Buy\n    iconOnLeft: vaadin:cart\n')
        send({ type: 'files', files: MOUNT_FILES('redwood') })
        await settle()
        el.selectedPath = [0]
        await el.updateComplete
        const props = el.shadowRoot.querySelector('editor-properties') as any
        await props.updateComplete
        const picker = props.shadowRoot.querySelector('ve-icon-picker') as any
        expect(picker).toBeTruthy()
        expect(picker.value).toBe('vaadin:cart')
        expect(picker.renderer).toBe('redwood')
        // free text still works: what is typed is what is written
        const input = picker.shadowRoot.querySelector('input.value') as HTMLInputElement
        input.value = 'oj-ux-ico-bed'
        input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await el.updateComplete
        expect(posted.filter((m) => m.type === 'contentChanged').at(-1).yaml).toContain('iconOnLeft: oj-ux-ico-bed')
    })
})
