import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpolateUrlWith } from './urlTemplate.ts';

// A minimal evaluator for dotted paths (state.id, appState.base) — the real one lives in
// expressions.ts, which node cannot type-strip.
const interpolateUrl = (t: string, ctx: Record<string, unknown>): string =>
  interpolateUrlWith(t, (expr) => expr.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown> | undefined)?.[k], ctx));

// Same cases as the server (TemplateInterpolatorUrlTest) and libs/mateu (interpolateUrl.test.ts):
// a direct fetch from the app must reach the url the proxied one would.
test('a path value cannot add segments or a query', () => {
  assert.equal(
    interpolateUrl('https://api.example.com/people/${state.id}', { state: { id: '1/../../admin?x=' } }),
    'https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D',
  );
});

test('a query value cannot add parameters', () => {
  assert.equal(
    interpolateUrl('/search?q=${state.q}&page=1', { state: { q: 'a b&page=99#frag' } }),
    '/search?q=a%20b%26page%3D99%23frag&page=1',
  );
});

test('reserved and unicode characters are encoded like the server does', () => {
  assert.equal(
    interpolateUrl('/x/${state.v}', { state: { v: "Ñandú !'()*~._-" } }),
    '/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-',
  );
});

test('client state cannot choose the origin; a configured one is raw', () => {
  assert.throws(() => interpolateUrl('${state.base}/people', { state: { base: 'http://169.254.169.254' } }));
  assert.throws(() => interpolateUrl('https://${state.host}/people', { state: { host: 'evil' } }));
  assert.equal(
    interpolateUrl('${appState.base}/people/${state.id}', { state: { id: 7 }, appState: { base: 'https://h/v1' } }),
    'https://h/v1/people/7',
  );
});

test('a dot segment is refused in the path but not in the query', () => {
  assert.throws(() => interpolateUrl('/people/${state.id}', { state: { id: '..' } }));
  assert.equal(interpolateUrl('/people?id=${state.id}', { state: { id: '..' } }), '/people?id=..');
});
