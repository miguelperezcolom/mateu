import { describe, expect, it } from 'vitest'
import { checkTypes } from './typesModel'

const DATA_TYPES = ['string', 'money', 'status']
const STEREOTYPES = ['regular', 'email', 'badge']

describe('checkTypes (types.yaml)', () => {
    it('reads a `types:` envelope and reports nothing for a clean file', () => {
        const r = checkTypes('type: Types\ntypes:\n  - {id: Money, dataType: money}\n  - {id: Email, stereotype: email}\n', DATA_TYPES, STEREOTYPES)
        expect(r.types.map((t) => t.id)).toEqual(['Money', 'Email'])
        expect(r.problems).toEqual([])
    })

    it('flags what the loader would ignore or reject', () => {
        const r = checkTypes([
            'types:',
            '  - {label: no id}',
            '  - {id: A, dataType: decimal}',
            '  - {id: A, stereotype: nope, colour: red}',
            '  - {id: S, dataType: status, tones: {OPEN: orange}}',
        ].join('\n'), DATA_TYPES, STEREOTYPES)
        expect(r.problems).toEqual([
            'entry 1: has no id, so nothing can reference it.',
            'A: unknown dataType `decimal`.',
            'A: declared twice — the last one wins.',
            'A: `colour` is not a field type attribute (ignored).',
            'A: unknown stereotype `nope`.',
            'S: tone `orange` for `OPEN` is not one of success, warning, danger, info, neutral.',
        ])
    })

    it('an empty file is an empty catalogue; broken YAML says so', () => {
        expect(checkTypes('', DATA_TYPES, STEREOTYPES)).toEqual({ types: [], problems: [] })
        expect(checkTypes('types: [', DATA_TYPES, STEREOTYPES).problems[0]).toMatch(/Not valid YAML/)
    })
})
