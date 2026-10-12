import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAggregateFooters,
  formatAggregateValue,
  groupLabelColumnId,
  groupRowCellText,
  interleaveGroupRows,
  isGroupRow,
  type GroupRow,
} from './listingGroups.ts';

const rows = [
  { id: 1, city: 'Palma', amount: 10 },
  { id: 2, city: 'Palma', amount: 5 },
  { id: 3, city: 'Madrid', amount: 7 },
  { id: 4, city: null, amount: 1 },
];

test('no groupBy or no group summaries: the rows pass through untouched', () => {
  assert.deepEqual(interleaveGroupRows(rows, undefined, [{ value: 'Palma', count: 2, aggregates: {} }]), rows);
  assert.deepEqual(interleaveGroupRows(rows, 'city', []), rows);
  assert.deepEqual(interleaveGroupRows(rows, 'city', null), rows);
  assert.deepEqual(interleaveGroupRows(null, 'city', [{ value: 'x', count: 1, aggregates: {} }]), []);
});

test('a marker row opens every contiguous group, using the server summary matched by value', () => {
  const groups = [
    { value: 'Palma', count: 12, aggregates: { amount: 150 } },
    { value: 'Madrid', count: 3, aggregates: { amount: 7 } },
  ];
  const out = interleaveGroupRows(rows, 'city', groups);
  assert.equal(out.length, rows.length + 3);
  const markers = out.filter(isGroupRow) as GroupRow[];
  assert.deepEqual(markers.map((m) => m.__mateuGroup.value), ['Palma', 'Madrid', '']);
  // the WHOLE-set summary wins over the page count
  assert.equal(markers[0].__mateuGroup.count, 12);
  // a run with no summary gets one synthesized from the page rows
  assert.deepEqual(markers[2].__mateuGroup, { value: '', count: 1, aggregates: {} });
  assert.ok(markers.every((m) => m.__mateuGroupBy === 'city'));
  // marker ids never collide with each other nor with data rows
  assert.equal(new Set(markers.map((m) => m._rowNumber)).size, 3);
  assert.ok(markers[0]._rowNumber.startsWith('__mateuGroup:0:'));
  assert.equal(isGroupRow(out[1]), false);
  assert.equal(isGroupRow(null), false);
});

test('aggregate formatting: money like the money cells, count as integer, else ≤2 decimals', () => {
  assert.equal(formatAggregateValue(1234.5, { dataType: 'money' }), '1.234,50');
  assert.equal(formatAggregateValue(3, { stereotype: 'money' }), '3,00');
  assert.equal(formatAggregateValue(2.6, { aggregate: 'count' }), new Intl.NumberFormat(undefined).format(3));
  assert.equal(formatAggregateValue(1.23456, { aggregate: 'avg' }), new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(1.23));
  assert.equal(formatAggregateValue(null, { aggregate: 'sum' }), '');
  assert.equal(formatAggregateValue(undefined, { aggregate: 'sum' }), '');
});

test('the group label sits in the groupBy column when visible, else the first column', () => {
  assert.equal(groupLabelColumnId('city', ['id', 'city']), 'city');
  assert.equal(groupLabelColumnId('city', [undefined, 'id', 'amount']), 'id');
  assert.equal(groupLabelColumnId(undefined, ['id']), 'id');
});

test('group header cells: label (count), aggregates per aggregated column, blank elsewhere', () => {
  const marker = interleaveGroupRows(rows, 'city', [{ value: 'Palma', count: 2, aggregates: { amount: 15 } }])[0] as GroupRow;
  assert.equal(groupRowCellText(marker, { id: 'city' }, 'city'), 'Palma (2)');
  assert.equal(groupRowCellText(marker, { id: 'amount', aggregate: 'sum', dataType: 'money' }, 'city'), '15,00');
  assert.equal(groupRowCellText(marker, { id: 'id' }, 'city'), '');
});

test('footers: totals of the whole filtered set, "Total" label, none when nothing aggregates', () => {
  const cols = [{ id: 'city' }, { id: 'amount', aggregate: 'sum', dataType: 'money' }, { id: 'n', aggregate: 'count' }];
  assert.deepEqual(buildAggregateFooters(cols, { aggregates: { amount: 23, n: 4 }, page: { totalElements: 4 } }, undefined), {
    amount: '23,00',
    n: new Intl.NumberFormat(undefined).format(4),
    city: 'Total',
  });
  // grouped by the first column → the row count joins the label
  assert.equal(buildAggregateFooters(cols, { aggregates: { amount: 1 }, page: { totalElements: 9 } }, 'city')?.city, 'Total (9)');
  // an aggregate missing from the envelope is simply not shown
  assert.equal(buildAggregateFooters(cols, { aggregates: {} }, undefined)?.amount, undefined);
  // first column itself aggregated keeps its value, no "Total"
  assert.deepEqual(buildAggregateFooters([{ id: 'a', aggregate: 'sum' }], { aggregates: { a: 2 } }, undefined), {
    a: new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(2),
  });
  assert.equal(buildAggregateFooters(cols, { page: {} }, undefined), undefined);
  assert.equal(buildAggregateFooters([{ id: 'x' }], { aggregates: { x: 1 } }, undefined), undefined);
  assert.equal(buildAggregateFooters(cols, null, undefined), undefined);
});
