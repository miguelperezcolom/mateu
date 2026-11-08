import { describe, expect, it } from 'vitest'
import { formatDateParts, formatTemporalCell, formatTimeParts } from './dateFormat'

describe('formatDateParts (the date pickers’ rule)', () => {
    it('writes the locale’s order and separator, with a 4-digit year', () => {
        expect(formatDateParts({ year: 2026, month: 10, day: 5 }, 'es-ES')).toBe('5/11/2026')
        expect(formatDateParts({ year: 2026, month: 10, day: 5 }, 'en-US')).toBe('11/5/2026')
        expect(formatDateParts({ year: 2026, month: 10, day: 5 }, 'de-DE')).toBe('5.11.2026')
        expect(formatDateParts({ year: 2026, month: 10, day: 5 }, 'en-GB')).toBe('05/11/2026')
    })
})

describe('formatTemporalCell (a date / dateTime / time listing column)', () => {
    it('writes an ISO date in the UI locale', () => {
        expect(formatTemporalCell('2026-11-05', 'date', 'es-ES')).toBe('5/11/2026')
        expect(formatTemporalCell('2026-11-05', 'date', 'en-US')).toBe('11/5/2026')
    })
    it('writes a date-time as its date and hour:minute, the wall-clock it names (no zone shift)', () => {
        expect(formatTemporalCell('2026-11-05T23:45:30', 'dateTime', 'es-ES')).toBe('5/11/2026 ' + formatTimeParts(23, 45, 'es-ES'))
        expect(formatTemporalCell('2026-11-05T23:45:30.123Z', 'dateTime', 'de-DE')).toBe('5.11.2026 23:45')
        expect(formatTemporalCell('2026-11-05T08:05:00+02:00', 'dateTime', 'de-DE')).toBe('5.11.2026 08:05')
    })
    it('writes a time as the locale’s hour:minute', () => {
        expect(formatTemporalCell('09:30:00', 'time', 'de-DE')).toBe('09:30')
        expect(formatTemporalCell('09:30', 'time', 'en-US')).toBe(formatTimeParts(9, 30, 'en-US'))
    })
    it('leaves other columns, non-ISO text and non-strings alone', () => {
        expect(formatTemporalCell('2026-11-05', 'string', 'es-ES')).toBe('2026-11-05')
        expect(formatTemporalCell('yesterday', 'date', 'es-ES')).toBe('yesterday')
        expect(formatTemporalCell(42, 'date', 'es-ES')).toBe(42)
        expect(formatTemporalCell(null, 'dateTime', 'es-ES')).toBe(null)
    })
})
