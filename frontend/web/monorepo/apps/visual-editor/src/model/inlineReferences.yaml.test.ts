import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { inlineReferences } from './inlineReferences'

// YAML alias cycles and merge keys (review findings 3 + 4, 2026-11-13). A recursive alias
// (`&loop … content: [*loop]`) makes the yaml library hand over a CYCLIC object, and every walk of
// the definition recursed until "Maximum call stack size exceeded" — freezing Play / the canvas.
// The backend (SpecsYaml) refuses a recursive alias: the file does not load. A merge key
// (`<<: *base`) is applied there, and was kept here as an ordinary `<<` property.

const LOOP = '&loop\ntype: VerticalLayout\ncontent: [*loop]\n'
const INDIRECT = '&a\ntype: VerticalLayout\ncontent:\n  - &b\n    type: Card\n    content: *a\n'
const catalogue = (entries: string) => ({ path: 'specs/ui/components.yaml', content: `components:\n${entries}` })

describe('inlineReferences — alias cycles', () => {
    it('a cyclic definition (direct or indirect) is a controlled error, not a stack overflow', () => {
        for (const yaml of [LOOP, INDIRECT]) {
            const cyclic = parse(yaml)
            for (const files of [[], [{ path: 'specs/ui/partials/x.yaml', content: 'type: Text\n' }]]) {
                let thrown: unknown
                try { inlineReferences(cyclic, files) } catch (e) { thrown = e }
                expect(thrown).toBeInstanceOf(Error)
                expect(thrown).not.toBeInstanceOf(RangeError)
                expect((thrown as Error).message).toMatch(/alias refers to itself/)
            }
        }
    })

    it('a partial whose file is a recursive alias is left as a reference, the rest still inlines', () => {
        const files = [
            { path: 'specs/ui/partials/loop.yaml', content: LOOP },
            { path: 'specs/ui/partials/other.yaml', content: INDIRECT },
            { path: 'specs/ui/partials/brand.yaml', content: 'type: Text\ntext: Brand\n' },
        ]
        const page = { type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'loop' }, { type: 'Partial', ref: 'other' }, { type: 'Partial', ref: 'brand' }] }
        const out = inlineReferences(page, files) as any
        expect(out.content).toEqual([{ type: 'Partial', ref: 'loop' }, { type: 'Partial', ref: 'other' }, { type: 'Text', text: 'Brand' }])
    })

    it('a business component whose catalogue is a recursive alias is left as a reference', () => {
        const files = [catalogue('  - name: loop\n    component: &c {type: VerticalLayout, content: [*c]}\n')]
        const out = inlineReferences({ type: 'ComponentRef', ref: 'loop' }, files) as any
        expect(out).toEqual({ type: 'ComponentRef', ref: 'loop' })
    })

    it('a shared alias between siblings (no cycle) still inlines both copies', () => {
        const files = [{ path: 'specs/ui/partials/brand.yaml', content: 'type: Text\ntext: Brand\n' }]
        const page = parse('shared: &p {type: Partial, ref: brand}\nlabel: &t {type: Text, text: Hi}\ncontent: [*p, *t, *p, *t]\n')
        const out = inlineReferences({ type: 'VerticalLayout', content: page.content }, files) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'Brand' }, { type: 'Text', text: 'Hi' }, { type: 'Text', text: 'Brand' }, { type: 'Text', text: 'Hi' }])
    })

    it('a partial file sharing an alias between siblings inlines', () => {
        const files = [{ path: 'specs/ui/partials/twice.yaml', content: 'x: &t {type: Text, text: Twice}\ncontent: [*t, *t]\n' }]
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'twice' }] }, files) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'Twice' }, { type: 'Text', text: 'Twice' }])
    })
})

describe('inlineReferences — merge keys', () => {
    it('a partial using a merge key brings the inherited fields in, its own fields winning', () => {
        const files = [{ path: 'specs/ui/partials/greeting.yaml', content: 'defaults: &base\n  type: Text\n  text: Hello\ncontent:\n  - <<: *base\n  - <<: *base\n    text: Bye\n' }]
        const out = inlineReferences({ type: 'VerticalLayout', content: [{ type: 'Partial', ref: 'greeting' }] }, files) as any
        expect(out.content).toEqual([{ type: 'Text', text: 'Hello' }, { type: 'Text', text: 'Bye' }])
    })

    it('a business component using a merge key brings the inherited fields in', () => {
        const files = [catalogue('  - name: price\n    component: {<<: {type: Text, text: base}, text: Price}\n')]
        const out = inlineReferences({ type: 'ComponentRef', ref: 'price' }, files) as any
        expect(out).toEqual({ type: 'Text', text: 'Price' })
    })
})
