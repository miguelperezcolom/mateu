// Phase 6 increment 1 — the client-side expander reproduces the SERVER's expansion of a bare-layout
// definition, to render-parity. The golden (about.golden.json) was captured from the Python backend
// (SyncHandler.handle on the definition-only "about" route, whose about.yaml is
// `layout: { VerticalLayout > content: [ Text "About this app" ] }`). The server fills per-type
// defaults (spacing/container/noMargins); the expander omits them and the renderer defaults them, so
// the assertion is a STRUCTURAL SUBSET: everything the expander emits must be present and equal in
// the golden, and the tree (types + children) must match. See design/phase6-client-side-expander.md.

import { describe, expect, it } from 'vitest'
import { expandDefinition, isClientExpandable, requiredValidationsOf, type DefinitionSpec } from '@infra/expander/expandDefinition'
import { expandComponent } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/about.golden.json'
import { pageTypeOf } from '@infra/ui/layout/pageWidth'

// The parsed about.yaml (increment 2 owns loading + js-yaml parsing; here we hand the parsed object).
const aboutSpec: DefinitionSpec = {
    layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'About this app' }] },
}

describe('client-side expander — bare-layout definition (Phase 6, increment 1)', () => {
    it('recognises a bare layout (no viewModel) as client-expandable', () => {
        expect(isClientExpandable(aboutSpec)).toBe(true)
        expect(isClientExpandable({ ...aboutSpec, viewModel: 'io.example.Foo' })).toBe(false)
        expect(isClientExpandable({ ...aboutSpec, modelView: 'io.example.Foo' })).toBe(false)
    })

    it('expands to the SERVER wire (render-parity: a structural subset of the golden)', () => {
        const inc = expandDefinition(aboutSpec, 'about')
        expectSubset(inc, golden)
    })

    it('mechanically maps fluent → ClientSide+metadata, lifting container content to children', () => {
        const wire = expandComponent(aboutSpec.layout!) as any
        expect(wire.type).toBe('ClientSide')
        expect(wire.metadata.type).toBe('VerticalLayout')
        expect(wire.children).toHaveLength(1)
        const text = wire.children[0]
        expect(text.type).toBe('ClientSide')
        expect(text.metadata).toMatchObject({ type: 'Text', text: 'About this app' })
        expect(text.children).toEqual([])
    })

    it('drops the authors\' design notes, as the server does — they never reach the wire', () => {
        const noted = { type: 'VerticalLayout', note: 'the screen', content: [{ type: 'Listing', note: 'paged', columns: [] }, { type: 'Text', text: 'x', note: 'a hint' }] }
        expect(JSON.stringify(expandComponent(noted as any))).not.toContain('note')
    })

    it('titles the window with the route when the definition declares none, and can override', () => {
        expect(expandDefinition(aboutSpec, 'about').commands![0]).toMatchObject({
            type: 'SetWindowTitle',
            data: 'about',
            targetComponentId: 'ux_main',
        })
        expect(expandDefinition(aboutSpec, 'about', 'About').commands![0]).toMatchObject({ data: 'About' })
    })

    it('emits one Replace fragment targeting ux_main', () => {
        const f = expandDefinition(aboutSpec, 'about').fragments![0]
        expect(f.targetComponentId).toBe('ux_main')
        expect(f.action).toBe('Replace')
        expect((f.component as any).metadata.type).toBe('VerticalLayout')
    })

    it('throws when a definition has no layout to expand', () => {
        expect(() => expandDefinition({ viewModel: 'io.example.Foo' }, 'x')).toThrow(/no layout/)
    })
})

// `pageType:` — the YAML twin of @PageTemplate. It must reach the page from the browser expander
// too, or a specsOnly bundle would size the page by inference while the served app uses the
// declaration. The renderers read it off the fragment's top component (pageTypeOf).
describe('client-side expander — declared pageType', () => {
    it('stamps it on the root of a page with no behaviour, which stays unwrapped (case-insensitive)', () => {
        const wire = expandDefinition({ ...aboutSpec, pageType: 'Landing' }, 'about', undefined, { path: 'about' })
            .fragments![0].component as any
        // unwrapped: the visual editor's canvas maps clicks through this very tree
        expect(wire.type).toBe('ClientSide')
        expect(wire.metadata.type).toBe('VerticalLayout')
        expect(wire.pageType).toBe('landing')
        expect(pageTypeOf(wire)).toBe('landing')
    })

    it('carries the type on the wrapper of a page with declared actions', () => {
        const wire = expandDefinition({ ...aboutSpec, pageType: 'collection', actions: [{ id: 'save' }] }, 'about')
            .fragments![0].component as any
        expect(wire.type).toBe('ServerSide')
        expect(wire.pageType).toBe('collection')
        expect(pageTypeOf(wire)).toBe('collection')
        expect(wire.actions.map((a: any) => a.id)).toContain('save')
    })

    it('leaves an undeclared or unknown type to inference: no wrapper, no pageType', () => {
        for (const spec of [aboutSpec, { ...aboutSpec, pageType: 'banana' }]) {
            const wire = expandDefinition(spec, 'about').fragments![0].component as any
            expect(wire.type).toBe('ClientSide')
            expect(wire.pageType).toBeUndefined()
        }
    })

    it('reads the type off a BARE tree without leaking it into the root component', () => {
        const wire = expandDefinition({ type: 'VerticalLayout', pageType: 'dashboard', content: [] }, 'x')
            .fragments![0].component as any
        expect(wire.pageType).toBe('dashboard')
        expect(JSON.stringify(wire.metadata)).not.toContain('pageType')
    })
})

describe('required fields of a bundled definition', () => {
    it('travel as the validations the server gives them, so the page refuses an action with them empty', () => {
        const spec = {
            layout: { type: 'FormLayout', content: [
                { type: 'FormField', id: 'guest', label: 'Guest', required: true },
                { type: 'FormField', id: 'locked', label: 'Locked', required: true, readOnly: true },
                { type: 'FormField', id: 'notes', label: 'Notes' },
            ] },
            actions: [{ id: 'save', validationRequired: true, restAction: { source: { url: '/x', method: 'POST' } } }],
        } as unknown as DefinitionSpec
        const inc = expandDefinition(spec, 'booking') as unknown as { fragments: { component: { validations: { fieldId: string, condition: string }[] } }[] }
        const validations = inc.fragments[0].component.validations
        expect(validations.map((v) => v.fieldId)).toEqual(['guest'])
        expect(validations[0].condition).toBe(
            "state['guest'] != null && state['guest'] !== '' && (state['guest'].length === undefined || state['guest'].length > 0)")
        expect(requiredValidationsOf({})).toEqual([])
    })
})
