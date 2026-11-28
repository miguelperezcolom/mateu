import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ganttScale, tickUnitOf, todayPercent } from './ganttScale.ts'

test('sixty years fit the width, ticked by decade', () => {
  const s = ganttScale([
    { id: 'a', start: '1965-06-03', end: '1965-06-07' },
    { id: 'b', start: '1973-03-03', end: '2003-01-23' },
    { id: 'c', start: '2026-04-01', end: '2026-04-10' },
  ])!
  assert.equal(s.bars.length, 3)
  assert.equal(s.bars[0]!.left, 0)
  const last = s.bars[2]!
  assert.ok(Math.abs(last.left + last.width - 100) < 1e-9, 'the last bar ends at the right edge')
  assert.ok(s.bars.every((b) => b.left >= 0 && b.left + b.width <= 100 + 1e-9))
  assert.deepEqual(s.ticks.map((t) => t.label), ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'])
  assert.equal(s.ticks[0]!.left, 0, 'a tick before the first day is pinned to the start')
})

test('the tick unit follows the span', () => {
  assert.equal(tickUnitOf(90), 'month')
  assert.equal(tickUnitOf(3 * 365), 'quarter')
  assert.equal(tickUnitOf(10 * 365), 'year')
  assert.equal(tickUnitOf(40 * 365), 'decade')
  const months = ganttScale([{ start: '2026-01-10', end: '2026-03-20' }])!
  assert.deepEqual(months.ticks.map((t) => t.label), ['2026-01', '2026-02', '2026-03'])
})

test('a task without readable dates is left out; none at all is null', () => {
  assert.equal(ganttScale([{ start: 'soon', end: '' }]), null)
  assert.equal(ganttScale([{ start: '2026-01-01', end: '2026-01-02' }, { start: undefined, end: '2026-01-05' }])!.bars.length, 1)
})

test('today in %, null outside the range', () => {
  assert.equal(todayPercent(100, 100, 10), 0)
  assert.equal(todayPercent(105, 100, 10), 50)
  assert.equal(todayPercent(99, 100, 10), null)
  assert.equal(todayPercent(111, 100, 10), null)
})
