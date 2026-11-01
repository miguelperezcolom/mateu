import { stableHashOf } from './overviews.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): a kanban board's pure half —
// a LIVE board's cards from the items of its rowsSource, what a move does to the columns and the
// action it runs. The web's libs/mateu kanbanModel.ts is the same rules (RN core/kanban.ts and the
// IntelliJ plugin's KanbanModel.kt too).

/** The OnLoad action that loads a live board's items (answered in the browser, restSources.mjs). */
export const KANBAN_ACTION = '__kanban__:'

/** Where a live board's items are kept (ctx.data[key]) — from what it IS, not its position. */
export function kanbanKeyOf(md) {
  const m = md || {}
  return 'kanban-' + stableHashOf(JSON.stringify([m.rowsSource || null, (m.columns || []).map((c) => c && c.id), m.columnField || '']))
}

/** The Kanban nodes of a tree. */
export function kanbanNodesOf(tree) {
  const out = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (n.metadata && n.metadata.type === 'Kanban') out.push(n)
    for (const c of n.children || []) walk(c)
  }
  walk(tree)
  return out
}

/** The load actions of a context's live boards. */
export function kanbanTriggersOf(ctx) {
  return kanbanNodesOf(ctx && ctx.tree).filter((n) => n.metadata.rowsSource).map((n) => KANBAN_ACTION + kanbanKeyOf(n.metadata))
}

const valueAt = (row, path) => String(path).split('.').reduce((v, k) => (v != null && typeof v === 'object' ? v[k] : undefined), row)

/** `${row.x}` (dotted paths too) against an item, values as they are (not a url): unresolved → ''. */
export function kanbanTextOf(template, row) {
  if (template == null) return ''
  return String(template).replace(/\$\{\s*row\.([A-Za-z0-9_$.]+)\s*\}/g, (all, path) => {
    const v = valueAt(row, path)
    return v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v))
  })
}

/** The items of a source's answer: at its itemsPath, or the answer itself when it is a list. */
export function kanbanItemsOf(json, itemsPath) {
  const items = itemsPath ? valueAt(json, itemsPath) : json
  return Array.isArray(items) ? items.filter((i) => i && typeof i === 'object') : []
}

/**
 * The declared columns filled with one card per item, in the source's order: an item goes to the
 * column whose id equals its `columnField` (default `status`); one naming no declared column is left
 * out. A card's texts come from the `card` template, its id defaulting to the item's `id`; a colour
 * naming a key of `cardColors` takes that value. Each card keeps its item (`row`).
 */
export function kanbanCardsFromRows(md, rows) {
  const field = md.columnField || 'status'
  const tpl = md.card || {}
  const columns = (md.columns || []).map((c) => ({ ...c, cards: [] }))
  const byId = new Map(columns.map((c) => [String(c.id), c]))
  for (const row of rows || []) {
    const column = byId.get(String(row[field] == null ? '' : row[field]))
    if (!column) continue
    const color = tpl.color != null ? kanbanTextOf(tpl.color, row) : ''
    const colors = md.cardColors || {}
    column.cards.push({
      id: (tpl.id != null ? kanbanTextOf(tpl.id, row) : '') || String(row.id == null ? '' : row.id),
      title: tpl.title != null ? kanbanTextOf(tpl.title, row) : String(row.title == null ? (row.name == null ? '' : row.name) : row.title),
      description: tpl.description != null ? kanbanTextOf(tpl.description, row) : '',
      badge: tpl.badge != null ? kanbanTextOf(tpl.badge, row) : '',
      color: color && colors[color] ? colors[color] : color,
      actionId: tpl.actionId != null ? kanbanTextOf(tpl.actionId, row) : '',
      row,
    })
  }
  return columns
}

/** The columns after a move (the index is the position AFTER the card left its place, clamped). */
export function kanbanMovedColumns(columns, move) {
  const from = (columns || []).find((c) => c.id === move.fromColumnId)
  const to = (columns || []).find((c) => c.id === move.toColumnId)
  const card = from && (from.cards || []).find((c) => c.id === move.cardId)
  if (!from || !to || !card) return columns
  return columns.map((c) => {
    let cards = (c.cards || []).filter((x) => !(c === from && x === card))
    if (c === to) {
      const at = Math.max(0, Math.min(Number(move.toIndex) || 0, cards.length))
      cards = [...cards.slice(0, at), card, ...cards.slice(at)]
    }
    return c === from || c === to ? { ...c, cards } : c
  })
}

/** Whether the move changes anything (a card dropped back where it was does not). */
export function kanbanIsRealMove(columns, move) {
  if (move.fromColumnId !== move.toColumnId) return true
  const col = (columns || []).find((c) => c.id === move.fromColumnId)
  const index = col ? (col.cards || []).findIndex((c) => c.id === move.cardId) : -1
  return index >= 0 && index !== Number(move.toIndex)
}

/** What the move action receives: the card's item with `_cardId/_fromColumnId/_toColumnId/_toIndex`. */
export function kanbanMoveParametersOf(card, move) {
  return {
    ...((card && card.row) || {}),
    _cardId: move.cardId,
    _fromColumnId: move.fromColumnId,
    _toColumnId: move.toColumnId,
    _toIndex: Number(move.toIndex) || 0,
  }
}

/** The index a card dropped at pointerY lands on, given the middles of the column's other cards. */
export function kanbanDropIndexOf(pointerY, cardMiddles) {
  const at = (cardMiddles || []).findIndex((middle) => pointerY < middle)
  return at < 0 ? (cardMiddles || []).length : at
}

// The moves on screen whose action has not answered yet, by board key: the projection paints them at
// once (optimistic) and the chain drops them when the action answers — failed = the card is back.
const pendingKanbanMoves = new Map()
export function setPendingKanbanMove(key, move) {
  if (move) pendingKanbanMoves.set(key, move)
  else pendingKanbanMoves.delete(key)
}
export function pendingKanbanMoveOf(key) {
  return pendingKanbanMoves.get(key) || null
}

/** The board's columns as they are on screen: the live items (or the declared cards), plus a pending move. */
export function kanbanColumnsOnScreen(md, data) {
  const key = kanbanKeyOf(md)
  const loaded = data && data[key]
  const columns = md.rowsSource
    ? kanbanCardsFromRows(md, (loaded && loaded.items) || [])
    : (md.columns || []).map((c) => ({ ...c, cards: c.cards || [] }))
  const pending = pendingKanbanMoveOf(key)
  return pending ? kanbanMovedColumns(columns, pending) : columns
}

/**
 * What the kanbanCardMoved chain does with a move on the board `key` of the context `ctx`: null when
 * nothing (no such board, not movable, the card dropped where it was); else the action to run and its
 * parameters (the card's item + where it went), and the action that reads a live board again.
 */
export function kanbanMovePlanOf(ctx, key, move) {
  const node = kanbanNodesOf(ctx && ctx.tree).find((n) => kanbanKeyOf(n.metadata) === key)
  const md = node && node.metadata
  if (!md || !md.moveActionId) return null
  const columns = kanbanColumnsOnScreen(md, (ctx && ctx.data) || {})
  if (!kanbanIsRealMove(columns, move)) return null
  const from = columns.find((c) => c.id === move.fromColumnId)
  const card = from && (from.cards || []).find((c) => c.id === move.cardId)
  if (!card) return null
  return {
    actionId: md.moveActionId,
    parameters: kanbanMoveParametersOf(card, move),
    reloadActionId: md.rowsSource ? KANBAN_ACTION + key : '',
  }
}

/** Whether an action's answer says it failed (an error message, or no answer at all). */
export function kanbanMoveFailed(increment) {
  if (!increment) return true
  return (increment.messages || []).some((m) => m && (m.variant === 'error' || m.type === 'error'))
}
