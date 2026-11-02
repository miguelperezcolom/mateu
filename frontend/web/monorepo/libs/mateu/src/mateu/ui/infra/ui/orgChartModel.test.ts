import { describe, expect, it } from 'vitest'
import { findNodeById, focusView, initialFocus, initialsOf, isFocusDisplay, pathTo, visibleAncestors } from './orgChartModel'

const dev1 = { id: 'dev1', title: 'Dev One' }
const dev2 = { id: 'dev2', title: 'Dev Two' }
const lead = { id: 'lead', title: 'Team Lead', children: [dev1, dev2] }
const cto = { id: 'cto', title: 'CTO', children: [lead] }
const cfo = { id: 'cfo', title: 'CFO' }
const ceo = { id: 'ceo', title: 'Ana García', children: [cto, cfo] }

describe('org chart focus model', () => {
    it('display: only "focus" is the focused presentation; null/unknown is the tree', () => {
        expect(isFocusDisplay('focus')).toBe(true)
        expect(isFocusDisplay(' Focus ')).toBe(true)
        expect(isFocusDisplay('tree')).toBe(false)
        expect(isFocusDisplay(null)).toBe(false)
        expect(isFocusDisplay(undefined)).toBe(false)
    })

    it('finds a node by id (string compare), anywhere in the tree', () => {
        expect(findNodeById(ceo, 'dev2')).toBe(dev2)
        expect(findNodeById(ceo, 'ceo')).toBe(ceo)
        expect(findNodeById(ceo, 'nobody')).toBeUndefined()
        expect(findNodeById(ceo, null)).toBeUndefined()
        expect(findNodeById(undefined, 'ceo')).toBeUndefined()
        const numeric = { id: 7 as unknown as string, title: 'N' }
        expect(findNodeById({ title: 'R', children: [numeric] }, '7')).toBe(numeric)
    })

    it('opens on the node named by focus, else the root', () => {
        expect(initialFocus(ceo, 'lead')).toBe(lead)
        expect(initialFocus(ceo, 'unknown')).toBe(ceo)
        expect(initialFocus(ceo, null)).toBe(ceo)
        expect(initialFocus(undefined, 'lead')).toBeUndefined()
    })

    it('path to a node is root first, by identity', () => {
        expect(pathTo(ceo, dev1)).toEqual([ceo, cto, lead, dev1])
        expect(pathTo(ceo, ceo)).toEqual([ceo])
        expect(pathTo(ceo, { id: 'dev1', title: 'Dev One' })).toBeUndefined()
    })

    it('focus view: ancestors above (root first), children below', () => {
        const view = focusView(ceo, lead)!
        expect(view.ancestors).toEqual([ceo, cto])
        expect(view.node).toBe(lead)
        expect(view.children).toEqual([dev1, dev2])

        const atRoot = focusView(ceo, ceo)!
        expect(atRoot.ancestors).toEqual([])
        expect(atRoot.children).toEqual([cto, cfo])

        const leaf = focusView(ceo, cfo)!
        expect(leaf.ancestors).toEqual([ceo])
        expect(leaf.children).toEqual([])

        // a node that is no longer in the tree falls back to the root
        expect(focusView(ceo, { title: 'stale' })!.node).toBe(ceo)
        expect(focusView(undefined, ceo)).toBeUndefined()
    })

    it('a chain longer than 2 collapses to the direct parent until expanded', () => {
        expect(visibleAncestors([ceo, cto], false)).toEqual({ hidden: 0, visible: [ceo, cto] })
        expect(visibleAncestors([ceo, cto, lead], false)).toEqual({ hidden: 2, visible: [lead] })
        expect(visibleAncestors([ceo, cto, lead], true)).toEqual({ hidden: 0, visible: [ceo, cto, lead] })
        expect(visibleAncestors([], false)).toEqual({ hidden: 0, visible: [] })
    })

    it('initials: first letters of the first two words', () => {
        expect(initialsOf('Ana García López')).toBe('AG')
        expect(initialsOf('cto')).toBe('C')
        expect(initialsOf('')).toBe('')
        expect(initialsOf(undefined)).toBe('')
    })
})
