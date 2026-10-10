/**
 * Calendars (wire type `Calendar`): the pure half of the renderer. Same contract as the web ones:
 *
 *  - `month` is the ANCHOR date; `view` (month | week | day | list, default month) picks the period:
 *    month and list = the anchor's month (list = the agenda: only the dates with events, in order),
 *    week = Monday..Sunday around the anchor, day = the anchor itself;
 *  - `views` with more than one entry = a client-side switcher (no server round trip);
 *  - an event spans `date`..`endDate` (inclusive) and shows on every day of that span; within a day
 *    the all-day events come first, then by `startTime`;
 *  - `days` put a `label` and a `tone` (info, success, warning, danger, neutral) in a date's cell;
 *  - `dayActionId` makes the date cells actionable: they dispatch it with `{ _date: "YYYY-MM-DD" }`.
 *
 * Dates are handled as ISO strings and computed in UTC, so the device time zone never shifts a day.
 * Pure logic (no react-native import) so it runs under `node --test`.
 */

export type CalendarView = 'month' | 'week' | 'day' | 'list';
export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface CalendarEventMeta {
  id?: string | null; title?: string | null; date?: string | null; endDate?: string | null;
  startTime?: string | null; endTime?: string | null; color?: string | null; actionId?: string | null;
}
export interface CalendarDayMeta { date?: string | null; label?: string | null; tone?: string | null }
export interface CalendarMeta {
  month?: string | null;
  events?: CalendarEventMeta[] | null;
  view?: string | null;
  views?: string[] | null;
  days?: CalendarDayMeta[] | null;
  dayActionId?: string | null;
}

const VIEWS: readonly CalendarView[] = ['month', 'week', 'day', 'list'];
const TONES: ReadonlySet<string> = new Set(['info', 'success', 'warning', 'danger', 'neutral']);
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ISO = /^(\d{4})-(\d{2})-(\d{2})/;

/** The UTC midnight of an ISO date (anything after the date part is ignored); undefined if unparseable. */
export const parseIso = (s: string | null | undefined): Date | undefined => {
  const m = ISO.exec((s ?? '').trim());
  if (!m) return undefined;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return isNaN(d.getTime()) ? undefined : d;
};

const pad = (n: number) => String(n).padStart(2, '0');
export const toIso = (d: Date): string => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

/** The anchor date: the wire's `month`, else today. */
export const anchorOf = (meta: CalendarMeta, today: Date = new Date()): Date =>
  parseIso(meta.month) ?? new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

const normView = (v: string | null | undefined): CalendarView | undefined => {
  const t = (v ?? '').trim().toLowerCase();
  return (VIEWS as readonly string[]).includes(t) ? (t as CalendarView) : undefined;
};

/** The initial view: the wire's `view`, default month. */
export const initialView = (meta: CalendarMeta): CalendarView => normView(meta.view) ?? 'month';

/** The views offered by the switcher, deduplicated in wire order; the switcher shows when > 1. */
export const switcherViews = (meta: CalendarMeta): CalendarView[] => {
  const out: CalendarView[] = [];
  for (const v of meta.views ?? []) {
    const n = normView(v);
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
};

export const viewLabel = (view: CalendarView): string => view.charAt(0).toUpperCase() + view.slice(1);

/** The dates a view covers, in order: the anchor's month (month, list), its Monday-to-Sunday week, or the anchor. */
export const periodDates = (view: CalendarView, anchor: Date): string[] => {
  if (view === 'day') return [toIso(anchor)];
  if (view === 'week') {
    const monday = addDays(anchor, -((anchor.getUTCDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => toIso(addDays(monday, i)));
  }
  const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const out: string[] = [];
  for (let d = first; d.getUTCMonth() === first.getUTCMonth(); d = addDays(d, 1)) out.push(toIso(d));
  return out;
};

/** The month grid: weeks of 7 Monday-first slots, `null` for the padding before day 1 and after the last day. */
export const monthWeeks = (anchor: Date): (string | null)[][] => {
  const dates = periodDates('month', anchor);
  const lead = (parseIso(dates[0])!.getUTCDay() + 6) % 7;
  const slots: (string | null)[] = [...Array<null>(lead).fill(null), ...dates];
  while (slots.length % 7) slots.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));
  return weeks;
};

/** The events on a date — multi-day ones on every day of their span —, all-day first, then by start time. */
export const eventsOn = (meta: CalendarMeta, date: string): CalendarEventMeta[] =>
  (meta.events ?? [])
    .filter((e) => {
      const start = parseIso(e.date);
      if (!start) return false;
      const end = parseIso(e.endDate);
      const from = toIso(start);
      const to = end && end >= start ? toIso(end) : from;
      return from <= date && date <= to;
    })
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const ta = (a.e.startTime ?? '').trim();
      const tb = (b.e.startTime ?? '').trim();
      if (ta !== tb) return ta < tb ? -1 : 1; // '' (all-day) sorts first
      return a.i - b.i;
    })
    .map(({ e }) => e);

export interface AgendaGroup { date: string; events: CalendarEventMeta[] }

/** The list view: the dates of the anchor's month that have events, in order, each with its events. */
export const agenda = (meta: CalendarMeta, anchor: Date): AgendaGroup[] =>
  periodDates('list', anchor)
    .map((date) => ({ date, events: eventsOn(meta, date) }))
    .filter((g) => g.events.length > 0);

export interface DayInfo { label: string; tone: Tone | undefined }

/** What the wire puts IN a date's cell: its label and tone (unknown tones are ignored). */
export const dayInfo = (meta: CalendarMeta, date: string): DayInfo => {
  const d = (meta.days ?? []).find((x) => {
    const p = parseIso(x.date);
    return !!p && toIso(p) === date;
  });
  const t = (d?.tone ?? '').trim().toLowerCase();
  return { label: (d?.label ?? '').trim(), tone: TONES.has(t) ? (t as Tone) : undefined };
};

export const isDayActionable = (meta: CalendarMeta): boolean => !!(meta.dayActionId ?? '').trim();

/** The parameters a date cell dispatches `dayActionId` with. */
export const dayParameters = (date: string): { _date: string } => ({ _date: date });

/** "09:00–10:30", "09:00", or '' for an all-day event. */
export const timeRange = (e: CalendarEventMeta): string => {
  const s = (e.startTime ?? '').trim();
  const t = (e.endTime ?? '').trim();
  return s && t ? `${s}–${t}` : s || t;
};

/** "Thu 29 October". */
export const dateLabel = (date: string): string => {
  const d = parseIso(date);
  return d ? `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : date;
};

export const weekdayShort = (date: string): string => {
  const d = parseIso(date);
  return d ? DOW[d.getUTCDay()] : '';
};

export const dayOfMonth = (date: string): number => parseIso(date)?.getUTCDate() ?? 0;

/** Monday-first weekday headers of the month grid. */
export const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The heading of the period a view shows: "October 2026", "26 Oct – 1 Nov 2026", "Thu 29 October 2026". */
export const periodTitle = (view: CalendarView, anchor: Date): string => {
  if (view === 'day') return `${dateLabel(toIso(anchor))} ${anchor.getUTCFullYear()}`;
  if (view === 'week') {
    const dates = periodDates('week', anchor).map((d) => parseIso(d)!);
    const a = dates[0];
    const b = dates[6];
    const short = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
    return `${short(a)} – ${short(b)} ${b.getUTCFullYear()}`;
  }
  return `${MONTHS[anchor.getUTCMonth()]} ${anchor.getUTCFullYear()}`;
};

const eventsCount = (n: number) => (n === 1 ? '1 event' : `${n} events`);

/** What a screen reader says for a date cell: "Thu 29 October, Avail 12, 1 event". */
export const dayA11yLabel = (meta: CalendarMeta, date: string): string => {
  const parts = [dateLabel(date)];
  const { label } = dayInfo(meta, date);
  if (label) parts.push(label);
  const n = eventsOn(meta, date).length;
  if (n > 0) parts.push(eventsCount(n));
  return parts.join(', ');
};

/** What a screen reader says for an event: "Board meeting, 09:00–10:30". */
export const eventA11yLabel = (e: CalendarEventMeta): string =>
  [(e.title ?? '').trim(), timeRange(e)].filter(Boolean).join(', ');
