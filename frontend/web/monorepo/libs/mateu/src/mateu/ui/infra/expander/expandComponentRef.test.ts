// Phase 6 + #13: the client-side expander resolves a business-component reference against the
// shipped catalogue (componentCatalogue), so `type: ComponentRef` renders with no backend — the
// browser twin of the server's ComponentRef resolution.
import { describe, expect, it, beforeEach } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { setComponentCatalogue, resolveComponent } from '@infra/http/componentCatalogue'

const agencySelector = {
    type: 'ClientSide',
    metadata: { type: 'Text', text: 'agency selector' },
    children: [],
} as any

beforeEach(() => setComponentCatalogue(undefined))

describe('component catalogue (Phase 7, #13)', () => {
    it('resolves a name to its composition, undefined otherwise', () => {
        expect(resolveComponent('AgencySelector')).toBeUndefined()
        setComponentCatalogue([{ name: 'AgencySelector', component: agencySelector }])
        expect(resolveComponent('AgencySelector')).toEqual(agencySelector)
        expect(resolveComponent('Unknown')).toBeUndefined()
        expect(resolveComponent(undefined)).toBeUndefined()
    })

    it('a replace, not a merge — a new catalogue drops the old entries', () => {
        setComponentCatalogue([{ name: 'AgencySelector', component: agencySelector }])
        setComponentCatalogue([{ name: 'Other', component: agencySelector }])
        expect(resolveComponent('AgencySelector')).toBeUndefined()
        expect(resolveComponent('Other')).toEqual(agencySelector)
    })
})

describe('client-side expander — ComponentRef (Phase 7, #13)', () => {
    it('substitutes a ComponentRef with the catalogue composition', () => {
        setComponentCatalogue([{ name: 'AgencySelector', component: agencySelector }])
        const wire = expandComponent({ type: 'ComponentRef', ref: 'AgencySelector' } as FluentNode) as any
        expect(wire.metadata).toMatchObject({ type: 'Text', text: 'agency selector' })
    })

    it('an unknown ref is a graceful placeholder, not an error', () => {
        const wire = expandComponent({ type: 'ComponentRef', ref: 'Nope' } as FluentNode) as any
        expect(wire.type).toBe('ClientSide')
        expect(wire.metadata.type).toBe('Text')
        expect(wire.metadata.text).toContain('Unknown business component: Nope')
    })

    it('resolves a ComponentRef nested inside a layout', () => {
        setComponentCatalogue([{ name: 'AgencySelector', component: agencySelector }])
        const layout = {
            type: 'VerticalLayout',
            content: [{ type: 'ComponentRef', ref: 'AgencySelector' }],
        } as FluentNode
        const wire = expandComponent(layout) as any
        expect(wire.metadata.type).toBe('VerticalLayout')
        expect(wire.children[0].metadata).toMatchObject({ type: 'Text', text: 'agency selector' })
    })
})
