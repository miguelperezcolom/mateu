import { describe, it, expect } from 'vitest'
import { parsePage, removeAt, updateProp, nodeAt } from '../model/pageModel'
import { ancestorRowKeys, expandedFor, nodeIdOf, nodeIdOfEventPath, nodePathOfEventPath, parentSelection, surviving } from './canvasSelection'

/** A stand-in for a DOM element: just the attributes the mapping reads. */
const el = (attrs: Record<string, string> = {}, id = '') => ({ id, getAttribute: (k: string) => attrs[k] ?? null })

const WELCOME = `type: VerticalLayout
content:
  - type: HeroSection
    title: Welcome
    content:
      - {type: Button, label: Get started, actionId: getStarted}
  - type: DashboardLayout
    items:
      - {type: DashboardPanel, title: Orders, content: {type: Text, text: Track orders.}}
`

describe('a click → the node under it', () => {
    it('reads data-node-id first, then a ve- DOM id, and ignores anything else', () => {
        expect(nodeIdOf(el({ 'data-node-id': 've-1-items.0' }))).toBe('ve-1-items.0')
        expect(nodeIdOf(el({}, 've-0-0'))).toBe('ve-0-0')
        expect(nodeIdOf(el({}, 'save'))).toBeNull()
        expect(nodeIdOf(el({ 'data-node-id': 'not-ours' }))).toBeNull()
        expect(nodeIdOf(null)).toBeNull()
        expect(nodeIdOf({})).toBeNull()
    })

    it('picks the INNERMOST tagged element of the composed path (target first)', () => {
        // a click on the label inside a vaadin-button inside the hero inside the page
        const path = [
            el(), // the label span, in the button's shadow root
            el({ 'data-node-id': 've-0-0' }), // the button
            el(), // the hero's text column
            el({ 'data-node-id': 've-0' }), // the hero
            el({}, 've-root'),
        ]
        expect(nodeIdOfEventPath(path)).toBe('ve-0-0')
        expect(nodePathOfEventPath(path)).toEqual([0, 0])
        // a click on the hero's own padding selects the hero
        expect(nodePathOfEventPath(path.slice(2))).toEqual([0])
        // slot steps come back as slot steps
        expect(nodePathOfEventPath([el({ 'data-node-id': 've-1-items.0-0' })])).toEqual([1, 'items.0', 0])
        expect(nodePathOfEventPath([el(), el()])).toBeNull()
    })
})

describe('Layers expansion', () => {
    it('opens every ancestor and every slot group on the way to a node', () => {
        expect(ancestorRowKeys([1, 'items.0', 0])).toEqual(['ve-root', 've-1', 've-1:items', 've-1-items.0'])
        expect(ancestorRowKeys([])).toEqual([])
    })

    it('removes exactly what hides the selection from the collapsed set', () => {
        const collapsed = new Set(['ve-1', 've-1:items', 've-0', 've-root'])
        const next = expandedFor(collapsed, [1, 'items.0', 0])
        expect([...next]).toEqual(['ve-0'])
        expect(collapsed.size).toBe(4) // not mutated
        expect([...expandedFor(collapsed, null)]).toEqual([...collapsed])
    })
})

describe('the selection survives a re-render', () => {
    it('keeps the node after a property edit, an undo-style reload and a re-parse of the same file', () => {
        const doc = parsePage(WELCOME)
        const sel = [1, 'items.0', 0]
        updateProp(nodeAt(doc, sel)!, 'text', 'Edited')
        expect(surviving(doc, sel)).toBe(sel)
        // the file changed on disk / undo: a NEW doc, same structure → same node
        expect(surviving(parsePage(WELCOME), sel)).toBe(sel)
    })

    it('clears it when the node is gone', () => {
        const doc = parsePage(WELCOME)
        removeAt(doc, [1, 'items.0'])
        expect(surviving(doc, [1, 'items.0', 0])).toBeNull()
        expect(surviving(undefined, [0])).toBeNull()
        expect(surviving(doc, null)).toBeNull()
    })
})

describe('Esc', () => {
    it('selects the parent, and on the root clears the selection', () => {
        expect(parentSelection([1, 'items.0', 0])).toEqual([1, 'items.0'])
        expect(parentSelection([0])).toEqual([])
        expect(parentSelection([])).toBeNull()
        expect(parentSelection(null)).toBeNull()
    })
})
