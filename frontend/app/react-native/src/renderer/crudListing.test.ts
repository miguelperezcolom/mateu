// The CRUD listing view-model (crudListing.ts) — what the phone listing shows and sends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  activeFilterCount,
  allRowsSelected,
  applySearchToState,
  cellTone,
  columnDefsOf,
  listRowModel,
  extractListing,
  firstRowAction,
  isBlankFilterValue,
  nextSort,
  normalizeCrudData,
  pagingOf,
  sortMark,
  toggledSelection,
} from './crudListing.ts';

const page = (content: unknown[], extra: Record<string, unknown> = {}) => ({ content, ...extra });

test('a search response keyed by the crud id is reduced to its listing envelope, keeping totals and groups', () => {
  const envelope = { page: page([{ id: 1 }]), aggregates: { total: 3 } };
  assert.equal(normalizeCrudData({ crud1: envelope, other: 'x' }), envelope);
  assert.equal(normalizeCrudData(envelope), envelope);
  const bare = page([{ id: 1 }]);
  assert.equal(normalizeCrudData(bare), bare);
  assert.equal(normalizeCrudData(null), null);
  assert.deepEqual(extractListing(envelope), envelope);
  assert.deepEqual(extractListing(bare), {}, 'a bare page has no aggregates/groups');
});

test('paging counters come from the server page; a page without counters is one full page', () => {
  const p = pagingOf({ page: page([{ id: 1 }, { id: 2 }], { totalElements: 25, pageSize: 10, pageNumber: 1 }) });
  assert.equal(p.rows.length, 2);
  assert.equal(p.totalPages, 3);
  assert.equal(p.hasPrevious, true);
  assert.equal(p.hasNext, true);
  const last = pagingOf(page([{}], { totalElements: 21, pageSize: 10, pageNumber: 2 }));
  assert.equal(last.hasNext, false);
  const bare = pagingOf(page([{}, {}, {}]));
  assert.deepEqual({ ...bare, rows: bare.rows.length }, { rows: 3, totalElements: 3, pageSize: 3, pageNumber: 0, totalPages: 1, hasPrevious: false, hasNext: false });
  const rowsArray = pagingOf([{ a: 1 }]);
  assert.equal(rowsArray.rows.length, 1, 'a plain array of rows is accepted');
  const nothing = pagingOf(undefined);
  assert.deepEqual([nothing.rows.length, nothing.totalPages, nothing.hasNext], [0, 1, false]);
  assert.equal(pagingOf({ content: 'not rows' }).rows.length, 0);
});

test('a header tap cycles ascending, descending, none; another column restarts ascending', () => {
  let s = nextSort(null, 'name');
  assert.deepEqual(s, { field: 'name', direction: 'ascending' });
  assert.equal(sortMark(s, 'name'), ' ▲');
  s = nextSort(s, 'name');
  assert.equal(sortMark(s, 'name'), ' ▼');
  assert.equal(sortMark(s, 'age'), '');
  assert.equal(nextSort(s, 'name'), null);
  assert.deepEqual(nextSort(s, 'age'), { field: 'age', direction: 'ascending' });
});

test('blank filters are not counted and are removed from the state instead of being sent empty', () => {
  assert.equal(isBlankFilterValue([]), true);
  assert.equal(isBlankFilterValue(0), false);
  assert.equal(isBlankFilterValue(false), false);
  assert.equal(activeFilterCount({ a: '', b: null, c: [], d: 'x', e: ['A'], f: 0 }), 3);
  const state: Record<string, unknown> = { page: 4, status: 'OPEN', city: 'Palma', other: 1 };
  applySearchToState(state, 'ana', { status: '', city: 'Madrid', tags: ['A'] });
  assert.deepEqual(state, { page: 0, city: 'Madrid', other: 1, searchText: 'ana', tags: ['A'] });
});

test('selection toggles rows by identity, and select-all needs every row', () => {
  const a = { id: 1 };
  const b = { id: 1 };
  let sel = toggledSelection([], a);
  assert.deepEqual(sel, [a]);
  sel = toggledSelection(sel, b);
  assert.equal(sel.length, 2, 'an equal-looking row is another row');
  sel = toggledSelection(sel, a);
  assert.equal(sel[0], b);
  assert.equal(allRowsSelected([a, b], [b]), false);
  assert.equal(allRowsSelected([a, b], [b, a]), true);
  assert.equal(allRowsSelected([], []), false);
});

test('a non-navigable row press runs its first group action; rows without one do nothing', () => {
  const columns = [
    { metadata: { id: 'name', dataType: 'string' } },
    { metadata: { id: 'ops', dataType: 'actionGroup' } },
  ];
  assert.equal(firstRowAction(columns, { name: 'x', ops: { actions: [{ methodNameInCrud: 'checkIn' }, { methodNameInCrud: 'b' }] } }), 'action-on-row-checkIn');
  assert.equal(firstRowAction(columns, { name: 'x', ops: { actions: [] } }), '');
  assert.equal(firstRowAction([{}], {}), '');
});

test('column definitions: the row-action columns are not cells; display columns keep their own press only on navigable rows', () => {
  const columns = [
    { metadata: { id: 'name', label: 'Name', sortable: true, valueLabels: { A: 'Aa' } } },
    { id: 'status', label: 'Status' },
    { metadata: { id: 'open', dataType: 'action', label: 'Open' } },
    { metadata: { id: 'edit', label: 'Edit', stereotype: 'button', actionId: 'editRow', editable: true } },
  ];
  const plain = columnDefsOf(columns, undefined);
  assert.deepEqual(plain.map((c) => c.fieldId), ['name', 'status', 'edit']);
  assert.equal(plain[0].sortable, true);
  assert.deepEqual(plain[0].valueLabels, { A: 'Aa' });
  assert.equal(plain[1].label, 'Status');
  assert.equal(plain[2].display, false);
  assert.equal(plain[2].editable, true);
  assert.equal(plain[2].cellAction, 'editRow');
  const navigable = columnDefsOf(columns, { kind: 'action', actionId: 'view' });
  assert.equal(navigable[2].display, true);
  assert.equal(navigable[0].display, false);
});

test('a status cell is painted by its column tones, or by the status object it carries', () => {
  const col = { dataType: 'status', tones: { Available: 'success', OutOfStock: 'danger' } };
  assert.equal(cellTone('Available', col), 'success');
  assert.equal(cellTone('OutOfStock', col), 'danger');
  assert.equal(cellTone('Other', col), 'neutral', 'an unmapped status value is still a status');
  assert.equal(cellTone({ type: 'WARNING', message: 'Low' }, { dataType: '', tones: null }), 'warning');
  assert.equal(cellTone('x', { dataType: 'string', tones: null }), null);
  assert.equal(cellTone(null, col), null);
});

test('a list row: first column headlines, statuses and true booleans become chips, the rest is supporting text', () => {
  const cols = [
    { fieldId: 'id', label: 'Id', dataType: 'string', stereotype: '', valueLabels: null, tones: null },
    { fieldId: 'name', label: 'Name', dataType: 'string', stereotype: '', valueLabels: null, tones: null },
    { fieldId: 'certified', label: 'Certified', dataType: 'bool', stereotype: '', valueLabels: null, tones: null },
    { fieldId: 'status', label: 'Status', dataType: 'status', stereotype: '', valueLabels: { OutOfStock: 'Out of stock' }, tones: { OutOfStock: 'danger' } },
    { fieldId: 'price', label: 'Price', dataType: 'number', stereotype: '', valueLabels: null, tones: null },
  ];
  const text = (v: unknown, c: { valueLabels?: Record<string, string> | null }) => (v == null ? '' : c.valueLabels?.[String(v)] ?? String(v));
  assert.deepEqual(listRowModel({ id: '0006', name: 'Producto 6', certified: true, status: 'OutOfStock', price: 30 }, cols, text), {
    headline: '0006',
    supporting: 'Producto 6 · 30',
    chips: [{ label: 'Certified', tone: 'neutral' }, { label: 'Out of stock', tone: 'danger' }],
  });
  assert.deepEqual(listRowModel({ id: '1', name: 'N', certified: false, status: null, price: 1 }, cols, text).chips, []);
});
