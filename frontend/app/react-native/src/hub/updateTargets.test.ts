import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_STORE_URL, DOCS_URL, GITHUB_RELEASES_URL, PLAY_URL, storeUrlFor } from './updateTargets.ts';

test('a store build updates from its store; the GitHub APK from the releases page', () => {
  assert.equal(storeUrlFor('ios', undefined), APP_STORE_URL);
  assert.equal(storeUrlFor('android', undefined), PLAY_URL);
  assert.equal(storeUrlFor('android', 'github'), GITHUB_RELEASES_URL);
  assert.equal(storeUrlFor('web', undefined), DOCS_URL);
});
