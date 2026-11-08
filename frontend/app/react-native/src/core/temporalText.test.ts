import { test } from 'node:test';
import assert from 'node:assert/strict';
import { temporalText } from './temporalText.ts';
import { cellText } from '../renderer/cellText.ts';

test('a date cell reads in the locale order and separator, with a 4-digit year', () => {
  assert.equal(temporalText('2026-11-05', 'date', 'es-ES'), '5/11/2026');
  assert.equal(temporalText('2026-11-05', 'date', 'en-US'), '11/5/2026');
  assert.equal(temporalText('2026-11-05', 'date', 'de-DE'), '5.11.2026');
  assert.equal(temporalText('2026-01-05', 'date', 'en-GB'), '05/01/2026');
});

test('a date-time cell is the date and the wall-clock time — zones are never applied', () => {
  assert.equal(temporalText('2026-11-05T10:15:30', 'dateTime', 'es-ES'), '5/11/2026 10:15');
  assert.equal(temporalText('2026-11-05T23:15:30.123Z', 'dateTime', 'es-ES'), '5/11/2026 23:15');
  assert.equal(temporalText('2026-11-05T23:15:30+05:00', 'dateTime', 'de-DE'), '5.11.2026 23:15');
  assert.match(String(temporalText('2026-11-05T10:15', 'dateTime', 'en-US')), /^11\/5\/2026 10:15\sAM$/);
  // a date-time column whose value is a bare date
  assert.equal(temporalText('2026-11-05', 'dateTime', 'es-ES'), '5/11/2026');
});

test('a time cell reads as the locale writes hours and minutes', () => {
  assert.equal(temporalText('10:15:30', 'time', 'es-ES'), '10:15');
  assert.equal(temporalText('09:05', 'time', 'de-DE'), '09:05');
});

test('anything unparseable, or another data type, stays as is', () => {
  assert.equal(temporalText('yesterday', 'date', 'es-ES'), 'yesterday');
  assert.equal(temporalText('2026-13-05', 'date', 'es-ES'), '2026-13-05');
  assert.equal(temporalText('2026-02-30', 'date', 'es-ES'), '2026-02-30');
  assert.equal(temporalText('25:00', 'time', 'es-ES'), '25:00');
  assert.equal(temporalText('2026-11-05', 'string', 'es-ES'), '2026-11-05');
  assert.equal(temporalText(42, 'date', 'es-ES'), 42);
});

test('a listing cell of a date column is localised; a status word reads as words', () => {
  assert.notEqual(cellText('2026-11-05', null, { dataType: 'date' }), '2026-11-05');
  assert.equal(cellText('2026-11-05', null, { dataType: 'string' }), '2026-11-05');
  assert.equal(cellText('OUT_OF_STOCK', null, { dataType: 'status' }), 'Out of stock');
  assert.equal(cellText('OUT_OF_STOCK', { OUT_OF_STOCK: 'Sold out' }, { dataType: 'status' }), 'Sold out');
});
