import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { hasAppShell, parseApp, serializeApp, AppDoc } from './appModel'

const src = `type: AppShell
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
`

describe('appModel', () => {
    it('detects a type: AppShell definition', () => {
        expect(hasAppShell(src)).toBe(true)
        expect(hasAppShell('routes:\n  - route: a\n')).toBe(false)
        expect(hasAppShell('type: UI\nbasePath: /\n')).toBe(false)
    })

    it('reads scalar fields and the menu tree off the top-level definition', () => {
        const doc = parseApp(src)
        expect(doc.fields.title).toBe('Back office')
        expect(doc.fields.variant).toBe('MENU_ON_TOP')
        expect(doc.menu.map((m) => m.kind)).toEqual(['link', 'group', 'separator'])
        const group = doc.menu[1] as any
        expect(group.submenu[0]).toMatchObject({ kind: 'link', label: 'Users', route: 'users' })
        expect(doc.widgets).toHaveLength(1)
    })

    it('round-trips: type: AppShell + menu tree + widgets, empty fields omitted', () => {
        const out = parse(serializeApp(parseApp(src)))
        expect(out.type).toBe('AppShell')
        expect(out.title).toBe('Back office')
        expect(out.menu[0]).toEqual({ type: 'RouteLink', label: 'Orders', route: 'orders', icon: 'vaadin:cart' })
        expect(out.menu[1].submenu[0]).toEqual({ type: 'RouteLink', label: 'Users', route: 'users' })
        expect(out.menu[2]).toEqual({ type: 'MenuSeparator' })
        expect(out.widgets[0].text).toBe('v3')
        expect(out.pageTitle).toBeUndefined()
    })

    it('edits a field and a menu item and re-serializes', () => {
        const doc: AppDoc = parseApp(src)
        doc.fields.title = 'HQ'
        ;(doc.menu[0] as any).route = 'pedidos'
        const out = parse(serializeApp(doc))
        expect(out.title).toBe('HQ')
        expect(out.menu[0].route).toBe('pedidos')
    })
})
