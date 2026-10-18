import { describe, expect, it } from 'vitest'
import { inlineReferences } from './inlineReferences'

// Reference cycles and partials named by an explicit path (external review, 2026-10-18). A
// ComponentRef whose composition referenced itself — directly, through another component or through
// a partial — recursed until "Maximum call stack size exceeded" and took Play / the canvas down; the
// rule (DefinitionInliner, PartialExpander) is that a cycle is broken and the reference is left as
// it was, without aborting the rest of the definition.

const catalogue = (entries: string) => ({ path: 'specs/ui/components.yaml', content: `components:\n${entries}` })

describe('inlineReferences — cycles', () => {
    it('a self-referencing business component is left as a reference, the rest still inlines', () => {
        const files = [catalogue(
            '  - name: loop\n    component: {type: VerticalLayout, content: [{type: Text, text: inside}, {type: ComponentRef, ref: loop}]}\n'
            + '  - name: price\n    component: {type: Text, text: Price}\n')]
        const page = { type: 'VerticalLayout', content: [{ type: 'ComponentRef', ref: 'loop' }, { type: 'ComponentRef', ref: 'price' }] }
        const out = inlineReferences(page, files) as any
        expect(out.content[0]).toMatchObject({ type: 'VerticalLayout' })
        expect(out.content[0].content[0]).toEqual({ type: 'Text', text: 'inside' })
        expect(out.content[0].content[1]).toEqual({ type: 'ComponentRef', ref: 'loop' })
        expect(out.content[1]).toEqual({ type: 'Text', text: 'Price' })
    })

    it('an indirect cycle between two business components is broken', () => {
        const files = [catalogue(
            '  - name: a\n    component: {type: Card, content: {type: ComponentRef, ref: b}}\n'
            + '  - name: b\n    component: {type: Card, content: {type: ComponentRef, ref: a}}\n')]
        const out = inlineReferences({ type: 'ComponentRef', ref: 'a' }, files) as any
        expect(out).toEqual({ type: 'Card', content: { type: 'Card', content: { type: 'ComponentRef', ref: 'a' } } })
    })

    it('a mixed cycle (component → partial → component) is broken', () => {
        const files = [
            catalogue('  - name: header\n    component: {type: VerticalLayout, content: [{type: Partial, ref: brand}]}\n'),
            { path: 'specs/ui/partials/brand.yaml', content: 'content:\n  - {type: Text, text: Brand}\n  - {type: ComponentRef, ref: header}\n' },
        ]
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'ComponentRef', ref: 'header' }] }, files) as any
        expect(out.content[0].content).toEqual([{ type: 'Text', text: 'Brand' }, { type: 'ComponentRef', ref: 'header' }])
    })

    it('a mixed cycle (partial → component → partial) is broken', () => {
        const files = [
            catalogue('  - name: card\n    component: {type: Card, content: {type: Partial, ref: shell}}\n'),
            { path: 'specs/ui/partials/shell.yaml', content: 'type: VerticalLayout\ncontent:\n  - {type: ComponentRef, ref: card}\n' },
        ]
        const out = inlineReferences({ type: 'Partial', ref: 'shell' }, files) as any
        expect(out).toEqual({ type: 'VerticalLayout', content: [{ type: 'Card', content: { type: 'Partial', ref: 'shell' } }] })
    })

    it('the same component used twice side by side is NOT a cycle', () => {
        const files = [catalogue('  - name: price\n    component: {type: Text, text: Price}\n')]
        const out = inlineReferences({ type: 'HorizontalLayout', content: [{ type: 'ComponentRef', ref: 'price' }, { type: 'ComponentRef', ref: 'price' }] }, files) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'Price' }, { type: 'Text', text: 'Price' }])
    })
})

describe('inlineReferences — partials by explicit path', () => {
    const files = [
        { path: 'specs/ui/partials/address.yaml', content: 'content:\n  - {type: FormField, id: street}\n  - {type: FormField, id: city}\n' },
        { path: 'specs/ui/shared/legal.yml', content: 'type: Text\ntext: Legal\n' },
    ]
    const ids = (out: any) => (out.content as any[]).map((c) => c.id ?? c.type)

    it('resolves the short name, the classpath path (PartialRegistry.java) and the specs-relative path alike', () => {
        for (const ref of ['address', 'specs/ui/partials/address.yaml', 'partials/address.yaml', '/specs/ui/partials/address.yaml']) {
            const out = inlineReferences({ type: 'FormLayout', content: [{ type: 'Partial', ref }] }, files)
            expect(ids(out), ref).toEqual(['street', 'city'])
        }
    })

    it('an explicit path may point outside partials/, with .yml too', () => {
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'specs/ui/shared/legal.yml' }] }, files) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'Legal' }])
    })

    it('a missing explicit path is left as a reference', () => {
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'specs/ui/partials/nope.yaml' }] }, files) as any
        expect(out.content).toEqual([{ type: 'Partial', ref: 'specs/ui/partials/nope.yaml' }])
    })

    it('a cycle is detected whatever spelling each side uses', () => {
        const loop = [
            { path: 'specs/ui/partials/a.yaml', content: 'content:\n  - {type: Text, text: A}\n  - {type: Partial, ref: specs/ui/partials/b.yaml}\n' },
            { path: 'specs/ui/partials/b.yaml', content: 'content:\n  - {type: Partial, ref: a}\n' },
        ]
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'a' }] }, loop) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'A' }, { type: 'Partial', ref: 'a' }])
    })
})
