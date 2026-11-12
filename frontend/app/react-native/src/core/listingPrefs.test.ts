import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { KeyValueStore } from './sessionId.ts';
import { clearListingPrefs, listingPrefsKey, loadListingPrefs, persistListingPrefs, sanitizeListingPrefs } from './listingPrefs.ts';
import { ColumnPrefsStore } from '../renderer/columnPrefs.ts';
import { SavedViewsStore } from '../renderer/savedViews.ts';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
}

/** One app run: fresh in-memory stores, restored from the device, writing back to it. */
async function run(device: KeyValueStore, ui: string) {
  const columns = new ColumnPrefsStore();
  const views = new SavedViewsStore();
  const persisted = persistListingPrefs(columns, views, device, ui, await loadListingPrefs(device, ui));
  return { columns, views, persisted };
}

test('listing prefs: saved views and hidden columns outlive the app run', async () => {
  const device = memoryStore();
  const first = await run(device, 'u1');
  first.columns.set('orders', ['notes', 'created']);
  first.views.save('orders', { name: 'Palma', values: { city: 'Palma', amount_from: 10 } });
  first.views.save('orders', { name: 'Big', values: { amount_from: 1000 } });
  first.views.setDefault('orders', 'Big');
  await first.persisted.flushed();

  const second = await run(device, 'u1');
  assert.deepEqual(second.columns.get('orders'), ['notes', 'created']);
  assert.deepEqual(second.views.list('orders').map((v) => v.name), ['Palma', 'Big']);
  assert.equal(second.views.defaultView('orders')?.name, 'Big');
  assert.deepEqual(second.views.list('orders')[0].values, { city: 'Palma', amount_from: 10 });

  // the last change wins, deletions too
  second.views.delete('orders', 'Palma');
  second.columns.set('orders', []);
  await second.persisted.flushed();
  const third = await run(device, 'u1');
  assert.deepEqual(third.views.list('orders').map((v) => v.name), ['Big']);
  assert.deepEqual(third.columns.get('orders'), []);
});

test('listing prefs: one record per UI, and removing the UI clears only its own', async () => {
  const device = memoryStore();
  const a = await run(device, 'a');
  const b = await run(device, 'b');
  a.columns.set('people', ['email']);
  b.columns.set('people', ['phone']);
  await a.persisted.flushed();
  await b.persisted.flushed();
  assert.deepEqual((await run(device, 'a')).columns.get('people'), ['email']);
  assert.deepEqual((await run(device, 'b')).columns.get('people'), ['phone']);

  await clearListingPrefs(device, 'a');
  assert.equal(device.data.has(listingPrefsKey('a')), false);
  assert.deepEqual((await run(device, 'a')).columns.get('people'), []);
  assert.deepEqual((await run(device, 'b')).columns.get('people'), ['phone']);
});

test('listing prefs: a damaged or failing store yields nothing, never an error', async () => {
  const device = memoryStore();
  device.data.set(listingPrefsKey('x'), '{not json');
  assert.deepEqual(await loadListingPrefs(device, 'x'), { columns: {}, views: {} });
  const failing: KeyValueStore = {
    get: async () => { throw new Error('boom'); },
    set: async () => { throw new Error('full'); },
    remove: async () => { throw new Error('boom'); },
  };
  assert.deepEqual(await loadListingPrefs(failing, 'x'), { columns: {}, views: {} });
  await clearListingPrefs(failing, 'x');
  const columns = new ColumnPrefsStore();
  const persisted = persistListingPrefs(columns, new SavedViewsStore(), failing, 'x', { columns: {}, views: {} });
  columns.set('l', ['a']);
  await persisted.flushed(); // a failing write is swallowed
  assert.deepEqual(columns.get('l'), ['a']);
});

test('listing prefs: stored data is re-validated', () => {
  assert.deepEqual(
    sanitizeListingPrefs({
      columns: { ok: ['a', 3, 'b'], bad: 'x', empty: [] },
      views: {
        l: [{ name: 'A', values: { a: 1 }, isDefault: true }, { name: '', values: {} }, { name: 'B' }, 'junk', { name: 'C', values: { c: 1 }, isDefault: 'yes' }],
      },
    }),
    { columns: { ok: ['a', 'b'] }, views: { l: [{ name: 'A', values: { a: 1 }, isDefault: true }, { name: 'C', values: { c: 1 } }] } },
  );
  assert.deepEqual(sanitizeListingPrefs(null), { columns: {}, views: {} });
  assert.deepEqual(sanitizeListingPrefs([1, 2]), { columns: {}, views: {} });
});

test('listing prefs: the initial record follows the changes (a session rebuilt in the same run)', async () => {
  const device = memoryStore();
  const initial = await loadListingPrefs(device, 'u');
  const columns = new ColumnPrefsStore();
  persistListingPrefs(columns, new SavedViewsStore(), device, 'u', initial);
  columns.set('l', ['x']);
  const rebuilt = new ColumnPrefsStore();
  persistListingPrefs(rebuilt, new SavedViewsStore(), device, 'u', initial);
  assert.deepEqual(rebuilt.get('l'), ['x']);
});
