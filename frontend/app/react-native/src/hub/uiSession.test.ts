import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotateUiSessionId, uiSessionId } from './uiSession.ts';

test('sign-out draws a new session id: who signs in next is not the same session to the server', async () => {
  const data = new Map<string, string>();
  const store = { get: async (k: string) => data.get(k) ?? null, set: async (k: string, v: string) => void data.set(k, v), remove: async (k: string) => void data.delete(k) };
  const first = await uiSessionId(store, 'a', () => 'one');
  const next = await rotateUiSessionId(store, 'a', () => 'two');
  assert.equal(first, 'one');
  assert.equal(next, 'two');
  assert.equal(await uiSessionId(store, 'a', () => 'three'), 'two');
});

test('a failing store never blocks the session id: a fresh one is drawn', async () => {
  const broken = { get: async () => { throw new Error('locked'); }, set: async () => { throw new Error('locked'); }, remove: async () => {} };
  assert.equal(await uiSessionId(broken, 'a', () => 'fresh'), 'fresh');
  const unwritable = { get: async () => null, set: async () => { throw new Error('full'); }, remove: async () => {} };
  assert.equal(await uiSessionId(unwritable, 'a', () => 'kept'), 'kept');
  assert.equal(await rotateUiSessionId(unwritable, 'a', () => 'rotated'), 'rotated');
});

test('without a maker the session id is a random uuid, distinct per draw', async () => {
  const data = new Map<string, string>();
  const store = { get: async (k: string) => data.get(k) ?? null, set: async (k: string, v: string) => void data.set(k, v), remove: async () => {} };
  const a = await uiSessionId(store, 'x');
  const b = await rotateUiSessionId(store, 'x');
  assert.match(a, /^[0-9a-f-]{36}$/i);
  assert.notEqual(a, b);
});
