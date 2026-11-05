import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardRouteOf, cardsFromRows, dropTargetOf, edgeScrollStep, itemsOf, moveCard, moveOfDrop, moveParameters, movesOf, rowText, type ColumnGeometry } from './kanban.ts';

const board = {
  columns: [{ id: 'backlog', title: 'Backlog' }, { id: 'done', title: 'Done' }],
  card: { title: '${row.title}', badge: '${row.priority}', color: '${row.priority}' },
  cardColors: { urgent: '#dc2626' },
};
const rows = [
  { id: 1, title: 'Varnish', status: 'backlog', priority: 'urgent' },
  { id: 2, title: 'Inpaint', status: 'backlog', priority: 'high' },
  { id: 3, title: 'Mount', status: 'done', priority: 'low' },
  { id: 4, title: 'Lost', status: 'archived' },
];

test('a live board: one card per item in the column its status names, drawn from the template', () => {
  const columns = cardsFromRows(board, itemsOf({ content: rows }, 'content'));
  assert.deepEqual(columns.map((c) => c.cards!.map((x) => x.title)), [['Varnish', 'Inpaint'], ['Mount']]);
  assert.equal(columns[0].cards![0].color, '#dc2626');
  assert.equal(columns[0].cards![1].color, 'high');
  assert.equal(columns[0].cards![0].id, '1');
  assert.equal(rowText('${row.a.b}', { a: { b: 7 } }), '7');
  assert.equal(cardRouteOf('tasks/${row.id}', columns[0].cards![0]), 'tasks/1');
});

test('the Move picker: up/down in its column, then to each other column; a move and its parameters', () => {
  const columns = cardsFromRows(board, rows);
  assert.deepEqual(movesOf(columns, '1', 'backlog').map((m) => m.label), ['Move down', 'Move to Done']);
  assert.deepEqual(movesOf(columns, '2', 'backlog').map((m) => m.label), ['Move up', 'Move to Done']);
  const move = movesOf(columns, '1', 'backlog')[1].move;
  assert.deepEqual(move, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'done', toIndex: 1 });
  assert.deepEqual(moveCard(columns, move).map((c) => c.cards!.map((x) => x.id)), [['2'], ['3', '1']]);
  assert.deepEqual(moveParameters(columns[0].cards![0], move), { ...rows[0], _cardId: '1', _fromColumnId: 'backlog', _toColumnId: 'done', _toIndex: 1 });
  assert.equal(moveCard(columns, { ...move, cardId: 'nope' }), columns);
});

// ── dragging a card ──────────────────────────────────────────────────────────────────────────────
const dragGeometry = (): ColumnGeometry[] => [
  { id: 'a', x: 0, width: 200, listTop: 40, scrollY: 0, cards: [{ id: 'a1', y: 0, height: 100 }, { id: 'a2', y: 108, height: 100 }, { id: 'a3', y: 216, height: 100 }] },
  { id: 'b', x: 212, width: 200, listTop: 40, scrollY: 0, cards: [{ id: 'b1', y: 0, height: 100 }] },
  { id: 'c', x: 424, width: 200, listTop: 40, scrollY: 0, cards: [] },
];

test('a card held over another column lands before the first card whose middle is below the finger', () => {
  assert.equal(dropTargetOf(dragGeometry(), 300, 60, 'a1')?.index, 0);
  assert.equal(dropTargetOf(dragGeometry(), 300, 120, 'a1')?.index, 1);
  assert.equal(dropTargetOf(dragGeometry(), 300, 60, 'a1')?.columnId, 'b');
});

test('an empty column takes the card at its start', () => {
  assert.deepEqual(dropTargetOf(dragGeometry(), 500, 300, 'a1'), { columnId: 'c', index: 0, lineY: 0 });
});

test('the dragged card does not count: the index is after it left its place', () => {
  // finger over a3's lower half, dragging a1: past a2 and a3 → the end of a list of two
  assert.equal(dropTargetOf(dragGeometry(), 100, 40 + 300, 'a1')?.index, 2);
  // dropped back where it was: nothing moves
  const target = dropTargetOf(dragGeometry(), 100, 45, 'a1')!;
  const columns = [{ id: 'a', cards: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] }];
  assert.equal(moveOfDrop(columns, 'a1', 'a', target), undefined);
});

test('a scrolled list and a scrolled board count', () => {
  const scrolled = dragGeometry();
  scrolled[0]!.scrollY = 216;
  assert.equal(dropTargetOf(scrolled, 100, 45, 'zz')?.index, 2);
});

test('over a gap or past the last column, the nearest column', () => {
  assert.equal(dropTargetOf(dragGeometry(), 205, 60, 'x')?.columnId, 'a');
  assert.equal(dropTargetOf(dragGeometry(), 9000, 60, 'x')?.columnId, 'c');
  assert.equal(dropTargetOf([], 0, 0, 'x'), undefined);
});

test('a drop on another column is the move the picker would make', () => {
  const columns = [{ id: 'a', cards: [{ id: 'a1' }] }, { id: 'b', cards: [] }];
  assert.deepEqual(moveOfDrop(columns, 'a1', 'a', { columnId: 'b', index: 0, lineY: 0 }), { cardId: 'a1', fromColumnId: 'a', toColumnId: 'b', toIndex: 0 });
});

test('the board scrolls only near its edges, faster the closer', () => {
  assert.equal(edgeScrollStep(500, 0, 1000), 0);
  assert.ok(edgeScrollStep(10, 0, 1000) < 0);
  assert.ok(edgeScrollStep(990, 0, 1000) > 0);
  assert.ok(edgeScrollStep(990, 0, 1000) > edgeScrollStep(950, 0, 1000));
});
