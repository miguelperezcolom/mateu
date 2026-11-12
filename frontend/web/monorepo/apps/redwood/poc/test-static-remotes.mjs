// A federated shell (RemoteMenu) mounting a domain with NO backend: its static bundle, `specsOnly`
// included (raw YAML definitions expanded in the browser with the web's own expander, packaged by
// make-expander.mjs). Same fixture as libs/mateu's bundleRemotes.test.ts, so both renderers are held
// to one answer. Run: node test-static-remotes.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { generate, OUT } from './make-expander.mjs'
import { mateuBundleResolver } from './vendor/bundleResolver.mjs'
import { staticRemoteLoad, loadStaticRemote, resetStaticRemotesForTests } from './staticRemotes.mjs'
import { callMateu, expandRemoteMenus, remoteRouteOf, runMateuAction } from './transport.mjs'
import { getRestSource, clearReferencedSources } from './restSources.mjs'
import { reduceContexts, HOST_ID, listingOf } from './reduceContexts.mjs'

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

const CATALOG = 'http://cdn.example.com/catalog/manifest.json'

/** What `mateu:bundle` with specsOnly writes for a YAML-only domain: raw definitions, no entries. */
const catalogManifest = {
  entries: [],
  routes: {
    routes: [
      { route: '', definition: 'catalog-app.yaml' },
      { route: 'products', definition: 'products.yaml' },
    ],
  },
  sources: {
    sources: [{ name: 'products', source: { url: 'http://cdn.example.com/api/products.json', method: 'GET' } }],
  },
  definitions: {
    'catalog-app.yaml': {
      type: 'AppShell', title: 'Catalog', homeRoute: 'products',
      menu: [{ type: 'RouteLink', label: 'Products', route: 'products' }],
    },
    'products.yaml': {
      type: 'Listing', title: 'Products', rowsSource: { ref: 'products' },
      columns: [{ type: 'GridColumn', id: 'sku', label: 'SKU' }],
    },
  },
}

const withFetch = async (handler, fn) => {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), method: (init && init.method) || 'GET' }); return handler(String(url), init) }
  try { await fn(calls) } finally { globalThis.fetch = original }
}
const json = (body) => ({ ok: true, status: 200, headers: { get: () => null }, json: async () => body })
const manifestServer = (url) => (url === CATALOG ? json(catalogManifest) : { ok: false, status: 404, headers: { get: () => null }, json: async () => ({}) })
const appOf = (inc) => (inc.fragments || []).map((f) => f.component).find((c) => c && c.metadata && c.metadata.type === 'App')
const typesIn = (node, out = []) => {
  if (!node || typeof node !== 'object') return out
  if (typeof node.type === 'string') out.push(node.type)
  for (const v of Object.values(node)) if (v && typeof v === 'object') typesIn(v, out)
  return out
}
const reset = () => { resetStaticRemotesForTests(); clearReferencedSources() }

test('the packaged resolver is the libs/mateu closure as it is now (npm run bridge regenerates it)', () => {
  assert.equal(readFileSync(OUT, 'utf8'), generate(), 'poc/vendor/bundleResolver.mjs is stale: run npm run bridge')
  for (const k of ['parseBundleManifest', 'resolveLoad', 'rootIncrement', 'appShellOf', 'toSyncPath'])
    assert.equal(typeof mateuBundleResolver[k], 'function', k)
})

test('the shell\'s menu load of a specsOnly remote answers its app shell, expanded from its definition', async () => {
  reset()
  await withFetch(manifestServer, async (calls) => {
    const inc = await staticRemoteLoad(CATALOG, '', '_empty', 'x#')
    const app = appOf(inc).metadata
    assert.equal(app.title, 'Catalog')
    assert.match(JSON.stringify(app.menu), /Products/)
    // the manifest is read once, with a GET — never POSTed to as a server
    await staticRemoteLoad(CATALOG, 'products', '', 'x#')
    assert.deepEqual(calls, [{ url: CATALOG, method: 'GET' }])
  })
})

test('a content load answers the SCREEN (never the remote\'s shell nested in ours); the root as content is its home', async () => {
  reset()
  await withFetch(manifestServer, async () => {
    const screen = await staticRemoteLoad(CATALOG, '/products', '', 'content-1')
    assert.ok(!appOf(screen), 'not a shell')
    assert.ok(typesIn(screen).includes('Crud'), 'the Listing definition expanded to a Crud')
    assert.equal(screen.fragments[0].targetComponentId, 'content-1', 'aimed at the initiator')
    const home = await staticRemoteLoad(CATALOG, '', '/help', 'content-1')
    assert.ok(!appOf(home))
    assert.ok(typesIn(home).includes('Crud'), 'the remote mounted at its root as content = its home screen')
    assert.equal(await staticRemoteLoad(CATALOG, '/nowhere', '', 'c'), null)
  })
})

test('the remote\'s REST sources become named sources its screens can reference', async () => {
  reset()
  await withFetch(manifestServer, async () => {
    await loadStaticRemote(CATALOG)
    assert.equal(getRestSource('products').source.url, 'http://cdn.example.com/api/products.json')
  })
})

test('a manifest that cannot be read is asked again next time (not cached)', async () => {
  reset()
  let up = false
  await withFetch((url) => (up ? manifestServer(url) : { ok: false, status: 503, headers: { get: () => null }, json: async () => ({}) }), async (calls) => {
    assert.equal(await loadStaticRemote(CATALOG), null)
    up = true
    assert.ok(await loadStaticRemote(CATALOG))
    assert.equal(calls.length, 2)
  })
})

test('a remote that throws (no network) is an unread manifest too', async () => {
  reset()
  await withFetch(() => { throw new TypeError('Failed to fetch') }, async () => {
    assert.equal(await loadStaticRemote(CATALOG), null)
    assert.equal(await staticRemoteLoad(CATALOG, '/products', '', 'c'), null)
  })
})

test('${i18n.…} in a remote\'s definitions is resolved with ITS translations', async () => {
  reset()
  const localized = JSON.parse(JSON.stringify(catalogManifest))
  localized.definitions['products.yaml'].title = '${i18n.products.title}'
  localized.translations = { en: { 'products.title': 'Products (en)' }, es: { 'products.title': 'Productos' } }
  await withFetch((url) => (url === CATALOG ? json(localized) : manifestServer(url)), async () => {
    const screen = await staticRemoteLoad(CATALOG, '/products', '', 'c')
    const text = JSON.stringify(screen)
    assert.ok(!text.includes('${i18n.'), 'no placeholder left')
    assert.ok(/Products \(en\)|Productos/.test(text), text.slice(0, 200))
  })
})

test('RemoteMenu → a specsOnly static remote: its menu is spliced under the prefix (not disabled), its screens load from it', async () => {
  reset()
  await withFetch(manifestServer, async (calls) => {
    const menu = await expandRemoteMenus([
      { label: 'Catalog', remote: true, baseUrl: CATALOG, route: '', path: '/catalog', routePrefix: '/catalog', shellLabel: true },
    ])
    const routes = JSON.stringify(menu)
    assert.match(routes, /\/catalog\/products/, routes)
    assert.ok(!/"disabled":true/.test(routes), 'the section is not shown disabled')
    assert.equal(remoteRouteOf('/catalog/products').baseUrl, CATALOG)
    // the content load of a screen under the prefix: answered from the manifest
    const inc = await callMateu(CATALOG, { route: '/catalog/products', actionId: '', consumedRoute: '', initiatorComponentId: 'c-1' }, { quiet: true })
    assert.ok(typesIn(inc).includes('Crud'))
    assert.ok(!calls.some((c) => c.method === 'POST'), 'nothing is POSTed to a static remote')
  })
})

test('an ACTION aimed at a static remote has no server to go to: it fails as such, it is never POSTed', async () => {
  reset()
  await withFetch(manifestServer, async (calls) => {
    await assert.rejects(callMateu(CATALOG, { route: '/products', actionId: 'save' }, { quiet: true }), (e) => e.mateuStaticRemote === true)
    assert.equal(calls.length, 0)
  })
})

test('a listing of a static remote searches through its REST source in the browser (no server round trip)', async () => {
  reset()
  await withFetch((url) => (url === 'http://cdn.example.com/api/products.json' ? json([{ sku: 'A-1' }, { sku: 'B-2' }]) : manifestServer(url)), async (calls) => {
    const screen = await callMateu(CATALOG, { route: '/products', actionId: '', consumedRoute: '', initiatorComponentId: HOST_ID }, { quiet: true })
    let reg = reduceContexts({ contexts: {}, stack: [] }, screen)
    const host = { ...reg.contexts[HOST_ID], outbound: { baseUrl: CATALOG, route: '/products' } }
    const answer = await runMateuAction(CATALOG, host, '/products', 'search', { page: 0, size: 10 }, {})
    reg = reduceContexts({ ...reg, contexts: { ...reg.contexts, [HOST_ID]: host } }, answer)
    const listing = listingOf(reg.contexts[HOST_ID])
    assert.deepEqual(listing.rows.map((r) => r.sku), ['A-1', 'B-2'])
    assert.ok(!calls.some((c) => c.method === 'POST'))
  })
})

for (const { name, fn } of queue) {
  await fn()
  passed++
  console.log('  ✓ ' + name)
}
console.log(`\n${passed} static-remote tests OK`)
