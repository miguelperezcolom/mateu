import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellTooltipText, popoverOpensOnPress } from './hoverDetails.ts';

test('a hover popover opens on press on a touch screen, like a click one', () => {
  assert.equal(popoverOpensOnPress('hover'), true);
  assert.equal(popoverOpensOnPress('click'), true);
  assert.equal(popoverOpensOnPress(undefined), true);
});

test('the cell tooltip is the other field of the row, line breaks kept', () => {
  const row = { rate: 134, breakdown: 'Sat 10: 134 €\nSun 11: 120 €' };
  assert.equal(cellTooltipText(row, 'breakdown'), 'Sat 10: 134 €\nSun 11: 120 €');
});

test('a fixed-width column points at its own field', () => {
  assert.equal(cellTooltipText({ guest: 'Brown' }, 'guest'), 'Brown');
});

test('dot paths are followed', () => {
  assert.equal(cellTooltipText({ stay: { note: 'late arrival' } }, 'stay.note'), 'late arrival');
  assert.equal(cellTooltipText({ stay: null }, 'stay.note'), null);
});

test('no tooltipPath or an empty field means no tooltip', () => {
  assert.equal(cellTooltipText({ a: 'x' }, null), null);
  assert.equal(cellTooltipText({ a: 'x' }, ''), null);
  assert.equal(cellTooltipText({ a: '  ' }, 'a'), null);
  assert.equal(cellTooltipText({}, 'missing'), null);
});

test('numbers and status-like objects render as text', () => {
  assert.equal(cellTooltipText({ n: 0 }, 'n'), '0');
  assert.equal(cellTooltipText({ s: { message: 'Paid' } }, 's'), 'Paid');
});
