import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { hasAppBlock, parseApp, serializeApp, AppDoc } from './appModel'

const src = `app:
  title: Back office
  subtitle: Ops
  variant: MENU_ON_TOP
  menu:
    - type: RouteLink
      label: Orders
      route: orders
      icon: vaadin:cart
    - type: Menu
      label: Admin
      submenu:
        - type: RouteLink
          label: Users
          route: users
    - type: MenuSeparator
  widgets:
    - type: Text
      text: v3
routes:
  - route: orders
    definition: orders.yaml
`

describe('appModel', () => {
    it('detects an app: block', () => {
        expect(hasAppBlock(src)).toBe(true)
        expect(hasAppBlock('routes:\n  - route: a\n')).toBe(false)
    })

    it('reads scalar fields, the menu tree, and keeps routes: in rest', () => {
        const doc = parseApp(src)
        expect(doc.fields.title).toBe('Back office')
        expect(doc.fields.variant).toBe('MENU_ON_TOP')
        expect(doc.menu.map((m) => m.kind)).toEqual(['link', 'group', 'separator'])
        const group = doc.menu[1] as any
        expect(group.label).toBe('Admin')
        expect(group.submenu[0]).toMatchObject({ kind: 'link', label: 'Users', route: 'users' })
        expect((doc.rest as any).routes[0].route).toBe('orders')
        expect(doc.widgets).toHaveLength(1)
    })

    it('round-trips: menu tree + widgets + routes: preserved, empty fields omitted', () => {
        const out = parse(serializeApp(parseApp(src)))
        expect(out.app.title).toBe('Back office')
        expect(out.app.subtitle).toBe('Ops')
        expect(out.app.menu[0]).toEqual({ type: 'RouteLink', label: 'Orders', route: 'orders', icon: 'vaadin:cart' })
        expect(out.app.menu[1].submenu[0]).toEqual({ type: 'RouteLink', label: 'Users', route: 'users' })
        expect(out.app.menu[2]).toEqual({ type: 'MenuSeparator' })
        expect(out.app.widgets[0].text).toBe('v3')
        expect(out.routes[0].definition).toBe('orders.yaml')
        expect(out.app.pageTitle).toBeUndefined() // empty scalar omitted
    })

    it('edits a field and a menu item and re-serializes', () => {
        const doc: AppDoc = parseApp(src)
        doc.fields.title = 'HQ'
        ;(doc.menu[0] as any).route = 'pedidos'
        const out = parse(serializeApp(doc))
        expect(out.app.title).toBe('HQ')
        expect(out.app.menu[0].route).toBe('pedidos')
    })
})
