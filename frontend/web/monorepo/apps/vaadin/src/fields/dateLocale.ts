import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * The date pickers' i18n in the USER'S locale. Vaadin's default is en-US (M/D/YYYY): in a Spanish
 * browser "15/2/2027" parsed as month 15 → no value, while the input kept showing the text, and the
 * server got null ("the dates are required"). One helper for every picker: vaadin-date-picker,
 * vaadin-date-time-picker, vcf-date-range-picker and the grid's inline date editors.
 *
 * The locale is the UI's — `<html lang>`, which `applyUiLanguage` sets from the server's
 * `AppDto.locale`, else the browser's — refined by `navigator.language` when that one is the same
 * language with a region (`es` + `es-MX`, `en` + `en-GB`). Order (D/M/Y, M/D/Y, Y/M/D), separator
 * and zero padding come from `Intl.DateTimeFormat(locale).formatToParts`; month and weekday names
 * from Intl too; the first day of the week from `Intl.Locale` weekInfo where the browser has it.
 */

export type DatePart = 'day' | 'month' | 'year'

export interface DateParts { day: number, month: number, year: number }

export interface DateFormatSpec {
    order: DatePart[]
    separator: string
    padDay: boolean
    padMonth: boolean
}

/** The locale date pickers format and parse in. */
export const uiLocale = (): string => {
    const htmlLang = (typeof document !== 'undefined' && document.documentElement?.lang) || ''
    const browser = (typeof navigator !== 'undefined' && navigator.language) || ''
    let locale = htmlLang || browser || 'en-US'
    if (htmlLang && browser && browser.toLowerCase().startsWith(htmlLang.toLowerCase() + '-')) locale = browser
    try {
        return Intl.getCanonicalLocales(locale)[0] ?? 'en-US'
    } catch {
        return 'en-US'
    }
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

const daysInMonth = (year: number, month0: number) => new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate()

/** A 2-digit year → the year closest to `referenceYear` that ends in those digits (Vaadin's rule). */
const adjustYear = (yy: number, referenceYear: number) => {
    let y = Math.floor(referenceYear / 100) * 100 + yy
    if (y > referenceYear + 50) y -= 100
    else if (y <= referenceYear - 50) y += 100
    return y
}

/**
 * Text typed in `locale`'s order → `{year, month (0-based), day}`, or `undefined` when it is not a
 * date (month 14, 31 February, letters…) — undefined is what makes Vaadin mark the field invalid
 * instead of silently dropping the value. Accepts any non-digit separator, 1–2 digit day and month,
 * 2- or 4-digit year, ISO `yyyy-mm-dd` (and any `yyyy?mm?dd`), "day/month" (this year) and "day"
 * (this month), as Vaadin's own parser did.
 */
export const parseDateText = (text: string, locale: string, today: Date = new Date()): DateParts | undefined => {
    const trimmed = (text ?? '').trim()
    if (!trimmed || /[^\d\s./\-,]/.test(trimmed)) return undefined
    const nums = trimmed.split(/[^\d]+/).filter(Boolean)
    const spec = dateFormatSpec(locale)
    let dayStr: string | undefined
    let monthStr: string | undefined
    let yearStr: string | undefined
    if (nums.length === 3) {
        // a leading 4-digit number is a year whatever the locale: ISO yyyy-mm-dd
        const order: DatePart[] = nums[0].length === 4 ? ['year', 'month', 'day'] : spec.order
        order.forEach((part, i) => {
            if (part === 'day') dayStr = nums[i]
            else if (part === 'month') monthStr = nums[i]
            else yearStr = nums[i]
        })
    } else if (nums.length === 2) {
        const order = spec.order.filter(p => p !== 'year')
        dayStr = nums[order.indexOf('day')]
        monthStr = nums[order.indexOf('month')]
    } else if (nums.length === 1) {
        dayStr = nums[0]
    } else {
        return undefined
    }
    if (!dayStr || dayStr.length > 2) return undefined
    if (monthStr !== undefined && (monthStr.length === 0 || monthStr.length > 2)) return undefined
    if (yearStr !== undefined && yearStr.length !== 2 && yearStr.length !== 4) return undefined
    const day = parseInt(dayStr, 10)
    const month = monthStr === undefined ? today.getMonth() : parseInt(monthStr, 10) - 1
    let year = yearStr === undefined ? today.getFullYear() : parseInt(yearStr, 10)
    if (yearStr?.length === 2) year = adjustYear(year, today.getFullYear())
    if (month < 0 || month > 11) return undefined
    if (day < 1 || day > daysInMonth(year, month)) return undefined
    return { day, month, year }
}

/** Day the week starts on, 0 = Sunday … 6 = Saturday, as the calendars want it. */
export const firstDayOfWeek = (locale: string): number => {
    try {
        const loc = new Intl.Locale(locale) as Intl.Locale & {
            getWeekInfo?: () => { firstDay: number }, weekInfo?: { firstDay: number }
        }
        const info = loc.getWeekInfo?.() ?? loc.weekInfo
        if (info?.firstDay) return info.firstDay % 7
        // no weekInfo (Firefox): Sunday in the Americas and East Asia, Monday elsewhere
        const region = (loc.maximize().region ?? '').toUpperCase()
        return SUNDAY_REGIONS.has(region) ? 0 : 1
    } catch {
        return 0
    }
}

const SUNDAY_REGIONS = new Set(['US', 'CA', 'MX', 'BR', 'AR', 'CO', 'PE', 'VE', 'GT', 'HN', 'SV', 'NI', 'PA', 'DO', 'PR',
    'JP', 'KR', 'TW', 'HK', 'CN', 'PH', 'IN', 'IL', 'ZA', 'SA'])

const capitalize = (s: string, locale: string) => s ? s.charAt(0).toLocaleUpperCase(locale) + s.slice(1) : s

/** Localized month and weekday names (Sunday first, as Vaadin wants them). */
export const calendarNames = (locale: string) => {
    const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d))
    try {
        const month = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' })
        const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
        const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
        // 3 January 2027 is a Sunday
        return {
            monthNames: Array.from({ length: 12 }, (_, m) => capitalize(month.format(utc(2027, m, 1)), locale)),
            weekdays: Array.from({ length: 7 }, (_, d) => capitalize(weekday.format(utc(2027, 0, 3 + d)), locale)),
            weekdaysShort: Array.from({ length: 7 }, (_, d) => capitalize(weekdayShort.format(utc(2027, 0, 3 + d)), locale)),
        }
    } catch {
        return undefined
    }
}

const i18ns = new Map<string, Record<string, unknown>>()

/**
 * The `i18n` of a vaadin-date-picker / vaadin-date-time-picker (both merge a partial i18n with
 * their defaults) in `locale`.
 */
export const datePickerI18n = (locale: string = uiLocale()): Record<string, unknown> => {
    const cached = i18ns.get(locale)
    if (cached) return cached
    const i18n = {
        ...(calendarNames(locale) ?? {}),
        firstDayOfWeek: firstDayOfWeek(locale),
        today: chromeText('dateToday', locale),
        cancel: chromeText('cancel', locale),
        formatDate: (d: DateParts) => formatDateParts(d, locale),
        parseDate: (text: string) => parseDateText(text, locale),
    }
    i18ns.set(locale, i18n)
    return i18n
}

/**
 * The `i18n` of a vcf-date-range-picker: it does NOT merge with its defaults, so every key it reads
 * is here (its side-panel shortcuts included).
 */
export const dateRangePickerI18n = (locale: string = uiLocale()): Record<string, unknown> => {
    const cached = rangeI18ns.get(locale)
    if (cached) return cached
    const i18n = {
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'],
        ...datePickerI18n(locale),
        week: chromeText('dateWeek', locale),
        calendar: chromeText('dateCalendar', locale),
        clear: chromeText('clear', locale),
        yesterday: chromeText('dateYesterday', locale),
        thisWeek: chromeText('dateThisWeek', locale),
        lastWeek: chromeText('dateLastWeek', locale),
        thisMonth: chromeText('dateThisMonth', locale),
        lastMonth: chromeText('dateLastMonth', locale),
        thisYear: chromeText('dateThisYear', locale),
        lastYear: chromeText('dateLastYear', locale),
        formatTitle: (monthName: string, fullYear: number) => `${monthName} ${fullYear}`,
    }
    rangeI18ns.set(locale, i18n)
    return i18n
}

const rangeI18ns = new Map<string, Record<string, unknown>>()
