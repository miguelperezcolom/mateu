import { describe, it, expect } from 'vitest'
import { parsePage, serializePage } from './pageModel'
import { tidyFindings, applyTidy, humanize, TIDY_RULES, TidyRule } from './tidy'
import { parse } from 'yaml'

const messy = parsePage(`type: VerticalLayout
content:
  - {type: FormField, id: firstName}
  - {type: FormField, id: email, label: Email}
  - type: VerticalLayout
    content:
      - {type: Text, text: hello}
  - type: HorizontalLayout
    spacing: true
    content:
      - {type: Text, text: kept}
  - type: VerticalLayout
    content: []
  - type: VerticalLayout
    content:
      - {type: Text, text: a}
      - {type: Text, text: b}
  - {type: Button, label: Save, actionId: save}
  - {type: Button, label: Cancel, actionId: cancel}
  - {type: FormField, id: email, label: Email again}
`)

const all = TIDY_RULES.filter((r) => r.fixable).map((r) => r.id) as TidyRule[]
const tree = (doc: ReturnType<typeof applyTidy>) => parse(serializePage(doc))

describe('tidyFindings', () => {
    it('finds what drifted, each where it is', () => {
        const f = tidyFindings(messy)
        expect(f.map((x) => `${x.rule}@${x.path.join('/')}`)).toEqual([
            'groupFields@0', 'buttonRow@6', 'unwrapSingle@2', 'dropEmpty@4', 'flattenSame@5',
            'labelFields@0', 'duplicateIds@8',
        ])
    })
    it('leaves a layout that says something about its look alone, and finds nothing on a tidy page', () => {
        expect(tidyFindings(messy).some((x) => x.path.join('/') === '3')).toBe(false)
        expect(tidyFindings(parsePage('type: FormLayout\ncontent:\n  - {type: FormField, id: a, label: A}\n  - {type: FormField, id: b, label: B}\n'))).toEqual([])
    })
})

describe('applyTidy', () => {
    it('applies the chosen rules until nothing more changes', () => {
        const out = tree(applyTidy(messy, all))
        expect(out.content.map((c: any) => c.type)).toEqual(['FormLayout', 'Text', 'HorizontalLayout', 'Text', 'Text', 'HorizontalLayout', 'FormField'])
        expect(out.content[0].content.map((c: any) => [c.id, c.label])).toEqual([['firstName', 'First name'], ['email', 'Email']])
        expect(out.content[2]).toEqual({ type: 'HorizontalLayout', spacing: true, content: [{ type: 'Text', text: 'kept' }] })
        expect(out.content[5].content.map((c: any) => c.label)).toEqual(['Save', 'Cancel'])
    })
    it('applies only what was asked, and never touches the input', () => {
        const before = serializePage(messy)
        const out = tree(applyTidy(messy, ['dropEmpty']))
        expect(out.content).toHaveLength(8)
        expect(serializePage(messy)).toBe(before)
    })
    it('unwraps chains of single wrappers but keeps the root', () => {
        const nested = parsePage('type: VerticalLayout\ncontent:\n  - type: VerticalLayout\n    content:\n      - type: HorizontalLayout\n        content:\n          - {type: Text, text: x}\n')
        expect(tree(applyTidy(nested, ['unwrapSingle']))).toEqual({ type: 'VerticalLayout', content: [{ type: 'Text', text: 'x' }] })
    })
})

describe('humanize', () => {
    it('reads an id as a label', () => {
        expect(humanize('birthYear')).toBe('Birth year')
        expect(humanize('first_name')).toBe('First name')
        expect(humanize('vatID')).toBe('Vat id')
    })
})
