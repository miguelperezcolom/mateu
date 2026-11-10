import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setAppLocale } from './money.ts';
import { humanizeConstant, lookupLabelOf, optionLabelOf, readOnlyFieldText, readOnlyStatus, toneOfStatusWord } from './readOnlyDisplay.ts';

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
];

test('a read-only amount is formatted in the UI locale, whichever channel says money', () => {
  setAppLocale('en');
  assert.equal(readOnlyFieldText({ dataType: 'money' }, 249), '249.00');
  assert.equal(readOnlyFieldText({ dataType: 'number', stereotype: 'money' }, 249), '249.00');
  setAppLocale('es');
  assert.match(readOnlyFieldText({ stereotype: 'money' }, 89.5), /^89,50$/);
  setAppLocale(undefined);
});

test('a read-only date reads in the UI locale, like its listing column', () => {
  setAppLocale('es-ES');
  assert.equal(readOnlyFieldText({ dataType: 'date' }, '2026-11-05'), '5/11/2026');
  assert.equal(readOnlyFieldText({ dataType: 'string' }, '2026-11-05'), '2026-11-05');
  setAppLocale(undefined);
});

test('a value among the options shows the option label, not its code', () => {
  assert.equal(readOnlyFieldText({ options: statusOptions }, 'OUT_OF_STOCK'), 'Out of stock');
  // == : a number matches its option's string value
  assert.equal(optionLabelOf({ options: [{ value: '3', label: 'Three' }] }, 3), 'Three');
  assert.equal(readOnlyFieldText({ options: statusOptions }, 'GONE'), 'GONE');
  assert.equal(readOnlyFieldText({}, 'plain'), 'plain');
  assert.equal(readOnlyFieldText({}, null), '');
});

test('a status is a tone chip: label from the options, else the words; tone from its meaning', () => {
  assert.deepEqual(readOnlyStatus({ options: statusOptions }, 'AVAILABLE'), { label: 'Available', tone: 'success' });
  assert.deepEqual(readOnlyStatus({}, 'OUT_OF_STOCK'), { label: 'Out of stock', tone: 'neutral' });
  assert.deepEqual(readOnlyStatus({}, 'in-progress'), { label: 'In progress', tone: 'warning' });
  assert.deepEqual(readOnlyStatus({}, 'FAILED'), { label: 'Failed', tone: 'danger' });
  assert.deepEqual(readOnlyStatus({}, { type: 'WARNING', message: 'Low' }), { label: 'Low', tone: 'warning' });
  assert.equal(readOnlyStatus({}, ''), null);
});

test('status words and constants', () => {
  assert.equal(toneOfStatusWord('Available'), 'success');
  assert.equal(toneOfStatusWord('InProgress'), 'warning');
  assert.equal(humanizeConstant('OutOfStock'), 'Out of stock');
  assert.equal(humanizeConstant('ROOM1'), 'Room 1');
});

test('a lookup shows the label the server sent beside its value', () => {
  assert.equal(lookupLabelOf({ 'guestId-label': 'Alan Turing' }, {}, 'guestId'), 'Alan Turing');
  assert.equal(lookupLabelOf(null, { 'guestId-label': 'Ada' }, 'guestId'), 'Ada');
  assert.equal(lookupLabelOf({}, {}, 'guestId'), undefined);
});
