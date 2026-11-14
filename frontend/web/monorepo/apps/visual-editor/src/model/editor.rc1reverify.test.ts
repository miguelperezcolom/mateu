// rc.1 re-verification of GA review 2 (visual editor). Both were pinned with it.fails at rc.1; both
// are fixed for rc.2 (N-12: the anchored node is edited in place, its alias uses become copies).
//  - N-3 is fixed for rc.2: an unhydrated delta is written back as it was, and the editor refuses
//    edits until the contract arrives (also through the route-bound view model).
//  - N-3: a `layoutDelta:` page edited before its contract arrives (app not running, or the view
//    model bound only through routes.yaml) is written back as an EMPTY `layout:` — no fields.
//  - N-12: editing an anchored node whose alias is used elsewhere rewrites the whole file
//    (comments and formatting lost).
import { describe, expect, it } from 'vitest'
import { awaitsItsContract, hydrate, insertIntoSlot, nodeAt, parsePage, reorder, saveShape, serializePage, updateProp } from './pageModel'
import { writePreservingReport } from './yamlPreserve'
import { parseSpec } from './specYaml'

describe('rc.1 re-verify N-3: a delta page edited with no contract', () => {
    const DELTA = [
        'viewModel: com.example.Order',
        'layoutDelta:',
        '  order:',
        '    - customer',
        '    - total',
        '  hidden:',
        '    - internalNote',
        '',
    ].join('\n')

    it('(control) the delta is parsed aside and the canvas is empty', () => {
        const doc = parsePage(DELTA)
        expect(doc.delta?.order).toEqual(['customer', 'total'])
        expect(doc.layout.content ?? []).toHaveLength(0)
    })

    it('dropping one component keeps the delta (never an empty layout: over it)', () => {
        const doc = parsePage(DELTA)
        insertIntoSlot(doc, [], 'content', { type: 'Text', text: 'note' })
        const out = serializePage(doc)
        expect(out).toContain('layoutDelta')
        expect(parseSpec(out)).not.toHaveProperty('layout')
        expect(parseSpec(out)).toEqual(parseSpec(DELTA))
        expect(saveShape(doc)).toBe('delta')
        expect(awaitsItsContract(doc)).toBe(true)
    })

    it('a delta bound only through routes.yaml, hydrated against the route\'s view model, still writes a delta', () => {
        const ROUTED = ['layoutDelta:', '  hidden:', '    - note', ''].join('\n')
        const fields = [{ id: 'customer', label: 'Customer' }, { id: 'total', label: 'Total' }, { id: 'note', label: 'Note' }]
        const doc = hydrate(parsePage(ROUTED), fields as never, 'com.example.Order')
        expect(awaitsItsContract(doc)).toBe(false)
        expect(doc.layout.content?.map((n) => n.id)).toEqual(['customer', 'total'])
        reorder(doc, [1], -1)
        const out = parseSpec(serializePage(doc)) as Record<string, unknown>
        expect(out).not.toHaveProperty('viewModel')
        expect(out).not.toHaveProperty('layout')
        expect(JSON.stringify(out.layoutDelta)).toMatch(/total.*customer/)
        expect(JSON.stringify(out.layoutDelta)).toContain('note')
        expect(saveShape(doc)).toBe('delta')
    })
})

describe('rc.1 re-verify N-12: anchors whose alias is used elsewhere', () => {
    // the review's own shape: a bare page, the anchored button relabelled through the page model
    const ORIGINAL = '# header\ntype: VerticalLayout\ncontent:\n  - &save {type: Button, label: Save}   # anchor\n  - type: Text\n    text: hi\n  - *save\n'
    const edit = (path: number[], label: string) => {
        const doc = parsePage(ORIGINAL)
        updateProp(nodeAt(doc, path)!, 'label', label)
        const want = parseSpec(serializePage(doc))
        return { want, r: writePreservingReport(ORIGINAL, want) }
    }

    it('editing the ANCHORED use keeps the file (comments) and is not a whole rewrite', () => {
        const { want, r } = edit([0], 'Other')
        expect(parseSpec(r.text)).toEqual(want) // the data is right either way
        expect(r.rewritten).toBe(false)
        expect(r.text).toContain('# header')
    })

    it('(control) editing the ALIAS use keeps the file', () => {
        const { want, r } = edit([2], 'Other')
        expect(parseSpec(r.text)).toEqual(want)
        expect(r.rewritten).toBe(false)
        expect(r.text).toContain('# anchor')
    })
})
