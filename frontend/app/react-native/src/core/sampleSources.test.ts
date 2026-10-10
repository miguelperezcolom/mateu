import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchExternalJson,
  isSampled,
  registerRestSources,
  sampledResponse,
  setSampleMode,
  viaProxy,
} from './restFetch.ts';
import { restListingPage } from './restListing.ts';

// Same rule as libs/mateu sampleSources.test.ts and the server's SampleSources: the sample answers
// ONLY in sample mode (on RN: the app's mockSources flag), a read gets a copy, a write null, and a
// sampled source is never proxied.
const ordersSample = {
  data: [
    { id: 1, customer: 'Acme', status: 'OPEN', total: 120.5 },
    { id: 2, customer: 'Globex', status: 'SHIPPED', total: 80 },
    { id: 3, customer: 'Initech', status: 'OPEN', total: 300 },
  ],
  meta: { total: 3 },
};

beforeEach(() => {
  setSampleMode(false);
  registerRestSources([
    { name: 'orders', source: { url: '/api/orders', itemsPath: 'data', proxy: true }, totalPath: 'meta.total', sample: ordersSample },
    { name: 'plain', source: { url: '/api/plain', proxy: true } },
  ]);
});

const noFetch = () => {
  (globalThis as { fetch: unknown }).fetch = () => {
    throw new Error('must not fetch');
  };
};
const id = (t: unknown) => String(t ?? '');

test('sample mode off: a sampled source is fetched/proxied like any other', () => {
  assert.equal(isSampled({ ref: 'orders' }), false);
  assert.equal(viaProxy({ ref: 'orders' }), true);
  assert.equal(sampledResponse({ ref: 'orders' }), undefined);
});

test('sample mode on: a read answers with a COPY of the entry sample, never fetched', async () => {
  setSampleMode(true);
  noFetch();
  const json = (await fetchExternalJson({ ref: 'orders' }, id)) as typeof ordersSample;
  assert.deepEqual(json, ordersSample);
  json.data.pop();
  assert.equal(ordersSample.data.length, 3);
});

test('sample mode on: a write succeeds with null', async () => {
  setSampleMode(true);
  noFetch();
  assert.equal(await fetchExternalJson({ ref: 'orders', method: 'POST' }, id), null);
  assert.equal(sampledResponse({ ref: 'orders' }, 'DELETE'), null);
});

test('a sampled source is never proxied; one without a sample still is', () => {
  setSampleMode(true);
  assert.equal(viaProxy({ ref: 'orders' }), false);
  assert.equal(viaProxy({ ref: 'plain' }), true);
});

test("the surface's own sample wins over the entry's, inline sources are sampled too", async () => {
  setSampleMode(true);
  noFetch();
  assert.deepEqual(await fetchExternalJson({ ref: 'orders', sample: { data: [] } }, id), { data: [] });
  assert.deepEqual(await fetchExternalJson({ url: '/x', sample: [1, 2] }, id), [1, 2]);
});

test('a sampled listing searches, filters, sorts and pages in memory', () => {
  const rows = ordersSample.data as Record<string, unknown>[];
  const cols = ['id', 'customer', 'status', 'total'];
  const filters = [{ fieldId: 'status', options: [{ value: 'OPEN' }] }];
  const filtered = restListingPage(rows, {
    columnIds: cols,
    filters,
    state: { status: 'OPEN', sort: [{ field: 'total', direction: 'descending' }] },
  });
  assert.deepEqual(filtered.content.map((r) => r['id']), [3, 1]);
  assert.equal(filtered.totalElements, 2);
  const searched = restListingPage(rows, { columnIds: cols, state: { searchText: 'glo' } });
  assert.deepEqual(searched.content.map((r) => r['id']), [2]);
  const page1 = restListingPage(rows, { columnIds: cols, state: { page: 1 }, pageSize: 2 });
  assert.deepEqual(page1.content.map((r) => r['id']), [3]);
  assert.equal(page1.totalElements, 3);
  assert.equal(page1.pageNumber, 1);
});
