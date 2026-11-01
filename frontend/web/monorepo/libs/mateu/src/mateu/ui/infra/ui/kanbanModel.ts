import KanbanColumn from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanColumn";
import KanbanCard from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanCard";
import { interpolate } from './interpolation.ts'
import { getByPath } from '@infra/http/externalOptions.ts'

/**
 * The pure half of a kanban board (mateu-kanban): a LIVE board's cards from the items of its
 * rowsSource, and what a move does — to the columns on screen and to the action it runs. The same
 * rules live in Redwood (poc/kanban.mjs), React Native (core/kanban.ts) and the IntelliJ plugin
 * (KanbanModel.kt).
 */

/** A card drawn from an item keeps the item, which a move sends along (a PUT needs the whole row). */
export interface BoardCard extends KanbanCard {
    row?: Record<string, unknown>
}

export interface BoardColumn extends Omit<KanbanColumn, 'cards'> {
    cards?: BoardCard[]
}

export interface LiveBoard {
    columns?: KanbanColumn[]
    columnField?: string
    card?: KanbanCard
    cardColors?: Record<string, string>
    cardRoute?: string
}

/** The items of a source's answer: at its itemsPath, or the answer itself when it is a list. */
export function itemsOf(json: unknown, itemsPath?: string): Record<string, unknown>[] {
    const items = itemsPath ? getByPath(json, itemsPath) : json
    return Array.isArray(items) ? items.filter(i => i && typeof i === 'object') as Record<string, unknown>[] : []
}

const text = (template: string | undefined, row: Record<string, unknown>, state?: Record<string, unknown>, data?: Record<string, unknown>) =>
    template == null ? undefined : (interpolate(template, state, data, { row }) ?? undefined)

/**
 * The declared columns filled with one card per item, in the source's order: each item goes to the
 * column whose id equals its `columnField` (default `status`); an item naming no declared column is
 * left out. A card's texts come from the `card` template (`${row.x}`), its id defaulting to the
 * item's `id`; a colour naming a key of `cardColors` takes that value.
 */
export function cardsFromRows(board: LiveBoard, rows: Record<string, unknown>[],
                              state?: Record<string, unknown>, data?: Record<string, unknown>): BoardColumn[] {
    const field = board.columnField || 'status'
    const template = board.card ?? {}
    const columns: BoardColumn[] = (board.columns ?? []).map(c => ({ ...c, cards: [] }))
    const byId = new Map(columns.map(c => [String(c.id), c]))
    for (const row of rows) {
        const column = byId.get(String(row[field] ?? ''))
        if (!column) continue
        const color = text(template.color, row, state, data)
        column.cards!.push({
            id: text(template.id, row, state, data) || String(row.id ?? ''),
            title: text(template.title, row, state, data) ?? String(row.title ?? row.name ?? ''),
            description: text(template.description, row, state, data),
            badge: text(template.badge, row, state, data),
            color: color && board.cardColors?.[color] ? board.cardColors[color] : color,
            actionId: text(template.actionId, row, state, data),
            row,
        })
    }
    return columns
}

/** Where a card goes: a column and its position there (0 = first). */
export interface KanbanMove {
    cardId: string
    fromColumnId: string
    toColumnId: string
    toIndex: number
}

/**
 * The columns after a move. The index is the card's position in the target column AFTER it moves
 * (within its own column the card first leaves its old place), clamped to the column. A move that
 * names a card or a column the board does not have changes nothing.
 */
export function moveCard(columns: BoardColumn[], move: KanbanMove): BoardColumn[] {
    const from = columns.find(c => c.id === move.fromColumnId)
    const to = columns.find(c => c.id === move.toColumnId)
    const card = from?.cards?.find(c => c.id === move.cardId)
    if (!from || !to || !card) return columns
    return columns.map(c => {
        let cards = (c.cards ?? []).filter(x => !(c === from && x === card))
        if (c === to) {
            const at = Math.max(0, Math.min(move.toIndex, cards.length))
            cards = [...cards.slice(0, at), card, ...cards.slice(at)]
        }
        return c === from || c === to ? { ...c, cards } : c
    })
}

/** Whether the move changes anything (dropping a card back where it was does not). */
export function isRealMove(columns: BoardColumn[], move: KanbanMove): boolean {
    if (move.fromColumnId !== move.toColumnId) return true
    const index = columns.find(c => c.id === move.fromColumnId)?.cards?.findIndex(c => c.id === move.cardId) ?? -1
    return index >= 0 && index !== move.toIndex
}

/**
 * What the move action receives: the card's item (when it came from a source — so a write that
 * needs the whole record has it) with `_cardId`, `_fromColumnId`, `_toColumnId` and `_toIndex` over it.
 */
export function moveParameters(card: BoardCard | undefined, move: KanbanMove): Record<string, unknown> {
    return {
        ...(card?.row ?? {}),
        _cardId: move.cardId,
        _fromColumnId: move.fromColumnId,
        _toColumnId: move.toColumnId,
        _toIndex: move.toIndex,
    }
}

/** Where a card of a live board goes when clicked (`tasks/${row.id}`), or undefined. */
export function cardRouteOf(template: string | undefined, card: BoardCard,
                            state?: Record<string, unknown>, data?: Record<string, unknown>): string | undefined {
    if (!template || !card.row) return undefined
    const route = text(template, card.row, state, data)
    return !route || route.includes('${') ? undefined : route
}

/**
 * The index a card dropped at `pointerY` lands on, given the vertical middles of the column's cards
 * (the dragged card excluded): before the first card whose middle is below the pointer.
 */
export function dropIndexOf(pointerY: number, cardMiddles: number[]): number {
    const at = cardMiddles.findIndex(middle => pointerY < middle)
    return at < 0 ? cardMiddles.length : at
}
