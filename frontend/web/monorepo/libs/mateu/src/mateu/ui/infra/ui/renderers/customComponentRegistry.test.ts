// Custom components (coherence-plan #14): the per-renderer escape hatch. This pins the registry
// (register/resolve/replace/clear) and the Phase-6 expander's container-style expansion of a
// CustomComponent node (name/props in metadata, slotted content lifted to wire children).
import { describe, expect, it, beforeEach } from 'vitest'
import { html } from 'lit'
import {
    registerCustomComponent,
    resolveCustomComponent,
    hasCustomComponent,
    clearCustomComponents,
} from '@infra/ui/renderers/customComponentRegistry'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

beforeEach(() => clearCustomComponents())

describe('custom component registry (Phase 7, #14)', () => {
    it('registers, resolves, and reports presence', () => {
        expect(resolveCustomComponent('org-chart')).toBeUndefined()
        expect(hasCustomComponent('org-chart')).toBe(false)
        const renderer = () => html`<div>chart</div>`
        registerCustomComponent('org-chart', renderer)
        expect(resolveCustomComponent('org-chart')).toBe(renderer)
        expect(hasCustomComponent('org-chart')).toBe(true)
    })

    it('a later registration replaces an earlier one', () => {
        const first = () => html`<div>first</div>`
        const second = () => html`<div>second</div>`
        registerCustomComponent('widget', first)
        registerCustomComponent('widget', second)
        expect(resolveCustomComponent('widget')).toBe(second)
    })

    it('an unregistered name resolves to undefined (→ <mateu-unsupported> at render)', () => {
        expect(resolveCustomComponent('never-registered')).toBeUndefined()
    })
})

describe('client-side expander — CustomComponent (Phase 7, #14)', () => {
    it('keeps name/props in metadata and lifts slotted content to wire children', () => {
        const node = {
            type: 'CustomComponent',
            name: 'org-chart',
            props: { orientation: 'vertical', levels: 3 },
            content: [{ type: 'Text', text: 'fallback content' }],
        } as unknown as FluentNode
        const wire = expandComponent(node) as any
        expect(wire.type).toBe('ClientSide')
        expect(wire.metadata).toMatchObject({
            type: 'CustomComponent',
            name: 'org-chart',
            props: { orientation: 'vertical', levels: 3 },
        })
        expect(wire.children).toHaveLength(1)
        expect(wire.children[0].metadata).toMatchObject({ type: 'Text', text: 'fallback content' })
    })
})
