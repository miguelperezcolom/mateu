// P5·S0 (static VCN slice) — the expander covers the read-only record page and the app shell, so a
// YAML-authored static UI runs with NO pre-rendering. Shapes taken from the server wire of the same
// definitions (demo/demo-static-vcn/yaml served live): a `type: Form` lifts its content to children
// and keeps title/subtitle/toolbar in metadata; a FormField's authored `id` is the wire `fieldId`; a
// Button whose actionable is a RouteLink carries the route; a button with no id gets one from its label.
import { describe, expect, it } from 'vitest'
import { expandComponent, expandButton, type FluentNode } from '@infra/expander/expandComponent'
import { expandAppShell, expandDefinition } from '@infra/expander/expandDefinition'

describe('client-side expander — the record page', () => {
    const form: FluentNode = {
        type: 'Form',
        title: '${state.displayName}',
        subtitle: 'Virtual cloud network',
        toolbar: [
            { type: 'Button', actionId: 'backToList', label: 'Back', actionable: { type: 'RouteLink', route: 'vcns' } },
            { type: 'Button', label: 'Subnets', actionable: { type: 'RouteLink', route: 'vcns/${state.id}/subnets' } },
            { type: 'Button', label: 'Delete', actionId: 'delete', color: 'error' },
        ] as unknown as FluentNode,
        content: [{ type: 'FormLayout', content: [{ type: 'FormField', id: 'cidrBlock', label: 'CIDR', readOnly: true }] }],
    }

    it('lifts the content and keeps the header in metadata', () => {
        const wire = expandComponent(form) as any
        expect(wire.metadata).toMatchObject({ type: 'Form', title: '${state.displayName}', subtitle: 'Virtual cloud network' })
        expect(wire.children[0].metadata.type).toBe('FormLayout')
        const field = wire.children[0].children[0]
        expect(field.id).toBe('cidrBlock')
        expect(field.metadata).toMatchObject({ type: 'FormField', fieldId: 'cidrBlock', dataType: 'string', stereotype: 'regular', readOnly: true })
        expect(field.metadata.id).toBeUndefined()
    })

    it('maps toolbar buttons the way the server ButtonMapper does', () => {
        const [back, subnets, del] = (expandComponent(form) as any).metadata.toolbar
        expect(back).toEqual({ type: 'Button', actionId: 'backToList', label: 'Back', route: 'vcns' })
        expect(subnets).toMatchObject({ actionId: 'subnets', route: 'vcns/${state.id}/subnets' })
        expect(del).toMatchObject({ actionId: 'delete', color: 'error' })
        expect(del.route).toBeUndefined()
        expect(expandButton({ type: 'Button', label: 'Virtual cloud networks' }).actionId).toBe('virtualCloudNetworks')
    })

    it('a screen with no behaviour is not wrapped', () => {
        const inc = expandDefinition({ type: 'Form', content: [] }, 'x')
        expect((inc.fragments![0].component as any).type).toBe('ClientSide')
    })
})

describe('client-side expander — listings keep the load-bearing defaults', () => {
    it('pages by 10 unless told otherwise, and maps filters to wire FormFields', () => {
        const wire = expandComponent({
            type: 'Listing', rowsSource: { ref: 'vcns' } as unknown as FluentNode,
            filters: [{ type: 'FormField', id: 'lifecycleState', stereotype: 'select' }] as unknown as FluentNode,
        }) as any
        expect(wire.metadata).toMatchObject({ pageSize: 10, filtersLayout: 'auto', gridLayout: 'auto', searchOnEnter: true })
        expect(wire.metadata.filters[0]).toEqual({ type: 'FormField', fieldId: 'lifecycleState', stereotype: 'select', dataType: 'string' })
        expect((expandComponent({ type: 'Listing', pageSize: 5 }) as any).metadata.pageSize).toBe(5)
    })
})

describe('client-side expander — the app shell', () => {
    it('turns an AppShell into the wire App with its menu and home', () => {
        const inc = expandAppShell({
            type: 'AppShell', title: 'Networking', subtitle: 'static', variant: 'MENU_ON_TOP',
            menu: [
                { type: 'RouteLink', label: 'Virtual cloud networks', route: 'vcns', icon: 'vaadin:cluster' },
                { type: 'Menu', label: 'More', submenu: [{ type: 'RouteLink', label: 'Subnets', route: 'subnets' }] },
            ] as unknown as FluentNode,
        } as FluentNode)
        const app = (inc.fragments![0].component as any).metadata
        expect(app).toMatchObject({ type: 'App', title: 'Networking', variant: 'MENU_ON_TOP', homeRoute: 'vcns', route: '' })
        expect(app.menu[0]).toMatchObject({ label: 'Virtual cloud networks', path: '/vcns', route: '/vcns', consumedRoute: '', visible: true })
        expect(app.menu[1].submenus[0]).toMatchObject({ label: 'Subnets', route: '/subnets' })
    })
})
