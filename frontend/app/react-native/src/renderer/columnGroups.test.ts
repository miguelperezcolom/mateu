import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flattenColumnGroups } from './columnGroups.ts';
import { gridColumnsOf } from './wireWidgets.ts';

const col = (id: string, label: string) => ({ type: 'ClientSide', id, metadata: { type: 'GridColumn', id, label }, children: [] });
// the wire shape pinned by GridColumnGroupSyncTest: the grouped columns in metadata.columns
const group = {
  type: 'ClientSide', id: 'occupancy', children: [],
  metadata: { type: 'GridGroupColumn', id: 'occupancy', label: 'Occupancy', columns: [col('adults', 'Adults'), col('children', 'Children')] },
};

test('a column group is flattened into its columns, the group label prefixing theirs', () => {
  const flat = flattenColumnGroups([col('room', 'Room'), group]);
  assert.deepEqual(flat.map((c) => [c.id, c.metadata.label]), [
    ['room', 'Room'], ['adults', 'Occupancy · Adults'], ['children', 'Occupancy · Children'],
  ]);
  // untouched columns are the same objects; the envelope of a grouped one survives
  assert.equal(flat[0], flattenColumnGroups([flat[0]])[0]);
  assert.equal(flat[1].type, 'ClientSide');
});

test('nested groups compose their prefixes; an unlabelled group adds none; bare metadata stays bare', () => {
  const flat = flattenColumnGroups<Record<string, unknown>>([{ type: 'GridGroupColumn', label: 'A', columns: [
    { type: 'GridGroupColumn', label: 'B', columns: [{ type: 'GridColumn', id: 'x', label: 'X' }] },
    { type: 'GridGroupColumn', columns: [{ type: 'GridColumn', id: 'y' }] },
  ] }]);
  assert.deepEqual(flat.map((c) => c['label']), ['A · B · X', 'A · y']);
});

test('a fluent Grid shows every grouped column, headed with its group', () => {
  const cols = gridColumnsOf({ type: 'ClientSide', metadata: { type: 'Grid', content: [col('room', 'Room'), group] } });
  assert.deepEqual(cols.map((c) => [c.id, c.label]), [
    ['room', 'Room'], ['adults', 'Occupancy · Adults'], ['children', 'Occupancy · Children'],
  ]);
});
