import { describe, expect, it } from 'vitest'
import { currentTabScope, tabDomId, tabStripKey, withinTab } from './tabIds'

describe('tab ids', () => {
    it('derives ids from the strip and the index, never from the label', () => {
        const strip = tabStripKey('_tabs')
        expect(tabDomId(strip, 0)).toBe('_tabs-tab-0')
        expect(tabDomId(strip, 1)).toBe('_tabs-tab-1')
    })

    it('falls back to a generic key when the TabLayout has no id', () => {
        expect(tabStripKey(undefined)).toBe('tabs')
        expect(tabStripKey('')).toBe('tabs')
        expect(tabStripKey('  my tabs ')).toBe('my_tabs')
    })

    it('keeps nested strips apart even when they share the id', () => {
        const outer = tabStripKey('_tabs')
        const outerIds = [0, 1].map(i => tabDomId(outer, i))
        const innerIds = withinTab(outerIds[1], () => {
            const inner = tabStripKey('_tabs', currentTabScope())
            return [0, 1].map(i => tabDomId(inner, i))
        })
        expect(innerIds).toEqual(['_tabs-tab-1._tabs-tab-0', '_tabs-tab-1._tabs-tab-1'])
        expect(new Set([...outerIds, ...innerIds]).size).toBe(4)
    })

    it('restores the scope after rendering a tab, even if the render throws', () => {
        expect(currentTabScope()).toBe('')
        withinTab('a', () => {
            expect(currentTabScope()).toBe('a')
            withinTab('b', () => expect(currentTabScope()).toBe('b'))
            expect(currentTabScope()).toBe('a')
        })
        expect(() => withinTab('c', () => { throw new Error('boom') })).toThrow('boom')
        expect(currentTabScope()).toBe('')
    })
})
