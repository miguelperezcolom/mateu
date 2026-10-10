import type CalendarEvent from '@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent'
import type { CalendarDay, CalendarViewName } from '@mateu/shared/apiClients/dtos/componentmetadata/Calendar'

/**
 * The pure part of the calendar (tested without a DOM): ISO dates ("YYYY-MM-DD") handled in UTC so
 * no timezone shifts a day, the period of each view, the month grid, events per date (multi-day
 * events on every day of their span, sorted by time) and the list view's agenda.
 */

const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
}
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => fromUtc(toUtc(iso) + n * 86400000)
/** 0 = Monday … 6 = Sunday */
export const weekdayOf = (iso: string) => (new Date(toUtc(iso)).getUTCDay() + 6) % 7
export const firstOfMonth = (iso: string) => iso.slice(0, 8) + '01'
export const lastOfMonth = (iso: string) => {
    const [y, m] = iso.split('-').map(Number)
    return fromUtc(Date.UTC(y, m, 0))
}
export const todayIso = () => {
    const now = new Date()
    return fromUtc(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

/** The first and last date a view shows around its anchor. */
export const periodOf = (view: CalendarViewName, anchor: string): { from: string, to: string } => {
    if (view === 'day') return { from: anchor, to: anchor }
    if (view === 'week') {
        const monday = addDays(anchor, -weekdayOf(anchor))
        return { from: monday, to: addDays(monday, 6) }
    }
    return { from: firstOfMonth(anchor), to: lastOfMonth(anchor) }
}

/** Every date from..to inclusive. */
export const datesBetween = (from: string, to: string): string[] => {
    const out: string[] = []
    for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
    return out
}

/** The month grid: weeks of 7 cells, Monday first; null outside the month. */
export const monthWeeks = (anchor: string): (string | null)[][] => {
    const first = firstOfMonth(anchor)
    const cells: (string | null)[] = Array(weekdayOf(first)).fill(null)
    cells.push(...datesBetween(first, lastOfMonth(anchor)))
    while (cells.length % 7) cells.push(null)
    const weeks: (string | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
}

/** The events on a date — a multi-day event on every day of its span —, timed ones by start time. */
export const eventsOn = (events: CalendarEvent[], date: string): CalendarEvent[] =>
    events
        .filter((e) => e.date && e.date <= date && (e.endDate || e.date) >= date)
        .map((e, i) => ({ e, i }))
        .sort((a, b) => (a.e.startTime || '').localeCompare(b.e.startTime || '') || a.i - b.i)
        .map(({ e }) => e)

/** The list view: the dates of the period that have events, each with its events. */
export const agendaOf = (events: CalendarEvent[], from: string, to: string) =>
    datesBetween(from, to)
        .map((date) => ({ date, events: eventsOn(events, date) }))
        .filter((d) => d.events.length)

/** What the server says about a date's cell (label + tone), if anything. */
export const dayOf = (days: CalendarDay[] | undefined, date: string): CalendarDay | undefined =>
    (days || []).find((d) => d.date === date)

/** "09:00–18:00", "09:00" or "" */
export const timeRangeOf = (e: CalendarEvent) =>
    e.startTime ? e.startTime + (e.endTime ? '–' + e.endTime : '') : ''

const TONES = new Set(['info', 'success', 'warning', 'danger', 'neutral'])
export const toneClassOf = (tone?: string | null) => (tone && TONES.has(tone) ? 'tone-' + tone : '')
