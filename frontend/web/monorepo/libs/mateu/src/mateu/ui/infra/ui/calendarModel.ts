import type CalendarEvent from '@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent'
import type { CalendarDay, CalendarViewName } from '@mateu/shared/apiClients/dtos/componentmetadata/Calendar'
import { chromeText, chromeTextf, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'

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

// ── the calendar's words, in the UI's locale ─────────────────────────────────────────────────────
// Weekday and month names come from Intl in the locale the caller passes (uiLocale(): the app's
// language, the same the date pickers use); the view names from the chrome catalogue. Dates are
// formatted in UTC, like the rest of this file, so no time zone moves a day.

const formatters = new Map<string, Intl.DateTimeFormat>()
const formatterOf = (locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
    const key = locale + '|' + JSON.stringify(options)
    let formatter = formatters.get(key)
    if (!formatter) {
        try {
            formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' })
        } catch {
            // a malformed tag (a server locale such as "en_GB") must not break the calendar
            formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
        }
        formatters.set(key, formatter)
    }
    return formatter
}

/** An ISO date written in `locale` with Intl `options` ("lunes, 2 de noviembre", "November 2026"…). */
export const formatIsoDate = (iso: string, locale: string, options: Intl.DateTimeFormatOptions): string =>
    formatterOf(locale, options).format(new Date(toUtc(iso)))

/** The seven weekday names, Monday first, in `locale` ("Mon"…, "lun"…). */
export const weekdayNamesOf = (locale: string, width: 'short' | 'long' = 'short'): string[] =>
    // 2024-01-01 is a Monday
    Array.from({ length: 7 }, (_, i) => formatIsoDate(addDays('2024-01-01', i), locale, { weekday: width }))

/** A week column's head: the short weekday and the day of the month ("Mon 2", "lun 2"). */
export const weekHeadOf = (iso: string, locale: string): string =>
    formatIsoDate(iso, locale, { weekday: 'short' }) + ' ' + Number(iso.slice(8))

/** A date in full, without the year ("Monday, November 2", "lunes, 2 de noviembre"). */
export const longDateOf = (iso: string, locale: string): string =>
    formatIsoDate(iso, locale, { weekday: 'long', day: 'numeric', month: 'long' })

/** The title over a view: the month, the week's span, or the day — in `locale`. */
export const calendarTitleOf = (view: CalendarViewName, anchor: string, locale: string): string => {
    if (view === 'day') return formatIsoDate(anchor, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (view === 'week') {
        const { from, to } = periodOf('week', anchor)
        return formatIsoDate(from, locale, { day: 'numeric', month: 'short' }) + ' – '
            + formatIsoDate(to, locale, { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return formatIsoDate(anchor, locale, { month: 'long', year: 'numeric' })
}

const VIEW_KEYS: Record<CalendarViewName, ChromeTextKey> = {
    month: 'calendarMonth', week: 'calendarWeek', day: 'calendarDay', list: 'calendarList',
}

/** A view's name in the UI's language ("Month", "Mes"). */
export const calendarViewLabelOf = (view: CalendarViewName, lang?: string): string =>
    VIEW_KEYS[view] ? chromeText(VIEW_KEYS[view], lang) : view

/** "1 event", "3 events" in the UI's language. */
export const eventCountOf = (count: number, lang?: string): string =>
    count === 1 ? chromeText('calendarOneEvent', lang) : chromeTextf('calendarEvents', { count }, lang)
