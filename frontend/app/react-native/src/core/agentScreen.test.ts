import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentScreenRegistry, agentQueryOf, answerParameters, answerQuery, OPERATING_WINDOW_MS, waitIdle, type ListingDriver, type ScreenView } from './agentScreen.ts';
import { routeAgentPush } from './agentPush.ts';

type Json = Record<string, unknown>;

const field = (fieldId: string, extra: Json = {}) => ({ type: 'ClientSide', metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', ...extra } });
const button = (actionId: string, extra: Json = {}) => ({ type: 'ClientSide', metadata: { type: 'Button', actionId, label: actionId, ...extra } });

function fakeView(children: unknown[], listing?: { rows: Json[]; driver?: Partial<ListingDriver> }) {
  const calls: { kind: string; args: unknown[] }[] = [];
  const view: ScreenView = {
    currentRoute: '/orders',
    currentComponentState: {},
    rendered: { component: { type: 'ServerSide', children }, state: {}, data: null },
    fieldErrors: {},
    fieldAttributes: {},
    listingPages: listing ? { orders: { page: { content: listing.rows, totalElements: listing.rows.length } } } : {},
    listingDrivers: listing
      ? {
          orders: {
            searchText: () => '',
            setSearchText: (t) => calls.push({ kind: 'searchText', args: [t] }),
            setFilter: (id, v) => calls.push({ kind: 'filter', args: [id, v] }),
            search: () => calls.push({ kind: 'search', args: [] }),
            changePage: (d) => calls.push({ kind: 'page', args: [d] }),
            openRow: (row) => (calls.push({ kind: 'open', args: [row] }), true),
            ...listing.driver,
          },
        }
      : {},
    putState(fieldId, value) {
      calls.push({ kind: 'put', args: [fieldId, value] });
      this.currentComponentState[fieldId] = value;
    },
    async runAction(actionId, parameters) {
      calls.push({ kind: 'run', args: [actionId, parameters] });
      return true;
    },
  };
  return { view, calls };
}

const deps = (registry: AgentScreenRegistry) => ({ registry, appState: {}, idle: async () => {}, repaint: async () => {} });
const query = (event: string, detail: Json = {}) => agentQueryOf('query', event, { requestId: 'r1', ...detail })!;

test('a query message is routed as a query; one without a requestId is ignored', () => {
  const routed = routeAgentPush({ kind: 'query', event: 'describe-screen', detail: { requestId: 'abc' } });
  assert.equal(routed.kind, 'query');
  assert.deepEqual(routeAgentPush({ kind: 'query', event: 'describe-screen', detail: {} }), { kind: 'ignored' });
  assert.deepEqual(routeAgentPush({ kind: 'query', event: 'nope', detail: { requestId: 'a' } }), { kind: 'ignored' });
  assert.deepEqual(answerParameters(query('describe-screen'), { error: { code: 'unsupported' } }), { requestId: 'r1', error: { code: 'unsupported' } });
});

test('nothing on screen: unsupported', async () => {
  const r = new AgentScreenRegistry();
  assert.deepEqual(await answerQuery(query('describe-screen'), deps(r)), { error: { code: 'unsupported' } });
});

test('set-fields writes through the edit path, and refuses the WHOLE call for a field that is not editable', async () => {
  const r = new AgentScreenRegistry();
  const { view, calls } = fakeView([field('name'), field('code', { readOnly: true })]);
  r.page = view;
  assert.deepEqual(await answerQuery(query('set-fields', { values: { name: 'Ada', code: 'X' } }), deps(r)), { error: { code: 'unknownField', id: 'code' } });
  assert.deepEqual(await answerQuery(query('set-fields', { values: { name: 'Ada', ghost: 1 } }), deps(r)), { error: { code: 'unknownField', id: 'ghost' } });
  assert.equal(calls.length, 0);
  const ok = await answerQuery(query('set-fields', { values: { name: 'Ada' } }), deps(r));
  assert.deepEqual(calls, [{ kind: 'put', args: ['name', 'Ada'] }]);
  assert.ok('screen' in ok);
  assert.equal(((ok.screen['fields'] as Json[])[0])['value'], 'Ada');
});

test('run-action presses only what the screen offers and is enabled', async () => {
  const r = new AgentScreenRegistry();
  const { view, calls } = fakeView([button('save'), button('delete', { disabled: true })]);
  r.page = view;
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'drop' }), deps(r)), { error: { code: 'unknownAction', id: 'drop' } });
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'delete' }), deps(r)), { error: { code: 'disabledAction', id: 'delete' } });
  const ok = await answerQuery(query('run-action', { actionId: 'save', parameters: { notify: true } }), deps(r));
  assert.ok('screen' in ok);
  assert.deepEqual(calls, [{ kind: 'run', args: ['save', { notify: true }] }]);
});

test('listing: rows open, row actions get the row, search and paging drive the listing', async () => {
  const r = new AgentScreenRegistry();
  const rows = [{ id: 1, name: 'a', actions: { actions: [{ methodNameInCrud: 'archive', label: 'Archive' }] } }];
  const crud = {
    type: 'ClientSide', id: 'orders',
    metadata: { type: 'Crud', searchable: true, rowRoute: 'orders/${row.id}', columns: [{ metadata: { id: 'name', label: 'Name' } }, { metadata: { id: 'actions', label: '', dataType: 'actionGroup' } }], filters: [{ fieldId: 'status', label: 'Status' }] },
  };
  const { view, calls } = fakeView([crud], { rows });
  r.page = view;
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'open-row', row: 3 }), deps(r)), { error: { code: 'unknownRow', id: '3' } });
  await answerQuery(query('run-action', { actionId: 'open-row', row: 0 }), deps(r));
  await answerQuery(query('run-action', { actionId: 'action-on-row-archive', row: 0, listing: 'orders' }), deps(r));
  await answerQuery(query('set-fields', { values: { searchText: 'ad', status: 'A' } }), deps(r));
  await answerQuery(query('run-action', { actionId: 'search' }), deps(r));
  await answerQuery(query('run-action', { actionId: 'nextPage' }), deps(r));
  assert.deepEqual(calls.map((c) => c.kind), ['open', 'run', 'searchText', 'filter', 'search', 'page']);
  assert.deepEqual(calls[1].args, ['action-on-row-archive', { _clickedRow: rows[0] }]);
  assert.deepEqual(calls[5].args, [1]);
});

test('an overlay is in front: its fields are the ones written', async () => {
  const r = new AgentScreenRegistry();
  const page = fakeView([field('name')]);
  const drawer = fakeView([field('note')]);
  r.page = page.view;
  r.overlays = () => [{ component: { metadata: { type: 'Drawer', headerTitle: 'Note' } }, view: drawer.view }];
  assert.deepEqual(await answerQuery(query('set-fields', { values: { name: 'x' } }), deps(r)), { error: { code: 'unknownField', id: 'name' } });
  const ok = await answerQuery(query('set-fields', { values: { note: 'hi' } }), deps(r));
  assert.ok('screen' in ok && ok.screen['focus'] === 'overlay');
  assert.deepEqual(drawer.calls, [{ kind: 'put', args: ['note', 'hi'] }]);
});

test('the operating notice: from a query until the window ends, or Stop', () => {
  let now = 1000;
  const r = new AgentScreenRegistry(() => now);
  let changes = 0;
  r.subscribe(() => changes++);
  assert.equal(r.operating(), false);
  r.noteQuery();
  assert.equal(r.operating(), true);
  assert.equal(changes, 1);
  r.noteQuery();
  assert.equal(changes, 1);
  now += OPERATING_WINDOW_MS + 1;
  assert.equal(r.operating(), false);
  r.noteQuery();
  r.stopOperating();
  assert.equal(r.operating(), false);
});

test('waitIdle: resolves when the activity goes idle, or after its bound', async () => {
  let busy = true;
  let listener: ((b: boolean) => void) | undefined;
  const p = waitIdle(() => busy, (l) => ((listener = l), () => (listener = undefined)), 2000);
  await new Promise((r) => setTimeout(r, 50));
  busy = false;
  listener?.(false);
  await p;
  const started = Date.now();
  await waitIdle(() => true, () => () => {}, 80);
  assert.ok(Date.now() - started >= 70);
});

test('the registry keeps the last messages, says when the notice ends, and survives a failing listener', () => {
  const now = 5000;
  const r = new AgentScreenRegistry(() => now);
  for (let i = 0; i < 12; i++) r.noteMessage({ variant: 'info', text: `m${i}` });
  assert.equal(r.messages.length, 10);
  assert.equal(r.messages[0].text, 'm2');
  assert.equal(r.operatingUntil(), 0);
  let heard = 0;
  r.subscribe(() => {
    throw new Error('broken listener');
  });
  const off = r.subscribe(() => heard++);
  r.stopOperating(); // nothing to stop: nothing announced
  assert.equal(heard, 0);
  r.noteQuery();
  assert.equal(heard, 1);
  assert.equal(r.operatingUntil(), 5000 + OPERATING_WINDOW_MS);
  off();
  r.stopOperating();
  assert.equal(heard, 1);
  assert.equal(r.operatingUntil(), 0);
});

test('describe carries the messages, the shown title and a listing whose search box is gone', () => {
  const r = new AgentScreenRegistry();
  const crud = { type: 'ClientSide', id: 'orders', metadata: { type: 'Crud', searchable: true, columns: [{ metadata: { id: 'name', label: 'Name' } }] } };
  const { view } = fakeView([crud], {
    rows: [{ name: 'a' }],
    driver: {
      searchText: () => {
        throw new Error('gone');
      },
    },
  });
  (view as { shownTitle?: string }).shownTitle = 'Orders';
  r.page = view;
  r.noteMessage({ variant: 'success', title: 'Saved', text: 'Order saved' });
  const s = r.describe()!;
  assert.equal(s['windowTitle'], 'Orders');
  assert.deepEqual(s['messages'], [{ variant: 'success', title: 'Saved', text: 'Order saved' }]);
  assert.equal((s['listings'] as Json[])[0]['searchText'], '');
});

test('without a repaint hook the answer waits a short default repaint, then reads the screen again', async () => {
  const r = new AgentScreenRegistry();
  const { view } = fakeView([field('name')]);
  r.page = view;
  const started = Date.now();
  const ok = await answerQuery(query('set-fields', { values: { name: 'Ada' } }), { registry: r, appState: {}, idle: async () => {} });
  assert.ok(Date.now() - started >= 100);
  assert.ok('screen' in ok && ((ok.screen['fields'] as Json[])[0])['value'] === 'Ada');
});

test('an overlay without a view of its own is described; a press on it has no view to run on', async () => {
  const r = new AgentScreenRegistry();
  r.overlays = () => [{ component: { metadata: { type: 'Dialog', title: 'Confirm', content: button('ok') } }, view: null }];
  const s = r.describe()!;
  assert.equal(s['focus'], 'overlay');
  assert.equal((s['overlay'] as Json)['kind'], 'dialog');
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'ok' }), deps(r)), { error: { code: 'unsupported' } });
});

test('a failure while answering is "failed", never a throw', async () => {
  const r = new AgentScreenRegistry();
  const { view } = fakeView([field('name')]);
  view.putState = () => {
    throw new Error('boom');
  };
  r.page = view;
  assert.deepEqual(await answerQuery(query('set-fields', { values: { name: 'x' } }), deps(r)), { error: { code: 'failed' } });
});

test('app header actions run through the shell (children included); without a runner, unsupported', async () => {
  const r = new AgentScreenRegistry();
  const { view, calls } = fakeView([field('name')]);
  r.page = view;
  r.app = { contextActions: [{ actionId: 'tools', label: 'Tools', children: [{ actionId: 'export', label: 'Export' }] }] };
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'export' }), deps(r)), { error: { code: 'unsupported' } });
  const ran: string[] = [];
  r.runAppAction = async (id) => {
    ran.push(id);
  };
  const ok = await answerQuery(query('run-action', { actionId: 'export' }), deps(r));
  assert.ok('screen' in ok);
  assert.deepEqual(ran, ['export']);
  assert.equal(calls.length, 0);
});

test('a button with a route navigates as its press does; without a navigator, unsupported', async () => {
  const r = new AgentScreenRegistry();
  const routeButton = { type: 'ClientSide', metadata: { type: 'Button', route: '/customers', label: 'Customers' } };
  const { view, calls } = fakeView([routeButton]);
  r.page = view;
  assert.deepEqual(await answerQuery(query('run-action', { actionId: '/customers' }), deps(r)), { error: { code: 'unsupported' } });
  const went: string[] = [];
  r.navigate = (route) => went.push(route);
  assert.ok('screen' in (await answerQuery(query('run-action', { actionId: '/customers' }), deps(r))));
  assert.deepEqual(went, ['/customers']);
  assert.equal(calls.length, 0);
});

test('listing presses without a driver, or rows that do not open, are unsupported; plain row actions get the row itself', async () => {
  const r = new AgentScreenRegistry();
  const rows = [{ id: 7, name: 'a' }];
  const crud = {
    type: 'ClientSide', id: 'orders',
    metadata: { type: 'Crud', searchable: true, rowRoute: 'orders/${row.id}', columns: [{ metadata: { id: 'name', label: 'Name' } }, { metadata: { id: 'pay', label: 'Pay', actionId: 'pay' } }] },
  };
  const { view, calls } = fakeView([crud], { rows, driver: { openRow: () => false } });
  r.page = view;
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'open-row', row: 0 }), deps(r)), { error: { code: 'unsupported' } });
  await answerQuery(query('run-action', { actionId: 'pay', row: 0, parameters: { now: true } }), deps(r));
  assert.deepEqual(calls.at(-1), { kind: 'run', args: ['pay', { id: 7, name: 'a', now: true }] });
  await answerQuery(query('run-action', { actionId: 'prevPage' }), deps(r));
  assert.deepEqual(calls.at(-1), { kind: 'page', args: [-1] });

  view.listingDrivers = {};
  assert.deepEqual(await answerQuery(query('run-action', { actionId: 'search' }), deps(r)), { error: { code: 'unsupported' } });
  assert.deepEqual(await answerQuery(query('set-fields', { values: { searchText: 'x' } }), deps(r)), { error: { code: 'unsupported' } });
});
