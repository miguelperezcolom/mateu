import { describe, expect, it } from 'vitest'
import {
    addDays, agendaOf, calendarTitleOf, calendarViewLabelOf, dayOf, eventCountOf, eventsOn, longDateOf, monthWeeks, periodOf,
    timeRangeOf, toneClassOf, weekdayNamesOf, weekdayOf, weekHeadOf,
} from './calendarModel'

const events = [
    { id: 'conv', title: 'Convention', date: '2026-10-29', endDate: '2026-10-31', startTime: '09:00', endTime: '18:00' },
    { id: 'gala', title: 'Gala', date: '2026-11-01', startTime: '20:00' },
    { id: 'early', title: 'Breakfast', date: '2026-10-30', startTime: '07:30' },
]

describe('calendar model', () => {
    it('periods: month/list = the month, week = Monday..Sunday, day = the anchor', () => {
        expect(periodOf('month', '2026-10-28')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
        expect(periodOf('list', '2026-02-10')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
        expect(periodOf('week', '2026-10-28')).toEqual({ from: '2026-10-26', to: '2026-11-01' })
        expect(periodOf('day', '2026-10-28')).toEqual({ from: '2026-10-28', to: '2026-10-28' })
    })

    it('dates do not drift across months or DST', () => {
        expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
        expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
        expect(weekdayOf('2026-10-26')).toBe(0)
    })

    it('the month grid starts on Monday with blanks outside the month', () => {
        const weeks = monthWeeks('2026-10-15')
        expect(weeks[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
        expect(weeks.every((w) => w.length === 7)).toBe(true)
        expect(weeks[weeks.length - 1]).toContain('2026-10-31')
    })

    it('a multi-day event shows on every day of its span; timed events sort by start', () => {
        expect(eventsOn(events, '2026-10-30').map((e) => e.id)).toEqual(['early', 'conv'])
        expect(eventsOn(events, '2026-11-01').map((e) => e.id)).toEqual(['gala'])
        expect(eventsOn(events, '2026-10-28')).toEqual([])
    })

    it('the agenda lists only the dates with events', () => {
        const agenda = agendaOf(events, '2026-10-26', '2026-11-01')
        expect(agenda.map((d) => d.date)).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'])
    })

    it('day cells, time ranges and tones', () => {
        expect(dayOf([{ date: '2026-10-30', label: 'Avail 3', tone: 'danger' }], '2026-10-30')?.label).toBe('Avail 3')
        expect(timeRangeOf(events[0])).toBe('09:00–18:00')
        expect(timeRangeOf(events[1])).toBe('20:00')
        expect(toneClassOf('danger')).toBe('tone-danger')
        expect(toneClassOf('pink')).toBe('')
    })
})

describe('calendar words in the UI language', () => {
    it('weekday names come from Intl in the locale, Monday first', () => {
        expect(weekdayNamesOf('en-US')).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        expect(weekdayNamesOf('es-ES')).toEqual(['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'])
        expect(weekdayNamesOf('es-ES', 'long')[0]).toBe('lunes')
    })

    it('titles, week heads and long dates are written in the locale (no time zone moves a day)', () => {
        expect(calendarTitleOf('month', '2026-11-02', 'es-ES')).toBe('noviembre de 2026')
        expect(calendarTitleOf('month', '2026-11-02', 'en-US')).toBe('November 2026')
        expect(calendarTitleOf('week', '2026-11-04', 'en-US')).toBe('Nov 2 – Nov 8, 2026')
        expect(calendarTitleOf('day', '2026-11-02', 'es-ES')).toBe('lunes, 2 de noviembre de 2026')
        expect(weekHeadOf('2026-11-02', 'es-ES')).toBe('lun 2')
        expect(weekHeadOf('2026-11-02', 'en-US')).toBe('Mon 2')
        expect(longDateOf('2026-11-01', 'es-ES')).toBe('domingo, 1 de noviembre')
        expect(longDateOf('2026-11-01', 'en-US')).toBe('Sunday, November 1')
    })

    it('a malformed locale falls back to en-US instead of throwing', () => {
        expect(calendarTitleOf('month', '2026-11-02', 'not a locale!')).toBe('November 2026')
    })

    it('view names and event counts come from the chrome catalogue', () => {
        expect(['month', 'week', 'day', 'list'].map(v => calendarViewLabelOf(v as 'month', 'es'))).toEqual(['Mes', 'Semana', 'Día', 'Lista'])
        expect(calendarViewLabelOf('week', 'en')).toBe('Week')
        expect(eventCountOf(1, 'es')).toBe('1 evento')
        expect(eventCountOf(3, 'es')).toBe('3 eventos')
        expect(eventCountOf(2, 'en')).toBe('2 events')
    })
})
