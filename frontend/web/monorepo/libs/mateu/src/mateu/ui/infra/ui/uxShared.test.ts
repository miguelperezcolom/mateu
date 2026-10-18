import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// money follows the UI's locale (moneyFormat): these expectations are written for a German one
beforeAll(() => { vi.stubGlobal('navigator', { language: 'de-DE' }) })
afterAll(() => { vi.unstubAllGlobals() })
import { formatMoney, formatNumber, formatWithUnit } from './uxShared'

describe('uxShared money formatting', () => {

    it('formats numbers with the UI locale grouping (de-DE here) and 2 decimals', () => {
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

    it('renders a figure that is not a number as nothing, not as "NaN"', () => {
        // Every caller guards its own input today; this is what the reader sees the day one stops.
        expect(formatNumber(undefined as unknown as number)).toBe('')
        expect(formatNumber(NaN)).toBe('')
        expect(formatWithUnit(undefined as unknown as number, '€')).toBe(' €')
    })
})
