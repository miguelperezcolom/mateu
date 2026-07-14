import { describe, expect, it } from 'vitest'
import { formatMoney, formatNumber, formatWithUnit } from './uxShared'

describe('uxShared money formatting', () => {

    it('formats numbers with de-DE thousands dot and 2 decimals', () => {
        expect(formatNumber(1540)).toBe('1.540,00')
        expect(formatNumber(343)).toBe('343,00')
        expect(formatNumber(1710.5)).toBe('1.710,50')
    })

    it('puts the currency symbol before the amount', () => {
        expect(formatMoney(1540, '€')).toBe('€ 1.540,00')
        expect(formatMoney(383, undefined)).toBe('383,00')
    })

    it('renders negative amounts with the minus before the symbol', () => {
        expect(formatMoney(-154, '€')).toBe('-€ 154,00')
        expect(formatMoney(-154)).toBe('-154,00')
    })

    it('appends the unit after the amount (Meter convention)', () => {
        expect(formatWithUnit(1240, '€')).toBe('1.240,00 €')
        expect(formatWithUnit(1240)).toBe('1.240,00')
    })
})
