import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultView, deleteView, listSavedViews, saveView, setDefaultView } from './savedViews.ts';
import { getHiddenColumns, setHiddenColumns } from './columnPrefs.ts';

test('saved views: save, replace by (trimmed) name, ignore empty names and empty snapshots', () => {
  const s = 'listing-a';
  assert.deepEqual(listSavedViews(s), []);
  saveView(s, { name: '  Palma ', values: { city: 'Palma' } });
  saveView(s, { name: 'Big', values: { amount_from: 100 } });
  saveView(s, { name: '', values: { x: 1 } });
  saveView(s, { name: '   ', values: { x: 1 } });
  saveView(s, { name: 'Empty', values: {} });
  assert.deepEqual(listSavedViews(s).map((v) => v.name), ['Palma', 'Big']);
  saveView(s, { name: 'Palma', values: { city: 'Palma', searchText: 'x' } });
  assert.deepEqual(listSavedViews(s).map((v) => v.name), ['Big', 'Palma']);
  assert.deepEqual(listSavedViews(s).find((v) => v.name === 'Palma')?.values, { city: 'Palma', searchText: 'x' });
  // scopes do not leak into each other
  assert.deepEqual(listSavedViews('listing-b'), []);
});

test('saved views: one default per scope, toggled; delete removes it and the empty scope', () => {
  const s = 'listing-c';
  saveView(s, { name: 'A', values: { a: 1 } });
  saveView(s, { name: 'B', values: { b: 1 } });
  assert.equal(defaultView(s), undefined);
  setDefaultView(s, 'A');
  assert.equal(defaultView(s)?.name, 'A');
  setDefaultView(s, 'B');
  assert.equal(defaultView(s)?.name, 'B');
  assert.equal(listSavedViews(s).filter((v) => v.isDefault).length, 1);
  setDefaultView(s, 'B'); // toggle off
  assert.equal(defaultView(s), undefined);
  deleteView(s, 'A');
  assert.deepEqual(listSavedViews(s).map((v) => v.name), ['B']);
  deleteView(s, 'B');
  assert.deepEqual(listSavedViews(s), []);
});

test('column prefs: hidden ids per scope, a copy is stored, empty clears', () => {
  const ids = ['amount'];
  setHiddenColumns('crud-1', ids);
  ids.push('city');
  assert.deepEqual(getHiddenColumns('crud-1'), ['amount']);
  assert.deepEqual(getHiddenColumns('crud-2'), []);
  setHiddenColumns('crud-1', []);
  assert.deepEqual(getHiddenColumns('crud-1'), []);
});
