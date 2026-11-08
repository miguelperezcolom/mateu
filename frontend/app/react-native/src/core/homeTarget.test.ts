import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remoteHomeBaseUrl } from './homeTarget.ts';

test('a shell opened on a remote screen loads its home from the remote', () => {
  assert.equal(remoteHomeBaseUrl({ homeBaseUrl: 'http://inventory:8641/inventory' }, 'http://host:8640/fed'), 'http://inventory:8641/inventory');
});

test('an app\'s own home (relative, or its own absolute base) stays on the app\'s backend', () => {
  assert.equal(remoteHomeBaseUrl({ homeBaseUrl: '/fed' }, 'http://host:8640/fed'), undefined);
  assert.equal(remoteHomeBaseUrl({ homeBaseUrl: 'http://host:8640/fed/' }, 'http://host:8640/fed'), undefined);
  assert.equal(remoteHomeBaseUrl({}, 'http://host:8640/fed'), undefined);
});
