import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildScreenSummary, cap, editableTargets, focusOf, MAX_ACTIONS, MAX_FIELDS, MAX_ROWS, MAX_TEXT, offeredAction, offeredActionIds, pageOf } from './screenSummary.ts';

const field = (fieldId: string, extra: Record<string, unknown> = {}) => ({ type: 'ClientSide', metadata: { type: 'FormField', fieldId, label: fieldId.toUpperCase(), dataType: 'string', ...extra } });
const button = (actionId: string, label: string, extra: Record<string, unknown> = {}) => ({ type: 'ClientSide', metadata: { type: 'Button', actionId, label, ...extra } });

const page = {
  type: 'ServerSide',
  actions: [{ id: 'save' }, { id: 'archive' }, { id: 'search' }],
  initialData: { name: 'Ada' },
  children: [
    {
      type: 'ClientSide',
      metadata: { type: 'Page', title: 'Order ${state.name}', subtitle: 'Edit it' },
      children: [
        field('name', { required: true }),
        field('password', { stereotype: 'password' }),
        field('notes', { readOnly: true }),
        field('hiddenByRule'),
        field('status', { options: [{ value: 'A', label: 'Active' }] }),
        button('save', 'Save'),
        button('delete', 'Delete', { disabled: true }),
      ],
    },
  ],
};

test('fields, header and actions come from the rendered tree and its state, never more', () => {
  const s = buildScreenSummary({
    route: '/orders/1',
    windowTitle: 'Order',
    view: { content: page, state: { name: 'Grace', password: 'secret' }, fieldAttributes: { hiddenByRule: { hidden: true } }, fieldErrors: { name: 'Too short' } },
    app: { title: 'Shop', user: { name: 'ann', accessToken: 'x' } },
  });
  assert.equal(s['focus'], 'page');
  assert.deepEqual(s['header'], { title: 'Order Grace', subtitle: 'Edit it' });
  assert.deepEqual(s['user'], { name: 'ann' });
  const fields = s['fields'] as Record<string, unknown>[];
  assert.deepEqual(fields.map((f) => f['id']), ['name', 'password', 'notes', 'status']);
  assert.equal(fields[0]['value'], 'Grace');
  assert.equal(fields[0]['required'], true);
  assert.equal(fields[0]['error'], 'Too short');
  assert.equal(fields[1]['value'], '••••••');
  assert.equal(fields[2]['readOnly'], true);
  assert.deepEqual(fields[3]['options'], [{ value: 'A', label: 'Active' }]);
  assert.deepEqual(s['actions'], [{ id: 'save', label: 'Save', enabled: true }, { id: 'delete', label: 'Delete', enabled: false }]);
  assert.deepEqual(s['otherActionIds'], ['archive']);
  assert.ok(!JSON.stringify(s).includes('secret'));
  assert.deepEqual([...offeredActionIds(s)].sort(), ['archive', 'delete', 'save']);
  assert.deepEqual([...editableTargets(s).keys()], ['name', 'password', 'status']);
});

test('an open overlay is in front of the page; long text and rows are capped and said so', () => {
  const rows = Array.from({ length: MAX_ROWS + 5 }, (_, i) => ({ id: i, name: 'n' + i, _hidden: 1 }));
  const listingNode = {
    type: 'ClientSide',
    id: 'orders',
    metadata: {
      type: 'Crud', title: 'Orders', searchable: true, rowRoute: 'orders/${row.id}',
      columns: [{ metadata: { id: 'name', label: 'Name' } }],
      filters: [{ fieldId: 'status', label: 'Status', dataType: 'string' }],
      toolbar: [{ metadata: { type: 'Button', actionId: 'new', label: 'New' } }],
    },
  };
  const s = buildScreenSummary({
    route: '/orders',
    view: { content: { type: 'ServerSide', children: [listingNode] }, state: {}, listings: { orders: { page: { content: rows, totalElements: 99, pageNumber: 0, pageSize: 55 } } }, searchTexts: { orders: 'ad' } },
    overlay: {
      component: { metadata: { type: 'Drawer', headerTitle: 'Edit' } },
      view: { content: { type: 'ServerSide', children: [field('note')] }, state: { note: 'x'.repeat(MAX_TEXT + 10) } },
    },
    messages: Array.from({ length: 12 }, (_, i) => ({ variant: 'info', text: 'm' + i })),
  });
  assert.equal(s['focus'], 'overlay');
  const overlay = s['overlay'] as Record<string, unknown>;
  assert.equal(overlay['kind'], 'drawer');
  assert.equal(overlay['title'], 'Edit');
  const note = (overlay['fields'] as Record<string, unknown>[])[0];
  assert.equal((note['value'] as string).length, MAX_TEXT + 1);
  const listing = ((s['page'] as Record<string, unknown>)['listings'] as Record<string, unknown>[])[0];
  assert.equal(listing['searchText'], 'ad');
  assert.equal(listing['totalElements'], 99);
  assert.equal((listing['rows'] as unknown[]).length, MAX_ROWS);
  assert.deepEqual((listing['rows'] as unknown[])[0], { name: 'n0' });
  assert.deepEqual(listing['rowActions'], [{ id: 'open-row', label: 'Open' }]);
  assert.deepEqual(listing['builtInActions'], ['search', 'nextPage', 'prevPage']);
  assert.deepEqual((s['messages'] as unknown[]).length, 10);
  assert.deepEqual(s['truncated'], ['overlay.fields.note', 'page.listings.orders.rows'].map((p) => p.replace(/^page\./, '')).sort());
  // the overlay is in front: what a set-fields may write is its field
  assert.deepEqual([...editableTargets(s).keys()], ['note']);
});

test('the app shell: context selectors, header actions (nested), and a user without secrets', () => {
  const options = Array.from({ length: 55 }, (_, i) => ({ value: `h${i}`, label: `Hotel ${i}` }));
  const s = buildScreenSummary({
    route: '/x',
    app: {
      title: 'PMS',
      user: { name: 'Ana', accessToken: 'abc', roles: ['x'], id: 3 },
      contextSelectors: [{ fieldName: 'hotel', label: 'Hotel', options }, { fieldName: 'year', options: [] }],
      contextActions: [{ actionId: 'tools', children: [{ actionId: 'export', label: 'Export', route: '/export' }] }],
    },
    appState: { hotel: 'h1' },
  });
  assert.deepEqual(s['ui'], { appTitle: 'PMS' });
  assert.deepEqual(s['user'], { name: 'Ana', id: 3 });
  const ctx = s['appContext'] as Record<string, unknown>[];
  assert.equal(ctx[0]['valueLabel'], 'Hotel 1');
  assert.equal((ctx[0]['options'] as unknown[]).length, 50);
  assert.deepEqual(ctx[1], { field: 'year', label: 'year', value: '', options: [] });
  assert.deepEqual(s['appActions'], [{ id: 'tools', label: 'tools', children: [{ id: 'export', label: 'Export', navigatesTo: '/export' }] }]);
  assert.ok((s['truncated'] as string[]).includes('appContext.hotel.options'));
  const ids = offeredActionIds(s);
  assert.ok(ids.has('tools') && ids.has('export'));
  assert.equal(offeredAction(s, 'export')?.['navigatesTo'], '/export');
  assert.equal(offeredAction(s, 'nope'), undefined);
  assert.equal(buildScreenSummary({ route: '', app: { user: 'ana' } })['user'], 'ana');
});

test('header extras, button groups, sourced options, rows from a REST source and value labels', () => {
  const s = buildScreenSummary({
    route: '/r',
    view: {
      content: {
        type: 'ServerSide',
        children: [
          {
            type: 'ClientSide',
            metadata: {
              type: 'Page', title: 'T', timestamp: 'Updated today', badges: [{ text: 'New' }], kpis: [{ title: 'Total', text: '3' }],
              breadcrumbs: [{ text: 'Home', link: '/' }, { text: 'Here' }],
            },
            children: [
              field('country', { optionsSource: { ref: 'countries' }, label: { not: 'a string' } }),
              field('photo'),
              field('deep'),
              field('fn'),
              { type: 'ClientSide', metadata: { type: 'Button', label: 'More', children: [{ metadata: { actionId: 'a1', label: 'A1' } }, { actionId: 'a2', label: 'A2' }] } },
              {
                type: 'ClientSide', id: 'remote',
                metadata: { type: 'Crud', rowsSource: { url: '/api' }, columns: [{ metadata: { id: 'status', label: 'Status', valueLabels: { A: 'Active' } } }] },
              },
            ],
          },
        ],
      },
      state: { photo: 'data:image/png;base64,AAAA', deep: { a: { b: { c: { d: { e: 1 } } } } }, fn: () => 1 },
      listings: { remote: { page: { content: [{ status: 'A' }, { status: 'B' }], totalElements: 2 } } },
    },
  });
  assert.deepEqual(s['header'], { title: 'T', timestamp: 'Updated today', badges: ['New'], kpis: [{ title: 'Total', value: '3' }] });
  assert.deepEqual(s['breadcrumbs'], [{ label: 'Home', route: '/' }, { label: 'Here' }]);
  const fields = s['fields'] as Record<string, unknown>[];
  const byId = (id: string) => fields.find((f) => f['id'] === id)!;
  assert.equal(byId('country')['optionsFrom'], 'a source the renderer fetches');
  assert.equal(byId('country')['label'], undefined); // a non-text label is not shown
  assert.equal(byId('photo')['value'], '[data:image/png data, 26 characters]');
  assert.deepEqual(byId('deep')['value'], { a: { b: { c: { d: '{…}' } } } });
  assert.equal(byId('fn')['value'], null);
  assert.ok((s['truncated'] as string[]).includes('fields.photo'));
  assert.ok((s['truncated'] as string[]).includes('fields.deep'));
  const more = (s['actions'] as Record<string, unknown>[])[0];
  assert.deepEqual(more['children'], [{ id: 'a1', label: 'A1', enabled: true }, { id: 'a2', label: 'A2', enabled: true }]);
  const listing = (s['listings'] as Record<string, unknown>[])[0];
  assert.deepEqual(listing['rows'], [{ status: 'Active' }, { status: 'B' }]);
  assert.match(String(listing['rowsFrom']), /REST source/);
  assert.equal(listing['builtInActions'], undefined);
});

test('fields and actions are capped at their maximum and said so', () => {
  const children = [
    ...Array.from({ length: MAX_FIELDS + 5 }, (_, i) => field(`f${i}`)),
    ...Array.from({ length: MAX_ACTIONS + 5 }, (_, i) => button(`b${i}`, `B${i}`)),
  ];
  const s = buildScreenSummary({ route: '/', view: { content: { type: 'ServerSide', children } } });
  assert.equal((s['fields'] as unknown[]).length, MAX_FIELDS);
  assert.equal((s['actions'] as unknown[]).length, MAX_ACTIONS);
  assert.deepEqual(s['truncated'], ['actions', 'fields']);
});

test('pageOf reads every envelope shape; cap bounds lists, maps and odd values; focusOf picks the front', () => {
  const p = { content: [1] };
  assert.equal(pageOf({ crud: { page: p } }), p);
  assert.equal(pageOf({ page: p }), p);
  assert.equal(pageOf(p), p);
  assert.equal(pageOf({ other: 1 }), null);
  assert.equal(pageOf('x'), null);
  const notes: string[] = [];
  const t = { add: (x: string) => void notes.push(x) };
  assert.equal((cap(Array.from({ length: 60 }, (_, i) => i), 'l', t, 0) as unknown[]).length, 50);
  const big = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`k${i}`, i]));
  assert.equal(Object.keys(cap(big, 'm', t, 0) as object).length, 50);
  assert.equal(cap(undefined, 'u', t, 0), null);
  assert.equal(cap(42, 'n', t, 0), 42);
  assert.deepEqual(notes, ['l', 'm']);
  assert.equal(focusOf({ page: { a: 1 } })['a'], 1);
  assert.equal(focusOf({ overlay: { b: 2 }, page: {} })['b'], 2);
});
