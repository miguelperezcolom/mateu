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

/** The declared columns filled with one card per item (its `columnField`, default `status`). */
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

/** What the move action receives: the card's item with where it went over it. */
export function moveParameters(card: BoardCard | undefined, move: KanbanMove): Dict {
  return {
    ...(card?.row ?? {}),
    _cardId: move.cardId,
    _fromColumnId: move.fromColumnId,
    _toColumnId: move.toColumnId,
    _toIndex: move.toIndex,
  };
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
