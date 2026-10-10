// The browser expander's `type: AppShell` must reproduce what the server sends for the same shell
// (YamlAppLoader → AppMapper): the declared FLOWS lowered to commands, the menu's RuleLink with its
// RunAction rule, the header widgets in slot "widgets" and the header switches. The golden
// (app-shell.golden.json) is captured from the JAVA backend by AppShellFlowSyncTest
// (-Dmateu.golden.write=true) over mount-home/shell-flows/specs/ui/shell.yaml — the same tree as
// `shell` below. Structural subset: everything the expander emits must be present and equal.

import { describe, expect, it } from 'vitest'
import { expandAppShell, expandDefinition, lowerAction, lowerStep } from '@infra/expander/expandDefinition'
import type { FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/app-shell.golden.json'

// shell.yaml of the Java fixture, parsed.
const shell: FluentNode = {
    type: 'AppShell',
    title: 'Shell flows',
    variant: 'MENU_ON_TOP',
    homeRoute: 'home',
    themeToggle: true,
    commandCenter: true,
    accessKeys: true,
    actions: [
        { id: 'newOrder', steps: [{ type: 'MarkClean' }, { type: 'Navigate', route: 'orders/new' }] },
        { id: 'announce', steps: [{ type: 'Emit', event: 'order-started' }] },
    ],
    menu: [
        { type: 'RouteLink', label: 'Home', route: 'home' },
        { type: 'RuleLink', label: 'New order', rules: [{ action: 'RunAction', actionId: 'newOrder' }] },
    ],
    widgets: [{ type: 'Text', text: 'v1.0' }],
}

const goldenApp = (golden as any).fragments[0].component

describe('client-side expander — app shell flows, widgets and header switches', () => {
    const wire = (expandAppShell(shell).fragments![0] as any).component

    it('reproduces the server App metadata (structural subset of the Java golden)', () => {
        expectSubset(wire.metadata, goldenApp.metadata)
    })

    it('reproduces the header widgets in slot "widgets"', () => {
        const strip = (c: any) => ({ ...c, id: undefined })
        expectSubset(wire.children.map(strip), goldenApp.children)
        expect(wire.children[0].slot).toBe('widgets')
    })

    it('lowers each flow to commands and drops the authored steps', () => {
        const [newOrder] = wire.metadata.actions
        expect(newOrder.steps).toBeUndefined()
        expect(newOrder.commands.map((c: any) => c.type)).toEqual(['MarkAsClean', 'NavigateTo'])
        expect(newOrder.commands[1].data).toBe('orders/new')
    })

    it('keeps the menu action leaf as a RuleLink with its RunAction rule', () => {
        const leaf = wire.metadata.menu[1]
        expect(leaf.rules).toHaveLength(1)
        expect(leaf.rules[0]).toMatchObject({ action: 'RunAction', actionId: 'newOrder' })
        expect(leaf.path).toBe('/newOrder')
    })

    it('chromeless implies the command center, as on the server', () => {
        const m = (expandAppShell({ type: 'AppShell', chromeless: true, menu: [] }).fragments![0] as any).component.metadata
        expect(m.chromeless).toBe(true)
        expect(m.commandCenterEnabled).toBe(true)
        expect(m.actions).toEqual([])
    })
})

describe('lowering a declared flow', () => {
    it('maps every v0 verb to the command the server emits', () => {
        expect(lowerStep({ type: 'CloseOverlay' })).toEqual({ targetComponentId: null, type: 'CloseModal', data: null })
        expect(lowerStep({ type: 'CloseOverlay', event: 'saved' })!.data).toEqual({ eventName: 'saved', detail: null })
        expect(lowerStep({ type: 'RunAction', actionId: 'x' })!.data).toEqual({ actionId: 'x' })
        expect(lowerStep({ type: 'MarkDirty' })!.type).toBe('MarkAsDirty')
        expect(lowerStep({ type: 'Emit', event: 'e', payload: { a: 1 } })!.data).toEqual({ eventName: 'e', detail: { a: 1 } })
        expect(lowerStep({ type: 'Nope' })).toBeUndefined()
    })

    it('leaves an action without steps untouched', () => {
        const a = { id: 'save', restAction: { source: { ref: 'x' } } }
        expect(lowerAction(a)).toBe(a)
    })
})

describe('a page definition\'s flow is lowered too', () => {
    it('travels as commands on the page component, as the server sends it (YamlDeclaredFlowSyncTest)', () => {
        const inc = expandDefinition({
            layout: { type: 'VerticalLayout', content: [] },
            actions: [{ id: 'saveAndClose', steps: [{ type: 'MarkClean' }, { type: 'CloseOverlay' }, { type: 'Navigate', route: 'x' }] }],
        }, 'yaml-flow')
        const page = (inc.fragments![0] as any).component
        expect(page.actions[0].commands.map((c: any) => c.type)).toEqual(['MarkAsClean', 'CloseModal', 'NavigateTo'])
        expect(page.actions[0].steps).toBeUndefined()
    })
})
