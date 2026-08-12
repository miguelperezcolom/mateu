import { describe, it, expect } from 'vitest'
import { applyDelta, deltaBetween, readDelta, writeDelta } from './layoutDelta'
import { PageDoc, hydrate, parsePage, saveShape, serializePage } from './pageModel'

/**
 * The editor's side of `layoutDelta:` — item 10.2.
 *
 * Before this, opening a screen in the editor and dragging one field wrote a full `layout:`, and an
 * explicit layout wins over inference for good. The screen stopped re-deriving, silently and
 * permanently. These tests pin the two things that make the fix real: the editor writes a delta
 * when it can, and it does not pretend to when it cannot.
 */

const INFERRED = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'age', label: 'Age' },
]

const IDS = INFERRED.map((f) => f.id)

function docWith(content: any[], modelView = 'com.acme.Contact'): PageDoc {
    return {
        modelView,
        layout: { type: 'FormLayout', content },
        bare: false,
        inferred: INFERRED,
    }
}

describe('the delta algebra agrees with the server', () => {
    it('leaves unmentioned fields in their inferred place', () => {
        // THE property. A human reordered two fields months ago; today someone adds `phone`.
        const delta = { order: ['email', 'name'], hidden: [], overrides: {} }

        expect(applyDelta(['name', 'email', 'age', 'phone'], delta))
            .toEqual(['email', 'name', 'age', 'phone'])
    })

    it('ignores an entry for a field the model no longer has', () => {
        const delta = { order: ['email', 'removed', 'name'], hidden: [], overrides: {} }

        expect(applyDelta(IDS, delta)).toEqual(['email', 'name', 'age'])
    })

    it('records nothing when the arrangement matches inference', () => {
        // The trap to avoid: merely opening a screen must not freeze it.
        expect(deltaBetween(IDS, IDS)).toEqual({ order: [], hidden: [], overrides: {} })
    })

    it('records only what the human actually changed', () => {
        const delta = deltaBetween(IDS, ['email', 'name'])

        expect(delta.order).toEqual(['email', 'name'])
        expect(delta.hidden).toEqual(['age'])
    })

    it('round-trips: what it records is what it reproduces', () => {
        const desired = ['email', 'name']

        expect(applyDelta(IDS, deltaBetween(IDS, desired))).toEqual(desired)
    })

    it('reads a partial or malformed delta without throwing', () => {
        expect(readDelta({ order: ['a', 7], hidden: null, overrides: 'nope' }))
            .toEqual({ order: ['a'], hidden: [], overrides: {} })
        expect(readDelta(undefined)).toEqual({ order: [], hidden: [], overrides: {} })
    })

    it('omits the parts of a delta that carry no decision', () => {
        expect(writeDelta({ order: [], hidden: ['age'], overrides: {} })).toEqual({ hidden: ['age'] })
    })
})

describe('the editor writes a delta when it can', () => {
    it('saves a reorder as a delta, not as a snapshot', () => {
        const doc = docWith([
            { type: 'FormField', id: 'email' },
            { type: 'FormField', id: 'name' },
            { type: 'FormField', id: 'age' },
        ])

        const yaml = serializePage(doc)

        expect(yaml).toContain('layoutDelta:')
        expect(yaml).not.toContain('layout:')
        expect(yaml).toContain('email')
    })

    it('saves a removed field as hidden rather than as an absence', () => {
        const doc = docWith([
            { type: 'FormField', id: 'name' },
            { type: 'FormField', id: 'email' },
        ])

        expect(serializePage(doc)).toContain('hidden')
    })

    it('opening a screen and changing nothing writes an empty delta, not a snapshot', () => {
        // The regression that matters most: using the editor at all must not cost the screen its
        // inference.
        const doc = docWith(INFERRED.map((f) => ({ type: 'FormField', id: f.id, label: f.label })))

        const yaml = serializePage(doc)

        expect(saveShape(doc)).toBe('delta')
        expect(yaml).toContain('layoutDelta: {}')
    })

    it('carries a relabel as an override, keyed by field id', () => {
        const doc = docWith([
            { type: 'FormField', id: 'name', label: 'Full name' },
            { type: 'FormField', id: 'email' },
            { type: 'FormField', id: 'age' },
        ])

        const yaml = serializePage(doc)

        expect(yaml).toContain('overrides')
        expect(yaml).toContain('Full name')
    })
})

describe('the editor does not pretend when a delta cannot say it', () => {
    it('falls back to a snapshot when the tree holds a non-field', () => {
        const doc = docWith([
            { type: 'FormField', id: 'name' },
            { type: 'Text', text: 'a note' },
        ])

        expect(saveShape(doc)).toBe('snapshot')
        expect(serializePage(doc)).toContain('layout:')
    })

    it('falls back to a snapshot when a field is nested inside another container', () => {
        // "Wrap these two in a card" is exactly what a delta cannot express — anchoring to ids is
        // what makes it survive a model change.
        const doc = docWith([{ type: 'Card', content: [{ type: 'FormField', id: 'name' }] }])

        expect(saveShape(doc)).toBe('snapshot')
    })

    it('falls back to a snapshot for a field the model does not have', () => {
        const doc = docWith([{ type: 'FormField', id: 'invented' }])

        expect(saveShape(doc)).toBe('snapshot')
    })

    it('falls back to a snapshot for a prop a delta cannot carry', () => {
        const doc = docWith([{ type: 'FormField', id: 'name', stereotype: 'email' }])

        expect(saveShape(doc)).toBe('snapshot')
    })

    it('writes a plain layout when there is no model view to infer from', () => {
        const doc: PageDoc = { layout: { type: 'VerticalLayout', content: [] }, bare: true }

        expect(saveShape(doc)).toBe('static')
        expect(serializePage(doc)).not.toContain('layoutDelta')
    })

    it('cannot save a delta before the contract arrives', () => {
        // Until the server says what inference produces, there is nothing to diff against.
        const doc: PageDoc = {
            modelView: 'com.acme.Contact',
            layout: { type: 'FormLayout', content: [{ type: 'FormField', id: 'name' }] },
            bare: false,
        }

        expect(saveShape(doc)).toBe('snapshot')
    })
})

describe('a page written as a delta comes back editable', () => {
    const YAML = [
        'modelView: com.acme.Contact',
        'layoutDelta:',
        '  order:',
        '    - email',
        '    - name',
        '  hidden:',
        '    - age',
        '  overrides:',
        '    name:',
        '      label: Full name',
        '',
    ].join('\n')

    it('parses the delta instead of mistaking it for a layout', () => {
        const doc = parsePage(YAML)

        expect(doc.delta?.order).toEqual(['email', 'name'])
        expect(doc.delta?.hidden).toEqual(['age'])
    })

    it('materializes the arrangement the delta describes once the contract arrives', () => {
        const doc = hydrate(parsePage(YAML), INFERRED)

        expect(doc.layout.content?.map((n) => n.id)).toEqual(['email', 'name'])
        expect(doc.layout.content?.[1].label).toBe('Full name')
    })

    it('a field the model grew since the file was written shows up', () => {
        // The reason all of this exists.
        const doc = hydrate(parsePage(YAML), [...INFERRED, { id: 'phone', label: 'Phone' }])

        expect(doc.layout.content?.map((n) => n.id)).toEqual(['email', 'name', 'phone'])
    })

    it('survives a full round trip without inventing changes', () => {
        const doc = hydrate(parsePage(YAML), INFERRED)

        const reparsed = hydrate(parsePage(serializePage(doc)), INFERRED)

        expect(reparsed.delta).toEqual(doc.delta)
        expect(reparsed.layout).toEqual(doc.layout)
    })
})
