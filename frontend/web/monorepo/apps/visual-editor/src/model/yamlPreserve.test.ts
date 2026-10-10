/// <reference types="node" />
// (vitest 4's typings no longer pull the node types in transitively, and this test reads files)
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { writePreserving } from './yamlPreserve'

const SPECS = resolve(__dirname, '../../../../../../../demo/demo-starwars/src/main/resources/specs/ui')

describe('writePreserving — an edit keeps the author\'s comments and formatting', () => {
    it('writes every demo spec back byte-identical when nothing changed', () => {
        for (const f of readdirSync(SPECS)) {
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
        expect(writePreserving(': : bad', { a: 1 })).toBe('a: 1\n')
    })
})
