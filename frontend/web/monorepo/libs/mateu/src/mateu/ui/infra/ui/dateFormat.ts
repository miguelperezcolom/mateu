/**
 * How the UI's locale writes a date — one rule for the date pickers (apps/vaadin dateLocale.ts,
 * which formats and parses with it) and for the read-only places that show a date: listing cells
 * of a `date` / `dateTime` / `time` column.
 *
 * Order (D/M/Y, M/D/Y, Y/M/D), separator and zero padding come from
 * `Intl.DateTimeFormat(locale).formatToParts`; the year is always written with four digits (an
 * Intl "numeric" year can come out as "27"). A time is the locale's hour:minute, a date-time both.
 */

export type DatePart = 'day' | 'month' | 'year'

export interface DateParts { day: number, month: number, year: number }

export interface DateFormatSpec {
    order: DatePart[]
    separator: string
    padDay: boolean
    padMonth: boolean
}

const specs = new Map<string, DateFormatSpec>()

/** How `locale` writes a numeric date: the order of its parts, the separator and the padding. */
export const dateFormatSpec = (locale: string): DateFormatSpec => {
    const cached = specs.get(locale)
    if (cached) return cached
    let spec: DateFormatSpec = { order: ['month', 'day', 'year'], separator: '/', padDay: false, padMonth: false }
    try {
        // 5 January: a day and month that show whether the locale pads them
        const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' })
            .formatToParts(new Date(Date.UTC(2027, 0, 5)))
        const order = parts.map(p => p.type).filter((t): t is DatePart => t === 'day' || t === 'month' || t === 'year')
        if (order.length === 3 && new Set(order).size === 3) {
            const literal = parts.find(p => p.type === 'literal')?.value.trim() ?? ''
            spec = {
                order,
                // a separator a user can type: "." (de), "-" (nl), "/" … ; "年" or "" → "/"
                separator: /^[./-]$/.test(literal) ? literal : '/',
                padDay: (parts.find(p => p.type === 'day')?.value.length ?? 1) > 1,
                padMonth: (parts.find(p => p.type === 'month')?.value.length ?? 1) > 1,
            }
        }
    } catch {
        // an unknown locale keeps the en-US spec
    }
    specs.set(locale, spec)
    return spec
}

const pad = (n: number, width: number) => String(n).padStart(width, '0')

/** `{year, month (0-based), day}` as `locale` writes it ("15/2/2027" in es-ES, "2/15/2027" in en-US). */
export const formatDateParts = (d: DateParts, locale: string): string => {
    const spec = dateFormatSpec(locale)
    return spec.order.map(part => part === 'year' ? pad(d.year, 4)
        : part === 'month' ? pad(d.month + 1, spec.padMonth ? 2 : 1)
        : pad(d.day, spec.padDay ? 2 : 1)).join(spec.separator)
}

/** A wall-clock hour:minute as `locale` writes it ("14:05", "2:05 PM") — no time zone involved. */
export const formatTimeParts = (hour: number, minute: number, locale: string): string => {
    try {
        return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
            .format(new Date(Date.UTC(2027, 0, 5, hour, minute)))
    } catch {
        return `${pad(hour, 2)}:${pad(minute, 2)}`
    }
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_TIME = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/

/**
 * A listing cell of a `date`, `dateTime` or `time` column in the UI's locale: the row carries ISO
 * text ("2026-11-05", "2026-11-05T10:15:30Z", "10:15:30"), read as the wall-clock it names — never
 * shifted to the browser's time zone. Any other column, and a value that is not ISO text, comes
 * back unchanged.
 */
export const formatTemporalCell = (value: unknown, dataType: string | undefined | null, locale: string): unknown => {
    if (typeof value !== 'string' || !dataType) return value
    const text = value.trim()
    if (dataType === 'date') {
        const m = ISO_DATE.exec(text) ?? ISO_DATE_TIME.exec(text)
        return m ? formatDateParts({ year: +m[1], month: +m[2] - 1, day: +m[3] }, locale) : value
    }
    if (dataType === 'dateTime') {
        const m = ISO_DATE_TIME.exec(text)
        if (m) return formatDateParts({ year: +m[1], month: +m[2] - 1, day: +m[3] }, locale) + ' ' + formatTimeParts(+m[4], +m[5], locale)
        const d = ISO_DATE.exec(text)
        return d ? formatDateParts({ year: +d[1], month: +d[2] - 1, day: +d[3] }, locale) : value
    }
    if (dataType === 'time') {
        const m = ISO_TIME.exec(text)
        return m ? formatTimeParts(+m[1], +m[2], locale) : value
    }
    return value
}
