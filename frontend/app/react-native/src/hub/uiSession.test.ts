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
