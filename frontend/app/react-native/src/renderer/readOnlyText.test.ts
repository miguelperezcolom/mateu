import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showsAsReadOnlyText } from './readOnlyText.ts';

test('a read-only number is text, step buttons or not (it was a greyed −/+ stepper)', () => {
  assert.equal(showsAsReadOnlyText(false, 'integer', ''), true);
  assert.equal(showsAsReadOnlyText(false, 'integer', 'regular'), true);
});

test('an editable field keeps its input', () => {
  assert.equal(showsAsReadOnlyText(true, 'integer', ''), false);
});

test('non text-like widgets keep their own read-only rendering', () => {
  assert.equal(showsAsReadOnlyText(false, 'bool', ''), false);
  assert.equal(showsAsReadOnlyText(false, 'string', 'richText'), false);
});
