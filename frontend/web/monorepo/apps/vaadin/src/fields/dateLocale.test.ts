import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    calendarNames, dateFormatSpec, datePickerI18n, dateRangePickerI18n, firstDayOfWeek, formatDateParts,
    parseDateText, uiLocale,
} from './dateLocale'

const TODAY = new Date(2026, 10, 1) // 1 November 2026

describe('dateFormatSpec', () => {
    it('reads the order, separator and padding of the locale', () => {
        expect(dateFormatSpec('es-ES')).toEqual({ order: ['day', 'month', 'year'], separator: '/', padDay: false, padMonth: false })
        expect(dateFormatSpec('en-US')).toEqual({ order: ['month', 'day', 'year'], separator: '/', padDay: false, padMonth: false })
        expect(dateFormatSpec('en-GB')).toMatchObject({ order: ['day', 'month', 'year'], padDay: true, padMonth: true })
        expect(dateFormatSpec('de-DE')).toMatchObject({ order: ['day', 'month', 'year'], separator: '.' })
        expect(dateFormatSpec('ja-JP').order).toEqual(['year', 'month', 'day'])
    })
})

describe('formatDateParts', () => {
    it('writes the date as the locale does', () => {
        const d = { year: 2027, month: 1, day: 15 }
        expect(formatDateParts(d, 'es-ES')).toBe('15/2/2027')
        expect(formatDateParts(d, 'en-US')).toBe('2/15/2027')
        expect(formatDateParts(d, 'en-GB')).toBe('15/02/2027')
        expect(formatDateParts(d, 'de-DE')).toBe('15.2.2027')
        expect(formatDateParts(d, 'ja-JP')).toBe('2027/2/15')
    })

    it('pads the year to 4 digits', () => {
        expect(formatDateParts({ year: 987, month: 0, day: 3 }, 'es-ES')).toBe('3/1/0987')
    })
})

describe('parseDateText', () => {
    it('reads day/month/year in a Spanish locale (the reported bug)', () => {
        expect(parseDateText('15/2/2027', 'es-ES', TODAY)).toEqual({ day: 15, month: 1, year: 2027 })
        expect(parseDateText('15/02/2027', 'es-ES', TODAY)).toEqual({ day: 15, month: 1, year: 2027 })
        expect(parseDateText('5-2-27', 'es-ES', TODAY)).toEqual({ day: 5, month: 1, year: 2027 })
        expect(parseDateText(' 15.2.2027 ', 'es-ES', TODAY)).toEqual({ day: 15, month: 1, year: 2027 })
    })

    it('reads month/day/year in en-US', () => {
        expect(parseDateText('2/15/2027', 'en-US', TODAY)).toEqual({ day: 15, month: 1, year: 2027 })
    })

    it('accepts ISO yyyy-mm-dd in any locale', () => {
        expect(parseDateText('2027-02-15', 'es-ES', TODAY)).toEqual({ day: 15, month: 1, year: 2027 })
        expect(parseDateText('2027-2-5', 'en-US', TODAY)).toEqual({ day: 5, month: 1, year: 2027 })
    })

    it('fills the missing year (and month) from today', () => {
        expect(parseDateText('15/2', 'es-ES', TODAY)).toEqual({ day: 15, month: 1, year: 2026 })
        expect(parseDateText('2/15', 'en-US', TODAY)).toEqual({ day: 15, month: 1, year: 2026 })
        expect(parseDateText('7', 'es-ES', TODAY)).toEqual({ day: 7, month: 10, year: 2026 })
    })

    it('maps a 2-digit year to the closest century', () => {
        expect(parseDateText('1/1/30', 'es-ES', TODAY)?.year).toBe(2030)
        expect(parseDateText('1/1/80', 'es-ES', TODAY)?.year).toBe(1980)
    })

    it('returns undefined for what is not a date, so the field shows invalid', () => {
        expect(parseDateText('15/2/2027', 'en-US', TODAY)).toBeUndefined() // month 15
        expect(parseDateText('2/14/2027', 'es-ES', TODAY)).toBeUndefined() // month 14
        expect(parseDateText('31/2/2027', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('29/2/2027', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('29/2/2028', 'es-ES', TODAY)).toEqual({ day: 29, month: 1, year: 2028 })
        expect(parseDateText('0/2/2027', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('15/2/202', 'es-ES', TODAY)).toBeUndefined() // 3-digit year
        expect(parseDateText('150/2/2027', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('1/2/3/4', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('mañana', 'es-ES', TODAY)).toBeUndefined()
        expect(parseDateText('', 'es-ES', TODAY)).toBeUndefined()
    })

    it('round-trips what formatDateParts writes', () => {
        for (const locale of ['es-ES', 'en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'nl-NL']) {
            const d = { year: 2027, month: 11, day: 9 }
            expect(parseDateText(formatDateParts(d, locale), locale, TODAY)).toEqual(d)
        }
    })
})

describe('firstDayOfWeek', () => {
    it('is Monday in Spain and Germany, Sunday in the US', () => {
        expect(firstDayOfWeek('es-ES')).toBe(1)
        expect(firstDayOfWeek('de-DE')).toBe(1)
        expect(firstDayOfWeek('en-US')).toBe(0)
    })
})

describe('calendarNames', () => {
    it('names months and weekdays in the locale, Sunday first', () => {
        const es = calendarNames('es-ES')!
        expect(es.monthNames[1]).toBe('Febrero')
        expect(es.weekdays[0]).toBe('Domingo')
        expect(es.weekdays[1]).toBe('Lunes')
        expect(calendarNames('en-US')!.weekdaysShort[0]).toBe('Sun')
    })
})

describe('datePickerI18n', () => {
    it('wires format and parse to the locale', () => {
        const i18n = datePickerI18n('es-ES') as any
        expect(i18n.formatDate({ year: 2027, month: 1, day: 15 })).toBe('15/2/2027')
        expect(i18n.parseDate('15/2/2027')).toMatchObject({ day: 15, month: 1, year: 2027 })
        expect(i18n.parseDate('2/14/2027')).toBeUndefined()
        expect(i18n.firstDayOfWeek).toBe(1)
        expect(i18n.today).toBe('Hoy')
        expect(datePickerI18n('es-ES')).toBe(i18n) // cached: no re-render churn
    })

    it('gives the range picker a complete i18n (it does not merge with its defaults)', () => {
        const i18n = dateRangePickerI18n('en-US') as any
        for (const key of ['monthNames', 'weekdays', 'weekdaysShort', 'firstDayOfWeek', 'formatDate', 'parseDate',
            'formatTitle', 'week', 'calendar', 'clear', 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth',
            'lastMonth', 'thisYear', 'lastYear', 'cancel']) {
            expect(i18n[key], key).toBeDefined()
        }
        expect(i18n.formatTitle('February', 2027)).toBe('February 2027')
    })
})

describe('uiLocale', () => {
    afterEach(() => vi.unstubAllGlobals())

    it('uses <html lang>, refined by the browser region of the same language', () => {
        vi.stubGlobal('document', { documentElement: { lang: 'es' } })
        vi.stubGlobal('navigator', { language: 'es-MX' })
        expect(uiLocale()).toBe('es-MX')
        vi.stubGlobal('navigator', { language: 'en-US' })
        expect(uiLocale()).toBe('es')
    })

    it('falls back to the browser language', () => {
        vi.stubGlobal('document', { documentElement: { lang: '' } })
        vi.stubGlobal('navigator', { language: 'es-ES' })
        expect(uiLocale()).toBe('es-ES')
    })
})
