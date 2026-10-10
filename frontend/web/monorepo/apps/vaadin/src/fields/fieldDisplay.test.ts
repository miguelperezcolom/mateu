import { describe, expect, it } from 'vitest'
import { displayedValue, formatMoney } from './fieldDisplay'

describe('formatMoney', () => {
    it('uses the amount’s own locale and currency', () => {
        expect(formatMoney({ value: 1234.5, locale: 'en-US', currency: 'USD' })).toBe('$1,234.50')
    })
    it('defaults to two decimals with de-DE grouping', () => {
        expect(formatMoney(1234.5)).toBe('1.234,50')
        expect(formatMoney('99')).toBe('99,00')
        expect(formatMoney({ value: 7 })).toBe('7,00')
    })
    it('leaves what is not a number alone, and shows nothing for no value', () => {
        expect(formatMoney('n/a')).toBe('n/a')
        expect(formatMoney(undefined)).toBe('')
        expect(formatMoney(null)).toBe('')
    })
})

describe('displayedValue', () => {
    it('shows an em dash for no value', () => {
        expect(displayedValue(undefined).display).toBe('—')
        expect(displayedValue('').hasValue).toBe(false)
    })
    it('recognises booleans by type or by value', () => {
        expect(displayedValue(true)).toMatchObject({ isBool: true, checked: true })
        expect(displayedValue('true', 'bool')).toMatchObject({ isBool: true, checked: true })
        expect(displayedValue(false, 'bool')).toMatchObject({ isBool: true, checked: false })
    })
    it('unwraps {value} and formats money', () => {
        expect(displayedValue({ value: 10, locale: 'en-US', currency: 'EUR' }, 'money').display).toBe('€10.00')
        expect(displayedValue(3, 'money').display).toBe('3,00')
        expect(displayedValue({ value: 'x' }).display).toBe('x')
    })
    it('shows anything else as text', () => {
        expect(displayedValue(42)).toMatchObject({ display: '42', isBool: false, isMoney: false })
    })
})
