import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMultiValued, pickedStrings, pickedValue, pickedValues, widgetOptionsOf } from './fieldOptions.ts';

// a REST source's shape: ids are numbers
const MISSIONS = [{ value: 7, label: 'Apollo 11' }, { value: 25, label: 'Artemis III' }];

test('multi-valued: a multiSelect always, a list box / combobox / checkbox group when the field is a collection', () => {
  assert.equal(isMultiValued('string', 'multiSelect'), true);
  assert.equal(isMultiValued('array', 'listBox'), true);
  assert.equal(isMultiValued('array', 'combobox'), true);
  assert.equal(isMultiValued('array', 'checkbox'), true);
  assert.equal(isMultiValued(undefined, 'listBox', [1]), true);
  assert.equal(isMultiValued('string', 'listBox'), false);
  assert.equal(isMultiValued('string', 'combobox'), false);
  assert.equal(isMultiValued('array', 'grid'), false);
});

test('the widget gets string values; a pick goes back as the options\' own values', () => {
  assert.deepEqual(widgetOptionsOf(MISSIONS), [{ value: '7', label: 'Apollo 11' }, { value: '25', label: 'Artemis III' }]);
  assert.deepEqual(pickedValues(MISSIONS, ['25', '7']), [25, 7]);
  assert.equal(pickedValue(MISSIONS, '7'), 7);
  // a value no option has stays as it was typed
  assert.deepEqual(pickedValues(MISSIONS, ['99']), ['99']);
  assert.deepEqual(widgetOptionsOf(null), []);
});

test('the current value as the widget\'s string list', () => {
  assert.deepEqual(pickedStrings([25, 7]), ['25', '7']);
  assert.deepEqual(pickedStrings('A, B'), ['A', 'B']);
  assert.deepEqual(pickedStrings(25), ['25']);
  assert.deepEqual(pickedStrings(''), []);
  assert.deepEqual(pickedStrings(null), []);
  assert.deepEqual(pickedStrings([null, 3]), ['3']);
});
