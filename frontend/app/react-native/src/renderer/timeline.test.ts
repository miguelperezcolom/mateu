// The Gantt / planning-board layout (timeline.ts): what is on screen and where.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ganttLayout, laneBlocks, parseDay, planningRows, planningWindow, todayDayNumber, todayOffset } from './timeline.ts';

const day = (iso: string) => parseDay(iso)!;

test('ISO dates are UTC day numbers; a missing or malformed date is no day', () => {
  assert.equal(day('1970-01-02'), 1);
  assert.equal(parseDay(undefined), null);
  assert.equal(parseDay('tomorrow'), null);
  assert.equal(todayDayNumber(Date.UTC(1970, 0, 3, 23)), 2);
});

test('the today marker shows only inside the window', () => {
  assert.equal(todayOffset(12, 10, 20, 34), 68);
  assert.equal(todayOffset(9, 10, 20, 34), null);
  assert.equal(todayOffset(21, 10, 20, 34), null);
});

test('planning rows add a swimlane caption each time the group changes, none for ungrouped resources', () => {
  const rows = planningRows([
    { id: '101', group: 'Floor 1' },
    { id: '102', group: 'Floor 1' },
    { id: '201', group: 'Floor 2' },
    { id: 'x' },
  ]);
  assert.deepEqual(rows.map((r) => (r.kind === 'group' ? `#${r.label}` : r.resource.id)), ['#Floor 1', '101', '102', '#Floor 2', '201', 'x']);
});

test('the board window is from/to when given, else the span of the blocks; nothing drawable is null', () => {
  const blocks = [{ start: '2026-03-03', end: '2026-03-05' }, { start: '2026-03-01', end: 'bad' }];
  assert.deepEqual(planningWindow(blocks), { minDay: day('2026-03-01'), maxDay: day('2026-03-05'), totalDays: 5 });
  assert.deepEqual(planningWindow(blocks, '2026-02-28', '2026-03-02'), { minDay: day('2026-02-28'), maxDay: day('2026-03-02'), totalDays: 3 });
  assert.equal(planningWindow([]), null);
  assert.equal(planningWindow([], '2026-03-05', '2026-03-01'), null, 'to before from');
});

test('a lane shows its resource blocks clamped to the window, at least one day wide', () => {
  const min = day('2026-03-01');
  const max = day('2026-03-10');
  const blocks = [
    { id: 'a', resourceId: 'r1', start: '2026-02-25', end: '2026-03-02' },
    { id: 'b', resourceId: 'r1', start: '2026-03-09', end: '2026-03-20' },
    { id: 'c', resourceId: 'r1', start: '2026-04-01', end: '2026-04-02' },
    { id: 'd', resourceId: 'r2', start: '2026-03-03', end: '2026-03-03' },
    { id: 'e', resourceId: 'r1', start: '2026-03-05' },
  ];
  assert.deepEqual(laneBlocks(blocks, 'r1', min, max, 10).map((b) => [b.block.id, b.left, b.width]), [['a', 0, 20], ['b', 80, 20]]);
  assert.deepEqual(laneBlocks(blocks, 'r2', min, max, 10).map((b) => [b.left, b.width]), [[20, 10]]);
});

test('the gantt drops tasks without dates, fits the day width and ticks each month start', () => {
  assert.equal(ganttLayout([{ id: 'x', start: '2026-01-01' }]), null);
  const l = ganttLayout([
    { id: 'a', start: '2026-01-20', end: '2026-02-10', progress: 140 },
    { id: 'b', start: '2026-02-01', end: '2026-03-05', progress: -5 },
    { id: 'skip' },
  ])!;
  assert.deepEqual(l.tasks.map((t) => t.id), ['a', 'b']);
  const total = day('2026-03-05') - day('2026-01-20') + 1;
  assert.equal(l.dayW, Math.max(4, Math.min(16, Math.round(560 / total))));
  assert.equal(l.laneW, total * l.dayW);
  assert.deepEqual(l.months.map((m) => m.label), ['2026-02', '2026-03'], 'January starts before the range: no tick');
  assert.equal(l.months[0].left, (day('2026-02-01') - day('2026-01-20')) * l.dayW);
  assert.deepEqual(l.bars.map((b) => b.progress), [100, 0]);
  assert.equal(l.bars[1].left, (day('2026-02-01') - day('2026-01-20')) * l.dayW);
  const oneDay = ganttLayout([{ start: '2026-05-01', end: '2026-05-01' }])!;
  assert.equal(oneDay.dayW, 16);
  assert.equal(oneDay.bars[0].width, 16);
});

test('an end before the start is one day at the start, inside the lane — never a negative width', () => {
  const l = ganttLayout([
    { id: 'a', start: '2026-10-01', end: '2026-10-02' },
    { id: 'b', start: '2026-10-12', end: '2026-10-03' },
  ])!;
  const b = l.bars.find((x) => x.task.id === 'b')!;
  assert.equal(b.width, l.dayW);
  assert.ok(b.left >= 0 && b.left + b.width <= l.laneW);
  assert.equal(l.maxDay, day('2026-10-12'));
});
