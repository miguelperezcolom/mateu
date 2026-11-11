import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ColumnPrefsStore, moveColumn, orderColumns } from './columnPrefs.ts';
import { SavedViewsStore } from './savedViews.ts';
import { listingScopeOf } from './persistedScopes.ts';
import type { KeyValueStore } from '../core/sessionId.ts';

/** An in-memory stand-in for AsyncStorage. */
const memoryKv = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => {
      data.set(k, v);
    },
    remove: async (k) => {
      data.delete(k);
    },
  };
};

const flush = () => new Promise((r) => setTimeout(r, 0));

test('saved views survive a restart: stored per UI, loaded when the next run attaches', async () => {
  const kv = memoryKv();
  const first = new SavedViewsStore();
  await first.attach(kv, 'https://a.example');
  first.save('orders#list', { name: 'Open', values: { status: 'OPEN' }, isDefault: true });
  await flush();
  assert.ok(kv.data.has('mateu-saved-views:https://a.example'));

  // the next run: a fresh store, same UI
  const next = new SavedViewsStore();
  let heard = 0;
  next.subscribe(() => heard++);
  await next.attach(kv, 'https://a.example');
  assert.deepEqual(next.list('orders#list').map((v) => v.name), ['Open']);
  assert.equal(next.defaultView('orders#list')?.name, 'Open');
  assert.equal(heard, 1);

  // another UI does not see them
  const other = new SavedViewsStore();
  await other.attach(kv, 'https://b.example');
  assert.deepEqual(other.list('orders#list'), []);
});

test('deleting the last view removes the stored key; unreadable storage keeps the session going', async () => {
  const kv = memoryKv();
  const store = new SavedViewsStore();
  await store.attach(kv, 'ui');
  store.save('s', { name: 'A', values: { a: 1 } });
  store.delete('s', 'A');
  await flush();
  assert.equal(kv.data.size, 0);

  const broken: KeyValueStore = { get: async () => '{not json', set: async () => { throw new Error('full'); }, remove: async () => {} };
  const resilient = new SavedViewsStore();
  await resilient.attach(broken, 'ui');
  resilient.save('s', { name: 'B', values: { b: 1 } });
  await flush();
  assert.deepEqual(resilient.list('s').map((v) => v.name), ['B']);
});

test('what this run chose before the stored choices landed is not overwritten by them', async () => {
  const kv = memoryKv();
  kv.data.set('mateu-column-prefs:ui', JSON.stringify({ s: { hidden: ['old'] }, t: { hidden: ['city'] } }));
  const prefs = new ColumnPrefsStore();
  prefs.set('s', ['new']);
  await prefs.attach(kv, 'ui');
  assert.deepEqual(prefs.get('s'), ['new']);
  assert.deepEqual(prefs.get('t'), ['city']);
});

test('column prefs persist the hidden columns AND the order', async () => {
  const kv = memoryKv();
  const prefs = new ColumnPrefsStore();
  await prefs.attach(kv, 'ui');
  prefs.set('s', ['amount']);
  prefs.setOrder('s', ['city', 'name']);
  await flush();
  const next = new ColumnPrefsStore();
  await next.attach(kv, 'ui');
  assert.deepEqual(next.get('s'), ['amount']);
  assert.deepEqual(next.order('s'), ['city', 'name']);
  next.set('s', []);
  next.setOrder('s', []);
  await flush();
  assert.equal(kv.data.size, 0);
});

const cols = (...ids: string[]) => ids.map((fieldId) => ({ fieldId }));

test('orderColumns: the order first, the rest after in declared order, the first column pinned', () => {
  const declared = cols('id', 'name', 'city', 'amount');
  assert.deepEqual(orderColumns(declared, ['amount', 'name']).map((c) => c.fieldId), ['id', 'amount', 'name', 'city']);
  // the identity column cannot be moved; unknown ids are ignored; no order = declared
  assert.deepEqual(orderColumns(declared, ['id', 'gone', 'city']).map((c) => c.fieldId), ['id', 'city', 'name', 'amount']);
  assert.equal(orderColumns(declared, []), declared);
});

test('moveColumn: one place up or down, never past the pinned first column or the end', () => {
  const ids = ['id', 'name', 'city', 'amount'];
  assert.deepEqual(moveColumn(ids, 'city', -1), ['id', 'city', 'name', 'amount']);
  assert.deepEqual(moveColumn(ids, 'city', 1), ['id', 'name', 'amount', 'city']);
  assert.deepEqual(moveColumn(ids, 'name', -1), ids);
  assert.deepEqual(moveColumn(ids, 'amount', 1), ids);
  assert.deepEqual(moveColumn(ids, 'id', 1), ids);
});

test('a listing scope names the route and the listing', () => {
  assert.equal(listingScopeOf('/orders/', 'list'), 'orders#list');
  assert.equal(listingScopeOf(undefined, null), '#');
});
