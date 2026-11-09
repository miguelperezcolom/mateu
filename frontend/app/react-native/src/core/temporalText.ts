import { uiLocale } from './money.ts';

/**
 * A date / date-time / time value as the UI's locale writes it — the rule of the web's date
 * fields (apps/vaadin dateLocale: dateFormatSpec + formatDateParts). Listing columns carry
 * `dataType: date | dateTime | time` while the rows carry ISO text ("2026-11-05",
 * "2026-11-05T10:15:30.123+01:00", "10:15:30"): the cell shows "5/11/2026 10:15" in es, never the
 * ISO text. The ISO components are read LITERALLY — no time-zone conversion, the value is the wall
 * clock the server wrote. The year is always 4 digits. Anything unparseable is returned as is.
 */

type DatePart = 'day' | 'month' | 'year';
interface DateSpec { order: DatePart[]; separator: string; padDay: boolean; padMonth: boolean }

const specs = new Map<string, DateSpec>();

/** How `locale` writes a numeric date: order of the parts, separator and padding. */
export function dateFormatSpec(locale: string): DateSpec {
  const cached = specs.get(locale);
  if (cached) return cached;
  let spec: DateSpec = { order: ['month', 'day', 'year'], separator: '/', padDay: false, padMonth: false };
  try {
    // 5 January: a day and month that show whether the locale pads them
    const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' })
      .formatToParts(new Date(Date.UTC(2027, 0, 5)));
    const order = parts.map((p) => p.type).filter((t): t is DatePart => t === 'day' || t === 'month' || t === 'year');
    if (order.length === 3 && new Set(order).size === 3) {
      const literal = parts.find((p) => p.type === 'literal')?.value.trim() ?? '';
      spec = {
        order,
        separator: /^[./-]$/.test(literal) ? literal : '/',
        padDay: (parts.find((p) => p.type === 'day')?.value.length ?? 1) > 1,
        padMonth: (parts.find((p) => p.type === 'month')?.value.length ?? 1) > 1,
      };
    }
  } catch {
    // an unknown locale keeps the en-US spec
  }
  specs.set(locale, spec);
  return spec;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** year / month (1-based) / day as `locale` writes them ("5/11/2026" in es, "11/5/2026" in en-US). */
export function formatDate(year: number, month: number, day: number, locale: string): string {
  const spec = dateFormatSpec(locale);
  return spec.order.map((part) => part === 'year' ? pad(year, 4)
    : part === 'month' ? pad(month, spec.padMonth ? 2 : 1)
      : pad(day, spec.padDay ? 2 : 1)).join(spec.separator);
}

/** hour:minute as `locale` writes them ("10:15", "10:15 AM"). */
export function formatTime(hour: number, minute: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
      .format(new Date(Date.UTC(2027, 0, 5, hour, minute)));
  } catch {
    return `${pad(hour, 2)}:${pad(minute, 2)}`;
  }
}

const DATE = /^(\d{4})-(\d{2})-(\d{2})/;
const TIME = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?/;
/** What may follow the time: nothing, or a zone (read, never applied) — `Z`, `+01:00`, `[Europe/Madrid]`. */
const ZONE = /^(Z|[+-]\d{2}(:?\d{2})?)?(\[[^\]]*\])?$/;

const validDate = (y: number, m: number, d: number) =>
  m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
const validTime = (h: number, m: number) => h >= 0 && h <= 23 && m >= 0 && m <= 59;

/** A `date` / `dateTime` / `time` value in the UI's locale; other data types → the value as is. */
export function temporalText(value: unknown, dataType: string | undefined, locale: string = uiLocale()): unknown {
  if (typeof value !== 'string' || !dataType) return value;
  const text = value.trim();
  if (dataType === 'time') {
    const t = TIME.exec(text);
    if (!t || !ZONE.test(text.slice(t[0].length))) return value;
    const h = +t[1], m = +t[2];
    return validTime(h, m) ? formatTime(h, m, locale) : value;
  }
  if (dataType !== 'date' && dataType !== 'dateTime' && dataType !== 'datetime') return value;
  const d = DATE.exec(text);
  if (!d) return value;
  const y = +d[1], mo = +d[2], day = +d[3];
  if (!validDate(y, mo, day)) return value;
  const date = formatDate(y, mo, day, locale);
  const rest = text.slice(d[0].length);
  if (dataType === 'date') return rest === '' ? date : value;
  if (rest === '') return date;
  if (!/^[T ]/.test(rest)) return value;
  const t = TIME.exec(rest.slice(1));
  if (!t) return value;
  const h = +t[1], m = +t[2];
  if (!validTime(h, m)) return value;
  if (!ZONE.test(rest.slice(1 + t[0].length))) return value;
  return `${date} ${formatTime(h, m, locale)}`;
}
