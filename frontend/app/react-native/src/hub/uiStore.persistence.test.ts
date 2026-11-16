import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTRIES_KEY,
  MAX_STORED_ICON,
  PREVIOUS_KEY,
  SEEDED_KEY,
  UNREADABLE_KEY,
  UiStore,
  entryKeys,
  healthNotice,
} from './uiStore.ts';
import type { KeyValueStore } from '../core/sessionId.ts';

// Keeping "My UIs": a list that cannot be read is never written over, the list key stays small
// (icons and manifests on their own keys), and the value a write replaces is kept as a copy.

type Memory = KeyValueStore & { data: Record<string, string>; failGet: Set<string>; failSet: Set<string>; getCalls: string[] };

const memory = (seed: Record<string, string> = {}): Memory => {
  const data = { ...seed };
  const failGet = new Set<string>();
  const failSet = new Set<string>();
  const getCalls: string[] = [];
  return {
    data,
    failGet,
    failSet,
    getCalls,
    get: async (k) => {
      getCalls.push(k);
      if (failGet.has(k)) throw new Error('Row too big to fit into CursorWindow');
      return data[k] ?? null;
    },
    set: async (k, v) => {
      if (failSet.has(k)) throw new Error('disk full');
      data[k] = v;
    },
    remove: async (k) => {
      delete data[k];
    },
  };
};

const make = (meta: Memory) => {
  let n = 0;
  let t = 1000;
  return new UiStore(meta, memory(), () => ++t, () => `id${++n}`);
};

const listOf = (...urls: string[]) => JSON.stringify(urls.map((u, i) => ({ id: `e${i}`, baseUrl: u, name: `UI ${i}`, addedAt: i })));

test('a list whose read fails is never written over: the copy is shown, writes wait for the user', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: 'unreadable on this device', [PREVIOUS_KEY]: listOf('https://a.com', 'https://b.com') });
  meta.failGet.add(ENTRIES_KEY);
  const store = make(meta);
  const list = await store.load();
  assert.deepEqual(list.map((e) => e.baseUrl), ['https://a.com', 'https://b.com']);
  assert.equal(store.health(), 'recovered');
  assert.ok(healthNotice('recovered'));
  // the read was tried twice before giving up
  assert.equal(meta.getCalls.filter((k) => k === ENTRIES_KEY).length, 2);
  // automatic writes (opening a UI, a refreshed manifest) do not touch the stored list
  await store.touch('e0');
  await store.applyManifest('e1', { name: 'Renamed' });
  assert.equal(meta.data[ENTRIES_KEY], 'unreadable on this device');
  assert.equal(store.get('e1')!.name, 'Renamed', 'still applied in memory');
  // the user changing the list is what writes it again
  await store.add('https://c.com');
  assert.deepEqual(JSON.parse(meta.data[ENTRIES_KEY]).map((e: { baseUrl: string }) => e.baseUrl), ['https://a.com', 'https://b.com', 'https://c.com']);
  assert.equal(store.health(), 'ok');
  assert.equal(healthNotice('ok'), undefined);
});

test('a read that fails once is retried, and then the list loads normally', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: listOf('https://a.com') });
  let failures = 1;
  const get = meta.get;
  meta.get = async (k) => {
    if (k === ENTRIES_KEY && failures-- > 0) throw new Error('busy');
    return get(k);
  };
  const store = make(meta);
  assert.deepEqual((await store.load()).map((e) => e.baseUrl), ['https://a.com']);
  assert.equal(store.health(), 'ok');
});

test('a failed read with no copy shows nothing, seeds nothing and writes nothing', async () => {
  const meta = memory({ [ENTRIES_KEY]: 'x' });
  meta.failGet.add(ENTRIES_KEY);
  const store = make(meta);
  assert.deepEqual(await store.load(), []);
  assert.equal(store.health(), 'unreadable');
  assert.ok(healthNotice('unreadable'));
  assert.equal(meta.data[SEEDED_KEY], undefined, 'no demo over a list that may exist');
  assert.equal(meta.data[ENTRIES_KEY], 'x');
});

test('corrupt JSON is put aside once (never replaced) and the copy is loaded', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: '[{"id":"a","baseUrl":"https://a.com"', [PREVIOUS_KEY]: listOf('https://a.com') });
  const store = make(meta);
  assert.deepEqual((await store.load()).map((e) => e.baseUrl), ['https://a.com']);
  assert.equal(meta.data[UNREADABLE_KEY], '[{"id":"a","baseUrl":"https://a.com"');
  assert.equal(store.health(), 'recovered');
  // a second, different corruption does not replace what was put aside first
  const again = memory({ ...meta.data, [ENTRIES_KEY]: '{"other":' });
  await make(again).load();
  assert.equal(again.data[UNREADABLE_KEY], '[{"id":"a","baseUrl":"https://a.com"');
});

test('corrupt JSON with no copy is unreadable, and is written over only by the user', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: '{"not":"a list"}' });
  const store = make(meta);
  assert.deepEqual(await store.load(), []);
  assert.equal(store.health(), 'unreadable');
  assert.equal(meta.data[UNREADABLE_KEY], '{"not":"a list"}');
  await store.importAll(['https://a.com']);
  assert.equal(JSON.parse(meta.data[ENTRIES_KEY]).length, 1);
  assert.equal(meta.data[UNREADABLE_KEY], '{"not":"a list"}', 'the raw text stays aside');
});

test('a missing list with a copy is recovered (not re-seeded)', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [PREVIOUS_KEY]: listOf('https://a.com') });
  const store = make(meta);
  assert.deepEqual((await store.load()).map((e) => e.baseUrl), ['https://a.com']);
  assert.equal(store.health(), 'recovered');
  // a copy that is an empty list is a list the user emptied: a first launch is a first launch
  const empty = memory({ [PREVIOUS_KEY]: '[]' });
  const seeded = make(empty);
  assert.equal((await seeded.load()).length, 1, 'the demo');
  assert.equal(seeded.health(), 'ok');
});

test('each write keeps the value it replaces as the copy', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  await store.add('https://a.com');
  assert.equal(meta.data[PREVIOUS_KEY], undefined, 'nothing to keep before the first write');
  const first = meta.data[ENTRIES_KEY];
  await store.add('https://b.com');
  assert.equal(meta.data[PREVIOUS_KEY], first);
  // a write that changes nothing leaves the copy alone
  const second = meta.data[ENTRIES_KEY];
  await store.reorder(['id1', 'id2']);
  assert.equal(meta.data[PREVIOUS_KEY], first);
  assert.equal(meta.data[ENTRIES_KEY], second);
  // a corrupt list on the next start comes back from the copy
  meta.data[ENTRIES_KEY] = '\u0000garbage';
  const next = make(meta);
  assert.deepEqual((await next.load()).map((e) => e.baseUrl), ['https://a.com']);
});

test('a failing copy write still writes the list; a failing list write keeps it in memory', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  await store.add('https://a.com');
  meta.failSet.add(PREVIOUS_KEY);
  await store.add('https://b.com');
  assert.equal(JSON.parse(meta.data[ENTRIES_KEY]).length, 2);
  meta.failSet.add(ENTRIES_KEY);
  await store.add('https://c.com');
  assert.equal(store.list().length, 3);
  assert.equal(JSON.parse(meta.data[ENTRIES_KEY]).length, 2);
});

test('icons and manifests live on their own keys; the list holds metadata only', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  const bigIcon = 'data:image/png;base64,' + 'A'.repeat(150_000);
  const { entry } = await store.add('https://a.com', { name: 'A', icon: bigIcon, themeColor: '#123456' });
  const stored = meta.data[ENTRIES_KEY];
  assert.ok(stored.length < 500, `list is small (${stored.length} chars)`);
  assert.ok(!stored.includes('base64'));
  assert.equal(meta.data[entryKeys(entry.id).icon], bigIcon);
  assert.equal(JSON.parse(meta.data[entryKeys(entry.id).manifest]).name, 'A');
  // and they come back on the next start
  const next = make(meta);
  const [loaded] = await next.load();
  assert.equal(loaded.icon, bigIcon);
  assert.equal(loaded.manifest?.name, 'A');
  assert.equal(loaded.themeColor, '#123456');
  // a refreshed manifest rewrites them
  await next.applyManifest(entry.id, { name: 'A2' });
  assert.equal(meta.data[entryKeys(entry.id).icon], undefined, 'the new manifest has no icon');
  assert.equal(JSON.parse(meta.data[entryKeys(entry.id).manifest]).name, 'A2');
});

test('an absurdly large icon is not kept', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  const { entry } = await store.add('https://a.com', { name: 'A', icon: 'x'.repeat(MAX_STORED_ICON + 1) });
  assert.equal(entry.icon, undefined);
  assert.equal(meta.data[entryKeys(entry.id).icon], undefined);
});

test('an unreadable or corrupt per-entry key loses only that icon/manifest, never the entry', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: listOf('https://a.com', 'https://b.com') });
  meta.data[entryKeys('e0').manifest] = '{broken';
  meta.data[entryKeys('e1').icon] = 'https://b.com/i.png';
  meta.failGet.add(entryKeys('e1').manifest);
  const list = await make(meta).load();
  assert.equal(list.length, 2);
  assert.equal(list[0].manifest, undefined);
  assert.equal(list[1].icon, 'https://b.com/i.png');
  assert.equal(list[1].manifest, undefined);
});

test('the old one-key format still loads and is split on the first load', async () => {
  const manifest = { name: 'Acme', icon: 'data:image/png;base64,AAAA' };
  const old = JSON.stringify([
    { id: 'a', baseUrl: 'https://acme.com', name: 'Acme', icon: 'data:image/png;base64,AAAA', manifest, addedAt: 5, lastOpened: 9 },
    { id: 'b', baseUrl: 'https://b.com', name: 'B', addedAt: 6 },
  ]);
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: old });
  const store = make(meta);
  const list = await store.load();
  assert.equal(list[0].icon, 'data:image/png;base64,AAAA');
  assert.deepEqual(list[0].manifest, manifest);
  assert.equal(list[0].lastOpened, 9);
  // split: the list carries no icon/manifest any more, the per-entry keys do, the old value is the copy
  const stored = JSON.parse(meta.data[ENTRIES_KEY]);
  assert.deepEqual(stored.map((e: Record<string, unknown>) => Object.keys(e).sort()), [
    ['addedAt', 'baseUrl', 'id', 'lastOpened', 'name'],
    ['addedAt', 'baseUrl', 'id', 'name'],
  ]);
  assert.equal(meta.data[entryKeys('a').icon], 'data:image/png;base64,AAAA');
  assert.deepEqual(JSON.parse(meta.data[entryKeys('a').manifest]), manifest);
  assert.equal(meta.data[PREVIOUS_KEY], old);
  // and the split list loads the same
  const again = await make(meta).load();
  assert.equal(again[0].icon, 'data:image/png;base64,AAAA');
  assert.deepEqual(again[0].manifest, manifest);
});

test('an old-format list recovered from the copy is not rewritten until the user acts', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: '{', [PREVIOUS_KEY]: JSON.stringify([{ id: 'a', baseUrl: 'https://a.com', icon: 'https://a.com/i.png' }]) });
  const store = make(meta);
  assert.equal((await store.load())[0].icon, 'https://a.com/i.png');
  assert.equal(meta.data[ENTRIES_KEY], '{');
  assert.equal(meta.data[entryKeys('a').icon], undefined);
  await store.move('a', 1); // nothing moves, nothing is written
  assert.equal(meta.data[ENTRIES_KEY], '{');
  await store.remove('ghost');
  assert.deepEqual(JSON.parse(meta.data[ENTRIES_KEY]), [{ id: 'a', baseUrl: 'https://a.com', name: 'a.com', addedAt: 0 }]);
  assert.equal(meta.data[entryKeys('a').icon], 'https://a.com/i.png');
});

test('a per-entry key that cannot be written is tried again on the next write', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  meta.failSet.add(entryKeys('id1').icon);
  await store.add('https://a.com', { name: 'A', icon: 'https://a.com/i.png' });
  assert.equal(meta.data[entryKeys('id1').icon], undefined);
  assert.equal(JSON.parse(meta.data[ENTRIES_KEY]).length, 1, 'the list is written anyway');
  meta.failSet.clear();
  await store.add('https://b.com');
  assert.equal(meta.data[entryKeys('id1').icon], 'https://a.com/i.png');
});

test('remove deletes the entry\'s icon and manifest keys', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const store = make(meta);
  const a = (await store.add('https://a.com', { name: 'A', icon: 'https://a.com/i.png' })).entry;
  const b = (await store.add('https://b.com', { name: 'B', icon: 'https://b.com/i.png' })).entry;
  await store.remove(a.id);
  assert.equal(meta.data[entryKeys(a.id).icon], undefined);
  assert.equal(meta.data[entryKeys(a.id).manifest], undefined);
  assert.equal(meta.data[entryKeys(b.id).icon], 'https://b.com/i.png');
});

test('an invalid entry is kept (with its original address), exported, and removable', async () => {
  const meta = memory({
    [SEEDED_KEY]: '1',
    [ENTRIES_KEY]: JSON.stringify([
      { id: 'x', baseUrl: 'https://user:pw@old.example.com', name: 'Old', addedAt: 1 },
      { id: 'y', baseUrl: 'https://ok.com', name: 'OK', addedAt: 2 },
    ]),
  });
  const store = make(meta);
  const list = await store.load();
  assert.equal(list.length, 2);
  assert.match(list[0].invalid!, /user name or password/);
  assert.equal(list[0].name, 'Old');
  assert.deepEqual(store.exportBaseUrls(), ['https://user:pw@old.example.com', 'https://ok.com']);
  // writing the list keeps it as it was, without the (derived) mark
  await store.move('y', -1);
  const stored = JSON.parse(meta.data[ENTRIES_KEY]);
  assert.deepEqual(stored[1], { id: 'x', baseUrl: 'https://user:pw@old.example.com', name: 'Old', addedAt: 1 });
  await store.remove('x');
  assert.deepEqual(store.list().map((e) => e.id), ['y']);
});

test('load is shared by concurrent callers', async () => {
  const meta = memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: listOf('https://a.com') });
  const store = make(meta);
  const [a, b] = await Promise.all([store.load(), store.load()]);
  assert.equal(a, b);
  assert.equal(meta.getCalls.filter((k) => k === ENTRIES_KEY).length, 1);
});
