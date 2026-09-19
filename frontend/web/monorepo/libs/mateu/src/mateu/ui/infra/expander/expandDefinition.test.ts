// Phase 6 increment 1 — the client-side expander reproduces the SERVER's expansion of a bare-layout
// definition, to render-parity. The golden (about.golden.json) was captured from the Python backend
// (SyncHandler.handle on the definition-only "about" route, whose about.yaml is
// `layout: { VerticalLayout > content: [ Text "About this app" ] }`). The server fills per-type
// defaults (spacing/container/noMargins); the expander omits them and the renderer defaults them, so
// the assertion is a STRUCTURAL SUBSET: everything the expander emits must be present and equal in
// the golden, and the tree (types + children) must match. See design/phase6-client-side-expander.md.

import { describe, expect, it } from 'vitest'
import { expandDefinition, isClientExpandable, type DefinitionSpec } from '@infra/expander/expandDefinition'
import { expandComponent } from '@infra/expander/expandComponent'
import golden from '@infra/expander/__fixtures__/about.golden.json'

// The parsed about.yaml (increment 2 owns loading + js-yaml parsing; here we hand the parsed object).
const aboutSpec: DefinitionSpec = {
    layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'About this app' }] },
}

/** Assert `actual` is a structural subset of `expected`: every key/element the expander emits is
 *  present and equal in the golden. The golden may carry extra keys (server-filled defaults). */
function expectSubset(actual: unknown, expected: unknown, path = ''): void {
    if (Array.isArray(actual)) {
        expect(Array.isArray(expected), `${path} should be an array in the golden`).toBe(true)
        expect((actual as unknown[]).length, `${path} length`).toBe((expected as unknown[]).length)
        actual.forEach((v, i) => expectSubset(v, (expected as unknown[])[i], `${path}[${i}]`))
    } else if (actual && typeof actual === 'object') {
        expect(expected && typeof expected === 'object', `${path} should be an object in the golden`).toBeTruthy()
        for (const [k, v] of Object.entries(actual)) {
            if (v === undefined) continue
            expectSubset(v, (expected as Record<string, unknown>)[k], path ? `${path}.${k}` : k)
        }
    } else {
        expect(actual, `${path}`).toEqual(expected)
    }
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
