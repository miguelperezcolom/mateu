import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { cardsFromRows, moveCard, moveParameters } from './kanbanModel'

/**
 * The Kanban `orderField` corpus (conformance/client/kanban-order.json): how a live board sorts a
 * column and the order value a moved card takes. Redwood, React Native and IntelliJ run the same file.
 */
type Row = Record<string, unknown>
interface Move { cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/kanban-order.json', import.meta.url)), 'utf8',
)) as {
    columns: string[]
    rows: Row[]
    sort: { name: string; orderField?: string; rows: Row[]; expected: Record<string, string[]> }[]
    move: { name: string; orderField: string; rows?: Row[]; move: Move; expectedOrder: number }[]
}

const boardOf = (orderField?: string) => ({ columns: corpus.columns.map(id => ({ id, title: id })), orderField })

describe('kanban orderField conformance — sort', () => {
    for (const c of corpus.sort) {
        it(c.name, () => {
            const columns = cardsFromRows(boardOf(c.orderField), c.rows)
            expect(Object.fromEntries(columns.map(col => [col.id, (col.cards ?? []).map(card => card.id)]))).toEqual(c.expected)
        })
    }
})

describe('kanban orderField conformance — move', () => {
    for (const c of corpus.move) {
        it(c.name, () => {
            const columns = cardsFromRows(boardOf(c.orderField), c.rows ?? corpus.rows)
            const card = columns.find(col => col.id === c.move.fromColumnId)?.cards?.find(x => x.id === c.move.cardId)
            const parameters = moveParameters(card, c.move, c.orderField, moveCard(columns, c.move))
            expect(parameters['_toOrder']).toBe(c.expectedOrder)
            expect(parameters[c.orderField]).toBe(c.expectedOrder)
            expect(parameters['_toIndex']).toBe(c.move.toIndex)
        })
    }

    it('a board without an orderField sends no order', () => {
        const columns = cardsFromRows(boardOf(), corpus.rows)
        const move = corpus.move[0].move
        const card = columns[0].cards?.find(x => x.id === move.cardId)
        expect(moveParameters(card, move, undefined, moveCard(columns, move))).not.toHaveProperty('_toOrder')
    })
})
