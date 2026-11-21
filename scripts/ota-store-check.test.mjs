import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { strandedStores, warningFor } from './ota-store-check.mjs';

test('a store with the same version as the runtime is not stranded', () => {
  assert.deepEqual(strandedStores('1.0.1', { 'Google Play': '1.0.1', 'the App Store': '1.0.1' }), []);
});

test('a store still on the previous version is stranded, each one named', () => {
  assert.deepEqual(strandedStores('1.0.1', { 'Google Play': '1.0.0', 'the App Store': '1.0.1' }), [
    { store: 'Google Play', live: '1.0.0' },
  ]);
});

test('an unknown live version counts as stranded (never silently fine)', () => {
  assert.deepEqual(strandedStores('1.0.1', { 'the App Store': null }), [{ store: 'the App Store', live: null }]);
});

test('the warning says who misses the update and what to do', () => {
  const w = warningFor('1.0.1', { store: 'Google Play', live: '1.0.0' });
  assert.match(w, /for app 1\.0\.1, but Google Play has app 1\.0\.0/);
  assert.match(w, /will NOT get it/);
  assert.match(w, /RELEASE\.md/);
});

test('the CLI warns (GitHub annotation) and never fails', () => {
  const out = execFileSync(process.execPath, ['scripts/ota-store-check.mjs', '--offline'], { encoding: 'utf8' });
  assert.ok(out.includes('::warning') || out.includes('is live in every store'), out);
});
