// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { fabBottom, fabInsetEnd, fabPosition, fabRight, trackFabAnchor, FAB_INSET_END, FAB_PAGE_COLUMN } from './fabRail'

/**
 * The FABs sit in a rail near the bottom-right corner: in the viewport's corner for full-width and
 * edge-to-edge pages, just right of the content column for a fixed-width one — as the Redwood shell
 * anchors its chat FAB. They stack upwards by slot; page FABs take the column to the left.
 */
describe('fabRail', () => {

    afterEach(() => document.documentElement.style.removeProperty('--mateu-fab-inset-end'))

    it('puts the FABs of full-width and edge-to-edge pages in the corner', () => {
        expect(fabInsetEnd('full', 1440, 1440, 16, 52)).toBe(16)
        expect(fabInsetEnd('edge', 1200, 1440, 16, 52)).toBe(16)
    })

    it('puts the FABs of a fixed-width page in the margin just right of the content column', () => {
        // a 1408px column centred in a 1920px viewport ends at 1664; a 44px FAB and an 8px gap
        // start at 1672 and end at 1716: 204px from the end edge
        expect(fabInsetEnd('fixed', 1664, 1920, 16, 52)).toBe(204)
    })

    it('goes to the corner when the margin has no room for it', () => {
        // on a narrow screen the column reaches the edge
        expect(fabInsetEnd('fixed', 390, 390, 16, 52)).toBe(16)
        expect(fabInsetEnd('fixed', 1424, 1440, 16, 52)).toBe(16)
    })

    it('stacks the FABs of a column upwards, one size and gap per slot', () => {
        expect(fabBottom(0)).toContain('0 * (')
        expect(fabBottom(2)).toContain('2 * (')
        expect(fabRight(0)).toBe(FAB_INSET_END)
        expect(fabRight(FAB_PAGE_COLUMN)).toContain(`${FAB_PAGE_COLUMN} * (`)
        expect(fabPosition(1)).toBe(`bottom: ${fabBottom(1)}; right: ${fabRight(0)};`)
    })

    it('publishes the anchor for the content view, and lets it go', () => {
        const content = document.createElement('div')
        document.body.appendChild(content)
        content.getBoundingClientRect = () => ({ right: 1664 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })

        const release = trackFabAnchor(content, 'fixed')
        expect(document.documentElement.style.getPropertyValue('--mateu-fab-inset-end')).toBe('204px')

        release()
        expect(document.documentElement.style.getPropertyValue('--mateu-fab-inset-end')).toBe('')
        content.remove()
    })

    it('leaves the anchor to the view that took it last', () => {
        const first = document.createElement('div')
        const second = document.createElement('div')
        document.body.append(first, second)
        first.getBoundingClientRect = () => ({ right: 1664 } as DOMRect)
        second.getBoundingClientRect = () => ({ right: 1920 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })

        const releaseFirst = trackFabAnchor(first, 'fixed')
        const releaseSecond = trackFabAnchor(second, 'full')
        releaseFirst()
        expect(document.documentElement.style.getPropertyValue('--mateu-fab-inset-end')).toBe('16px')

        releaseSecond()
        first.remove()
        second.remove()
    })
})
