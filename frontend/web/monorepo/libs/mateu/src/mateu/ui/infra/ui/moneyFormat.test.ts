// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatMoneyNumber, formatMoneyValue, uiLocale } from './moneyFormat'

describe('moneyFormat — money follows the UI locale, an Amount its own', () => {
    afterEach(() => {
        document.documentElement.lang = ''
        vi.unstubAllGlobals()
    })

    it('reads the page language first (the app\'s AppDto.locale), then the browser\'s', () => {
        vi.stubGlobal('navigator', { language: 'fr-FR' })
        expect(uiLocale()).toBe('fr-FR')
        document.documentElement.lang = 'en-GB'
        expect(uiLocale()).toBe('en-GB')
    })

    it('writes a number declared money with two decimals in an English app — not de-DE', () => {
        document.documentElement.lang = 'en'
        expect(formatMoneyValue(89.5)).toBe('89.50')
        expect(formatMoneyValue(1234.5)).toBe('1,234.50')
        expect(formatMoneyValue('39.9')).toBe('39.90')
    })

    it('groups the way the UI locale does', () => {
        document.documentElement.lang = 'de-DE'
        expect(formatMoneyValue(1234.5)).toBe('1.234,50')
        expect(formatMoneyNumber(1234.5, 'en-US')).toBe('1,234.50')
    })

    it('lets an Amount keep its own locale and currency', () => {
        document.documentElement.lang = 'en'
        expect(formatMoneyValue({ value: 89.5, currency: 'EUR', locale: 'de-DE' })).toBe('89,50 €')
        // only a currency: the UI's locale writes it
        expect(formatMoneyValue({ value: 89.5, currency: 'EUR' })).toBe('€89.50')
        // only a locale: its grouping, no symbol
        expect(formatMoneyValue({ value: 1234.5, locale: 'de-DE' })).toBe('1.234,50')
    })

    it('never breaks a page on odd input', () => {
        expect(formatMoneyValue(null)).toBe('')
        expect(formatMoneyValue(undefined)).toBe('')
        expect(formatMoneyValue('n/a')).toBe('n/a')
        expect(formatMoneyNumber(Number.NaN)).toBe('')
        expect(formatMoneyNumber(5, 'en_GB')).toBe('5.00')
        expect(formatMoneyValue({ value: 5, currency: 'NOT-A-CODE' })).toMatch(/^5[.,]00 NOT-A-CODE$/)
    })
})
