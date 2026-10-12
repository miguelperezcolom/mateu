import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_BASE_URL, ENTRIES_KEY, SEEDED_KEY, UiStore, searchEntries, uiSecretKeys } from './uiStore.ts';
import { uiSessionId } from './uiSession.ts';
import { exportLink, parseHubLink } from './links.ts';
import type { KeyValueStore } from '../core/sessionId.ts';

const memory = (seed: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } => {
  const data = { ...seed };
  return {
    data,
    get: async (k) => data[k] ?? null,
    set: async (k, v) => {
      data[k] = v;
    },
    remove: async (k) => {
      delete data[k];
    },
  };
};

const make = (meta = memory(), secrets = memory()) => {
  let n = 0;
  let t = 1000;
  return { store: new UiStore(meta, secrets, () => ++t, () => `id${++n}`), meta, secrets };
};

test('first launch seeds the demo entry once; removing it sticks', async () => {
  const { store, meta, secrets } = make();
  const first = await store.load();
  assert.equal(first.length, 1);
  assert.equal(first[0].baseUrl, DEMO_BASE_URL);
  assert.equal(meta.data[SEEDED_KEY], '1');
  await store.remove(first[0].id);
  const again = new UiStore(meta, secrets);
  assert.deepEqual(await again.load(), []);
});

test('an existing list is not seeded over', async () => {
  const meta = memory({ [ENTRIES_KEY]: JSON.stringify([{ id: 'a', baseUrl: 'https://acme.com', name: 'Acme', addedAt: 1 }]) });
  const { store } = make(meta);
  const list = await store.load();
  assert.deepEqual(list.map((e) => e.baseUrl), ['https://acme.com']);
});

test('add dedupes by base URL and persists the manifest metadata', async () => {
  const { store, meta } = make(memory({ [SEEDED_KEY]: '1' }));
  const a = await store.add('https://acme.com/crm', { name: 'Acme CRM', shortName: 'CRM', themeColor: '#123456' });
  assert.equal(a.added, true);
  assert.equal(a.entry.name, 'Acme CRM');
  const b = await store.add('https://acme.com/crm');
  assert.equal(b.added, false);
  assert.equal(b.entry.id, a.entry.id);
  const persisted = JSON.parse(meta.data[ENTRIES_KEY]);
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].themeColor, '#123456');
});

test('a manifest-less add is named after its domain', async () => {
  const { store } = make(memory({ [SEEDED_KEY]: '1' }));
  const { entry } = await store.add('https://acme.com:8443/crm');
  assert.equal(entry.name, 'acme.com:8443');
});

test('move and reorder', async () => {
  const { store } = make(memory({ [SEEDED_KEY]: '1' }));
  const a = (await store.add('https://a.com')).entry;
  const b = (await store.add('https://b.com')).entry;
  const c = (await store.add('https://c.com')).entry;
  await store.move(c.id, -1);
  assert.deepEqual(store.list().map((e) => e.id), [a.id, c.id, b.id]);
  await store.move(a.id, -5); // clamped
  assert.deepEqual(store.list().map((e) => e.id), [a.id, c.id, b.id]);
  await store.move(a.id, 10);
  assert.deepEqual(store.list().map((e) => e.id), [c.id, b.id, a.id]);
  await store.reorder([b.id, 'ghost']);
  assert.deepEqual(store.list().map((e) => e.id), [b.id, c.id, a.id]);
});

test('remove clears THAT UI\'s secrets only', async () => {
  const secrets = memory();
  const { store } = make(memory({ [SEEDED_KEY]: '1' }), secrets);
  const a = (await store.add('https://a.com')).entry;
  const b = (await store.add('https://b.com')).entry;
  secrets.data[uiSecretKeys(a.id).tokens] = '{"accessToken":"A"}';
  secrets.data[uiSecretKeys(b.id).tokens] = '{"accessToken":"B"}';
  await uiSessionId(secrets, a.id);
  await store.remove(a.id);
  assert.equal(secrets.data[uiSecretKeys(a.id).tokens], undefined);
  assert.equal(secrets.data[uiSecretKeys(a.id).sessionId], undefined);
  assert.equal(secrets.data[uiSecretKeys(b.id).tokens], '{"accessToken":"B"}');
});

test('the metadata store never holds a token', async () => {
  const meta = memory({ [SEEDED_KEY]: '1' });
  const { store } = make(meta);
  const { entry } = await store.add('https://a.com', {
    name: 'A',
    auth: { type: 'oidc', issuer: 'https://id.a.com', clientId: 'x', scopes: ['openid'] },
  });
  await store.touch(entry.id);
  assert.ok(!/accessToken|refreshToken|idToken/.test(meta.data[ENTRIES_KEY]));
});

test('import adds only new base URLs; export carries base URLs only and round-trips', async () => {
  const { store } = make(memory({ [SEEDED_KEY]: '1' }));
  await store.add('https://a.com', { name: 'A', icon: 'https://a.com/i.png' });
  const added = await store.importAll(['https://a.com', 'https://b.com', 'https://c.com/x']);
  assert.equal(added, 2);
  const urls = store.exportBaseUrls();
  assert.deepEqual(urls, ['https://a.com', 'https://b.com', 'https://c.com/x']);
  const link = exportLink(urls);
  assert.ok(!link.includes('i.png'));
  const parsed = parseHubLink(link);
  assert.equal(parsed.kind, 'import');
  // importing your own export into a fresh store reproduces the list
  const fresh = make(memory({ [SEEDED_KEY]: '1' })).store;
  if (parsed.kind === 'import') await fresh.importAll(parsed.baseUrls);
  assert.deepEqual(fresh.exportBaseUrls(), urls);
});

test('applyManifest renames and touch stamps lastOpened', async () => {
  const { store } = make(memory({ [SEEDED_KEY]: '1' }));
  const { entry } = await store.add('https://a.com');
  await store.applyManifest(entry.id, { name: 'Renamed', themeColor: '#ffffff' });
  await store.touch(entry.id);
  const e = store.get(entry.id)!;
  assert.equal(e.name, 'Renamed');
  assert.equal(e.themeColor, '#ffffff');
  assert.ok(e.lastOpened! > e.addedAt);
});

test('corrupt or hostile stored data is dropped, not trusted', async () => {
  const meta = memory({
    [SEEDED_KEY]: '1',
    [ENTRIES_KEY]: JSON.stringify([
      { id: 'a', baseUrl: 'javascript:alert(1)' },
      { id: 'b', baseUrl: 'https://ok.com', name: 'OK' },
      { id: 'c', baseUrl: 'https://ok.com/' }, // duplicate after normalisation
      'junk',
      null,
    ]),
  });
  const { store } = make(meta);
  assert.deepEqual((await store.load()).map((e) => e.id), ['b']);
  const broken = make(memory({ [SEEDED_KEY]: '1', [ENTRIES_KEY]: '{not json' })).store;
  assert.deepEqual(await broken.load(), []);
});

test('search matches name, short name and domain', () => {
  const entries = [
    { id: '1', baseUrl: 'https://crm.acme.com', name: 'Acme CRM', addedAt: 0 },
    { id: '2', baseUrl: 'https://hr.example.org', name: 'People', shortName: 'HR', addedAt: 0 },
  ];
  assert.deepEqual(searchEntries(entries, 'acme').map((e) => e.id), ['1']);
  assert.deepEqual(searchEntries(entries, 'hr').map((e) => e.id), ['2']);
  assert.deepEqual(searchEntries(entries, 'example people').map((e) => e.id), ['2']);
  assert.equal(searchEntries(entries, '  ').length, 2);
  assert.equal(searchEntries(entries, 'zzz').length, 0);
});

test('each UI gets its own persistent session id', async () => {
  const secrets = memory();
  let n = 0;
  const mk = () => `s${++n}`;
  const a1 = await uiSessionId(secrets, 'a', mk);
  const b1 = await uiSessionId(secrets, 'b', mk);
  assert.notEqual(a1, b1);
  assert.equal(await uiSessionId(secrets, 'a', mk), a1);
});

test('secret keys are secure-store safe', () => {
  const k = uiSecretKeys('a/b c');
  assert.match(k.tokens, /^[A-Za-z0-9._-]+$/);
  assert.match(k.sessionId, /^[A-Za-z0-9._-]+$/);
});
