import { describe, expect, it } from 'vitest'
import { hasCycle, parseSpec, YamlAliasCycleError } from './specYaml'
import { buildPlayManifest } from './playManifest'
import { parsePage } from './pageModel'

// The editor reads spec YAML like the backend's SpecsYaml (SnakeYAML): merge keys applied (explicit
// keys win, the earlier base wins), a recursive alias refused. Review findings 3 + 4, 2026-11-13.

describe('parseSpec — recursive aliases', () => {
    it('a direct cycle is refused with a controlled error', () => {
        expect(() => parseSpec('&loop\ntype: VerticalLayout\ncontent: [*loop]\n')).toThrow(YamlAliasCycleError)
    })

    it('an indirect cycle (a → b → a) is refused', () => {
        expect(() => parseSpec('&a\ntype: VerticalLayout\ncontent:\n  - &b\n    type: Card\n    content: *a\n')).toThrow(YamlAliasCycleError)
    })

    it('a cycle deep inside a document is refused', () => {
        expect(() => parseSpec('page:\n  content:\n    - x: &n\n        child: {inner: [*n]}\n')).toThrow(YamlAliasCycleError)
    })

    it('shared aliases between siblings (no cycle) read as copies of one value', () => {
        const v = parseSpec('base: &b {type: Text, text: Hi}\ncontent: [*b, *b, {type: Card, content: *b}]\n')
        expect(v.content).toEqual([{ type: 'Text', text: 'Hi' }, { type: 'Text', text: 'Hi' }, { type: 'Card', content: { type: 'Text', text: 'Hi' } }])
    })

    it('a heavily shared anchor stays linear to check', () => {
        // 2^40 paths through a DAG of 40 levels: walked once per object, not once per path (the yaml
        // library itself caps alias expansion in a FILE; this is the walk's own bound)
        let node: Record<string, unknown> = { v: 1 }
        for (let i = 0; i < 40; i++) node = { a: node, b: [node, node] }
        const started = Date.now()
        expect(hasCycle(node)).toBe(false)
        expect(Date.now() - started).toBeLessThan(2000)
    })

    it('hasCycle tells a cycle from a shared reference', () => {
        const shared = { x: 1 }
        expect(hasCycle({ a: shared, b: [shared, shared] })).toBe(false)
        const loop: Record<string, unknown> = { type: 'VerticalLayout' }
        loop.content = [loop]
        expect(hasCycle(loop)).toBe(true)
        expect(hasCycle(null)).toBe(false)
        expect(hasCycle('text')).toBe(false)
    })

    it('a cyclic page reads as unreadable (empty) and a cyclic definition is left out of Play', () => {
        const loop = '&loop\ntype: VerticalLayout\ncontent: [*loop]\n'
        expect(parsePage(loop).layout).toBeDefined()
        const manifest = buildPlayManifest([{ path: 'specs/ui/loop.yaml', content: loop }, { path: 'specs/ui/ok.yaml', content: 'type: Text\ntext: ok\n' }])
        expect(Object.keys(manifest.definitions)).toEqual(['ok.yaml'])
    })
})

describe('parseSpec — merge keys', () => {
    it('a simple merge brings the base fields in', () => {
        const v = parseSpec('defaults: &base\n  type: Text\n  text: Hello\ncontent:\n  - <<: *base\n')
        expect(v.content).toEqual([{ type: 'Text', text: 'Hello' }])
    })

    it('an explicit key wins over a merged one, wherever it is written', () => {
        const v = parseSpec('b: &b {type: Text, text: base}\nafter: {<<: *b, text: own}\nbefore: {text: own, <<: *b}\n')
        expect(v.after).toEqual({ type: 'Text', text: 'own' })
        expect(v.before).toEqual({ type: 'Text', text: 'own' })
    })

    it('with several bases the EARLIER one wins (YAML 1.1, as SnakeYAML)', () => {
        const v = parseSpec('a: &a {x: a, y: a}\nb: &b {x: b, z: b}\nc: {<<: [*a, *b], y: own}\n')
        expect(v.c).toEqual({ x: 'a', y: 'own', z: 'b' })
    })

    it('a merge of a merge applies both', () => {
        const v = parseSpec('a: &a {x: 1}\nb: &b {<<: *a, y: 2}\nc: {<<: *b, z: 3}\n')
        expect(v.c).toEqual({ x: 1, y: 2, z: 3 })
    })

    it('a merge in a page reaches the edited model and Play', () => {
        const page = 'defaults: &base\n  type: Text\n  text: Hello\ntype: VerticalLayout\ncontent:\n  - <<: *base\n'
        expect(parsePage(page).layout.content?.[0]).toMatchObject({ type: 'Text', text: 'Hello' })
        const manifest = buildPlayManifest([{ path: 'specs/ui/p.yaml', content: page }])
        expect((manifest.definitions['p.yaml'] as any).content).toEqual([{ type: 'Text', text: 'Hello' }])
    })

    it('a merge whose source is not a map does not load (as SnakeYAML)', () => {
        expect(() => parseSpec('x: {<<: 5}\n')).toThrow()
    })
})
