import { describe, it, expect } from 'vitest'
import { VIEWPORTS, parseViewport, viewportWidth } from './viewport'

describe('viewports', () => {
    it('go from the pane\'s own width down to a phone', () => {
        expect(VIEWPORTS.map((v) => v.width)).toEqual([0, 1280, 768, 390])
        expect(viewportWidth('tablet')).toBe(768)
    })
    it('read a persisted choice back, falling back to the pane\'s width', () => {
        expect(parseViewport('phone')).toBe('phone')
        expect(parseViewport('watch')).toBe('fill')
        expect(parseViewport(null)).toBe('fill')
    })
})
