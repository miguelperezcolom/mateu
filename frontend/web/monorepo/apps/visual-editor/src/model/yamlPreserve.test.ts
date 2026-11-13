/// <reference types="node" />
// (vitest 4's typings no longer pull the node types in transitively, and this test reads files)
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { UnparseableYamlError, writePreserving, writePreservingReport } from './yamlPreserve'
import { parseSpec } from './specYaml'

const SPECS = resolve(__dirname, '../../../../../../../demo/demo-starwars/src/main/resources/specs/ui')

describe('writePreserving — an edit keeps the author\'s comments and formatting', () => {
    it('writes every demo spec back byte-identical when nothing changed', () => {
        // the files only (specs/ui also holds folders, e.g. partials/)
        for (const f of readdirSync(SPECS).filter((n) => n.endsWith('.yaml'))) {
            const text = readFileSync(resolve(SPECS, f), 'utf-8')
            expect(writePreserving(text, parse(text)), f).toBe(text)
        }
    })

    it('changes one label and nothing else (comments, flow maps, other lines intact)', () => {
        const text = readFileSync(resolve(SPECS, 'person-edit.yaml'), 'utf-8')
        const value = parse(text)
        value.content[0].content[1].label = 'Sex'
        const out = writePreserving(text, value)
        const before = text.split('\n')
        const after = out.split('\n')
        expect(after.length).toBe(before.length)
        const changed = after.filter((l, i) => l !== before[i])
        expect(changed).toEqual(['      - {type: FormField, id: gender, label: Sex}'])
    })

    it('keeps the comments of the items around an insertion, a removal and a reorder', () => {
        const text = `# head
items:
  # first
  - {type: A, id: a}
  # second
  - {type: B, id: b}
  - {type: C, id: c} # third
`
        const v = parse(text)
        v.items = [v.items[1], v.items[0], { type: 'D', id: 'd' }] // reorder a/b, drop c, add d
        const out = writePreserving(text, v)
        expect(out).toContain('# head')
        expect(out).toContain('# first')
        expect(out).toContain('# second')
        expect(out).not.toContain('# third')
        expect(parse(out)).toEqual(v)
        expect(out).toContain('{type: D, id: d}') // a new item follows its siblings' flow style
    })

    it('adds and removes keys; falls back to stringify without an original', () => {
        const text = 'type: Form # the kind\ntitle: Old\nsubtitle: gone\n'
        const out = writePreserving(text, { type: 'Form', title: 'New', buttons: [{ type: 'Button', label: 'Save' }] })
        expect(out).toContain('type: Form # the kind')
        expect(out).not.toContain('subtitle')
        expect(parse(out).buttons[0].label).toBe('Save')
        expect(writePreserving('', { a: 1 })).toBe('a: 1\n')
    })
})

describe('writePreserving — never over a file that does not parse (V-1)', () => {
    it('refuses to write over an original that is not valid YAML instead of replacing the whole file', () => {
        expect(() => writePreserving('type: Form\n  title: [oops\n', { a: 1 })).toThrow(UnparseableYamlError)
        expect(() => writePreserving(': : bad', { a: 1 })).toThrow(UnparseableYamlError)
    })

    it('refuses a recursive alias (#1183) the same way', () => {
        expect(() => writePreserving('a: &loop {content: [*loop]}\n', { a: 1 })).toThrow(UnparseableYamlError)
    })
})

describe('writePreserving — what the fast text patch cannot write (V-2)', () => {
    const roundTrips = (text: string, edit: (v: any) => void) => {
        const v = parseSpec(text)
        edit(v)
        const out = writePreserving(text, v)
        expect(parseSpec(out), out).toEqual(v)
        return out
    }

    it('a value ending in a colon stays valid YAML and keeps the comments', () => {
        const out = roundTrips('# my page\ntype: Text # the kind\nlabel: Old\n', (v) => { v.label = 'Name:' })
        expect(out).toContain('# my page')
        expect(out).toContain('# the kind')
    })

    it('a colon inside a flow map, and .inf / .nan, are quoted', () => {
        roundTrips('items: [{type: A, id: a, label: x}]\n', (v) => { v.items[0].label = 'a:b' })
        roundTrips('items: [{type: A, id: a, label: x}]\n', (v) => { v.items[0].label = 'a: b' })
        roundTrips('label: x\n', (v) => { v.label = '.inf' })
        roundTrips('label: x\n', (v) => { v.label = '-.Inf' })
        roundTrips('label: x\n', (v) => { v.label = '.NaN' })
    })

    it('never writes text that reads back as other data: the result is re-read and checked', () => {
        for (const s of ['key: value', 'a #b', '!tag', '*ref', '&anchor', '0x1F', '1e3', '~', 'null', 'Yes', '- item', '? q', '%x', '@x', '`x']) {
            roundTrips('# c\nlabel: x\n', (v) => { v.label = s })
            roundTrips('items: [{type: A, id: a, label: x}]\n', (v) => { v.items[0].label = s })
        }
    })
})

describe('writePreserving — aliases and merge keys survive a save (V-3)', () => {
    const ALIASED = `# buttons
content:
  - &save {type: Button, label: Save}
  - {type: Text, text: Hello}
  - *save
`

    it('an edit elsewhere keeps the anchor and the alias', () => {
        const v = parseSpec(ALIASED)
        v.content = v.content.map((c: any) => ({ ...c })) // the editor works on an unshared copy
        v.content[1].text = 'Bye'
        const out = writePreserving(ALIASED, v)
        expect(out).toContain('&save {type: Button, label: Save}')
        expect(out).toContain('- *save')
        expect(parseSpec(out)).toEqual(v)
    })

    it('editing ONE use of an alias edits that use only: the anchor and its other uses keep their value', () => {
        const v = parseSpec(ALIASED)
        v.content = v.content.map((c: any) => ({ ...c }))
        v.content[2].label = 'Store'
        const out = writePreserving(ALIASED, v)
        expect(out).toContain('&save {type: Button, label: Save}')
        expect(parseSpec(out)).toEqual(v)
        expect(parseSpec(out).content[0].label).toBe('Save')
    })

    const MERGED = `base: &base
  type: Button
  variant: primary
content:
  - <<: *base
    label: Save
  - <<: *base
    label: Cancel
`

    it('an unrelated edit keeps every merge key, unflattened', () => {
        const v = parseSpec(MERGED)
        v.content[1] = { ...v.content[1], label: 'Close' }
        const out = writePreserving(MERGED, v)
        expect(out.match(/<<: \*base/g)).toHaveLength(2)
        expect(out).not.toMatch(/variant: primary\n    label/)
        expect(parseSpec(out)).toEqual(v)
    })

    it('overriding an inherited key keeps the merge and adds the key on the item', () => {
        const v = parseSpec(MERGED)
        v.content[0] = { ...v.content[0], variant: 'tertiary' }
        const out = writePreserving(MERGED, v)
        expect(out.match(/<<: \*base/g)).toHaveLength(2)
        expect(parseSpec(out)).toEqual(v)
    })

    it('removing an inherited key flattens that item only (a merge cannot take a key away)', () => {
        const v = parseSpec(MERGED)
        const { variant: _gone, ...rest } = v.content[0]
        v.content[0] = rest
        const out = writePreserving(MERGED, v)
        expect(out.match(/<<: \*base/g)).toHaveLength(1)
        expect(parseSpec(out)).toEqual(v)
    })

    it('says when it had to rewrite the file from the data (nothing is lost silently)', () => {
        const ok = writePreservingReport(ALIASED, parseSpec(ALIASED))
        expect(ok.rewritten).toBe(false)
        expect(writePreservingReport('', { a: 1 }).rewritten).toBe(false)
        // the anchored item is replaced while an alias to it stays: the node tree cannot be written
        // as it stands, so the data is — correctly, and reported
        const text = '# c\nitems: [&x {type: A, id: a}, *x]\n'
        const value = { items: [{ type: 'C', id: 'c' }, { type: 'A', id: 'a' }] }
        const out = writePreservingReport(text, value)
        expect(parseSpec(out.text)).toEqual(value)
        expect(out.rewritten || /&x/.test(out.text)).toBe(true)
    })
})
