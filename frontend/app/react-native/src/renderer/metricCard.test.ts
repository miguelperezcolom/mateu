import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricA11yLabel, metricTimeframe } from './metricCard.ts';

test('the timeframe is shown trimmed, and not at all when blank', () => {
  assert.equal(metricTimeframe({ title: 'Revenue', value: '12.4k', timeframe: ' Last 7 days ' }), 'Last 7 days');
  assert.equal(metricTimeframe({ title: 'Revenue', value: '12.4k', timeframe: '  ' }), '');
  assert.equal(metricTimeframe({ title: 'Revenue', value: '12.4k' }), '');
});

test('the accessible name reads the timeframe right after the value', () => {
  assert.equal(
    metricA11yLabel({ title: 'Revenue', value: '12.4k', unit: '€', timeframe: 'Last 7 days', trendLabel: '+8%', description: 'Gross' }),
    'Revenue, 12.4k €, Last 7 days, +8%, Gross');
  assert.equal(metricA11yLabel({ title: 'Occupancy', value: '82', unit: '%', timeframe: ' ' }), 'Occupancy, 82 %');
});
