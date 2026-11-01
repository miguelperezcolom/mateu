import { describe, expect, it } from 'vitest'
import { cardRouteOf, cardsFromRows, dropIndexOf, isRealMove, itemsOf, moveCard, moveParameters } from './kanbanModel'

const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in_progress', title: 'In progress' },
    { id: 'done', title: 'Done' },
]
const rows = [
    { id: 1, title: 'Varnish', status: 'backlog', priority: 'urgent' },
    { id: 2, title: 'Mount', status: 'done', priority: 'low' },
    { id: 3, title: 'Inpaint', status: 'backlog', priority: 'high' },
    { id: 4, title: 'Lost', status: 'archived', priority: 'low' },
]
const board = {
    columns,
    card: { title: '${row.title}', badge: '${row.priority}', color: '${row.priority}' },
    cardColors: { urgent: '#dc2626' },
    cardRoute: 'tasks/${row.id}',
}

describe('a live board', () => {
    it('reads the items at the source items path, or the answer itself', () => {
        expect(itemsOf({ content: rows }, 'content')).toHaveLength(4)
        expect(itemsOf(rows)).toHaveLength(4)
        expect(itemsOf({ nope: 1 }, 'content')).toEqual([])
    })

    it('places each item in the column its status names, in the source order, drawn from the card template', () => {
        const shown = cardsFromRows(board, rows)
        expect(shown.map(c => c.cards!.map(x => x.title))).toEqual([['Varnish', 'Inpaint'], [], ['Mount']])
        const first = shown[0].cards![0]
        expect(first.id).toBe('1')
        expect(first.badge).toBe('urgent')
        // a colour naming a key of cardColors takes its value; another stays as written
        expect(first.color).toBe('#dc2626')
        expect(shown[0].cards![1].color).toBe('high')
        // an item naming no declared column is left out
        expect(shown.flatMap(c => c.cards!).map(c => c.title)).not.toContain('Lost')
    })

    it('reads another column field when it says so', () => {
        const shown = cardsFromRows({ ...board, columnField: 'priority', columns: [{ id: 'low', title: 'Low' }] }, rows)
        expect(shown[0].cards!.map(c => c.title)).toEqual(['Mount', 'Lost'])
    })

    it('opens the card route resolved against its item', () => {
        const card = cardsFromRows(board, rows)[0].cards![0]
        expect(cardRouteOf('tasks/${row.id}', card)).toBe('tasks/1')
        expect(cardRouteOf(undefined, card)).toBeUndefined()
        expect(cardRouteOf('tasks/${row.id}', { id: 'x' })).toBeUndefined()
    })
})

describe('a move', () => {
    const shown = cardsFromRows(board, rows)

    it('takes the card to another column at its position', () => {
        const after = moveCard(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'done', toIndex: 0 })
        expect(after.map(c => c.cards!.map(x => x.id))).toEqual([['3'], [], ['1', '2']])
    })

    it('reorders within a column, the index read after the card left its place', () => {
        const after = moveCard(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'backlog', toIndex: 1 })
        expect(after[0].cards!.map(x => x.id)).toEqual(['3', '1'])
    })

    it('clamps the position and ignores a card or column the board does not have', () => {
        expect(moveCard(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'in_progress', toIndex: 9 })[1].cards!.map(x => x.id)).toEqual(['1'])
        expect(moveCard(shown, { cardId: 'nope', fromColumnId: 'backlog', toColumnId: 'done', toIndex: 0 })).toBe(shown)
        expect(moveCard(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'nope', toIndex: 0 })).toBe(shown)
    })

    it('dropping a card back where it was is no move', () => {
        expect(isRealMove(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'backlog', toIndex: 0 })).toBe(false)
        expect(isRealMove(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'backlog', toIndex: 1 })).toBe(true)
        expect(isRealMove(shown, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'done', toIndex: 0 })).toBe(true)
    })

    it('sends the card item with where it went over it', () => {
        const card = shown[0].cards![0]
        const params = moveParameters(card, { cardId: '1', fromColumnId: 'backlog', toColumnId: 'done', toIndex: 0 })
        expect(params).toMatchObject({ id: 1, title: 'Varnish', status: 'backlog', _cardId: '1', _fromColumnId: 'backlog', _toColumnId: 'done', _toIndex: 0 })
        expect(moveParameters({ id: 'k' }, { cardId: 'k', fromColumnId: 'a', toColumnId: 'b', toIndex: 2 }))
            .toEqual({ _cardId: 'k', _fromColumnId: 'a', _toColumnId: 'b', _toIndex: 2 })
    })

    it('lands before the first card whose middle is below the pointer', () => {
        expect(dropIndexOf(5, [10, 30, 50])).toBe(0)
        expect(dropIndexOf(35, [10, 30, 50])).toBe(2)
        expect(dropIndexOf(99, [10, 30, 50])).toBe(3)
        expect(dropIndexOf(0, [])).toBe(0)
    })
})
