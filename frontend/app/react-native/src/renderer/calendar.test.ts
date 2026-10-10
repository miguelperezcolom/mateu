import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  agenda, anchorOf, dayA11yLabel, dayInfo, dayParameters, eventA11yLabel, eventsOn, initialView, isDayActionable,
  monthWeeks, parseIso, periodDates, periodTitle, switcherViews, timeRange, type CalendarMeta,
} from './calendar.ts';

const meta: CalendarMeta = {
  month: '2026-10-29',
  view: 'week',
  views: ['month', 'week', 'week', 'bogus', 'list'],
  dayActionId: 'openDay',
  days: [
    { date: '2026-10-29', label: 'Avail 12', tone: 'success' },
    { date: '2026-10-30', label: 'Closed', tone: 'DANGER' },
    { date: '2026-10-31', label: 'x', tone: 'purple' },
  ],
  events: [
    { id: 'conf', title: 'Conference', date: '2026-10-28', endDate: '2026-10-30' },
    { id: 'late', title: 'Dinner', date: '2026-10-29', startTime: '20:00' },
    { id: 'early', title: 'Standup', date: '2026-10-29', startTime: '09:00', endTime: '09:15' },
    { id: 'nov', title: 'Next month', date: '2026-11-02' },
    { id: 'bad', title: 'No date', date: null },
    { id: 'inverted', title: 'Inverted', date: '2026-10-05', endDate: '2026-10-01' },
  ],
};

const anchor = anchorOf(meta);

test('views: initial defaults to month, switcher dedups and drops unknowns', () => {
  assert.equal(initialView(meta), 'week');
  assert.equal(initialView({}), 'month');
  assert.equal(initialView({ view: 'nonsense' }), 'month');
  assert.deepEqual(switcherViews(meta), ['month', 'week', 'list']);
  assert.deepEqual(switcherViews({}), []);
});

test('periods: month = the whole month, week = Monday..Sunday, day = the anchor', () => {
  const month = periodDates('month', anchor);
  assert.equal(month.length, 31);
  assert.equal(month[0], '2026-10-01');
  assert.equal(month[30], '2026-10-31');
  assert.deepEqual(periodDates('list', anchor), month);
  assert.deepEqual(periodDates('week', anchor), [
    '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01',
  ]);
  // A Sunday anchor belongs to the week that started the previous Monday.
  assert.equal(periodDates('week', parseIso('2026-11-01')!)[0], '2026-10-26');
  assert.deepEqual(periodDates('day', anchor), ['2026-10-29']);
});

test('month grid: Monday-first weeks padded with null', () => {
  const weeks = monthWeeks(anchor);
  assert.ok(weeks.every((w) => w.length === 7));
  assert.deepEqual(weeks[0], [null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
  assert.deepEqual(weeks[weeks.length - 1], ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', null]);
});

test('events per date: multi-day spans, all-day first then by start time', () => {
  assert.deepEqual(eventsOn(meta, '2026-10-29').map((e) => e.id), ['conf', 'early', 'late']);
  assert.deepEqual(eventsOn(meta, '2026-10-28').map((e) => e.id), ['conf']);
  assert.deepEqual(eventsOn(meta, '2026-10-30').map((e) => e.id), ['conf']);
  assert.deepEqual(eventsOn(meta, '2026-10-31').map((e) => e.id), []);
  // An endDate before the date is ignored: the event is a single day.
  assert.deepEqual(eventsOn(meta, '2026-10-05').map((e) => e.id), ['inverted']);
  assert.deepEqual(eventsOn(meta, '2026-10-02').map((e) => e.id), []);
});

test('agenda: dates of the month with events, in order', () => {
  const groups = agenda(meta, anchor);
  assert.deepEqual(groups.map((g) => g.date), ['2026-10-05', '2026-10-28', '2026-10-29', '2026-10-30']);
  assert.equal(groups[2].events.length, 3);
});

test('days: label + tone, unknown tones dropped, missing dates empty', () => {
  assert.deepEqual(dayInfo(meta, '2026-10-29'), { label: 'Avail 12', tone: 'success' });
  assert.deepEqual(dayInfo(meta, '2026-10-30'), { label: 'Closed', tone: 'danger' });
  assert.deepEqual(dayInfo(meta, '2026-10-31'), { label: 'x', tone: undefined });
  assert.deepEqual(dayInfo(meta, '2026-10-01'), { label: '', tone: undefined });
});

test('day action: actionable only with a dayActionId, dispatches _date', () => {
  assert.equal(isDayActionable(meta), true);
  assert.equal(isDayActionable({ dayActionId: '  ' }), false);
  assert.deepEqual(dayParameters('2026-10-29'), { _date: '2026-10-29' });
});

test('labels: times, titles and the screen-reader text of a date cell', () => {
  assert.equal(timeRange({ startTime: '09:00', endTime: '09:15' }), '09:00–09:15');
  assert.equal(timeRange({ startTime: '20:00' }), '20:00');
  assert.equal(timeRange({}), '');
  assert.equal(periodTitle('month', anchor), 'October 2026');
  assert.equal(periodTitle('week', anchor), '26 Oct – 1 Nov 2026');
  assert.equal(periodTitle('day', anchor), 'Thu 29 October 2026');
  assert.equal(dayA11yLabel(meta, '2026-10-29'), 'Thu 29 October, Avail 12, 3 events');
  assert.equal(dayA11yLabel(meta, '2026-10-28'), 'Wed 28 October, 1 event');
  assert.equal(dayA11yLabel(meta, '2026-10-02'), 'Fri 2 October');
  assert.equal(eventA11yLabel({ title: 'Standup', startTime: '09:00', endTime: '09:15' }), 'Standup, 09:00–09:15');
});
