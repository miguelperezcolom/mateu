import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { buildMountGraph } from './mountGraph'
import {
    addArrow, applyWrites, arrowKindsFor, arrowPlaces, createScreen, declarationsIn, deleteEdge, fileForRoute,
    giveRoute, graphAfter, menuGroups, retargetEdge, routeOfTarget, targetOfRoute,
} from './boardEdits'
import { appendToList, removeKey, removeListItem, replaceScalar, setKey } from './yamlEdit'

const f = (path: string, content: string): ProjectFile => ({ path, content })
const TEMPLATE = { id: 'form', label: 'Form', yaml: 'type: Form\ntitle: New item\n' }

// A mount with nested menus, children routes, a parameterised route, comments and both YAML styles.
const APP = `# The shell — keep this comment
type: AppShell
title: Shop
menu:
  - {type: RouteLink, label: Orders, route: orders}   # flow-style item
  - type: Menu
    label: More
    submenu:
      - type: RouteLink
        label: Help
        route: help
      - type: Menu
        label: Admin
        submenu:
          - {type: RouteLink, label: Users, route: users}
`
const ROUTES = `# routes — keep this comment too
type: Routes
routes:
  - {route: "", layout: app.yaml}
  - route: orders
    layout: orders.yaml
    children:
      - {route: ":id", layout: order.yaml}
  - {route: help, layout: help.yaml}
  - {route: users, layout: users.yaml}
`
const ORDERS = `type: Listing
title: Orders
rowRoute: orders/\${row.id}
toolbar:
  - {type: Button, label: Archive, actionable: {type: RouteLink, route: archive}}
`
const ORDER = `type: Form
title: Order
buttons:
  - type: Button
    label: Back
    actionable:
      type: RouteLink
      route: orders
actions:
  - id: save
    restAction: {method: PUT, successRoute: orders}
  - id: done
    steps:
      - {type: Navigate, route: help}
`
const files = (): ProjectFile[] => [
    f('app.yaml', APP), f('routes.yaml', ROUTES), f('orders.yaml', ORDERS), f('order.yaml', ORDER),
    f('help.yaml', 'type: VerticalLayout\ncontent:\n  - {type: Text, text: Help}\n'),
    f('users.yaml', 'type: Form\ntitle: Users\n'),
    f('draft.yaml', 'type: Form\ntitle: Draft\n'),
    f('shop.ui.yaml', 'type: UI\nroutes: [routes.yaml]\n'),
]
const fileAfter = (c: { writes: { path: string; content: string | null }[] }, path: string) => c.writes.find((w) => w.path === path)?.content ?? undefined

describe('yamlEdit: minimal text edits', () => {
    it('appends to a block list at its indentation, keeping comments and flow items', () => {
        const out = appendToList(APP, [], 'menu', { type: 'RouteLink', label: 'Reports', route: 'reports' })
        expect(out.startsWith(APP.trimEnd())).toBe(true)
        expect(out.slice(APP.trimEnd().length)).toBe('\n  - type: RouteLink\n    label: Reports\n    route: reports\n')
        expect(parse(out).menu[2].route).toBe('reports')
    })
    it('appends into a nested group, a flow list, an empty [] and a missing key', () => {
        const nested = appendToList(APP, ['menu', 1, 'submenu', 1], 'submenu', { type: 'RouteLink', label: 'Roles', route: 'roles' })
        expect(parse(nested).menu[1].submenu[1].submenu.map((m: any) => m.route)).toEqual(['users', 'roles'])
        expect(nested).toContain('          - {type: RouteLink, label: Users, route: users}\n          - type: RouteLink\n            label: Roles')
        expect(appendToList('routes: [a.yaml]\n', [], 'routes', 'b.yaml')).toBe('routes: [a.yaml, b.yaml]\n')
        expect(appendToList('type: Routes\nroutes: []\n', [], 'routes', { route: 'x', layout: 'x.yaml' })).toBe('type: Routes\nroutes:\n  - route: x\n    layout: x.yaml\n')
        expect(appendToList('type: Form\ntitle: X\n', [], 'buttons', { type: 'Button', label: 'Go' })).toBe('type: Form\ntitle: X\nbuttons:\n  - type: Button\n    label: Go\n')
    })
    it('sets, replaces and removes keys in block and flow maps', () => {
        expect(setKey('type: Listing\ntitle: X # t\n', [], 'rowRoute', 'a/${row.id}')).toBe('type: Listing\ntitle: X # t\nrowRoute: "a/${row.id}"\n')
        expect(setKey('restAction: {method: PUT}\n', ['restAction'], 'successRoute', 'orders')).toBe('restAction: {method: PUT, successRoute: orders}\n')
        expect(replaceScalar(ORDERS, ['rowRoute'], 'people/${row.id}')).toContain('rowRoute: "people/${row.id}"\ntoolbar:')
        expect(removeKey(ORDERS, [], 'rowRoute')).toBe(ORDERS.replace('rowRoute: orders/${row.id}\n', ''))
        expect(removeKey('a: {method: PUT, successRoute: orders}\n', ['a'], 'successRoute')).toBe('a: {method: PUT}\n')
    })
    it('removes list items (block, flow, the last one) without touching the rest', () => {
        const out = removeListItem(APP, ['menu'], 0)
        expect(out).toBe(APP.replace('  - {type: RouteLink, label: Orders, route: orders}   # flow-style item\n', ''))
        expect(removeListItem('routes: [a.yaml, b.yaml]\n', ['routes'], 1)).toBe('routes: [a.yaml]\n')
        expect(removeListItem('type: Form\nbuttons:\n  - {type: Button, label: Go}\n', ['buttons'], 0)).toBe('type: Form\nbuttons: []\n')
    })
})

describe('boardEdits: reading the declarations like the board does', () => {
    it('finds every arrow a file declares, with where it is written', () => {
        expect(declarationsIn(APP, true).map((d) => `${d.via}:${d.label}→${d.target}`)).toEqual(['menu:Orders→orders', 'menu:Help→help', 'menu:Users→users'])
        expect(declarationsIn(ORDER, false).map((d) => `${d.via}:${d.label}→${d.target}`)).toEqual(['link:Back→orders', 'save:after save→orders', 'flow:done flow→help'])
        expect(declarationsIn(ORDERS, false).map((d) => d.via)).toEqual(['row', 'link'])
    })
    it('routes from targets and back', () => {
        expect(routeOfTarget('/people/${row.id}?tab=1')).toBe('people/:id')
        expect(routeOfTarget('archive')).toBe('archive')
        expect(targetOfRoute('orders/:id', 'row')).toBe('orders/${row.id}')
        expect(targetOfRoute('orders/:id/lines', 'other')).toBe('orders/${state.id}/lines')
        expect(fileForRoute('orders/:id', files())).toBe('orders-id.yaml')
        expect(fileForRoute('orders', files())).toBe('orders-2.yaml')
    })
})

describe('boardEdits: creating screens', () => {
    it('creates the missing screen of an unresolved target: its file and its route, in one step', () => {
        const fs = files()
        const g = buildMountGraph(fs)
        expect(g.unresolved.map((u) => u.target)).toEqual(['archive'])
        const c = createScreen(fs, routeOfTarget('archive'), TEMPLATE)
        expect(c.writes.map((w) => w.path)).toEqual(['archive.yaml', 'routes.yaml'])
        expect(fileAfter(c, 'routes.yaml')).toBe(ROUTES + '  - route: archive\n    layout: archive.yaml\n')
        const after = graphAfter(fs, c)
        expect(after.unresolved).toEqual([])
        expect(after.edges.some((e) => e.from === 'orders' && e.to === 'archive')).toBe(true)
        // undo puts the routes back and deletes the new file
        expect(c.undo).toEqual([{ path: 'routes.yaml', content: ROUTES }, { path: 'archive.yaml', content: null }])
        expect(buildMountGraph(applyWrites(applyWrites(fs, c.writes), c.undo)).unresolved.map((u) => u.target)).toEqual(['archive'])
    })
    it('a parameterised target becomes a parameterised route (beside the children tree)', () => {
        const fs = [...files(), f('lines.yaml', 'type: Listing\ntitle: Lines\nrowRoute: orders/${row.orderId}/lines/${row.id}\n')]
        const c = createScreen(fs, routeOfTarget('orders/${row.orderId}/lines/${row.id}'), TEMPLATE)
        expect(c.writes[0].path).toBe('orders-orderid-lines-id.yaml')
        expect(parse(fileAfter(c, 'routes.yaml')!).routes.at(-1)).toEqual({ route: 'orders/:orderId/lines/:id', layout: 'orders-orderid-lines-id.yaml' })
    })
    it('a declared route whose definition is missing only gets its file', () => {
        const fs = files().filter((x) => x.path !== 'help.yaml')
        expect(buildMountGraph(fs).screens.find((s) => s.id === 'help')?.kind).toBe('missing')
        const c = createScreen(fs, 'help', TEMPLATE)
        expect(c.writes).toEqual([{ path: 'help.yaml', content: TEMPLATE.yaml }])
        expect(graphAfter(fs, c).screens.find((s) => s.id === 'help')?.kind).toBe('page')
    })
    it('a mount with no routes file gets one, registered in the mount', () => {
        const fs = [f('shop.ui.yaml', 'type: UI\nbasePath: /\n'), f('home.yaml', 'type: Form\n')]
        const c = createScreen(fs, 'home', TEMPLATE, 'start.yaml')
        expect(c.writes.map((w) => w.path)).toEqual(['start.yaml', 'routes.yaml', 'shop.ui.yaml'])
        expect(fileAfter(c, 'shop.ui.yaml')).toBe('type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n')
        expect(graphAfter(fs, c).screens.find((s) => s.id === 'home')?.file).toBe('start.yaml')
    })
    it('gives an orphan page a route (and refuses one that exists)', () => {
        const fs = files()
        const c = giveRoute(fs, 'draft.yaml', 'draft')
        expect(graphAfter(fs, c).screens.find((s) => s.id === 'draft')).toMatchObject({ kind: 'page', file: 'draft.yaml' })
        expect(() => giveRoute(fs, 'draft.yaml', 'orders')).toThrow(/already exists/)
    })
})

describe('boardEdits: drawing arrows', () => {
    const fs = files()
    const g = buildMountGraph(fs)
    const screen = (id: string) => g.screens.find((s) => s.id === id)!

    it('offers only the kinds that make sense for the source', () => {
        expect(arrowKindsFor(fs, screen(''))).toEqual(['menu'])
        expect(arrowKindsFor(fs, screen('orders'))).toEqual(['button', 'row'])
        expect(arrowKindsFor(fs, screen('orders/:id'))).toEqual(['button', 'save'])
        expect(arrowKindsFor(fs, screen('help'))).toEqual(['button'])
        expect(menuGroups(APP).map((m) => m.label)).toEqual(['Menu (top level)', 'Menu › More', 'Menu › More › Admin'])
        expect(arrowPlaces(fs, screen('orders/:id'), 'save')).toEqual([{ id: 'save', label: 'after save' }])
    })
    it('a menu entry in a nested group', () => {
        const admin = menuGroups(APP).find((m) => m.label.endsWith('Admin'))!
        const c = addArrow(fs, screen(''), screen('help'), 'menu', admin.id, 'Manual')
        const after = graphAfter(fs, c)
        expect(after.edges.filter((e) => e.from === '' && e.to === 'help').map((e) => e.label).sort()).toEqual(['Help', 'Manual'])
        expect(fileAfter(c, 'app.yaml')).toContain('          - {type: RouteLink, label: Users, route: users}\n          - type: RouteLink\n            label: Manual\n            route: help\n')
    })
    it('a button with a RouteLink in the page\'s toolbar / buttons / content', () => {
        const c = addArrow(fs, screen('help'), screen('users'), 'button', 'content', 'Users')
        expect(fileAfter(c, 'help.yaml')).toBe('type: VerticalLayout\ncontent:\n  - {type: Text, text: Help}\n  - type: Button\n    label: Users\n    actionable: {type: RouteLink, route: users}\n')
        expect(graphAfter(fs, c).edges).toContainEqual({ from: 'help', to: 'users', via: 'link', label: 'Users' })
        const toolbar = addArrow(fs, screen('orders'), screen('help'), 'button', 'toolbar', '')
        expect(graphAfter(fs, toolbar).edges).toContainEqual({ from: 'orders', to: 'help', via: 'link', label: 'help' })
    })
    it('a listing\'s rowRoute to a parameterised route, and a REST action\'s successRoute', () => {
        const fsNoRow = applyWrites(fs, [{ path: 'orders.yaml', content: ORDERS.replace('rowRoute: orders/${row.id}\n', '') }])
        const g2 = buildMountGraph(fsNoRow)
        const row = addArrow(fsNoRow, g2.screens.find((s) => s.id === 'orders')!, g2.screens.find((s) => s.id === 'orders/:id')!, 'row', 'rowRoute', '')
        expect(fileAfter(row, 'orders.yaml')).toContain('rowRoute: "orders/${row.id}"')
        expect(graphAfter(fsNoRow, row).edges).toContainEqual({ from: 'orders', to: 'orders/:id', via: 'row', label: 'row click' })
        const save = addArrow(fs, screen('orders/:id'), screen('help'), 'save', 'save', '')
        expect(fileAfter(save, 'order.yaml')).toContain('restAction: {method: PUT, successRoute: help}')
    })
})

describe('boardEdits: deleting and retargeting arrows', () => {
    const fs = files()
    const g = buildMountGraph(fs)
    const edge = (from: string, to: string, via: string) => g.edges.find((e) => e.from === from && e.to === to && e.via === via)!
    const screen = (id: string) => g.screens.find((s) => s.id === id)!

    it('deletes a nested menu entry, a block button, a row click, a save landing and a flow step', () => {
        const users = deleteEdge(fs, g, edge('', 'users', 'menu'))
        expect(fileAfter(users, 'app.yaml')).toBe(APP.replace('          - {type: RouteLink, label: Users, route: users}\n', '').replace('        submenu:\n', '        submenu: []\n'))
        expect(graphAfter(fs, users).edges.some((e) => e.to === 'users')).toBe(false)
        const back = deleteEdge(fs, g, edge('orders/:id', 'orders', 'link'))
        expect(fileAfter(back, 'order.yaml')).toBe(ORDER.replace(/buttons:\n(?: {2}[^\n]*\n)+?(?=actions:)/, 'buttons: []\n'))
        expect(fileAfter(deleteEdge(fs, g, edge('orders', 'orders/:id', 'row')), 'orders.yaml')).not.toContain('rowRoute')
        expect(fileAfter(deleteEdge(fs, g, edge('orders/:id', 'orders', 'save')), 'order.yaml')).toContain('restAction: {method: PUT}')
        expect(fileAfter(deleteEdge(fs, g, edge('orders/:id', 'help', 'flow')), 'order.yaml')).toContain('    steps: []\n')
    })
    it('a nested route (children) is not an arrow the board deletes', () => {
        expect(() => deleteEdge(fs, g, edge('orders', 'orders/:id', 'child'))).toThrow()
    })
    it('retargets: only the target text changes', () => {
        const c = retargetEdge(fs, g, edge('', 'orders', 'menu'), screen('users'))
        expect(fileAfter(c, 'app.yaml')).toBe(APP.replace('label: Orders, route: orders}', 'label: Orders, route: users}'))
        const row = retargetEdge(fs, g, edge('orders', 'orders/:id', 'row'), screen('help'))
        expect(fileAfter(row, 'orders.yaml')).toContain('rowRoute: help\n')
        expect(() => retargetEdge(fs, g, edge('', 'orders', 'menu'), { id: 'file:draft.yaml', kind: 'unrouted', file: 'draft.yaml' })).toThrow(/no route/)
    })
    it('undo restores the file exactly', () => {
        const c = deleteEdge(fs, g, edge('', 'help', 'menu'))
        expect(applyWrites(applyWrites(fs, c.writes), c.undo).find((x) => x.path === 'app.yaml')?.content).toBe(APP)
    })
})
