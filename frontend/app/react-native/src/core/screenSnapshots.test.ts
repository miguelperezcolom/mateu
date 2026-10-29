import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_SNAPSHOTS, MAX_SNAPSHOT_CHARS, ScreenSnapshots, snapshotOf } from './screenSnapshots.ts';
import type { KeyValueStore } from './sessionId.ts';

const memory = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
};

test('a snapshot keeps the fragments and app state, never what ACTS (commands, messages)', () => {
  const increment = { fragments: [{ component: { type: 'X' } }], commands: [{ type: 'NavigateTo' }], messages: [{ text: 'Saved' }], appState: { a: 1 } };
  assert.deepEqual(snapshotOf(increment), { fragments: [{ component: { type: 'X' } }], commands: [], messages: [], appState: { a: 1 } });
  assert.equal(snapshotOf({ fragments: [] }), null);
  assert.equal(snapshotOf(null), null);
});

test('put/get round trip per UI; another UI does not see it; clear drops them all', async () => {
  const store = memory();
  const a = new ScreenSnapshots(store, 'ui-a');
  const b = new ScreenSnapshots(store, 'ui-b');
  const key = a.keyOf('people', '_empty', '');
  await a.put(key, { fragments: [{ id: 1 }], commands: [{ type: 'RunJS' }] });
  assert.deepEqual(await a.get(key), { fragments: [{ id: 1 }], commands: [], messages: [] });
  assert.equal(await b.get(b.keyOf('people', '_empty', '')), null);
  await a.clear();
  assert.equal(await a.get(key), null);
  assert.equal([...store.data.keys()].some((k) => k.includes('ui-a')), false);
});

test('at most MAX_SNAPSHOTS per UI (the oldest goes) and nothing over MAX_SNAPSHOT_CHARS', async () => {
  const store = memory();
  const s = new ScreenSnapshots(store, 'ui');
  for (let i = 0; i <= MAX_SNAPSHOTS; i++) await s.put(s.keyOf(`r${i}`, '', ''), { fragments: [{ i }] });
  assert.equal(await s.get(s.keyOf('r0', '', '')), null);
  assert.ok(await s.get(s.keyOf(`r${MAX_SNAPSHOTS}`, '', '')));
  await s.put(s.keyOf('big', '', ''), { fragments: [{ text: 'x'.repeat(MAX_SNAPSHOT_CHARS) }] });
  assert.equal(await s.get(s.keyOf('big', '', '')), null);
});
