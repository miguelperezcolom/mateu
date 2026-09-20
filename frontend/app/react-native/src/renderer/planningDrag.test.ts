import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePlanningMove, addDaysIso, type PlanningMoveInput } from './planningDrag.ts';

const base: PlanningMoveInput = {
  blockId: 'b1',
  originResourceIndex: 1,
  originStartIdx: 2,
  durationDays: 3,
  deltaXpx: 0,
  deltaYpx: 0,
  dayWidthPx: 40,
  laneHeightPx: 48,
  resourceIds: ['r0', 'r1', 'r2'],
  windowFromIso: '2026-03-01',
  dayCount: 10,
};

test('addDaysIso: deterministic UTC day arithmetic (incl. month rollover)', () => {
  assert.equal(addDaysIso('2026-03-01', 3), '2026-03-04');
  assert.equal(addDaysIso('2026-03-30', 3), '2026-04-02');
  assert.equal(addDaysIso('2026-03-04', 0), '2026-03-04');
});

test('no-op drop (same lane + same day) returns null', () => {
  assert.equal(computePlanningMove(base), null);
  // a sub-half-day / sub-half-lane jiggle rounds back to origin → still no-op
  assert.equal(computePlanningMove({ ...base, deltaXpx: 15, deltaYpx: 10 }), null);
});

test('drag right by 2 days shifts start + end, keeping duration + resource', () => {
  const move = computePlanningMove({ ...base, deltaXpx: 80 }); // 80 / 40 = +2 days
  assert.deepEqual(move, { _blockId: 'b1', _resourceId: 'r1', _start: '2026-03-05', _end: '2026-03-07' });
});

test('drag down one lane retargets the resource', () => {
  const move = computePlanningMove({ ...base, deltaYpx: 48 }); // +1 lane → r2
  assert.equal(move?._resourceId, 'r2');
  assert.equal(move?._start, '2026-03-03'); // start unchanged (originStartIdx 2)
});

test('clamps to the board: cannot drag before day 0 or a resource off either edge', () => {
  const left = computePlanningMove({ ...base, deltaXpx: -400, deltaYpx: -400 });
  assert.equal(left?._start, '2026-03-01'); // start clamped to window start (idx 0)
  assert.equal(left?._resourceId, 'r0'); // resource clamped to the first lane
});

test('clamps the end within the window (start cannot push a 3-day block past day 10)', () => {
  const right = computePlanningMove({ ...base, deltaXpx: 4000 });
  // maxStart = dayCount(10) - duration(3) = 7 → start = 2026-03-08, end = 2026-03-10
  assert.equal(right?._start, '2026-03-08');
  assert.equal(right?._end, '2026-03-10');
});
