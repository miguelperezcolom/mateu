/**
 * The pure half of a kanban board on React Native: a LIVE board's cards from the items of its
 * rowsSource, what a move does to the columns and what the move action receives. The same rules as
 * the web's libs/mateu kanbanModel.ts and Redwood's poc/core/kanban.mjs. On a phone a card does not
 * drag: its "Move…" picker offers the moves (up/down in its column, or to another column).
 */
import type { KanbanCard, KanbanColumn } from '../api/metadata';

type Dict = Record<string, unknown>;

export interface BoardCard extends KanbanCard {
  row?: Dict;
}

export interface BoardColumn extends Omit<KanbanColumn, 'cards'> {
  cards?: BoardCard[];
}

export interface LiveBoard {
  columns?: KanbanColumn[];
  columnField?: string;
  card?: KanbanCard;
  cardColors?: Record<string, string>;
  /** The item field that orders a column's cards; a move sends its new value. */
  orderField?: string;
}

export interface KanbanMove {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
}

const valueAt = (row: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((v, k) => (v != null && typeof v === 'object' ? (v as Dict)[k] : undefined), row);

/** `${row.x}` (dotted paths too) against an item, values as they are: unresolved → ''. */
export function rowText(template: string | undefined, row: Dict): string | undefined {
  if (template == null) return undefined;
  return template.replace(/\$\{\s*row\.([A-Za-z0-9_$.]+)\s*\}/g, (_all, path: string) => {
    const v = valueAt(row, path);
    return v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  });
}

/** The items of a source's answer: at its itemsPath, or the answer itself when it is a list. */
export function itemsOf(json: unknown, itemsPath?: string): Dict[] {
  const items = itemsPath ? valueAt(json, itemsPath) : json;
  return Array.isArray(items) ? (items.filter((i) => i && typeof i === 'object') as Dict[]) : [];
}

/** A sortable order value: a number (or a numeric text) as a number, anything else as text, absent = undefined. */
function orderValueOf(value: unknown): number | string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const n = Number(value);
  return typeof value === 'string' && value.trim() !== '' && Number.isFinite(n) ? n : String(value);
}

/** Compares two order values: numbers before texts, absent values last. */
function compareOrder(a: number | string | undefined, b: number | string | undefined): number {
  if (a === undefined || b === undefined) return a === b ? 0 : a === undefined ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * The declared columns filled with one card per item (its `columnField`, default `status`), in the
 * source's order — or sorted by `orderField` when the board declares one (items without it last).
 */
export function cardsFromRows(board: LiveBoard, rows: Dict[]): BoardColumn[] {
  const field = board.columnField || 'status';
  const tpl = board.card ?? {};
  const columns: BoardColumn[] = (board.columns ?? []).map((c) => ({ ...c, cards: [] }));
  const byId = new Map(columns.map((c) => [String(c.id), c]));
  for (const row of rows) {
    const column = byId.get(String(row[field] ?? ''));
    if (!column) continue;
    const color = rowText(tpl.color, row);
    column.cards!.push({
      id: rowText(tpl.id, row) || String(row['id'] ?? ''),
      title: rowText(tpl.title, row) ?? String(row['title'] ?? row['name'] ?? ''),
      description: rowText(tpl.description, row),
      badge: rowText(tpl.badge, row),
      color: color && board.cardColors?.[color] ? board.cardColors[color] : color,
      actionId: rowText(tpl.actionId, row),
      row,
    });
  }
  const order = board.orderField;
  if (order) {
    for (const column of columns) {
      column.cards = [...column.cards!].sort((a, b) => compareOrder(orderValueOf(a.row?.[order]), orderValueOf(b.row?.[order])));
    }
  }
  return columns;
}

/** The columns after a move (the index is the position AFTER the card left its place, clamped). */
export function moveCard(columns: BoardColumn[], move: KanbanMove): BoardColumn[] {
  const from = columns.find((c) => c.id === move.fromColumnId);
  const to = columns.find((c) => c.id === move.toColumnId);
  const card = from?.cards?.find((c) => c.id === move.cardId);
  if (!from || !to || !card) return columns;
  return columns.map((c) => {
    let cards = (c.cards ?? []).filter((x) => !(c === from && x === card));
    if (c === to) {
      const at = Math.max(0, Math.min(move.toIndex, cards.length));
      cards = [...cards.slice(0, at), card, ...cards.slice(at)];
    }
    return c === from || c === to ? { ...c, cards } : c;
  });
}

/**
 * The order value a moved card takes so that sorting by `orderField` keeps it where it was put, from
 * its neighbours in the target column AFTER the move (`after` = moveCard's result): halfway between
 * both, one past the previous, one before the next, 0 in an empty column — or the card's index when
 * a neighbour has no numeric order. Corpus: conformance/client/kanban-order.json.
 */
export function orderAfterMove(after: BoardColumn[], move: KanbanMove, orderField: string): number {
  const cards = after.find((c) => c.id === move.toColumnId)?.cards ?? [];
  const at = cards.findIndex((c) => c.id === move.cardId);
  if (at < 0) return move.toIndex;
  const numeric = (card: BoardCard | undefined) => {
    const v = card ? orderValueOf(card.row?.[orderField]) : undefined;
    return typeof v === 'number' ? v : undefined;
  };
  const prevCard = cards[at - 1];
  const nextCard = cards[at + 1];
  const prev = numeric(prevCard);
  const next = numeric(nextCard);
  if ((prevCard && prev === undefined) || (nextCard && next === undefined)) return at;
  if (prev !== undefined && next !== undefined) return (prev + next) / 2;
  if (prev !== undefined) return prev + 1;
  if (next !== undefined) return next - 1;
  return 0;
}

/**
 * What the move action receives: the card's item with where it went over it — and, with an
 * `orderField`, its new order value as `_toOrder` and over the item's own field.
 */
export function moveParameters(card: BoardCard | undefined, move: KanbanMove, orderField?: string, after?: BoardColumn[]): Dict {
  const parameters: Dict = {
    ...(card?.row ?? {}),
    _cardId: move.cardId,
    _fromColumnId: move.fromColumnId,
    _toColumnId: move.toColumnId,
    _toIndex: move.toIndex,
  };
  if (orderField && after) {
    const order = orderAfterMove(after, move, orderField);
    parameters[orderField] = order;
    parameters['_toOrder'] = order;
  }
  return parameters;
}

/** The moves a card's picker offers: up/down in its column, then to the end of each other column. */
export function movesOf(columns: BoardColumn[], cardId: string, columnId: string): { label: string; move: KanbanMove }[] {
  const column = columns.find((c) => c.id === columnId);
  const index = column?.cards?.findIndex((c) => c.id === cardId) ?? -1;
  if (!column || index < 0) return [];
  const base = { cardId, fromColumnId: columnId };
  const out: { label: string; move: KanbanMove }[] = [];
  if (index > 0) out.push({ label: 'Move up', move: { ...base, toColumnId: columnId, toIndex: index - 1 } });
  if (index < (column.cards?.length ?? 0) - 1) out.push({ label: 'Move down', move: { ...base, toColumnId: columnId, toIndex: index + 1 } });
  for (const other of columns) {
    if (other.id === columnId || !other.id) continue;
    out.push({ label: `Move to ${other.title ?? other.id}`, move: { ...base, toColumnId: other.id, toIndex: other.cards?.length ?? 0 } });
  }
  return out;
}

/** Where a card of a live board goes when tapped (`tasks/${row.id}`), or undefined. */
export function cardRouteOf(template: string | undefined, card: BoardCard): string | undefined {
  if (!template || !card.row) return undefined;
  const route = rowText(template, card.row);
  return route && !route.includes('${') ? route : undefined;
}
