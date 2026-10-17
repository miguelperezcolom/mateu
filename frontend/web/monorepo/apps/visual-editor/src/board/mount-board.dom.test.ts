// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { ProjectFile } from '../model/projectIndex'

// The board as the author uses it: one card per screen of the mount, arrows read off the files, and
// every edit (create a screen, give a page a route, draw / delete an arrow) handed to the shell as a
// `board-write` of whole files — which the board then re-derives from. jsdom lays nothing out, so a
// pointer position is computed from the card's own `left/top` and the board's pan/zoom.

beforeAll(async () => {
    // the miniatures only paint once scrolled into view; jsdom has no IntersectionObserver
    ;(globalThis as any).IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./mount-board')
})

const f = (path: string, content: string): ProjectFile => ({ path, content })
const MOUNT = (): ProjectFile[] => [
    f('app.ui.yaml', 'type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n'),
    f('routes.yaml', 'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n  - route: orders\n    layout: orders.yaml\n  - route: users\n    layout: users.yaml\n'),
    f('app.yaml', 'type: AppShell\ntitle: Shop\nsubtitle: Back office\nmenu:\n  - type: RouteLink\n    label: Orders\n    route: orders\n  - type: Menu\n    label: Admin\n    submenu:\n      - type: RouteLink\n        label: Users\n        route: users\n'),
    f('orders.yaml', 'type: Listing\ntitle: Orders\ntoolbar:\n  - {type: Button, label: Archive, actionable: {type: RouteLink, route: archive}}\n'),
    f('users.yaml', 'type: Form\ntitle: Users\n'),
    f('draft.yaml', 'type: Form\ntitle: Draft\n'),
]

const settle = async (el: any) => { for (let i = 0; i < 3; i++) { await el.updateComplete; await new Promise((r) => setTimeout(r, 0)) } }

async function board(props: Record<string, unknown> = {}, files = MOUNT()) {
    const el = document.createElement('mount-board') as any
    Object.assign(el, { files, canOpen: true, canEdit: true, ...props })
    const events: { type: string; detail: any }[] = []
    for (const t of ['board-write', 'board-open', 'board-play']) el.addEventListener(t, (e: CustomEvent) => events.push({ type: t, detail: e.detail }))
    document.body.appendChild(el)
    await settle(el)
    const root = el.shadowRoot as ShadowRoot
    return { el, root, events }
}
const card = (root: ShadowRoot, id: string) => root.querySelector(`.card[data-screen="${id}"]`) as HTMLElement
const button = (scope: ParentNode, text: string) => [...scope.querySelectorAll('button')].find((b) => b.textContent!.trim() === text) as HTMLButtonElement
const writes = (events: { type: string; detail: any }[]) => events.filter((e) => e.type === 'board-write').map((e) => e.detail.writes)

afterEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
})

describe('<mount-board> reading the mount', () => {
    it('with no routed screen it says what the board needs', async () => {
        const { root } = await board({}, [])
        expect(root.querySelector('.empty')?.textContent).toContain('No screens to map')
    })

    it('draws a card per screen: the shell by its title and menu, pages by route, the current file highlighted', async () => {
        const { root } = await board({ currentPath: 'specs/ui/users.yaml' })
        const shell = card(root, '')
        expect(shell.querySelector('.shell-title')?.textContent).toBe('Shop')
        expect(shell.textContent).toContain('Back office')
        expect([...shell.querySelectorAll('.menu span')].map((s) => s.textContent)).toEqual(['Orders', 'Admin', 'Users'])
        expect(card(root, 'orders').querySelector('.route')?.textContent).toContain('/orders')
        expect(card(root, 'users').classList.contains('current')).toBe(true)
        // a page no route serves is drawn too, dashed, saying so
        const draft = card(root, 'file:draft.yaml')
        expect(draft.classList.contains('unrouted')).toBe(true)
        expect(draft.textContent).toContain('no route serves this page')
        // the legend lists only the kinds of arrow this mount has
        expect(root.querySelector('.legend')?.textContent).toContain('menu')
        expect(root.querySelector('.legend')?.textContent).not.toContain('after save')
    })

    it('a link to a route the mount does not have is a warning and a red ghost card to create', async () => {
        const { root } = await board()
        expect(root.querySelector('.warn')?.textContent).toContain('archive')
        const ghost = root.querySelector('.card.ghost[data-ghost="archive"]') as HTMLElement
        expect(ghost.textContent).toContain('linked from /orders')
        expect(button(ghost, 'Create screen…')).toBeTruthy()
    })

    it('a read-only board offers no edit: no ghost button, no ports, no undo', async () => {
        const { root } = await board({ canEdit: false, canOpen: false })
        expect(button(root.querySelector('.card.ghost')!, 'Create screen…')).toBeUndefined()
        expect(root.querySelector('.port')).toBeNull()
        expect(button(root, 'Undo')).toBeUndefined()
        expect(button(card(root, 'orders'), 'Edit')).toBeUndefined()
    })
})

describe('<mount-board> opening and playing', () => {
    it('Edit (and a double click) opens the screen\'s file; Play runs the mount from its route', async () => {
        const { root, events } = await board()
        button(card(root, 'orders'), 'Edit').click()
        card(root, 'users').dispatchEvent(new MouseEvent('dblclick'))
        button(card(root, 'orders'), 'Play').click()
        expect(events.filter((e) => e.type !== 'board-write')).toEqual([
            { type: 'board-open', detail: { path: 'orders.yaml' } },
            { type: 'board-open', detail: { path: 'users.yaml' } },
            { type: 'board-play', detail: { route: 'orders' } },
        ])
    })

    it('clicking a screen selects it and labels its arrows; clicking the background clears it', async () => {
        const { el, root } = await board()
        card(root, 'orders').click()
        await settle(el)
        expect(card(root, 'orders').classList.contains('sel')).toBe(true)
        expect([...root.querySelectorAll('svg text.label')].map((t) => t.textContent)).toContain('Orders')
        const viewport = root.querySelector('.viewport') as HTMLElement
        viewport.click()
        await settle(el)
        expect(root.querySelector('.card.sel')).toBeNull()
    })
})

describe('<mount-board> editing the mount', () => {
    it('creating a ghost screen writes its page and its route in one step, and undo / redo replay it', async () => {
        const { el, root, events } = await board()
        button(root.querySelector('.card.ghost')!, 'Create screen…').click()
        await settle(el)
        const dialog = root.querySelector('.dialog[role=dialog]') as HTMLElement
        expect(dialog.querySelector('h4')?.textContent).toBe('Create /archive')
        expect((dialog.querySelector('input[name=file]') as HTMLInputElement).value).toBe('archive.yaml')
        button(dialog, 'Create').click()
        await settle(el)
        const [w] = writes(events)
        expect(w.map((x: any) => x.path).sort()).toEqual(['archive.yaml', 'routes.yaml'])
        expect(w.find((x: any) => x.path === 'routes.yaml').content).toContain('route: archive')
        expect(root.querySelector('.dialog')).toBeNull()
        expect(root.querySelector('.toast')?.textContent).toBe('Create /archive')

        button(root, 'Undo').click()
        await settle(el)
        const undo = writes(events)[1]
        expect(undo.find((x: any) => x.path === 'archive.yaml').content).toBeNull()
        expect(root.querySelector('.toast')?.textContent).toBe('Undone: Create /archive')
        button(root, 'Redo').click()
        await settle(el)
        expect(writes(events)[2]).toEqual(w)
    })

    it('typing a route proposes its file until the author edits the file name', async () => {
        const { el, root } = await board()
        button(root.querySelector('.card.ghost')!, 'Create screen…').click()
        await settle(el)
        const route = root.querySelector('.dialog input[name=route]') as HTMLInputElement
        route.value = 'reports/monthly'
        route.dispatchEvent(new Event('input'))
        await settle(el)
        const file = root.querySelector('.dialog input[name=file]') as HTMLInputElement
        expect(file.value).not.toBe('archive.yaml')
        file.value = 'mine.yaml'
        file.dispatchEvent(new Event('input'))
        await settle(el)
        route.value = 'reports/yearly'
        route.dispatchEvent(new Event('input'))
        await settle(el)
        expect((root.querySelector('.dialog input[name=file]') as HTMLInputElement).value).toBe('mine.yaml')
    })

    it('a screen that cannot be created says why in the dialog, and Escape closes it', async () => {
        const { el, root, events } = await board()
        button(root.querySelector('.card.ghost')!, 'Create screen…').click()
        await settle(el)
        const file = root.querySelector('.dialog input[name=file]') as HTMLInputElement
        file.value = 'users.yaml'
        file.dispatchEvent(new Event('input'))
        await settle(el)
        button(root.querySelector('.dialog')!, 'Create').click()
        await settle(el)
        expect(root.querySelector('.dialog .error')?.textContent).toContain('users.yaml already exists')
        expect(writes(events)).toEqual([])
        root.querySelector('.dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await settle(el)
        expect(root.querySelector('.dialog')).toBeNull()
    })

    it('a page no route serves gets one with "Add route…" (Enter confirms)', async () => {
        const { el, root, events } = await board()
        button(card(root, 'file:draft.yaml'), 'Add route…').click()
        await settle(el)
        const dialog = root.querySelector('.dialog') as HTMLElement
        expect((dialog.querySelector('input[name=route]') as HTMLInputElement).value).toBe('draft')
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await settle(el)
        const [w] = writes(events)
        expect(w).toHaveLength(1)
        expect(w[0].path).toBe('routes.yaml')
        expect(w[0].content).toMatch(/route: draft\n\s+layout: draft.yaml/)
    })

    it('an arrow is selected by a click and deleted with its button or the Delete key', async () => {
        const { el, root, events } = await board()
        const hit = root.querySelector('path.hit[data-edge^="→orders|menu"]') as SVGPathElement
        hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await settle(el)
        const tools = root.querySelector('.edge-tools') as HTMLElement
        expect(tools.textContent).toContain('drag its ◯ end')
        button(tools, 'Delete').click()
        await settle(el)
        const [w] = writes(events)
        expect(w[0].path).toBe('app.yaml')
        expect(w[0].content).not.toContain('route: orders')
        expect(w[0].content).toContain('route: users')

        // the key does the same (but not while typing in a field)
        ;(root.querySelector('path.hit[data-edge^="→users|menu"]') as SVGPathElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await settle(el)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }))
        await settle(el)
        expect(writes(events)).toHaveLength(2)
        expect(writes(events)[1][0].content).not.toContain('route: users')
    })

    it('dragging from a screen\'s port onto another opens the link dialog, and Create writes the arrow', async () => {
        const { el, root, events } = await board()
        const at = (id: string) => {
            const c = card(root, id)
            // client = world * zoom + pan (the viewport sits at 0,0 in jsdom)
            const zoom = el.zoom, pan = el.pan
            return { x: (parseFloat(c.style.left) + 20) * zoom + pan.x, y: (parseFloat(c.style.top) + 60) * zoom + pan.y }
        }
        const port = card(root, 'users').querySelector('.port') as HTMLElement
        const from = at('users'), to = at('orders')
        port.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: from.x, clientY: from.y, bubbles: true }))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: to.x, clientY: to.y }))
        await settle(el)
        expect(card(root, 'orders').classList.contains('drop')).toBe(true)
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: to.x, clientY: to.y }))
        await settle(el)
        const dialog = root.querySelector('.dialog[aria-label="Link screens"]') as HTMLElement
        expect(dialog.querySelector('h4')?.textContent).toBe('/users → /orders')
        expect((dialog.querySelector('input[name=label]') as HTMLInputElement).value).toBe('Orders')
        button(dialog, 'Create').click()
        await settle(el)
        const [w] = writes(events)
        expect(w[0].path).toBe('users.yaml')
        expect(w[0].content).toContain('route: orders')
    })
})

describe('<mount-board> arranging', () => {
    it('a screen moved by its header keeps its place the next time the same mount opens', async () => {
        const first = await board()
        const head = card(first.root, 'users').querySelector('.head') as HTMLElement
        const left = parseFloat(card(first.root, 'users').style.left)
        head.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100, bubbles: true }))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 180, clientY: 100 }))
        window.dispatchEvent(new MouseEvent('mouseup'))
        await settle(first.el)
        const moved = parseFloat(card(first.root, 'users').style.left)
        expect(moved).toBe(Math.round(left + 80 / first.el.zoom))
        first.el.remove()

        const again = await board()
        expect(parseFloat(card(again.root, 'users').style.left)).toBe(moved)
        // Auto layout forgets it
        button(again.root, 'Auto layout').click()
        await settle(again.el)
        expect(parseFloat(card(again.root, 'users').style.left)).toBe(left)
    })

    it('dragging the background pans and the wheel zooms, within bounds', async () => {
        const { el, root } = await board()
        const viewport = root.querySelector('.viewport') as HTMLElement
        const pan = { ...el.pan }
        viewport.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10, bubbles: true }))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 30 }))
        window.dispatchEvent(new MouseEvent('mouseup'))
        expect(el.pan).toEqual({ x: pan.x + 50, y: pan.y + 20 })
        for (let i = 0; i < 40; i++) viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, cancelable: true }))
        expect(el.zoom).toBe(2)
        button(root, '−').click()
        expect(el.zoom).toBeCloseTo(2 / 1.2)
    })
})
