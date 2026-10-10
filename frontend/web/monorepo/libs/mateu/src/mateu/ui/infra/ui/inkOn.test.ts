import { describe, expect, it } from 'vitest'
import { contrastRatio, inkOn } from './inkOn'

describe('inkOn (text on a data-supplied colour)', () => {
    it('picks the ink with the higher contrast', () => {
        expect(inkOn('#1f4e79')).toBe('#fff')          // deep blue → light ink
        expect(inkOn('#f59e0b')).toBe('#1a1a1a')       // amber → dark ink (white is ~2.1:1)
        expect(inkOn('#3b82f6')).toBe('#1a1a1a')       // mid blue: white is 3.7:1, dark is 4.8:1
        expect(inkOn('rgb(255, 255, 0)')).toBe('#1a1a1a')
    })
    it('leaves a colour it cannot read to the theme', () => {
        expect(inkOn('var(--lumo-primary-color)')).toBeUndefined()
        expect(inkOn(undefined)).toBeUndefined()
    })
    it('computes WCAG ratios', () => {
        expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0)
    })
})
