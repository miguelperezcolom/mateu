import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildScreenSummary, editableTargets, MAX_ROWS, MAX_TEXT, offeredActionIds } from './screenSummary.ts';

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
