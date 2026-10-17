// The date picker's model (dateCalendar.ts): the wire value it reads and commits, and the grid.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { committedValue, displayValue, formatDate, monthWeeks, parseIso, shiftedMonth, today } from './dateCalendar.ts';

test('an ISO date or datetime is read; anything else is no date', () => {
  assert.deepEqual(parseIso('2026-03-07'), { date: { y: 2026, m: 3, d: 7 }, time: '' });
  assert.deepEqual(parseIso('2026-03-07T09:30:00'), { date: { y: 2026, m: 3, d: 7 }, time: '09:30' });
  assert.deepEqual(parseIso('2026-03-07 18:05'), { date: { y: 2026, m: 3, d: 7 }, time: '18:05' });
  assert.deepEqual(parseIso('07/03/2026'), { date: null, time: '' });
  assert.deepEqual(parseIso(undefined as unknown as string), { date: null, time: '' });
});

test('a pick commits the LocalDate / LocalDateTime wire format; a malformed time becomes midnight', () => {
  const d = { y: 2026, m: 1, d: 5 };
  assert.equal(formatDate(d), '2026-01-05');
  assert.equal(committedValue(d, false, '10:00'), '2026-01-05');
  assert.equal(committedValue(d, true, '10:15'), '2026-01-05T10:15');
  assert.equal(committedValue(d, true, '7:5'), '2026-01-05T00:00');
});

test('the closed field shows a datetime with a space; a date or an unparseable value as sent', () => {
  assert.equal(displayValue('', true), '');
  assert.equal(displayValue('2026-01-05T10:15:00', true), '2026-01-05 10:15');
  assert.equal(displayValue('2026-01-05', true), '2026-01-05');
  assert.equal(displayValue('2026-01-05T10:15', false), '2026-01-05T10:15');
  assert.equal(displayValue('soon', true), 'soon');
});

test('month navigation wraps the year in both directions', () => {
  assert.deepEqual(shiftedMonth({ y: 2026, m: 1 }, -1), { y: 2025, m: 12 });
  assert.deepEqual(shiftedMonth({ y: 2026, m: 12 }, 1), { y: 2027, m: 1 });
  assert.deepEqual(shiftedMonth({ y: 2026, m: 6 }, 1), { y: 2026, m: 7 });
});

test('the grid is Monday-first full weeks: March 2026 starts on a Sunday, February 2024 is a leap month', () => {
  const march = monthWeeks(2026, 3);
  assert.deepEqual(march[0], [null, null, null, null, null, null, 1]);
  assert.ok(march.every((w) => w.length === 7));
  assert.equal(march.flat().filter((d) => d !== null).length, 31);
  assert.equal(march.at(-1)!.at(-1), null);
  const feb = monthWeeks(2024, 2);
  assert.equal(Math.max(...(feb.flat().filter((d) => d !== null) as number[])), 29);
  assert.deepEqual(feb[0], [null, null, null, 1, 2, 3, 4]);
});

test('today is the local calendar date', () => {
  assert.deepEqual(today(new Date(2026, 9, 17, 23, 59)), { y: 2026, m: 10, d: 17 });
});
