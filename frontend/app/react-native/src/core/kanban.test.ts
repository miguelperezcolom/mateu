import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardRouteOf, cardsFromRows, itemsOf, moveCard, moveParameters, movesOf, rowText } from './kanban.ts';

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
