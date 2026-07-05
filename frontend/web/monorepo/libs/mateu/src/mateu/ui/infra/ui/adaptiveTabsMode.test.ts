import { describe, expect, it } from 'vitest'
import { ADAPTIVE_TABS_BREAKPOINT, modeForWidth } from './adaptiveTabsMode'

describe('modeForWidth', () => {
    it('renders the tab strip on wide containers', () => {
        expect(modeForWidth(ADAPTIVE_TABS_BREAKPOINT)).toBe('tabs')
        expect(modeForWidth(ADAPTIVE_TABS_BREAKPOINT + 1)).toBe('tabs')
        expect(modeForWidth(1280)).toBe('tabs')
    })

    it('degrades to an accordion on narrow containers', () => {
        expect(modeForWidth(ADAPTIVE_TABS_BREAKPOINT - 1)).toBe('accordion')
        expect(modeForWidth(375)).toBe('accordion')
        expect(modeForWidth(1)).toBe('accordion')
    })

    it('keeps tabs (the default presentation) when the container is not laid out yet', () => {
        expect(modeForWidth(0)).toBe('tabs')
        expect(modeForWidth(-1)).toBe('tabs')
    })
})
