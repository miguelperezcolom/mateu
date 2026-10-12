import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CUSTOM, initialPicks, mergeParameters, mergeSummary, mergedValue, pickLabel, summaryText, valueText, visibleFields,
  type RecordMergeMeta,
} from './recordMerge.ts';

const merge: RecordMergeMeta = {
  title: 'Duplicate guests',
  records: [{ id: 'a', label: 'Profile 1021' }, { id: 'b', label: 'Profile 3388' }],
  fields: [
    { fieldId: 'name', label: 'Name', values: ['Ana García', 'Ana García'], chosen: 'a', differs: false },
    { fieldId: 'email', label: 'Email', values: [null, 'ana@example.com'], chosen: 'b', differs: true },
    { fieldId: 'phone', label: 'Phone', values: ['+34 600', '+34 611'], editable: true, differs: true },
  ],
  mergeActionId: 'mergeProfiles',
  parameters: { survivor: 'a' },
};

test('starts from the server picks, else from the first record with a value', () => {
  assert.deepEqual(initialPicks(merge), { name: 'a', email: 'b', phone: 'a' });
});

test('takes each value from the record picked, or what was typed', () => {
  const picks = { name: 'a', email: 'b', phone: CUSTOM };
  assert.equal(mergedValue(merge, merge.fields![1], picks, {}), 'ana@example.com');
  assert.equal(mergedValue(merge, merge.fields![2], picks, { phone: '+34 622' }), '+34 622');
});

test('sends the component parameters with _merged and _choices (same as the web)', () => {
  assert.deepEqual(mergeParameters(merge, { name: 'a', email: 'b', phone: CUSTOM }, { phone: '+34 622' }), {
    survivor: 'a',
    _merged: { name: 'Ana García', email: 'ana@example.com', phone: '+34 622' },
    _choices: { name: 'a', email: 'b', phone: 'custom' },
  });
});

test('can show only the rows that differ, and sums them up', () => {
  assert.deepEqual(visibleFields(merge, true).map((f) => f.fieldId), ['email', 'phone']);
  assert.equal(visibleFields(merge, false).length, 3);
  const s = mergeSummary(merge, { phone: CUSTOM });
  assert.deepEqual(s, { fields: 3, differ: 2, custom: 1 });
  assert.equal(summaryText(s), '3 fields: 2 differ; 1 typed by hand');
});

test('names each pick for a screen reader and shows any value as text', () => {
  assert.equal(pickLabel('Profile 1021', 'Email'), 'Use value from Profile 1021 for Email');
  assert.equal(valueText(null), '');
  assert.equal(valueText(true), 'true');
  assert.equal(valueText({ a: 1 }), '{"a":1}');
});
