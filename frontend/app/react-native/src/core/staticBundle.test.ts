import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUNDLE_MANIFEST, StaticBundle, bundlePath, bundleUrl, fetchStaticBundle } from './staticBundle.ts';
import { MateuSession } from './MateuSession.ts';
import { fetchExternalJson } from './restFetch.ts';

// A static UI (mateu-bundle:bundle → manifest.json) opened natively. The resolution rules are the
// web's own (libs/mateu bundleResolver.ts, shared through src/shared/mateuLib.ts); these tests pin
// what the native side adds: the transport, the catalogue the shell is handed, one bundle per UI,
// and that the bundle is only ever DATA from a checked address.

type Json = Record<string, any>;

const products = [
  { id: 'P-001', name: 'Espresso machine', status: 'AVAILABLE' },
  { id: 'P-002', name: 'Milk frother', status: 'OUT_OF_STOCK' },
];

/** What a specsOnly bundle carries (the vaadin renderer): raw definitions, expanded on the device. */
const specsManifest = (extra: Json = {}): Json => ({
  entries: [],
  routes: {
    routes: [
      { route: '', definition: 'app.yaml' },
      { route: 'home', definition: 'home.yaml' },
      { route: 'products', definition: 'products.yaml' },
      { route: 'form', definition: 'form.yaml' },
    ],
  },
  sources: {
    sources: [
      { name: 'products', source: { url: '/api/products', method: 'GET' }, sample: products },
      { name: 'person-create', source: { url: '/api/people', method: 'POST', body: '{"name":"${state.name}"}' }, sample: { id: '1' } },
    ],
  },
  definitions: {
    'app.yaml': {
      type: 'AppShell', title: 'Mateu test 001', variant: 'MENU_ON_TOP', homeRoute: 'home', accentColor: '#1f6feb',
      menu: [{ type: 'RouteLink', label: 'Home', route: 'home' }, { type: 'RouteLink', label: 'Products', route: 'products' }],
    },
    'home.yaml': { type: 'VerticalLayout', content: [{ type: 'Text', text: '${i18n.home.greeting}' }] },
    'products.yaml': {
      type: 'Listing', title: 'Products', rowsSource: { ref: 'products' },
      columns: [{ type: 'GridColumn', id: 'id', label: 'Id' }, { type: 'GridColumn', id: 'status', label: 'Status' }],
    },
    'form.yaml': {
      layout: { type: 'Form', title: 'Person', content: [{ type: 'FormField', id: 'name', label: 'Name', dataType: 'string' }] },
      actions: [{ id: 'save', restAction: { source: { ref: 'person-create' }, successMessage: 'Saved' } }],
    },
  },
  translations: { en: { 'home.greeting': 'Hello' }, es: { 'home.greeting': 'Hola' } },
  mockSources: true,
  ...extra,
});

/** What a Redwood bundle carries: every route PRE-RENDERED (shell + content loads). */
const shell = (homeRoute: string) => ({
  fragments: [{ targetComponentId: null, component: { type: 'ClientSide', metadata: { type: 'App', title: 'Pre', homeRoute, restSources: [{ name: 'products', source: { url: '/stale' } }] } } }],
});
const screen = (id: string) => ({ fragments: [{ targetComponentId: null, component: { type: 'ServerSide', id, children: [] } }] });
const preManifest: Json = {
  entries: [
    { route: '/', syncPath: '_no_route', ok: true, json: JSON.stringify(shell('/home')) },
    { route: '/home', syncPath: 'home', ok: true, json: JSON.stringify(shell('/home')), contentJson: JSON.stringify(screen('home')) },
    { route: '/products', syncPath: 'products', ok: true, json: JSON.stringify(shell('/products')), contentJson: JSON.stringify(screen('products')) },
  ],
  routes: { routes: [{ route: '' }, { route: 'home' }, { route: 'products' }] },
  sources: { sources: [{ name: 'products', source: { url: '/api/products' }, sample: products }] },
  mockSources: true,
};

const load = (route: string, consumedRoute: string) => ({ route, consumedRoute, actionId: '' });
const meta = (inc: Json) => inc.fragments[0].component.metadata as Json;

test('specs bundle: the fresh root load is the app shell, expanded on the device, carrying the catalogue', () => {
  const bundle = new StaticBundle(specsManifest() as never, 'http://192.168.1.5:3000', () => ['en']);
  const root = bundle.answer(load('', '_empty'));
  assert.equal(meta(root).type, 'App');
  assert.equal(meta(root).title, 'Mateu test 001');
  // the manifest's catalogue WITH its samples, and the mock flag, so rowsSource {ref} resolves offline
  assert.deepEqual(meta(root).restSources.map((s: Json) => s.name), ['products', 'person-create']);
  assert.deepEqual(meta(root).restSources[0].sample, products);
  assert.equal(meta(root).mockSources, true);
});

test('specs bundle: a deep link is the shell aimed at the route; the content load is the screen (#557)', () => {
  const bundle = new StaticBundle(specsManifest() as never, 'http://h:3000');
  assert.equal(meta(bundle.answer(load('/products', '_empty'))).homeRoute, '/products');
  const listing = bundle.answer(load('/products', ''));
  assert.equal(meta(listing).type, 'Crud');
  assert.deepEqual(meta(listing).rowsSource, { ref: 'products' });
  // a query string (a listing's filters) is not part of the screen
  assert.equal(meta(bundle.answer(load('/products?status=AVAILABLE', ''))).type, 'Crud');
});

test('specs bundle: a form keeps its declared restAction (the write runs on the device)', () => {
  const bundle = new StaticBundle(specsManifest() as never, 'http://h:3000');
  const form = JSON.stringify(bundle.answer(load('/form', '')));
  assert.match(form, /person-create/);
  assert.match(form, /"Form"/);
});

test('specs bundle: ${i18n.…} resolves for the device locale, else the fallback', () => {
  const es = new StaticBundle(specsManifest() as never, 'http://h', () => ['es-ES']);
  assert.match(JSON.stringify(es.answer(load('/home', ''))), /Hola/);
  const de = new StaticBundle(specsManifest() as never, 'http://h', () => ['de']);
  assert.match(JSON.stringify(de.answer(load('/home', ''))), /Hello/);
});

test('pre-rendered bundle (Redwood): entries answer; the bundle catalogue replaces the stale pre-rendered one', () => {
  const bundle = new StaticBundle(preManifest as never, 'http://h:3000');
  const root = bundle.answer(load('', '_empty'));
  assert.equal(meta(root).homeRoute, '/home');
  assert.equal(meta(root).restSources[0].source.url, '/api/products');
  assert.equal(meta(root).mockSources, true);
  assert.equal(bundle.answer(load('/products', '')).fragments[0].component.id, 'products');
  assert.equal(meta(bundle.answer(load('/products', '_empty'))).homeRoute, '/products');
});

test('answers are copies: what the renderer does to one never reaches the bundle', () => {
  const bundle = new StaticBundle(preManifest as never, 'http://h');
  const first = bundle.answer(load('/products', ''));
  first.fragments[0].component.id = 'mutated';
  assert.equal(bundle.answer(load('/products', '')).fragments[0].component.id, 'products');
});

test('a server action cannot run, and an unknown route is not found — nothing is POSTed anywhere', () => {
  const bundle = new StaticBundle(preManifest as never, 'http://h');
  assert.throws(() => bundle.answer({ route: '/products', consumedRoute: '', actionId: 'delete' }), /no server/);
  assert.throws(() => bundle.answer(load('/nope', '')), /Not found/);
});

test('one bundle per UI: the expander is primed with THIS bundle\'s action catalogue', () => {
  const withAction = (id: string) => specsManifest({
    actions: [{ id, restAction: { source: { ref: 'products' } } }],
    definitions: { ...specsManifest().definitions, 'home.yaml': { type: 'VerticalLayout', content: [{ type: 'Button', label: 'Go', actionId: id }] } },
  });
  const a = new StaticBundle(withAction('refresh-a') as never, 'http://a');
  const b = new StaticBundle(withAction('refresh-b') as never, 'http://b');
  assert.match(JSON.stringify(b.answer(load('/home', ''))), /refresh-b/);
  const fromA = JSON.stringify(a.answer(load('/home', '')));
  assert.match(fromA, /refresh-a/);
  assert.doesNotMatch(fromA, /refresh-b/);
});

test('the UI manifest of a bundle with no /mateu/v3/manifest: the app shell\'s title and accent colour', () => {
  assert.deepEqual(new StaticBundle(specsManifest() as never, 'http://h').uiManifestSource(), {
    name: 'Mateu test 001', icon: undefined, themeColor: '#1f6feb',
  });
  assert.equal(new StaticBundle(preManifest as never, 'http://h').uiManifestSource().name, 'Pre');
});

test('bundle paths: a plain relative .json path only — never another host, a parent or a query', () => {
  assert.equal(bundlePath(undefined), BUNDLE_MANIFEST);
  assert.equal(bundlePath('manifest.json'), 'manifest.json');
  assert.equal(bundlePath('ui/v2/manifest.json'), 'ui/v2/manifest.json');
  for (const bad of ['https://evil.example/m.json', '//evil.example/m.json', '../m.json', 'a/../m.json', '/m.json', 'm.json?x=1', 'm.js', 'm .json', 7]) {
    assert.equal(bundlePath(bad), undefined, String(bad));
  }
  assert.equal(bundleUrl('http://h:3000/app/', 'manifest.json'), 'http://h:3000/app/manifest.json');
});

const answering = (status: number, body: string) => async () => ({ ok: status < 400, status, text: async () => body });

test('fetchStaticBundle: only a document with the bundle\'s shape is a bundle', async () => {
  const ok = await fetchStaticBundle('http://h:3000', undefined, { fetchImpl: answering(200, JSON.stringify(preManifest)) });
  assert.equal(ok.ok, true);
  for (const [status, body] of [
    [200, '<!doctype html><html></html>'], // a static host's SPA fallback
    [200, '{"name":"Acme","icons":[]}'], // a web app manifest
    [200, '{"entries":"nope"}'],
    [404, 'not found'],
  ] as const) {
    const r = await fetchStaticBundle('http://h:3000', undefined, { fetchImpl: answering(status, body) });
    assert.equal(r.ok, false, body);
    assert.equal('notABundle' in r && r.notABundle, true, body);
  }
  const offline = await fetchStaticBundle('http://h:3000', undefined, { fetchImpl: async () => { throw new Error('ECONNREFUSED'); } });
  assert.equal(offline.ok === false && 'offline' in offline && offline.offline, true);
  // a hostile path never reaches the network
  let asked = false;
  const refused = await fetchStaticBundle('http://h', 'https://evil/x.json', { fetchImpl: async () => { asked = true; return { ok: true, status: 200, text: async () => '{}' }; } });
  assert.equal(refused.ok, false);
  assert.equal(asked, false);
});

test('a session opened on a bundle: loads never touch the network, sources are the bundle\'s, relative urls resolve against it', async () => {
  const session = new MateuSession('http://192.168.1.5:3000', 's1', {}, null);
  session.openStaticBundle(new StaticBundle(specsManifest({ mockSources: false }) as never, 'http://192.168.1.5:3000'));
  const realFetch = globalThis.fetch;
  const asked: string[] = [];
  (globalThis as { fetch: unknown }).fetch = async (url: string) => {
    asked.push(url);
    return { ok: true, status: 200, json: async () => products } as unknown as Response;
  };
  try {
    const root = (await session.api.initialLoad('', {})) as Json;
    assert.equal(meta(root).type, 'App');
    assert.deepEqual(asked, []); // no POST /mateu/v3/sync
    assert.equal(session.sources.get('products')?.['name'], 'products');
    // a live bundle (no mock): the relative source url is the bundle host's
    await fetchExternalJson({ ref: 'products' }, String, String, session.sources);
    assert.deepEqual(asked, ['http://192.168.1.5:3000/api/products']);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('a mock bundle switches the session\'s sample mode on: rows come from the samples', async () => {
  const session = new MateuSession('http://h:3000', 's2', {}, null);
  session.openStaticBundle(new StaticBundle(specsManifest() as never, 'http://h:3000'));
  assert.equal(session.sources.isSampleMode(), true);
  assert.deepEqual(await fetchExternalJson({ ref: 'products' }, String, String, session.sources), products);
  // a write succeeds with null: nothing persisted
  assert.equal(await fetchExternalJson({ ref: 'person-create' }, String, String, session.sources), null);
});

test('relative urls: an absolute url passes, a relative one is the base\'s', () => {
  const session = new MateuSession('http://h:3000/app', 's3', {}, null);
  session.sources.relativeBase = 'http://h:3000/app';
  assert.equal(session.sources.absolute('/api/x'), 'http://h:3000/api/x');
  assert.equal(session.sources.absolute('api/x'), 'http://h:3000/app/api/x');
  assert.equal(session.sources.absolute('https://api.example.com/x'), 'https://api.example.com/x');
  session.sources.relativeBase = undefined;
  assert.equal(session.sources.absolute('/api/x'), '/api/x');
});
