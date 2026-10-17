// The view controller is plain TypeScript; only its two platform edges (a11y announcements and
// document presentation) reach react-native / expo, so those PACKAGES are replaced here — the real
// a11y.ts and documentEffects.ts run (mocking those modules themselves made node's coverage merge
// report them as uncovered). Needs `--experimental-test-module-mocks`.
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native', 'expo-web-browser', 'expo-file-system']);

const announced: string[] = [];
const presented: unknown[] = [];
const liveQueue: (boolean | undefined)[] = [];
mock.module('react-native', {
  namedExports: {
    Platform: { OS: 'ios' },
    AccessibilityInfo: {
      announceForAccessibility: (m: string) => announced.push(m),
      announceForAccessibilityWithOptions: (m: string, o: { queue?: boolean }) => {
        announced.push('live:' + m);
        liveQueue.push(o?.queue);
      },
    },
    // the iOS share sheet: a file it cannot hand to anything rejects
    Share: {
      share: async (content: { title: string }) => {
        if (content.title === 'locked.pdf') throw new Error('no app can open it');
        presented.push(content.title);
      },
    },
    Linking: {},
  },
});
mock.module('expo-web-browser', { namedExports: { openBrowserAsync: async (url: string) => { presented.push(url); } } });
class FakeFile {
  uri: string;
  contentUri = '';
  constructor(_dir: string, name: string) { this.uri = `file:///cache/${name}`; }
  create() {}
  write() {}
}
mock.module('expo-file-system', { namedExports: { File: FakeFile, Paths: { cache: '/cache' } } });

const { MateuViewController } = await import('./MateuViewController.ts');
const { MateuSession } = await import('./MateuSession.ts');
const { headerValues } = await import('./appShellExtras.ts');

type Json = Record<string, any>;
const tick = () => new Promise((r) => setTimeout(r, 0));

function harness(answers: Json[] = []) {
  const session = new MateuSession('http://srv', 'sid');
  const calls: Json[] = [];
  const notes: Json[] = [];
  const queue = [...answers];
  const answer = () => {
    const next = queue.shift() ?? {};
    if (next instanceof Error) return Promise.reject(next);
    return Promise.resolve(next);
  };
  (session as any).api = {
    baseUrl: 'http://srv',
    initialLoad: (route: string) => { calls.push({ kind: 'initialLoad', route }); return answer(); },
    navigate: (route: string, consumedRoute: string, sst: string) => {
      calls.push({ kind: 'navigate', route, consumedRoute, sst });
      return answer();
    },
    runAction: (rq: Json) => { calls.push({ kind: 'action', ...rq, componentState: { ...rq.componentState } }); return answer(); },
  };
  session.notify = (title, text, variant, options) => notes.push({ title, text, variant, options });
  const c = new MateuViewController(session);
  const renders: Json[] = [];
  c.onRender = (v) => renders.push(v);
  return { session, c, calls, notes, renders };
}

const ssc = (extra: Json = {}, children: Json[] = [{ type: 'ClientSide', metadata: { type: 'Form' } }]): Json => ({
  type: 'ServerSide',
  id: 'cmp1',
  route: '/orders',
  serverSideType: 'app.Orders',
  children,
  ...extra,
});
const fragment = (component: Json, state: Json = {}, data?: unknown) => ({ fragments: [{ targetComponentId: 'ux_main', action: 'Replace', component, state, data }] });

test('initialLoad renders a ServerSide fragment: state = initialData overlaid with the fragment state', async () => {
  const { c, calls, renders } = harness([fragment(ssc({ initialData: { a: 1, b: 2 } }), { b: 3 })]);
  await c.initialLoad('/orders');
  assert.deepEqual(calls[0], { kind: 'initialLoad', route: '/orders' });
  const last = renders.at(-1)!;
  assert.equal(last.loading, false);
  assert.deepEqual(last.state, { a: 1, b: 3 });
  assert.equal(c.currentComponentId, 'cmp1');
  assert.equal(c.currentServerSideType, 'app.Orders');
});

test('a failed load shows the error instead of a blank screen', async () => {
  const { c, renders } = harness([new Error('HTTP 500')]);
  await c.initialLoad('/x');
  assert.equal(renders.at(-1)!.error, 'HTTP 500');
  assert.equal(renders.at(-1)!.loading, false);
});

test('actions send the live state to the component that owns them; unowned ones bubble to the navigated orchestrator', async () => {
  const { c, calls } = harness([
    fragment(ssc({ serverSideType: 'app.Detail', actions: [{ id: 'save' }] })),
    {},
    {},
  ]);
  await c.navigate('/orders/1', '/orders', 'app.OrdersCrud');
  c.putState('name', 'Ana');
  await c.runAction('save', { p: 1 });
  const save = calls.find((x) => x.actionId === 'save')!;
  assert.equal(save.serverSideType, 'app.Detail');
  assert.deepEqual(save.componentState, { name: 'Ana' });
  assert.deepEqual(save.parameters, { p: 1 });
  await c.runAction('edit');
  assert.equal(calls.find((x) => x.actionId === 'edit')!.serverSideType, 'app.OrdersCrud');
});

test('validation: a required action with failing conditions is NOT sent, errors are shown and spoken', async () => {
  const { c, calls, notes } = harness([
    fragment(ssc({
      actions: [{ id: 'save', validationRequired: true }],
      validations: [
        { fieldId: 'name', condition: "state['name']", message: 'Required' },
        { fieldId: 'age', condition: 'state.age >= 18', message: 'Adults only' },
      ],
    })),
    {},
  ]);
  await c.initialLoad('/orders');
  announced.length = 0;
  c.putState('age', 12);
  await c.runAction('save');
  assert.equal(calls.filter((x) => x.actionId === 'save').length, 0);
  assert.deepEqual(c.fieldErrors, { name: 'Required', age: 'Adults only' });
  assert.equal(notes.at(-1)!.variant, 'warning');
  assert.match(announced.at(-1)!, /name: Required; age: Adults only/);
  c.putState('name', 'Ana');
  c.putState('age', 30);
  await c.runAction('save');
  assert.equal(calls.filter((x) => x.actionId === 'save').length, 1);
  assert.deepEqual(c.fieldErrors, {});
});

test('bulk actions need a selection: nothing is sent and the user is told', async () => {
  const { c, calls, notes } = harness([fragment(ssc({ actions: [{ id: 'archive', rowsSelectedRequired: true }] })), {}]);
  await c.initialLoad('/orders');
  await c.runAction('archive');
  assert.equal(calls.filter((x) => x.actionId === 'archive').length, 0);
  assert.equal(notes.at(-1)!.text, 'You first need to select some rows');
  c.currentComponentState['crud_selected_items'] = [{ id: 1 }];
  await c.runAction('archive');
  assert.equal(calls.filter((x) => x.actionId === 'archive').length, 1);
});

test('client rules: conditional attributes and computed state react to edits', async () => {
  const { c, renders } = harness([fragment(ssc({
    rules: [
      { filter: 'state.kind == "company"', action: 'SetAttributeValue', fieldName: 'vat', fieldAttribute: 'hidden', value: false },
      { filter: 'state.kind != "company"', action: 'SetAttributeValue', fieldName: 'vat', fieldAttribute: 'hidden', value: true },
      { filter: '', action: 'SetStateValue', fieldName: 'total', expression: 'state.qty * 2' },
      { filter: 'state.qty > 100', action: 'SetStateValue', fieldName: 'big', value: true, result: 'Stop' },
      { filter: 'true', action: 'SetStateValue', fieldName: 'afterStop', value: 1 },
      { filter: 'state.(', action: 'SetStateValue', fieldName: 'broken', value: 1 },
    ],
    initialData: { kind: 'person', qty: 1 },
  }))]);
  await c.initialLoad('/orders');
  assert.equal(c.fieldAttributes['vat']['hidden'], true);
  assert.equal(c.currentComponentState['total'], 2);
  assert.equal(c.currentComponentState['broken'], undefined);
  const before = renders.length;
  c.putState('kind', 'company');
  assert.equal(c.fieldAttributes['vat']['hidden'], false);
  assert.ok(renders.length > before, 'a rule change re-renders');
  assert.equal(c.currentComponentState['afterStop'], 1);
  c.currentComponentState['afterStop'] = 0;
  c.putState('qty', 200);
  assert.equal(c.currentComponentState['big'], true);
  assert.equal(c.currentComponentState['afterStop'], 0, 'a matching rule with result Stop blocks the later ones');
});

test('dirty tracking: edits mark dirty, MarkAsClean clears, discarding actions ask first', async () => {
  const { c, calls } = harness([fragment(ssc({ confirmOnNavigationIfDirty: true, actions: [{ id: 'cancel-edit' }] })), {}, {}]);
  const changes: boolean[] = [];
  c.onDirtyChanged = (d) => changes.push(d);
  await c.initialLoad('/orders');
  c.putState('x', 1);
  assert.equal(c.dirty, true);
  let asked = 0;
  c.confirmDiscard = async () => { asked++; return false; };
  await c.runAction('cancel-edit');
  assert.equal(asked, 1);
  assert.equal(calls.filter((x) => x.actionId === 'cancel-edit').length, 0, 'refused → not sent');
  c.confirmDiscard = async () => true;
  await c.runAction('cancel-edit');
  assert.equal(calls.filter((x) => x.actionId === 'cancel-edit').length, 1);
  assert.equal(c.dirty, false);
  c.applyIncrement({ commands: [{ type: 'MarkAsDirty' }] });
  assert.equal(c.dirty, true);
  c.applyIncrement({ commands: [{ type: 'MarkAsClean' }] });
  assert.deepEqual(changes, [true, false, true, false]);
});

test('messages: toasts with duration and an Undo that runs the reverse action', async () => {
  const { c, calls, notes } = harness([{}]);
  c.applyIncrement({
    messages: [
      { text: '' },
      { title: 'Saved', text: 'Order saved', variant: 'info', duration: 2000, undoActionId: 'restore', undoParameters: { id: 7 } },
    ],
  });
  assert.equal(notes.length, 1);
  assert.equal(notes[0].title, 'Saved');
  assert.equal(notes[0].options.duration, 2000);
  assert.equal(notes[0].options.undo.label, 'Undo');
  notes[0].options.undo.onPress();
  await tick();
  assert.deepEqual(calls.at(-1)!.parameters, { id: 7 });
  assert.equal(calls.at(-1)!.actionId, 'restore');
});

test('silent errors (embedded islands) never toast', async () => {
  const { c, notes } = harness([new Error('boom')]);
  c.silentErrors = true;
  c.applyIncrement({ messages: [{ text: 'hidden' }] });
  await c.runAction('x');
  assert.equal(notes.length, 0);
});

test('a failed action toasts unless it is a silent trigger', async () => {
  const { c, notes } = harness([new Error('HTTP 503'), new Error('HTTP 503')]);
  await c.runAction('go', undefined, true);
  assert.equal(notes.length, 0);
  await c.runAction('go');
  assert.equal(notes[0].text, 'Action failed: HTTP 503');
  assert.equal(notes[0].variant, 'error');
});

test('commands: window title is set and announced, navigation opens a view, events reach subscribers stamped with the emitter', async () => {
  const { c, session } = harness([fragment(ssc({
    emitsName: 'orders-list',
    triggers: [{ type: 'OnCustomEvent', eventName: 'pax-selected', actionId: 'reload', source: 'COMPONENT', from: 'guests' }],
  })), {}]);
  const titles: string[] = [];
  const opened: Json[] = [];
  session.setTitle = (t) => titles.push(t);
  session.openView = (t) => opened.push(t as Json);
  const events: Json[] = [];
  session.subscribe('test', 'saved', (p) => events.push(p as Json));
  await c.initialLoad('/orders');
  announced.length = 0;
  c.applyIncrement({ commands: [
    { type: 'SetWindowTitle', data: 'Orders' },
    { type: 'SetWindowTitle', data: '[untranslated]' },
    { type: 'NavigateTo', data: '/orders/7/' },
    { type: 'DispatchEvent', data: { eventName: 'saved', payload: { id: 1 } } },
    { type: 'DispatchEvent', data: { eventName: 'saved', payload: [1] } },
  ] });
  assert.deepEqual(titles, ['Orders']);
  assert.deepEqual(announced, ['Orders']);
  assert.equal(opened[0].route, '/orders/7/');
  assert.equal(opened[0].label, 'orders/7');
  assert.deepEqual(events, [{ id: 1, __source: 'orders-list' }, [1]]);
});

test('@SubscribeTo COMPONENT scope only reacts to events from the named emitter', async () => {
  const { c, session, calls } = harness([fragment(ssc({
    triggers: [{ type: 'OnCustomEvent', eventName: 'pax-selected', actionId: 'reloadPax', source: 'COMPONENT', from: 'guests' }],
  })), {}, {}]);
  await c.initialLoad('/orders');
  session.dispatchEvent('pax-selected', { __source: 'other', i: 1 });
  await tick();
  assert.equal(calls.filter((x) => x.actionId === 'reloadPax').length, 0);
  session.dispatchEvent('pax-selected', { __source: 'guests', i: 2 });
  await tick();
  const sent = calls.find((x) => x.actionId === 'reloadPax')!;
  assert.deepEqual(sent.parameters, { __source: 'guests', i: 2 });
});

test('CloseModal closes the top overlay and emits the close event; overlays open over the page', async () => {
  const { c, session } = harness([fragment(ssc())]);
  await c.initialLoad('/orders');
  let closed = 0;
  const overlays: Json[] = [];
  session.closeTopOverlay = () => { closed++; };
  session.openOverlay = (component, state, data, opener) => overlays.push({ component, opener } as Json);
  const events: unknown[] = [];
  session.subscribe('t', 'contact-saved', (p) => events.push(p));
  c.applyIncrement({ commands: [{ type: 'CloseModal', data: { eventName: 'contact-saved', payload: { ok: true } } }] });
  assert.equal(closed, 1);
  assert.equal(events.length, 1);
  c.applyIncrement({ fragments: [{ action: 'Add', component: { type: 'ClientSide', metadata: { type: 'Drawer' } } }] });
  assert.equal(overlays.length, 1);
  assert.equal(overlays[0].opener.serverSideType, 'app.Orders');
});

test('documents: DownloadFile is presented; a failure is told to the user; Print is announced, not dropped', async () => {
  const { c, notes } = harness();
  announced.length = 0;
  c.applyIncrement({ commands: [{ type: 'DownloadFile', data: { filename: 'a.pdf', base64Content: 'aGk=' } }, { type: 'Print' }, { type: 'Announce', data: { text: 'Done' } }] });
  await tick();
  assert.deepEqual(presented.at(-1), 'a.pdf');
  assert.deepEqual(announced, ['live:Printing is not available in the mobile app', 'live:Done']);
  c.applyIncrement({ commands: [{ type: 'DownloadFile', data: { filename: 'locked.pdf', base64Content: 'aGk=' } }] });
  await tick();
  assert.equal(notes.at(-1)!.text, 'no app can open it');
});

test('data-only fragments go to field handlers first, else the component handler', async () => {
  const { c } = harness();
  const field: unknown[] = [];
  const crud: unknown[] = [];
  c.registerFieldDataHandler('customer', (d) => field.push(d));
  c.registerDataHandler('crud', (d) => crud.push(d));
  c.applyIncrement({ fragments: [{ targetComponentId: 'x', data: { customer: { content: [1] } } }] });
  c.applyIncrement({ fragments: [{ targetComponentId: 'x', data: { page: { content: [] } } }] });
  assert.deepEqual(field, [{ content: [1] }]);
  assert.deepEqual(crud, [{ page: { content: [] } }]);
  c.unregisterFieldDataHandler('customer');
  c.applyIncrement({ fragments: [{ data: { customer: 1 } }] });
  assert.equal(crud.length, 2);
});

test('state-only fragments: a crud _route navigates (detail via opener), a plain one merges and re-renders', async () => {
  const { c, calls, renders } = harness([fragment(ssc()), {}]);
  await c.initialLoad('/orders');
  const opened: Json[] = [];
  c.detailOpener = (t) => opened.push(t as Json);
  c.applyIncrement({ fragments: [{ state: { _route: '/new', _componentRoute: '/orders' } }] });
  assert.equal(opened[0].route, '/orders/new');
  assert.equal(opened[0].label, 'New');
  c.detailOpener = null;
  c.applyIncrement({ fragments: [{ state: { _route: '/7', _componentRoute: '/orders' } }] });
  await tick();
  assert.equal(calls.at(-1)!.kind, 'navigate');
  assert.equal(calls.at(-1)!.route, '/orders/7');
  const n = renders.length;
  c.applyIncrement({ fragments: [{ state: { total: 9 } }] });
  assert.equal(c.currentComponentState['total'], 9);
  assert.equal(renders.length, n + 1);
});

test('banners: a bare return replaces, append accumulates; app state merges into the session', async () => {
  const { c, session } = harness();
  c.applyIncrement({ banners: [{ title: 'a' }] });
  c.applyIncrement({ banners: [{ title: 'b' }] });
  assert.deepEqual(c.actionBanners.map((b) => b.title), ['b']);
  c.applyIncrement({ banners: [{ title: 'c' }], appendBanners: true, appState: { hotel: 'H1' } });
  assert.deepEqual(c.actionBanners.map((b) => b.title), ['b', 'c']);
  assert.equal(session.appState['hotel'], 'H1');
});

test('OnLoad search is seeded with default paging state; a ServerSide with no children loads in the background', async () => {
  const { c, calls } = harness([
    fragment(ssc({ triggers: [{ type: 'OnLoad', actionId: 'search' }] })),
    {},
    fragment({ type: 'ServerSide', id: 'inner', route: '/inner', serverSideType: 'app.Inner', children: [] }),
    fragment(ssc({ id: 'inner2' })),
  ]);
  await c.initialLoad('/orders');
  await tick();
  const search = calls.find((x) => x.actionId === 'search')!;
  assert.deepEqual(search.componentState, { page: 0, size: 10, sort: [], searchText: '' });
  await c.initialLoad('/x');
  await tick();
  const bg = calls.find((x) => x.route === '/inner')!;
  assert.equal(bg.actionId, '');
  assert.equal(bg.serverSideType, 'app.Inner');
  assert.equal(c.currentComponentId, 'inner2');
});

test('an App shell answer hops to its home route (bounded, so a misresolving backend cannot loop)', async () => {
  const app = { type: 'ClientSide', metadata: { type: 'App', homeRoute: '/home', homeServerSideType: 'app.Home' } };
  const { c, calls } = harness([fragment(app), fragment(app), fragment(app), fragment(app)]);
  await c.initialLoad('/');
  await tick(); await tick(); await tick();
  const navs = calls.filter((x) => x.kind === 'navigate');
  assert.ok(navs.length >= 1 && navs.length <= 2, 'hops are bounded: ' + navs.length);
  assert.equal(navs[0].route, '/home');
});

test('@AutoSave fires the configured action once the user is idle', async () => {
  const { c, calls } = harness([fragment(ssc({ triggers: [{ type: 'AutoSave', actionId: 'saveDraft', debounceMillis: 5 }] })), {}]);
  await c.initialLoad('/orders');
  c.putState('a', 1);
  c.putState('a', 2);
  await new Promise((r) => setTimeout(r, 20));
  const saves = calls.filter((x) => x.actionId === 'saveDraft');
  assert.equal(saves.length, 1);
  assert.equal(saves[0].componentState.a, 2);
  c.dispose();
});

test('declared flows run client-side with no round trip; a RunAction step comes back through the dispatcher', async () => {
  const { c, calls, session } = harness([fragment(ssc({
    actions: [{ id: 'go', commands: [{ type: 'MarkAsDirty' }, { type: 'RunAction', data: { actionId: 'search' } }] }],
  })), {}]);
  await c.initialLoad('/orders');
  const before = calls.length;
  await c.runAction('go');
  await tick();
  const after = calls.slice(before);
  assert.equal(after.filter((x) => x.actionId === 'go').length, 0, 'the flow is not sent to the server');
  assert.equal(after.filter((x) => x.actionId === 'search').length, 1);
  void session;
});

test('@RestAction runs against the endpoint in the client and merges the result into the state', async () => {
  const realFetch = globalThis.fetch;
  const seen: Json[] = [];
  globalThis.fetch = (async (url: string, init: Json) => {
    seen.push({ url, init });
    if (String(url).includes('fail')) return { ok: false, status: 500, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ result: { city: 'Palma' } }) };
  }) as any;
  try {
    const { c, notes, calls } = harness([fragment(ssc({
      initialData: { id: 'a b' },
      actions: [
        { id: 'lookup', restAction: { source: { url: 'https://api.x/p/${state.id}', method: 'POST', headers: { 'X-Id': '${state.id}' }, body: '{"id":"${state.id}"}' }, resultPath: 'result', successMessage: 'Found ${state.city}' } },
        { id: 'bad', restAction: { source: { url: 'https://api.x/fail' } } },
      ],
    }))]);
    await c.initialLoad('/orders');
    await c.runAction('lookup');
    assert.equal(seen[0].url, 'https://api.x/p/a%20b');
    assert.equal(seen[0].init.method, 'POST');
    assert.equal(seen[0].init.headers['X-Id'], 'a b');
    assert.equal(seen[0].init.body, '{"id":"a b"}');
    assert.equal(c.currentComponentState['city'], 'Palma');
    assert.equal(notes.at(-1)!.text, 'Found Palma');
    await c.runAction('bad');
    assert.equal(notes.at(-1)!.text, 'Request failed');
    assert.equal(calls.filter((x) => x.kind === 'action').length, 0, 'no Mateu round trip');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('proxied sources go through the reserved __restfetch__ action; a failure answers {}', async () => {
  const { c, calls } = harness([{ appData: { _restfetch: { rows: [1] } } }, new Error('down')]);
  assert.deepEqual(await c.fetchViaProxy('options', 'country'), { rows: [1] });
  assert.deepEqual(calls[0].parameters, { _sourceKind: 'options', _sourceId: 'country' });
  assert.equal(calls[0].actionId, '__restfetch__');
  assert.deepEqual(await c.fetchViaProxy('rows', 'x'), {});
});

test('mountServerSide (embedded island) renders the node with its initialData', () => {
  const { c, renders } = harness();
  c.mountServerSide(ssc({ route: '/island', serverSideType: 'app.Island', initialData: { k: 1 } }));
  assert.equal(c.currentRoute, '/island');
  assert.deepEqual(renders.at(-1)!.state, { k: 1 });
});

test('validation falls back to the legacy matcher for syntax the parser does not cover', async () => {
  const { c, calls } = harness([fragment(ssc({
    actions: [{ id: 'save', validationRequired: true }],
    validations: [
      { fieldId: 'qty', condition: "state['qty'] >= 3;", message: 'Min 3' },
      { fieldId: 'tags', condition: "state['tags'] #", message: 'Pick one' },
      { fieldId: 'any', condition: 'whatever #' },
    ],
  })), {}]);
  await c.initialLoad('/orders');
  c.putState('qty', '2');
  c.putState('tags', []);
  await c.runAction('save');
  assert.deepEqual(c.fieldErrors, { qty: 'Min 3', tags: 'Pick one' });
  c.putState('qty', 5);
  c.putState('tags', ['a']);
  await c.runAction('save');
  assert.equal(calls.filter((x) => x.actionId === 'save').length, 1);
});

test('a LongTask (sse action) streams: every increment is applied as it arrives', async () => {
  const { c, session, renders } = harness([fragment(ssc({ actions: [{ id: 'importAll', sse: true }] }))]);
  await c.initialLoad('/orders');
  const streamed: Json[] = [];
  (session as any).api.runActionStream = async (rq: Json, onIncrement: (i: unknown) => void) => {
    streamed.push(rq);
    onIncrement({ fragments: [{ state: { progress: 0.5 } }] });
    assert.equal(c.currentComponentState['progress'], 0.5, 'the first step is on screen before the stream ends');
    onIncrement({ fragments: [{ state: { progress: 1, done: true } }] });
  };
  await c.runAction('importAll', { file: 'a.csv' });
  assert.equal(streamed.length, 1);
  assert.equal(streamed[0].actionId, 'importAll');
  assert.deepEqual(streamed[0].parameters, { file: 'a.csv' });
  assert.equal(renders.at(-1)!.state.done, true);
});

test('a live header value change is announced once; Announce honours assertive', () => {
  const { c } = harness();
  headerValues.seed([{ id: 'businessDate', label: 'Business date', value: '1 Oct' }]);
  announced.length = 0;
  liveQueue.length = 0;
  c.applyIncrement({ commands: [{ type: 'UpdateHeaderValue', data: { id: 'businessDate', value: '2 Oct' } }] });
  c.applyIncrement({ commands: [{ type: 'UpdateHeaderValue', data: { id: 'businessDate', value: '2 Oct' } }] });
  assert.deepEqual(announced, ['live:Business date changed to 2 Oct']);
  c.applyIncrement({ commands: [{ type: 'Announce', data: { text: 'Payment failed', assertive: true } }, { type: 'Announce', data: 'Saved' }] });
  assert.deepEqual(announced.slice(1), ['live:Payment failed', 'live:Saved']);
  assert.deepEqual(liveQueue.slice(1), [false, true]);
  headerValues.reset();
});

test('crud mediator moves on a phone stack: Back to list pops to the listing; the same inner route stays put', async () => {
  const { c, calls } = harness([fragment(ssc()), {}]);
  await c.initialLoad('/orders');
  // open a record in place (no opener yet): the inner route becomes "7"
  c.applyIncrement({ fragments: [{ state: { _route: '/7', _componentRoute: '/orders' } }] });
  await tick();
  assert.equal(calls.at(-1)!.route, '/orders/7');
  const stacked: Json[] = [];
  c.detailOpener = () => assert.fail('a list is never opened as a detail');
  c.stackNavigator = (target, replaceTop) => stacked.push({ ...target, replaceTop });
  c.applyIncrement({ fragments: [{ state: { _route: '', _componentRoute: '/orders' } }] });
  assert.deepEqual(stacked, [{ label: '', route: '/orders', consumedRoute: '/orders', serverSideType: 'app.Orders', replaceTop: false }]);
  // the record answering for itself again ("7" → "7") just merges the state
  const before = calls.length;
  c.applyIncrement({ fragments: [{ state: { _route: '/7/', _componentRoute: '/orders', total: 3 } }] });
  assert.equal(calls.length, before);
  assert.equal(c.currentComponentState['total'], 3);
  c.stackNavigator = null;
  c.detailOpener = null;
});
