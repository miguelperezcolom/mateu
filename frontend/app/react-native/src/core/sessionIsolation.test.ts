// Several Mateu apps run in one process (the hub keeps every UI session mounted). What one app
// registers — its REST source catalogue, its action catalogue, sample mode, its header values, the
// listing personalisation, the drop zones on its screens — must not reach another. A hub session
// (constructed with its own TokenProvider, even `null`) owns those stores; a single-backend session
// (no provider argument) keeps the process-wide ones, exactly as before.
// Needs `--experimental-test-module-mocks` (the controller's a11y edge reaches react-native).
import { mock, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native', 'expo-web-browser', 'expo-file-system']);
mock.module('react-native', {
  namedExports: {
    Platform: { OS: 'ios' },
    AccessibilityInfo: { announceForAccessibility: () => {}, announceForAccessibilityWithOptions: () => {} },
    Share: { share: async () => {} },
    Linking: {},
  },
});
mock.module('expo-web-browser', { namedExports: { openBrowserAsync: async () => {} } });
mock.module('expo-file-system', { namedExports: { File: class {}, Paths: { cache: '/cache' } } });

const { MateuViewController } = await import('./MateuViewController.ts');
const { MateuSession } = await import('./MateuSession.ts');
const restFetch = await import('./restFetch.ts');
const shellFlows = await import('./shellFlows.ts');
const { headerValues } = await import('./appShellExtras.ts');

type Json = Record<string, any>;

const fetched: string[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string) => {
  fetched.push(String(url));
  return { ok: true, status: 200, json: async () => ({}) } as unknown as Response;
}) as typeof fetch;

afterEach(() => {
  fetched.length = 0;
  restFetch.registerRestSources([]);
  restFetch.clearReferencedRestSources();
  restFetch.setSampleMode(false);
  shellFlows.registerActionCatalogue(undefined);
});
process.on('exit', () => { globalThis.fetch = realFetch; });

/** A hub UI session (own provider: null = an unsecured backend) with a fake API recording calls. */
function hubUi(baseUrl: string) {
  const session = new MateuSession(baseUrl, 'sid', {}, null);
  const calls: Json[] = [];
  (session as any).api = {
    baseUrl,
    initialLoad: async () => ({}),
    navigate: async () => ({}),
    runAction: async (rq: Json) => { calls.push(rq); return {}; },
  };
  const titles: string[] = [];
  session.setTitle = (t) => titles.push(t);
  const c = new MateuViewController(session);
  return { session, c, calls, titles };
}

/** App A's shell arrives: a crud-mediator-style ServerSide whose first child is the App. */
function openAppA(c: InstanceType<typeof MateuViewController>) {
  c.applyIncrement({
    fragments: [{
      targetComponentId: 'ux_main',
      component: {
        type: 'ServerSide', id: 'shell', route: '', serverSideType: 'a.App',
        children: [{
          type: 'ClientSide',
          metadata: {
            type: 'App', homeRoute: '/home', serverSideType: 'a.App', mockSources: true,
            restSources: [{ name: 'countries', source: { url: 'https://a.example/countries', proxy: true } }],
            actionCatalogue: [{ id: 'hello', commands: [{ type: 'SetWindowTitle', data: 'From app A' }] }],
          },
        }],
      },
    }],
  });
}

/** A screen of app B whose actions are given. */
function showScreenB(c: InstanceType<typeof MateuViewController>, actions: Json[]) {
  c.applyIncrement({
    fragments: [{
      targetComponentId: 'ux_main',
      component: { type: 'ServerSide', id: 'b1', route: '/b', serverSideType: 'b.Screen', actions, children: [{ type: 'ClientSide', metadata: { type: 'Form' } }] },
    }],
  });
}

test("a hub UI does not resolve another UI's REST source refs", async () => {
  const a = hubUi('https://a.example');
  const b = hubUi('https://b.example');
  openAppA(a.c);
  showScreenB(b.c, [{ id: 'load', restAction: { source: { ref: 'countries' }, resultPath: '' } }]);
  await b.c.runAction('load');
  // app A's entry (proxied) must not decide how app B's surface is fetched
  assert.ok(!b.calls.some((rq) => rq['actionId'] === '__restfetch__'), "app B resolved its ref against app A's catalogue");
  assert.ok(!fetched.includes('https://a.example/countries'), `app B fetched app A's endpoint: ${fetched}`);
  // ...while app A itself resolves its own catalogue
  assert.equal(a.session.sources.resolve({ ref: 'countries' })['url'], 'https://a.example/countries');
  assert.equal(b.session.sources.get('countries'), undefined);
});

test("a hub UI does not run another UI's catalogue flow: the id goes to its own server", async () => {
  const a = hubUi('https://a.example');
  const b = hubUi('https://b.example');
  openAppA(a.c);
  showScreenB(b.c, []);
  await b.c.runAction('hello');
  assert.deepEqual(b.titles, []);
  assert.equal(b.calls.at(-1)?.['actionId'], 'hello');
});

test("one UI's sample mode does not turn another UI's sources into samples", async () => {
  const a = hubUi('https://a.example');
  const b = hubUi('https://b.example');
  openAppA(a.c);
  showScreenB(b.c, [{ id: 'load', restAction: { source: { url: 'https://b.example/live', sample: [{ x: 1 }] }, resultPath: '' } }]);
  await b.c.runAction('load');
  assert.deepEqual(fetched, ['https://b.example/live']);
  assert.equal(a.session.sources.isSampleMode(), true);
  assert.equal(b.session.sources.isSampleMode(), false);
});

test("references a response names stay in that UI", () => {
  const a = hubUi('https://a.example');
  const b = hubUi('https://b.example');
  a.c.applyIncrement({ restSources: [{ name: 'late', source: { url: 'https://a.example/late' } }] });
  assert.equal(a.session.sources.get('late')?.['source']?.['url'], 'https://a.example/late');
  assert.equal(b.session.sources.get('late'), undefined);
  assert.equal(restFetch.getRestSource('late'), undefined);
});

test('header values, listing personalisation and drop zones are per UI', () => {
  const a = hubUi('https://a.example').session;
  const b = hubUi('https://b.example').session;
  a.headerValues.seed([{ id: 'businessDate', label: 'Business date', value: '1 Oct' }]);
  assert.deepEqual(b.headerValues.list(), []);
  a.columnPrefs.set('Products', ['price']);
  assert.deepEqual(b.columnPrefs.get('Products'), []);
  a.savedViews.save('Products', { name: 'Cheap', values: { searchText: 'x' } });
  assert.deepEqual(b.savedViews.list('Products'), []);
  const unregister = a.dropZones.register({ key: 'z1', meta: { accept: 'room', actionId: 'move' }, dispatch: () => {} });
  assert.deepEqual(b.dropZones.zonesAccepting('room'), []);
  assert.equal(a.dropZones.zonesAccepting('room').length, 1);
  unregister();
});

test('a single-backend session keeps the process-wide stores (unchanged behaviour)', () => {
  const single = new MateuSession('http://srv', 'sid');
  const c = new MateuViewController(single);
  (single as any).api = { baseUrl: 'http://srv', navigate: async () => ({}) };
  openAppA(c);
  assert.equal((restFetch.getRestSource('countries')?.['source'] as Json)?.['url'], 'https://a.example/countries');
  assert.equal(shellFlows.getActionCatalogue()[0]?.id, 'hello');
  assert.equal(restFetch.isSampleMode(), true);
  assert.equal(single.headerValues, headerValues);
});
