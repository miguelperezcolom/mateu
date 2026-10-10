import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    hasAppShell, parseApp, serializeApp, AppDoc,
    appActionIds, appActionSteps, setAppActionSteps, addAppFlowAction, removeAppAction,
    widgetProp, addWidget, setWidgetProp, moveWidget, removeWidget,
} from './appModel'

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

    it('reads and round-trips an "action" menu leaf (RuleLink + RunAction), keeping richer rules raw', () => {
        const withActions = `type: AppShell
menu:
  - type: RuleLink
    label: Sign out
    rules:
      - action: RunAction
        actionId: logout
  - type: RuleLink
    label: Complex
    rules:
      - action: RunJS
        expression: doStuff()
`
        const doc = parseApp(withActions)
        // the RunAction leaf is editable; the RunJS one stays raw (never edited lossily)
        expect(doc.menu.map((m) => m.kind)).toEqual(['action', 'raw'])
        expect(doc.menu[0]).toMatchObject({ kind: 'action', label: 'Sign out', actionId: 'logout' })

        const out = parse(serializeApp(doc))
        expect(out.menu[0]).toEqual({ type: 'RuleLink', label: 'Sign out', rules: [{ action: 'RunAction', actionId: 'logout' }] })
        // the raw one round-trips untouched
        expect(out.menu[1]).toEqual({ type: 'RuleLink', label: 'Complex', rules: [{ action: 'RunJS', expression: 'doStuff()' }] })
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

describe('app shell — brand accent and back link', () => {
    it('reads and writes accentColor and backLink as fields', () => {
        const doc = parseApp('type: AppShell\ntitle: X\naccentColor: "#D2232A"\nbackLink: PARENT\n')
        expect(doc.fields.accentColor).toBe('#D2232A')
        expect(doc.fields.backLink).toBe('PARENT')
        expect(doc.appRest).toEqual({})
        const out = parse(serializeApp({ ...doc, fields: { ...doc.fields, backLink: undefined } }))
        expect(out.accentColor).toBe('#D2232A')
        expect(out.backLink).toBeUndefined()
    })
})

describe('app shell — flows, header switches and widgets', () => {
    const shell = `type: AppShell
title: App
homeRoute: home
themeToggle: true
actions:
  - id: newOrder
    confirmationRequired: true
    steps:
      - type: Navigate
        route: orders/new
        note: kept
menu:
  - type: RuleLink
    label: New order
    rules:
      - action: RunAction
        actionId: newOrder
widgets:
  - type: Text
    text: v1
  - type: Avatar
    name: x
`

    it('round-trips the shell actions losslessly (unmodelled keys on the action and its steps survive)', () => {
        const doc = parseApp(shell)
        expect(appActionIds(doc)).toEqual(['newOrder'])
        expect(parse(serializeApp(doc))).toEqual(parse(shell))
        expect(doc.appRest.actions).toBeUndefined()
    })

    it('edits a shell flow with the page flow model', () => {
        let doc = parseApp(shell)
        doc = setAppActionSteps(doc, 'newOrder', [...appActionSteps(doc, 'newOrder'), { type: 'MarkClean', extra: {} }])
        doc = addAppFlowAction(doc, 'announce')
        doc = setAppActionSteps(doc, 'announce', [{ type: 'Emit', event: 'started', extra: {} }])
        const out = parse(serializeApp(doc))
        expect(out.actions[0].confirmationRequired).toBe(true)
        expect(out.actions[0].steps).toEqual([{ type: 'Navigate', route: 'orders/new', note: 'kept' }, { type: 'MarkClean' }])
        expect(out.actions[1]).toEqual({ id: 'announce', steps: [{ type: 'Emit', event: 'started' }] })
        expect(appActionIds(removeAppAction(doc, 'newOrder'))).toEqual(['announce'])
    })

    it('reads and writes the header switches', () => {
        const doc = parseApp(shell)
        expect(doc.fields.themeToggle).toBe(true)
        const out = parse(serializeApp({ ...doc, fields: { ...doc.fields, accessKeys: true, chromeless: true } }))
        expect(out).toMatchObject({ themeToggle: true, accessKeys: true, chromeless: true })
    })

    it('adds, edits, reorders and removes widgets, keeping an unknown one untouched', () => {
        let doc = parseApp(shell)
        expect(widgetProp(doc.widgets[0])).toBe('text')
        expect(widgetProp(doc.widgets[1])).toBeUndefined()
        doc = addWidget(doc, 'Button')
        doc = setWidgetProp(doc, 2, 'Help')
        doc = moveWidget(doc, 2, -1)
        expect(doc.widgets).toEqual([{ type: 'Text', text: 'v1' }, { type: 'Button', label: 'Help' }, { type: 'Avatar', name: 'x' }])
        expect(setWidgetProp(doc, 2, 'nope')).toBe(doc) // an unknown widget is never edited lossily
        expect(removeWidget(doc, 0).widgets).toHaveLength(2)
    })
})
