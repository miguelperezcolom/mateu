import { describe, expect, it } from 'vitest'
import { placePanel, placementStyle } from './placement'

const viewport = { width: 1000, height: 800 }
const anchorAt = (top: number, left = 100, width = 200, height = 24) => ({ top, bottom: top + height, left, right: left + width })

describe('placePanel — the editor\'s dropdowns open toward the side with room', () => {
    it('opens below when the list fits there', () => {
        const p = placePanel(anchorAt(100), viewport, { preferredHeight: 300 })
        expect(p.side).toBe('below')
        expect(p.top).toBe(126) // anchor bottom + the 2px gap
        expect(p.maxHeight).toBe(300)
    })

    it('a dropdown at the TOP of the view never opens upward (it would be clipped by the top edge)', () => {
        // the toolbar's selects sit a few px from the top: there is no room above at all
        const p = placePanel(anchorAt(4), viewport, { preferredHeight: 300 })
        expect(p.side).toBe('below')
        expect(p.top! + p.maxHeight).toBeLessThanOrEqual(viewport.height)
    })

    it('flips above when the room below is short and there is more above', () => {
        const p = placePanel(anchorAt(700), viewport, { preferredHeight: 300 })
        expect(p.side).toBe('above')
        expect(p.bottom).toBe(viewport.height - 700 + 2)
        expect(p.maxHeight).toBe(300)
    })

    it('shrinks to the room it has (the list scrolls) instead of running off the viewport', () => {
        const p = placePanel(anchorAt(380), { width: 1000, height: 600 }, { preferredHeight: 900 })
        expect(p.maxHeight).toBeLessThan(900)
        if (p.side === 'below') expect(p.top! + p.maxHeight).toBeLessThanOrEqual(600 - 8)
        else expect(p.bottom! + p.maxHeight).toBeLessThanOrEqual(600 - 8)
    })

    it('is clamped horizontally: a field at the right edge gets a panel that stays inside', () => {
        const p = placePanel(anchorAt(100, 900, 90), viewport, { preferredHeight: 200, preferredWidth: 300 })
        expect(p.width).toBe(300)
        expect(p.left + p.width).toBeLessThanOrEqual(viewport.width - 8)
        expect(p.left).toBeGreaterThanOrEqual(8)
    })

    it('never narrower than its anchor, never wider than the viewport', () => {
        expect(placePanel(anchorAt(100, 100, 400), viewport, { preferredHeight: 100, preferredWidth: 50 }).width).toBe(400)
        expect(placePanel(anchorAt(100, 0, 100), { width: 320, height: 800 }, { preferredHeight: 100, preferredWidth: 900 }).width).toBe(304)
    })

    it('renders as fixed-position CSS on the side it chose', () => {
        expect(placementStyle(placePanel(anchorAt(100), viewport, { preferredHeight: 300 })))
            .toBe('position:fixed;top:126px;left:100px;width:200px;max-height:300px')
        expect(placementStyle(placePanel(anchorAt(700), viewport, { preferredHeight: 300 })))
            .toMatch(/^position:fixed;bottom:102px;/)
    })
})
