import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  externalAuthHeaders,
  fetchExternalJson,
  getByPath,
  getRestSource,
  mapItemsToOptions,
  mapItemsToRows,
  registerExternalAuthProvider,
  registerRestSources,
  resolveRestSource,
  setSampleMode,
  viaProxy,
} from './restFetch.ts';
import { filterRestRows, restListingPage, sortRestRows } from './restListing.ts';
import { canSignOut, onSignedOut, reauthenticateWithProvider, setTokenProvider, signOut } from './auth.ts';
import { MateuApiClient } from '../api/MateuApiClient.ts';

test('external auth provider: none → {}, its headers otherwise, a throwing one → {} (never breaks the fetch)', async () => {
  assert.deepEqual(await externalAuthHeaders({ url: 'u', method: 'GET' }), {});
  registerExternalAuthProvider(({ method }) => ({ Authorization: 'Bearer t-' + method }));
  assert.deepEqual(await externalAuthHeaders({ url: 'u', method: 'GET' }), { Authorization: 'Bearer t-GET' });
  registerExternalAuthProvider(async () => undefined);
  assert.deepEqual(await externalAuthHeaders({ url: 'u', method: 'GET' }), {});
  const warn = console.warn;
  console.warn = () => {};
  registerExternalAuthProvider(() => { throw new Error('keychain locked'); });
  assert.deepEqual(await externalAuthHeaders({ url: 'u', method: 'GET' }), {});
  console.warn = warn;
  registerExternalAuthProvider(undefined);
});

test('response shaping: options from objects or primitives, rows by column dot paths', () => {
  const json = { data: { items: [{ code: 'ES', name: { common: 'Spain' } }, { code: 'FR' }, { name: { common: 'Nowhere' } }] } };
  assert.deepEqual(mapItemsToOptions(json, 'data.items', 'code', 'name.common'), [
    { value: 'ES', label: 'Spain' },
    { value: 'FR', label: 'FR' },
    { value: 'Nowhere', label: 'Nowhere' },
  ]);
  assert.deepEqual(mapItemsToOptions(['a', 1]), [{ value: 'a', label: 'a' }, { value: '1', label: '1' }]);
  assert.deepEqual(mapItemsToOptions({ nope: 1 }, 'items'), []);
  assert.deepEqual(mapItemsToRows(json, 'data.items', ['code', 'name.common']), [
    { code: 'ES', 'name.common': 'Spain' },
    { code: 'FR', 'name.common': undefined },
    { code: undefined, 'name.common': 'Nowhere' },
  ]);
  assert.deepEqual(mapItemsToRows(null, 'x', ['a']), []);
  const o = { a: 1 };
  assert.equal(getByPath(o, ''), o, 'an empty path is identity');
  assert.equal(getByPath({ a: { b: null } }, 'a.b.c'), undefined);
});

test('catalogue: a ref resolves to the entry; the surface\'s own declared fields win; proxy read off the RESOLVED source', () => {
  registerRestSources([
    { name: 'countries', source: { url: 'https://api/c', method: 'GET', headers: { k: 'v' }, itemsPath: 'items', proxy: true } },
    { name: 'broken' },
  ]);
  assert.equal(getRestSource('countries')?.['name'], 'countries');
  const r = resolveRestSource({ ref: 'countries', itemsPath: 'data', headers: {} });
  assert.equal(r['url'], 'https://api/c');
  assert.equal(r['itemsPath'], 'data');
  assert.deepEqual(r['headers'], { k: 'v' });
  assert.equal(viaProxy({ ref: 'countries' }), true, 'a by-ref surface carries no proxy of its own');
  assert.equal(viaProxy({ url: 'https://x' }), false);
  assert.equal(viaProxy(undefined), false);
  const warn = console.warn;
  console.warn = () => {};
  assert.deepEqual(resolveRestSource({ ref: 'missing', url: 'u' }), { ref: 'missing', url: 'u' });
  console.warn = warn;
  const plain = { url: 'u' };
  assert.equal(resolveRestSource(plain), plain);
});

test('fetchExternalJson: interpolates, merges auth headers last, sends a body only on writes, throws on non-2xx', async () => {
  setSampleMode(false);
  const realFetch = globalThis.fetch;
  const seen: { url: string; init: RequestInit }[] = [];
  let status = 200;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    seen.push({ url, init });
    return { ok: status < 300, status, json: async () => ({ ok: 1 }) } as Response;
  }) as typeof fetch;
  try {
    registerExternalAuthProvider(() => ({ 'X-Token': 'secret' }));
    const resolve = (t: unknown) => String(t ?? '').replace('${state.id}', '7');
    assert.deepEqual(await fetchExternalJson({ url: 'https://a/${state.id}', headers: { 'X-Token': 'declared', 'X-Id': '${state.id}' }, body: 'ignored' }, resolve), { ok: 1 });
    assert.equal(seen[0].url, 'https://a/7');
    assert.deepEqual(seen[0].init.headers, { 'X-Token': 'secret', 'X-Id': '7' });
    assert.equal(seen[0].init.body, undefined, 'a GET carries no body');
    await fetchExternalJson({ url: 'https://a', method: 'put', body: '{"id":"${state.id}"}' }, resolve);
    assert.equal(seen[1].init.method, 'PUT');
    assert.equal(seen[1].init.body, '{"id":"7"}');
    status = 404;
    await assert.rejects(fetchExternalJson({ url: 'https://a' }, resolve), /404/);
  } finally {
    globalThis.fetch = realFetch;
    registerExternalAuthProvider(undefined);
  }
});

test('REST listing: search over visible columns, typed filters, sort with blanks last, clamped paging', () => {
  const rows = [
    { name: 'Ana', sex: 'female', age: 30, vip: true, when: '2026-01-10', tag: 'a' },
    { name: 'Bob', sex: 'male', age: 45, vip: false, when: '2026-03-01', tag: 'b' },
    { name: 'Carla', sex: 'female', age: null, vip: 'true', when: '', tag: 'c' },
  ];
  const cols = ['name', 'sex'];
  assert.equal(filterRestRows(rows, cols, [], {}), rows);
  assert.deepEqual(filterRestRows(rows, cols, [], { searchText: ' ANA ' }).map((r) => r.name), ['Ana']);
  // an option list is a pick: "male" does not match "female"
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'sex', options: [{}] }], { sex: 'male' }).map((r) => r.name), ['Bob']);
  // without options it is a contains match
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'sex' }], { sex: 'male' }).length, 3);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'vip', dataType: 'bool' }], { vip: 'true' }).map((r) => r.name), ['Ana', 'Carla']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'vip', stereotype: 'toggle' }], { vip: false }).map((r) => r.name), ['Bob']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'age', stereotype: 'numberRange' }], { age_from: 40 }).map((r) => r.name), ['Bob']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'age', stereotype: 'numberRange' }], { age_to: '35' }).map((r) => r.name), ['Ana']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'when', stereotype: 'dateRange' }], { when_from: '2026-02-01', when_to: '2026-12-31' }).map((r) => r.name), ['Bob']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'when', stereotype: 'dateRange' }], { when_to: '2026-02-01' }).map((r) => r.name), ['Ana']);
  assert.equal(filterRestRows(rows, cols, [{ fieldId: 'when', stereotype: 'dateRange' }], {}).length, 3);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'tag', stereotype: 'multiSelect' }], { tag: 'a, c' }).map((r) => r.name), ['Ana', 'Carla']);
  assert.deepEqual(filterRestRows(rows, cols, [{ fieldId: 'tag', stereotype: 'multiSelect' }], { tag: ['b'] }).map((r) => r.name), ['Bob']);
  assert.equal(filterRestRows(rows, cols, [{ fieldId: 'tag', stereotype: 'multiSelect' }], { tag: [] }).length, 3);
  assert.equal(filterRestRows(rows, cols, [{ fieldId: '' }, { fieldId: 'name' }], { name: '' }).length, 3);

  assert.deepEqual(sortRestRows(rows, [{ fieldId: 'age', direction: 'ascending' }]).map((r) => r.name), ['Ana', 'Bob', 'Carla']);
  assert.deepEqual(sortRestRows(rows, [{ field: 'age', direction: 'desc' }]).map((r) => r.name), ['Carla', 'Bob', 'Ana']);
  assert.deepEqual(sortRestRows([{ n: 'item10' }, { n: 'Item2' }], [{ fieldId: 'n' }]).map((r) => r.n), ['Item2', 'item10']);
  assert.deepEqual(sortRestRows([{ a: 1, b: 2 }, { a: 1, b: 1 }], [{ fieldId: 'a' }, { fieldId: 'b' }]).map((r) => r.b), [1, 2]);
  assert.equal(sortRestRows(rows, undefined), rows);

  const page = restListingPage(rows, { columnIds: cols, state: { page: 9, sort: [{ fieldId: 'name', direction: 'descending' }] }, pageSize: 2 });
  assert.deepEqual(page, { content: [rows[0]], totalElements: 3, pageSize: 2, pageNumber: 1 });
  assert.deepEqual(restListingPage([], { columnIds: cols, state: {} }), { content: [], totalElements: 0, pageSize: 1, pageNumber: 0 });
  assert.equal(restListingPage(rows, { columnIds: cols, state: { page: 'x' }, pageSize: 0 }).content.length, 3);
});

test('API client: route encoding, null fields dropped, initialLoad/navigate/runFormAction carry the right consumed route', async () => {
  const realFetch = globalThis.fetch;
  const seen: { url: string; body: Record<string, unknown> }[] = [];
  let status = 200;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    seen.push({ url, body: JSON.parse(String(init.body)) });
    return { ok: status < 300, status, text: async () => (status < 300 ? '{"fragments":[]}' : 'boom') } as Response;
  }) as typeof fetch;
  try {
    const api = new MateuApiClient('http://srv', 's1');
    await api.initialLoad('/', { a: 1 });
    assert.equal(seen[0].url, 'http://srv/mateu/v3/sync/_no_route');
    assert.equal(seen[0].body.route, '');
    assert.equal(seen[0].body.consumedRoute, '_empty');
    assert.equal('serverSideType' in seen[0].body, false, 'null values are dropped like the web client');
    await api.navigate('orders/7', '', '', {});
    assert.equal(seen[1].url, 'http://srv/mateu/v3/sync/orders/7');
    assert.equal(seen[1].body.route, '/orders/7');
    assert.equal(seen[1].body.consumedRoute, '', 'a full URL load consumes nothing (not _empty)');
    await api.runFormAction('/orders', '', 'save', 'app.Orders', 'c1', { x: 1 }, {});
    assert.equal(seen[2].body.consumedRoute, '_empty');
    assert.equal(seen[2].body.serverSideType, 'app.Orders');
    assert.deepEqual(seen[2].body.componentState, { x: 1 });
    status = 500;
    await assert.rejects(api.runFormAction('/o', 'x', 'a', '', 'c', {}, {}), /HTTP 500: boom/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('sign out: drops the tokens and tells every listener, even when logout throws; canSignOut follows the provider', async () => {
  setTokenProvider(undefined);
  assert.equal(canSignOut(), false);
  let told = 0;
  const off = onSignedOut(() => told++);
  await signOut();
  assert.equal(told, 1, 'no provider still tells the host');
  setTokenProvider({ getToken: async () => 't', refresh: async () => false, logout: async () => { throw new Error('idp down'); } });
  assert.equal(canSignOut(), true);
  await assert.rejects(signOut());
  assert.equal(told, 2);
  off();
  setTokenProvider({ getToken: async () => 't', refresh: async () => { throw new Error('x'); }, login: async () => { throw new Error('cancelled'); } });
  assert.equal(await reauthenticateWithProvider(), false, 'a throwing login is a failed login');
  assert.equal(await reauthenticateWithProvider(false), false, 'non-interactive never opens the login');
  setTokenProvider(undefined);
  assert.equal(await reauthenticateWithProvider(), false);
});
