import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MARKER_COLOR, mapRows, markerParameters, osmUrl, parsePosition } from './mapRows.ts';

test('osm url pins the point and centres the map on it', () => {
  assert.equal(osmUrl(39.57, 2.65), 'https://www.openstreetmap.org/?mlat=39.57&mlon=2.65#map=16/39.57/2.65');
});

test('position parses "lat, lon" and rejects anything else', () => {
  assert.deepEqual(parsePosition('39.57, 2.65'), { latitude: 39.57, longitude: 2.65 });
  assert.deepEqual(parsePosition(' -1.5 ,3 '), { latitude: -1.5, longitude: 3 });
  assert.equal(parsePosition(null), null);
  assert.equal(parsePosition(''), null);
  assert.equal(parsePosition('39.57'), null);
  assert.equal(parsePosition('a, b'), null);
});

test('one row per marker, actionable only when there is a markerActionId', () => {
  const rows = mapRows({
    position: '0, 0',
    markerActionId: 'openHotel',
    markers: [
      { id: 'h1', latitude: 39.57, longitude: 2.65, label: 'Palma', description: 'HQ', color: 'red' },
      { id: 'h2', latitude: 40.4, longitude: -3.7 },
    ],
  });
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    key: 'h1', markerId: 'h1', label: 'Palma', description: 'HQ', color: 'red',
    latitude: 39.57, longitude: 2.65, url: osmUrl(39.57, 2.65), actionable: true,
  });
  assert.equal(rows[1].label, '40.4, -3.7');
  assert.equal(rows[1].color, DEFAULT_MARKER_COLOR);
  assert.deepEqual(markerParameters(rows[0]), { _markerId: 'h1' });

  const passive = mapRows({ markers: [{ id: 'h1', latitude: 1, longitude: 2 }] });
  assert.equal(passive[0].actionable, false);
});

test('no markers: a single non-actionable row for the position, or nothing', () => {
  const rows = mapRows({ position: '39.57, 2.65', markerActionId: 'x', markers: [] });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].markerId, null);
  assert.equal(rows[0].actionable, false);
  assert.equal(rows[0].url, osmUrl(39.57, 2.65));
  assert.deepEqual(mapRows({ position: null, markers: null }), []);
});
