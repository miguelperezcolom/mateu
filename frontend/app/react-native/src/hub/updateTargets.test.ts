import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_STORE_URL, DOCS_URL, GITHUB_RELEASES_URL, PLAY_URL, distributionOf, storeUrlFor, updateChannelFor } from './updateTargets.ts';

test('a store build updates from its store; the GitHub APK from the releases page', () => {
  assert.equal(storeUrlFor('ios', undefined), APP_STORE_URL);
  assert.equal(storeUrlFor('android', undefined), PLAY_URL);
  assert.equal(storeUrlFor('android', 'github'), GITHUB_RELEASES_URL);
  assert.equal(storeUrlFor('web', undefined), DOCS_URL);
});

// GA review S8: an over-the-air update carries ITS OWN app config, published once for the whole
// channel — so `extra.distribution` cannot say where THIS binary came from. The update channel is
// native configuration of the binary (an update cannot change it): the GitHub APK asks for its own.
test('the GitHub APK asks for its own update channel; every other build for production', () => {
  assert.equal(updateChannelFor('github'), 'github');
  assert.equal(updateChannelFor(undefined), 'production');
  assert.equal(updateChannelFor('play'), 'production');
});

test("the binary's channel decides the distribution, whatever the running update's config says", () => {
  // the APK, after an over-the-air update published with no MATEU_DISTRIBUTION
  assert.equal(distributionOf('github', {}), 'github');
  assert.equal(storeUrlFor('android', distributionOf('github', {})), GITHUB_RELEASES_URL);
  // a store build
  assert.equal(distributionOf('production', {}), undefined);
  // no channel (a development build): the build's own stamp
  assert.equal(distributionOf(null, { distribution: 'github' }), 'github');
  assert.equal(distributionOf(undefined, { distribution: 42 }), undefined);
});
