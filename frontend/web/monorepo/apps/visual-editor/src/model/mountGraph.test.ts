import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildMountGraph, layoutBoard, matchRoute, CARD_W, CARD_H } from './mountGraph'
import type { ProjectFile } from './projectIndex'

const f = (path: string, content: string): ProjectFile => ({ path, content })

describe('matchRoute', () => {
    const routes = ['', 'people', 'people/new', 'people/:id', 'people/:id/edit']
    it('lands a template on the parameterised route, not on a static sibling', () => {
        expect(matchRoute('people/${row.id}', routes)).toBe('people/:id')
        expect(matchRoute('people/${state.id}/edit', routes)).toBe('people/:id/edit')
    })
    it('prefers a static route for a literal, and takes any value for a parameter', () => {
        expect(matchRoute('people/new', routes)).toBe('people/new')
        expect(matchRoute('people/42', routes)).toBe('people/:id')
    })
    it('ignores a leading slash and the query, and maps the root', () => {
        expect(matchRoute('/people?name=luke', routes)).toBe('people')
        expect(matchRoute('/', routes)).toBe('')
    })
    it('misses what the table does not have', () => {
        expect(matchRoute('planets', routes)).toBeUndefined()
    })
})

describe('buildMountGraph', () => {
    const files = [
        f('app.yaml', 'type: AppShell\ntitle: Shop\nmenu:\n  - {type: RouteLink, label: Orders, route: orders}\n  - type: Menu\n    label: More\n    submenu:\n      - {type: RouteLink, label: Help, route: help}\n'),
        f('routes.yaml', 'type: Routes\nroutes:\n  - {route: "", definition: app.yaml}\n  - {route: orders, definition: orders.yaml}\n  - {route: "orders/:id", definition: order.yaml}\n  - {route: help, definition: help.yaml}\n  - {route: legacy, viewModel: com.acme.Legacy}\n'),
        f('orders.yaml', 'type: Listing\ntitle: Orders\nrowRoute: orders/${row.id}\ntoolbar:\n  - {type: Button, label: Old screen, actionable: {type: RouteLink, route: legacy}}\n'),
        f('order.yaml', 'type: Form\ntitle: Order ${state.id}\ntoolbar:\n  - {type: Button, label: Back, actionable: {type: RouteLink, route: orders}}\n  - {type: Button, label: Docs, actionable: {type: RouteLink, route: nowhere}}\nactions:\n  - id: save\n    restAction: {method: PUT, successRoute: orders}\n  - id: done\n    steps:\n      - {type: Navigate, route: help}\n'),
        f('help.yaml', 'type: Form\ntitle: Help\n'),
        f('draft.yaml', 'type: Form\ntitle: Not wired yet\n'),
        f('sources.yaml', 'type: Sources\nsources: []\n'),
        f('shop.ui.yaml', 'type: UI\nbasePath: /\nroutes: [routes.yaml]\n'),
    ]
    const g = buildMountGraph(files)
    const edge = (from: string, to: string) => g.edges.filter((e) => e.from === from && e.to === to)

    it('has a screen per route, typed by what serves it', () => {
        const kinds = Object.fromEntries(g.screens.map((s) => [s.id, s.kind]))
        expect(kinds).toEqual({ '': 'shell', orders: 'page', 'orders/:id': 'page', help: 'page', legacy: 'viewModel', 'file:draft.yaml': 'unrouted' })
        expect(g.start).toBe('')
    })
    it('keeps a page\'s title, without its template placeholders', () => {
        expect(g.screens.find((s) => s.id === 'orders/:id')?.title).toBe('Order …')
    })
    it('draws the menu, nested menus included, from the shell', () => {
        expect(edge('', 'orders')).toEqual([{ from: '', to: 'orders', via: 'menu', label: 'Orders' }])
        expect(edge('', 'help')[0]?.via).toBe('menu')
    })
    it('draws a row click, a button, a save landing and a flow step', () => {
        expect(edge('orders', 'orders/:id')).toEqual([{ from: 'orders', to: 'orders/:id', via: 'row', label: 'row click' }])
        expect(edge('orders', 'legacy')[0]).toMatchObject({ via: 'link', label: 'Old screen' })
        expect(edge('orders/:id', 'orders').map((e) => e.via).sort()).toEqual(['link', 'save'])
        expect(edge('orders/:id', 'orders').find((e) => e.via === 'save')?.label).toBe('after save')
        expect(edge('orders/:id', 'help')[0]).toMatchObject({ via: 'flow', label: 'done flow' })
    })
    it('keeps a link to a screen that does not exist', () => {
        expect(g.unresolved).toEqual([{ from: 'orders/:id', target: 'nowhere', via: 'link', label: 'Docs' }])
    })
    it('lays a screen out right of the one that leads to it, and never two on the same spot', () => {
        const pos = layoutBoard(g)
        expect(Object.keys(pos).sort()).toEqual(g.screens.map((s) => s.id).sort())
        expect(pos['']).toEqual({ x: 0, y: 0 })
        expect(pos.orders!.x - pos['']!.x).toBeGreaterThanOrEqual(CARD_W)
        expect(pos['orders/:id']!.x).toBeGreaterThan(pos.orders!.x)
        expect(pos['orders/:id']!.y).toBe(pos.orders!.y)
        expectNoOverlap(pos)
    })
    it('links a parent route to its nested children', () => {
        const nested = buildMountGraph([
            f('routes.yaml', 'routes:\n  - route: emp\n    layout: master.yaml\n    children:\n      - {route: info, layout: info.yaml}\n'),
            f('master.yaml', 'type: Form\n'), f('info.yaml', 'type: Form\n'),
        ])
        expect(nested.edges).toEqual([{ from: 'emp', to: 'emp/info', via: 'child', label: 'tab' }])
        expect(nested.screens.find((s) => s.id === 'emp/info')?.parent).toBe('emp')
    })
})

function expectNoOverlap(pos: Record<string, { x: number; y: number }>) {
    const boxes = Object.entries(pos)
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const [a, p] = boxes[i], [b, q] = boxes[j]
        const overlap = Math.abs(p.x - q.x) < CARD_W && Math.abs(p.y - q.y) < CARD_H
        expect(overlap, `${a} overlaps ${b}`).toBe(false)
    }
}

describe('the demo-starwars mount', () => {
    let dir = dirname(fileURLToPath(import.meta.url))
    const rel = 'demo/demo-starwars/src/main/resources/specs/ui'
    while (dir !== '/' && !existsSync(resolve(dir, rel))) dir = dirname(dir)
    const root = resolve(dir, rel)
    const files = readdirSync(root).filter((n) => n.endsWith('.yaml')).map((n) => f(n, readFileSync(resolve(root, n), 'utf-8')))
    const g = buildMountGraph(files)

    it('maps every route, with no broken link', () => {
        expect(g.screens.filter((s) => s.kind === 'page')).toHaveLength(24)
        expect(g.unresolved).toEqual([])
    })
    it('lays each resource out as a row, the rows packed to a screen-like board', () => {
        const pos = layoutBoard(g)
        expectNoOverlap(pos)
        expect(pos['people/:id']!.y).toBe(pos.people!.y)
        expect(pos['people/:id/edit']!.y).toBe(pos['people/:id']!.y)
        expect(pos['people/:id/edit']!.x).toBeGreaterThan(pos['people/:id']!.x)
        const xs = Object.values(pos).map((p) => p.x), ys = Object.values(pos).map((p) => p.y)
        const ratio = (Math.max(...xs) + CARD_W) / (Math.max(...ys) + CARD_H)
        expect(ratio).toBeGreaterThan(0.8)
        expect(ratio).toBeLessThan(3)
    })
    it('reads the whole CRUD flow of a resource off the files', () => {
        const from = (id: string) => g.edges.filter((e) => e.from === id).map((e) => `${e.via}:${e.to}`).sort()
        expect(from('people')).toEqual(['link:people/new', 'row:people/:id'])
        expect(from('people/:id')).toEqual(['link:people', 'link:people/:id/edit'])
        expect(from('people/new')).toEqual(['link:people', 'save:people/:id'])
    })
})
