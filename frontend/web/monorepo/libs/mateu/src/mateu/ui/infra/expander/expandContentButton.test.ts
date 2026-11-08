// A Button authored in CONTENT (a hero's call to action, a layout's child) — not in a toolbar — is
// mapped by the server's ButtonMapper exactly like a toolbar button: a RouteLink `actionable` becomes
// the button's `route` and a missing actionId comes from the label (served wire of the starters'
// home.yaml: {type: Button, label: "Browse products", actionId: "browseProducts", route: "products"}).
// The browser expander must agree, or a static bundle's call to action does nothing on click.

import { describe, expect, it } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

const home: FluentNode = {
    type: 'VerticalLayout',
    content: [{
        type: 'HeroSection',
        title: 'My app',
        content: [{
            type: 'Button',
            label: 'Browse products',
            buttonStyle: 'primary',
            actionable: { type: 'RouteLink', route: 'products' },
        }],
    }],
} as unknown as FluentNode

describe('client-side expander — a Button in content', () => {
    it('navigates through its RouteLink and takes its actionId from its label, like the server', () => {
        const wire = expandComponent(home) as any
        const button = wire.children[0].children[0]
        expect(button.type).toBe('ClientSide')
        expect(button.metadata).toMatchObject({
            type: 'Button',
            label: 'Browse products',
            buttonStyle: 'primary',
            actionId: 'browseProducts',
            route: 'products',
        })
        expect(button.metadata.actionable).toBeUndefined()
    })

    it('keeps a declared actionId', () => {
        const wire = expandComponent({ type: 'Button', label: 'Save', actionId: 'persist' } as unknown as FluentNode) as any
        expect(wire.metadata.actionId).toBe('persist')
        expect(wire.metadata.route).toBeUndefined()
    })
})

describe('client-side expander — a ButtonGroup in content', () => {
    it('is a content Button whose children are the group buttons, like ButtonMapper.mapButtonGroupToDto', () => {
        const wire = expandComponent({
            type: 'ButtonGroup', id: 'more', label: 'More',
            buttons: [{ type: 'Button', label: 'Export' }, { type: 'Button', label: 'Home', actionable: { type: 'RouteLink', route: 'home' } }],
        } as unknown as FluentNode) as any
        expect(wire.type).toBe('ClientSide')
        expect(wire.id).toBe('more')
        expect(wire.children).toEqual([])
        expect(wire.metadata).toEqual({
            type: 'Button', label: 'More', children: [
                { type: 'Button', label: 'Export', actionId: 'export' },
                { type: 'Button', label: 'Home', actionId: 'home', route: 'home' },
            ],
        })
    })
})
