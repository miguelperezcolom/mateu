import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellText } from './cellText.ts';

const labels = { IN_HOUSE: 'In house', DEPARTED: 'Checked out' };

test('an enum column shows the label of the raw value', () => {
  assert.equal(cellText('IN_HOUSE', labels), 'In house');
  assert.equal(cellText('DEPARTED', labels), 'Checked out');
});

test('a value without a label, or a column without labels, shows as is', () => {
  assert.equal(cellText('DUE_OUT', labels), 'DUE_OUT');
  assert.equal(cellText('IN_HOUSE'), 'IN_HOUSE');
  assert.equal(cellText(42, null), '42');
});

test('empty and structured values', () => {
  assert.equal(cellText(null, labels), '');
  assert.equal(cellText(undefined), '');
  assert.equal(cellText({ message: 'Open' }, labels), 'Open');
});
