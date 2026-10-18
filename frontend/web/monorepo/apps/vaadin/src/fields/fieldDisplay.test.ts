import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { displayedValue, formatMoney } from './fieldDisplay'

// money follows the UI locale (libs/mateu moneyFormat): an English one here
beforeAll(() => { vi.stubGlobal('navigator', { language: 'en-US' }) })
afterAll(() => { vi.unstubAllGlobals() })

describe('formatMoney', () => {
    it('uses the amount’s own locale and currency', () => {
        expect(formatMoney({ value: 1234.5, locale: 'en-US', currency: 'USD' })).toBe('$1,234.50')
    })
    it('defaults to two decimals grouped the UI locale way — not de-DE in an English app', () => {
        expect(formatMoney(1234.5)).toBe('1,234.50')
        expect(formatMoney('99')).toBe('99.00')
        expect(formatMoney({ value: 7 })).toBe('7.00')
    })
    it('lets the Amount locale win over the UI one', () => {
        expect(formatMoney({ value: 1234.5, locale: 'de-DE' })).toBe('1.234,50')
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
        expect(displayedValue(3, 'money').display).toBe('3.00')
        // a plain number declared money (stereotype) is money too: a crud view of a price
        expect(displayedValue(89.5, 'number', 'money')).toMatchObject({ display: '89.50', isMoney: true })
        expect(displayedValue({ value: 'x' }).display).toBe('x')
    })
    it('shows anything else as text', () => {
        expect(displayedValue(42)).toMatchObject({ display: '42', isBool: false, isMoney: false })
    })
})
