import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageLoadReducer, initialImageState, remoteUriOf, type ImageLoadEvent, type ImageLoadState } from './imageLoadState.ts';

const run = (start: ImageLoadState, ...events: Exclude<ImageLoadEvent['type'], 'source'>[]) =>
  events.reduce<ImageLoadState>((s, type) => imageLoadReducer(s, { type } as ImageLoadEvent), start);

test('a url or a data uri loads; a bundled asset or no source is there already', () => {
  assert.equal(initialImageState({ uri: 'https://x/a.png' }), 'loading');
  assert.equal(initialImageState({ uri: 'data:image/png;base64,AAAA' }), 'loading');
  assert.equal(initialImageState([{ uri: 'https://x/a.png' }]), 'loading');
  assert.equal(initialImageState(12), 'loaded', 'require(...) is a number');
  assert.equal(initialImageState({ uri: '' }), 'loaded');
  assert.equal(initialImageState(undefined), 'loaded');
  assert.equal(remoteUriOf({ uri: ' ' }), null);
  assert.equal(remoteUriOf({ uri: 'https://x/a.png' }), 'https://x/a.png');
});

test('load → the picture; error → the broken mark, even if end follows', () => {
  assert.equal(run('loading', 'start', 'load', 'end'), 'loaded');
  assert.equal(run('loading', 'start', 'error', 'end'), 'error');
});

test('an end without load (a platform that skips it on a cache hit) settles as loaded', () => {
  assert.equal(run('loading', 'end'), 'loaded');
});

test('a cache hit re-firing start keeps a loaded image; a retry after a failure starts over', () => {
  assert.equal(run('loaded', 'start'), 'loaded');
  assert.equal(run('error', 'start'), 'loading');
});

test('a new source starts over', () => {
  assert.equal(imageLoadReducer('error', { type: 'source', source: { uri: 'https://x/b.png' } }), 'loading');
  assert.equal(imageLoadReducer('loading', { type: 'source', source: 7 }), 'loaded');
});
