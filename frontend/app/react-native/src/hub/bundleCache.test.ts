import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

mock.module('react-native', { namedExports: { Platform: { OS: 'ios' } } });
const { cachedStaticBundle } = await import('./bundleCache.ts');
type Store = Parameters<typeof cachedStaticBundle>[2] extends infer D ? NonNullable<D extends { store?: infer S } ? S : never> : never;

const BASE = 'https://rw.example.com';
const manifestText = JSON.stringify({
  entries: [{ route: '/', syncPath: '_no_route', ok: true, json: JSON.stringify({ fragments: [] }) }],
  routes: { routes: [{ route: '' }] },
});

const memoryStore = () => {
  const data = new Map<string, { text: string; etag?: string }>();
  const store: Store = {
    get: async (k) => data.get(k) ?? null,
    put: async (k, text, etag) => void data.set(k, { text, etag }),
    remove: async (k) => void data.delete(k),
  };
  return { data, store };
};

test('first open downloads the bundle and keeps it with its ETag', async () => {
  const { data, store } = memoryStore();
  let calls = 0;
  const found = await cachedStaticBundle(BASE, 'manifest.json', {
    store,
    fetch: async () => {
      calls++;
      return { ok: true, bundle: {} as never, text: manifestText, etag: '"v1"' };
    },
  });
  assert.equal(found.ok, true);
  assert.equal(calls, 1);
  assert.deepEqual([...data.values()][0], { text: manifestText, etag: '"v1"' });
});

test('next open answers from the device at once and revalidates with If-None-Match in the background', async () => {
  const { data, store } = memoryStore();
  await store.put(`${BASE}|manifest.json`, manifestText, '"v1"');
  const sent: (string | undefined)[] = [];
  let revalidated: (outcome: string) => void = () => {};
  const done = new Promise<string>((r) => (revalidated = r));
  const found = await cachedStaticBundle(BASE, 'manifest.json', {
    store,
    fetch: async (_b, _p, options) => {
      sent.push(options?.ifNoneMatch);
      return { ok: true, bundle: {} as never, text: manifestText.replace('_no_route', '_x'), etag: '"v2"' };
    },
    onRevalidated: revalidated,
  });
  assert.equal(found.ok, true);
  assert.equal(await done, 'updated');
  assert.deepEqual(sent, ['"v1"']);
  assert.equal([...data.values()][0].etag, '"v2"');
});

test('a 304 keeps the copy as it is; a broken copy is downloaded again', async () => {
  const { data, store } = memoryStore();
  await store.put(`${BASE}|manifest.json`, manifestText, '"v1"');
  let revalidated: (outcome: string) => void = () => {};
  const done = new Promise<string>((r) => (revalidated = r));
  await cachedStaticBundle(BASE, 'manifest.json', {
    store,
    fetch: async () => ({ ok: false, reason: 'Not modified.', notModified: true }),
    onRevalidated: revalidated,
  });
  assert.equal(await done, 'notModified');
  assert.equal([...data.values()][0].etag, '"v1"');

  await store.put(`${BASE}|manifest.json`, '{broken', '"v1"');
  let fetched = 0;
  await cachedStaticBundle(BASE, 'manifest.json', {
    store,
    fetch: async () => {
      fetched++;
      return { ok: true, bundle: {} as never, text: manifestText, etag: '"v3"' };
    },
  });
  assert.equal(fetched, 1);
});
