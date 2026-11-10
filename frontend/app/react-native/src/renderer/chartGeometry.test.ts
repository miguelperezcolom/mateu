import { test } from 'node:test';
import assert from 'node:assert/strict';
import { radarGeometry, trendPaths } from './chartGeometry.ts';

test('a trend line spans the width, lowest value at the bottom, highest at the top; the area closes', () => {
  const p = trendPaths([0, 10], 100, 50, 0)!;
  assert.equal(p.line, 'M0.0 50.0 L100.0 0.0');
  assert.equal(p.area, 'M0.0 50.0 L100.0 0.0 L100.0 50 L0.0 50 Z');
  assert.equal(trendPaths([], 100, 50), null);
  // a flat series does not divide by zero
  assert.ok(trendPaths([3, 3, 3], 100, 50)!.line.startsWith('M'));
});

test('a radar has one spoke per label from 12 o`clock and a polygon per dataset scaled to the max', () => {
  const g = radarGeometry(4, [[4, 2, 4, 2]], 50, 50, 40, 2);
  assert.equal(g.spokes.length, 4);
  assert.deepEqual({ x: Math.round(g.spokes[0].x), y: Math.round(g.spokes[0].y) }, { x: 50, y: 10 });
  assert.equal(g.rings.length, 2);
  // the first vertex (value 4 = max) on the top spoke's tip, the second (2) half-way to the right
  assert.equal(g.polygons[0].split(' ')[0], '50.0,10.0');
  assert.equal(g.polygons[0].split(' ')[1], '70.0,50.0');
});
