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
