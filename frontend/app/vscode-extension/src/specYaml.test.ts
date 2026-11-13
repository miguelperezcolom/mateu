import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { extractBindings } from './createInViewModel'
import { sourceOrigins } from './csp'
import { rendererOf } from './projectDescriptor'
import { homeOf, registerInMount } from './routesWizard'

// Spec YAML read as data in the extension follows the backend's SpecsYaml (SnakeYAML) like the visual
// editor does: merge keys applied (explicit keys win, the earlier base wins), a recursive alias
// refused with a controlled error, a shared alias between siblings read as usual. Review findings
// 3 + 4, 2026-11-13. A recursive alias used to overflow the stack in extractBindings' walk.

const LOOP = '&loop\ntype: VerticalLayout\ncontent: [*loop]\n'
const INDIRECT = '&a\ntype: VerticalLayout\ncontent:\n  - &b\n    type: Card\n    content: *a\n'

describe('spec YAML in the extension — recursive aliases', () => {
    it('extractBindings: a direct or indirect cycle reads as unreadable, not a stack overflow', () => {
        expect(extractBindings(LOOP)).toEqual({ fields: [] })
        expect(extractBindings(INDIRECT)).toEqual({ fields: [] })
        expect(extractBindings(`viewModel: a.B\nlayout:\n  ${LOOP.replace(/\n/g, '\n  ')}`)).toEqual({ fields: [] })
    })

    it('extractBindings: a shared alias between siblings (no cycle) still binds', () => {
        const yaml = 'f: &f {type: FormField, id: name, dataType: string}\ntype: VerticalLayout\ncontent: [*f, {type: Card, content: *f}]\n'
        expect(extractBindings(yaml).fields).toEqual([{ id: 'name', dataType: 'string' }])
    })

    it('the other readers treat a cyclic file as unreadable', () => {
        expect(sourceOrigins(['&s\nsources:\n  - *s\n'])).toEqual([])
        expect(rendererOf('&p\ntype: Project\nrenderer: redwood\nself: *p\n')).toBe('vaadin')
        expect(homeOf('&m\ntype: UI\nhome: orders\nself: *m\n')).toBeNull()
        expect(() => registerInMount('&m\ntype: UI\nroutes: [*m]\n', 'routes.yaml')).toThrow(/alias refers to itself/)
    })
})

describe('spec YAML in the extension — merge keys', () => {
    it('extractBindings: a merged FormField binds, its own fields winning', () => {
        const yaml = 'base: &base {type: FormField, id: name, dataType: string}\ntype: VerticalLayout\ncontent:\n  - <<: *base\n  - <<: *base\n    id: age\n    dataType: integer\n'
        expect(extractBindings(yaml).fields).toEqual([{ id: 'name', dataType: 'string' }, { id: 'age', dataType: 'integer' }])
    })

    it('with several bases the EARLIER one wins (YAML 1.1, as SnakeYAML)', () => {
        const yaml = 'a: &a {type: FormField, id: fromA}\nb: &b {id: fromB, dataType: number}\ncontent:\n  - {<<: [*a, *b]}\n'
        expect(extractBindings(yaml).fields).toEqual([{ id: 'fromA', dataType: 'number' }])
    })

    it('the other readers apply merges', () => {
        expect(sourceOrigins(['common: &c {source: {url: "https://api.example.com/x"}}\nsources:\n  - <<: *c\n    name: x\n'])).toEqual(['https://api.example.com'])
        expect(rendererOf('defaults: &d {renderer: redwood}\n<<: *d\ntype: Project\n')).toBe('redwood')
        expect(homeOf('d: &d {home: orders}\ntype: UI\n<<: *d\n')).toBe('orders')
    })
})

describe('the extension reader is a copy of the editor\'s', () => {
    it('specYaml.ts is identical in both packages', () => {
        const here = readFileSync(join(__dirname, 'specYaml.ts'), 'utf8')
        const editor = readFileSync(join(__dirname, '../../../web/monorepo/apps/visual-editor/src/model/specYaml.ts'), 'utf8')
        expect(here).toBe(editor)
    })
})
