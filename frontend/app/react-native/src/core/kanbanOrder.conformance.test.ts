import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cardsFromRows, moveCard, moveParameters } from './kanban.ts';

// The Kanban orderField corpus (conformance/client/kanban-order.json) — the same file the web,
// Redwood and IntelliJ suites run.

type Row = Record<string, unknown>;
interface Move { cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/kanban-order.json', import.meta.url)), 'utf8',
)) as {
  columns: string[];
  rows: Row[];
  sort: { name: string; orderField?: string; rows: Row[]; expected: Record<string, string[]> }[];
  move: { name: string; orderField: string; rows?: Row[]; move: Move; expectedOrder: number }[];
};

const boardOf = (orderField?: string) => ({ columns: corpus.columns.map((id) => ({ id, title: id })), orderField });

for (const c of corpus.sort) {
  test(`kanban order (sort): ${c.name}`, () => {
    const columns = cardsFromRows(boardOf(c.orderField), c.rows);
    assert.deepEqual(Object.fromEntries(columns.map((col) => [col.id, (col.cards ?? []).map((card) => card.id)])), c.expected);
  });
}

for (const c of corpus.move) {
  test(`kanban order (move): ${c.name}`, () => {
    const columns = cardsFromRows(boardOf(c.orderField), c.rows ?? corpus.rows);
    const card = columns.find((col) => col.id === c.move.fromColumnId)?.cards?.find((x) => x.id === c.move.cardId);
    const parameters = moveParameters(card, c.move, c.orderField, moveCard(columns, c.move));
    assert.equal(parameters['_toOrder'], c.expectedOrder);
    assert.equal(parameters[c.orderField], c.expectedOrder);
  });
}
