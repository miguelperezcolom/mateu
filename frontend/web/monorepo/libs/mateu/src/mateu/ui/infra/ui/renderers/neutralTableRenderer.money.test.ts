import { describe, expect, it } from 'vitest'
import { cellText } from './neutralTableRenderer'

/** An Amount row field is a money column: its cell is the amount, never "[object Object]". */
describe('a money cell of the neutral table', () => {
    it('writes an Amount in its own locale and currency', () => {
        const text = cellText({ value: { currency: 'EUR', value: 14.4, locale: 'es-ES' } }, 'value', true)
        expect(text).toContain('14,40')
        expect(text).toContain('€')
    })

    it('writes a bare number declared money with two decimals', () => {
        expect(cellText({ total: 3 }, 'total', true)).toMatch(/3[.,]00/)
    })

    it('leaves other columns as they were', () => {
        expect(cellText({ name: 'Milk' }, 'name')).toBe('Milk')
        expect(cellText({}, 'name', true)).toBe('')
    })
})
