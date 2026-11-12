import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toastLifetime } from './toastLifetime.ts';

test('an error stays until dismissed, whatever duration it arrived with', () => {
  assert.equal(toastLifetime('error'), 0);
  assert.equal(toastLifetime('error', { duration: 30000 }), 0);
});

test('the rest go away on their own; longer when they can be undone', () => {
  assert.equal(toastLifetime('info'), 4000);
  assert.equal(toastLifetime('info', { undo: {} }), 10000);
  assert.equal(toastLifetime('warning', { duration: 3000 }), 3000);
});

test('an actionable toast never stays less than 10 s, and stays while a screen reader is on (WCAG 2.2.1)', () => {
  assert.equal(toastLifetime('info', { undo: {}, duration: 3000 }), 10000);
  assert.equal(toastLifetime('info', { undo: {}, duration: 30000 }), 30000);
  assert.equal(toastLifetime('info', { undo: {}, screenReader: true }), 0);
  assert.equal(toastLifetime('info', { screenReader: true }), 4000, 'a plain toast keeps its clock');
});
