import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cellA11yLabel, cellParameters, cellTone, groupHeaders, initialCollapsed, isActionableLink, matrixLines,
  shouldCommit, toggleSection, type MatrixGridMeta,
} from './matrixGrid.ts';

const meta: MatrixGridMeta = {
  rowHeaderLabel: 'Type',
  cellActionId: 'openCell',
  editActionId: 'editCell',
  columns: [
    { id: 'd1', label: 'Fri 9', group: 'October', tone: null },
    { id: 'd2', label: 'Sat 10', group: 'October', tone: 'warning' },
    { id: 'd3', label: 'Sun 1', group: 'November', tone: null },
    { id: 'd4', label: 'Mon 2', group: null, tone: null },
  ],
  sections: [
    {
      id: 'top', title: '', collapsed: true,
      rows: [{ id: 'occ', label: 'Occupancy', emphasis: true, cells: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }] }],
    },
    {
      id: 'rooms', title: 'Rooms', collapsed: false,
      rows: [
        { id: 'avail', label: 'Available', editable: true, cells: [{ value: '10' }, { value: '12', tone: 'danger', link: true }, { value: '9' }, { value: '8' }] },
        { id: 'sold', label: 'Sold', cells: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }] },
      ],
    },
    { id: 'rates', title: 'Rates', collapsed: true, rows: [{ id: 'bar', label: 'BAR', cells: [] }] },
  ],
};

test('group headers: one span per run of consecutive columns sharing a group', () => {
  assert.deepEqual(groupHeaders(meta.columns), [
    { label: 'October', start: 0, span: 2 },
    { label: 'November', start: 2, span: 1 },
    { label: '', start: 3, span: 1 },
  ]);
  assert.deepEqual(groupHeaders([{ id: 'a' }, { id: 'b' }]), []);
  assert.deepEqual(groupHeaders(null), []);
  // a group interrupted by another starts a new span
  assert.deepEqual(groupHeaders([{ group: 'A' }, { group: 'B' }, { group: 'A' }]).map((g) => g.span), [1, 1, 1]);
});

test('tones: the cell wins over the column; unknown tones are ignored', () => {
  assert.equal(cellTone({ value: 'x' }, meta.columns![1]), 'warning');
  assert.equal(cellTone({ value: 'x', tone: 'danger' }, meta.columns![1]), 'danger');
  assert.equal(cellTone({ value: 'x' }, meta.columns![0]), undefined);
  assert.equal(cellTone({ value: 'x', tone: 'purple' }, { tone: 'info' }), 'info');
});

test('sections: titled ones are toggle headers, untitled rows go to the top level, initial state = collapsed', () => {
  const collapsed = initialCollapsed(meta);
  assert.deepEqual([...collapsed], ['rates']); // the untitled section's flag is meaningless
  const lines = matrixLines(meta, collapsed);
  assert.deepEqual(lines.map((l) => (l.kind === 'section' ? `[${l.title}${l.collapsed ? '+' : '-'}]` : l.row.id)),
    ['occ', '[Rooms-]', 'avail', 'sold', '[Rates+]']);
  const opened = matrixLines(meta, toggleSection(collapsed, 'rates'));
  assert.deepEqual(opened.map((l) => (l.kind === 'section' ? l.title : l.row.id)), ['occ', 'Rooms', 'avail', 'sold', 'Rates', 'bar']);
  const closed = matrixLines(meta, toggleSection(collapsed, 'rooms'));
  assert.deepEqual(closed.map((l) => (l.kind === 'section' ? l.title : l.row.id)), ['occ', 'Rooms', 'Rates']);
});

test('cell parameters and link actionability', () => {
  const row = meta.sections![1].rows![0];
  assert.deepEqual(cellParameters(row, meta.columns![1], '12'), { _rowId: 'avail', _columnId: 'd2', _value: '12' });
  assert.equal(isActionableLink(meta, row.cells![1]), true);
  assert.equal(isActionableLink(meta, row.cells![0]), false);
  assert.equal(isActionableLink({ ...meta, cellActionId: null }, row.cells![1]), false);
});

test('no-op commits do not dispatch, nor anything without an editActionId', () => {
  assert.equal(shouldCommit(meta, '12', '12'), false);
  assert.equal(shouldCommit(meta, '12', '13'), true);
  assert.equal(shouldCommit(meta, null, ''), false);
  assert.equal(shouldCommit({ ...meta, editActionId: '' }, '12', '13'), false);
});

test('a11y label names the row, the column and the value', () => {
  assert.equal(cellA11yLabel(meta.sections![1].rows![0], meta.columns![1], '12'), 'Available, Sat 10: 12');
});
