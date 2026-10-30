import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellActionOf, isDisplayColumn, rowOpenLabel, rowOpenOf, rowPressOf, rowRouteFields, rowRouteOf } from './rowOpen.ts';

test('U1 a listing is navigable by its rowRoute (wins) or a view column; otherwise not', () => {
  assert.deepEqual(rowOpenOf('people/${row.id}', [{ actionId: 'view' }]), { kind: 'route', template: 'people/${row.id}' });
  assert.deepEqual(rowOpenOf(null, [{ id: 'name', actionId: 'view' }, { id: 'city' }]), { kind: 'action', actionId: 'view' });
  assert.equal(rowOpenOf('', [{ id: 'x', actionId: 'approve' }]), undefined);
});

test('U1 display columns keep their own press; plain columns and the view column open the row', () => {
  assert.equal(isDisplayColumn({ id: 'name', actionId: 'view' }), false);
  assert.equal(isDisplayColumn({ id: 'city', dataType: 'string' }), false);
  assert.equal(isDisplayColumn({ id: 's', dataType: 'status' }), false);
  for (const dataType of ['action', 'actionGroup', 'menu', 'component', 'link']) {
    assert.equal(isDisplayColumn({ id: 'c', dataType }), true, dataType);
  }
  assert.equal(isDisplayColumn({ id: 'c', stereotype: 'button' }), true);
  assert.equal(isDisplayColumn({ id: 'c', actionId: 'approve' }), true);
  assert.equal(isDisplayColumn({ id: 'c', editable: true }), true);
  assert.equal(cellActionOf({ actionId: 'approve' }), 'approve');
  assert.equal(cellActionOf({ actionId: 'view' }), '', 'the view column is the row, not a cell action');
});

test('U1 pressing a row: route resolved against the row, or the view action with the row', () => {
  assert.deepEqual(rowPressOf({ kind: 'route', template: 'people/${row.id}' }, { id: 7 }), { kind: 'route', route: 'people/7' });
  assert.equal(rowPressOf({ kind: 'route', template: 'people/${row.id}' }, { name: 'x' }), undefined, 'unresolved → nothing');
  assert.deepEqual(rowPressOf({ kind: 'action', actionId: 'view' }, { id: 1 }), { kind: 'action', actionId: 'view', parameters: { id: 1 } });
  assert.equal(rowPressOf({ kind: 'action', actionId: 'view' }, { __mateuGroup: {} }), undefined, 'group rows never open');
  assert.equal(rowPressOf({ kind: 'action', actionId: 'view' }, { id: 1, viewable: false }), undefined);
  assert.equal(rowPressOf(undefined, { id: 1 }), undefined);
  assert.equal(rowRouteOf('/orders/${row.order.id}', { order: { id: 'A1' } }), 'orders/A1');
});

test('U1 a pressable row is named after what it opens', () => {
  assert.equal(rowOpenLabel('Ada'), 'Open Ada');
  assert.equal(rowOpenLabel(''), 'Open');
});

test('the fields a rowRoute needs are fetched with the row: without them a tap on it did nothing', () => {
  assert.deepEqual(rowRouteFields('people/${row.id}'), ['id']);
  assert.deepEqual(rowRouteFields('orders/${row.customer.id}/${ row.number }/${row.number}'), ['customer', 'number']);
  assert.deepEqual(rowRouteFields(undefined), []);
  assert.deepEqual(rowRouteFields('people'), []);
});
