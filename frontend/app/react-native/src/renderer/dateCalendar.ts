// The date / datetime picker's view-model (DateField.tsx): parsing and committing the wire value
// ('YYYY-MM-DD' for LocalDate, 'YYYY-MM-DDTHH:mm' for LocalDateTime), the Monday-first month grid
// and month navigation. Pure TypeScript, tested by node's runner.

export interface Ymd {
  y: number;
  m: number; // 1..12
  d: number;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const pad = (n: number): string => String(n).padStart(2, '0');
export const formatDate = ({ y, m, d }: Ymd): string => `${y}-${pad(m)}-${pad(d)}`;

/** The date (and HH:mm, when present) of an ISO value; anything else is "no date". */
export function parseIso(value: string): { date: Ymd | null; time: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}))?/.exec(value ?? '');
  if (!m) return { date: null, time: '' };
  return { date: { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }, time: m[4] ?? '' };
}

export function today(now: Date = new Date()): Ymd {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/** The value a pick commits: a date, or a datetime whose malformed time falls back to midnight. */
export function committedValue(date: Ymd, withTime: boolean, time: string): string {
  return withTime ? `${formatDate(date)}T${/^\d{2}:\d{2}$/.test(time) ? time : '00:00'}` : formatDate(date);
}

/** What the closed field shows: a datetime as "YYYY-MM-DD HH:mm", anything else as sent. */
export function displayValue(value: string, withTime: boolean): string {
  if (!value) return '';
  const parsed = parseIso(value);
  return withTime && parsed.date ? `${formatDate(parsed.date)} ${parsed.time}`.trim() : value;
}

/** The month shown `delta` months away, wrapping the year. */
export function shiftedMonth(cursor: { y: number; m: number }, delta: number): { y: number; m: number } {
  let { y, m } = cursor;
  m += delta;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  return { y, m };
}

/** The month as Monday-first weeks of day numbers, null for the padding cells. */
export function monthWeeks(y: number, m: number): (number | null)[][] {
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const total = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
