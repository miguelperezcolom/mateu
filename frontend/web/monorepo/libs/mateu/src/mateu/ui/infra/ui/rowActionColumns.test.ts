import { describe, expect, it } from 'vitest'
import { endsPinned, isRowActionColumn, trailingRowActionCount, withRowActionsPinnedToEnd } from './rowActionColumns.ts'

const col = (metadata: Record<string, unknown>) => ({ metadata: { type: 'GridColumn', ...metadata } })

describe('isRowActionColumn', () => {
    it('action, action group and menu columns are row actions', () => {
        expect(isRowActionColumn({ dataType: 'action' })).toBe(true)
        expect(isRowActionColumn({ dataType: 'actionGroup' })).toBe(true)
        expect(isRowActionColumn({ dataType: 'menu' })).toBe(true)
    })
    it('a button column or a column with its own action is a row action', () => {
        expect(isRowActionColumn({ stereotype: 'button', actionId: 'approve' })).toBe(true)
        expect(isRowActionColumn({ dataType: 'string', actionId: 'approve' })).toBe(true)
    })
    it('the row-open link, data, editors, groups and nothing are not', () => {
        expect(isRowActionColumn({ dataType: 'string', actionId: 'view' })).toBe(false)
        expect(isRowActionColumn({ stereotype: 'button', actionId: 'view' })).toBe(false)
        expect(isRowActionColumn({ dataType: 'string' })).toBe(false)
        expect(isRowActionColumn({ dataType: 'action', editable: true })).toBe(false)
        expect(isRowActionColumn({ type: 'GridGroupColumn' })).toBe(false)
        expect(isRowActionColumn(undefined)).toBe(false)
    })
})

describe('trailingRowActionCount', () => {
    it('counts the trailing run only', () => {
        expect(trailingRowActionCount([{ dataType: 'string' }, { dataType: 'action' }, { dataType: 'menu' }])).toBe(2)
        expect(trailingRowActionCount([{ dataType: 'action' }, { dataType: 'string' }])).toBe(0)
    })
    it('a column frozen to the start stops the run', () => {
        expect(trailingRowActionCount([{ dataType: 'string' }, { dataType: 'action', frozen: true }])).toBe(0)
    })
    it('a listing made only of actions pins nothing', () => {
        expect(trailingRowActionCount([{ dataType: 'action' }])).toBe(0)
        expect(trailingRowActionCount([])).toBe(0)
    })
})

describe('withRowActionsPinnedToEnd', () => {
    it('pins the trailing action columns to the end and leaves the rest untouched', () => {
        const name = col({ id: 'name', dataType: 'string', actionId: 'view' })
        const city = col({ id: 'city', dataType: 'string' })
        const actions = col({ id: 'actions', dataType: 'actionGroup', frozenToEnd: false })
        const out = withRowActionsPinnedToEnd([name, city, actions])
        expect(out[0]).toBe(name)
        expect(out[1]).toBe(city)
        expect((out[2].metadata as { frozenToEnd?: boolean }).frozenToEnd).toBe(true)
        expect((actions.metadata as { frozenToEnd?: boolean }).frozenToEnd).toBe(false)
        expect(endsPinned(out)).toBe(true)
    })
    it('returns the same node for the same wire node (stable across renders)', () => {
        const columns = [col({ id: 'name', dataType: 'string' }), col({ id: 'actions', dataType: 'action' })]
        expect(withRowActionsPinnedToEnd(columns)[1]).toBe(withRowActionsPinnedToEnd(columns)[1])
    })
    it('keeps a column already frozen to the end as it is', () => {
        const actions = col({ id: 'actions', dataType: 'action', frozenToEnd: true })
        const out = withRowActionsPinnedToEnd([col({ id: 'name' }), actions])
        expect(out[1]).toBe(actions)
    })
    it('returns the same array when nothing is pinned', () => {
        const columns = [col({ id: 'name' }), col({ id: 'city' })]
        expect(withRowActionsPinnedToEnd(columns)).toBe(columns)
        expect(endsPinned(columns)).toBe(false)
        expect(endsPinned([])).toBe(false)
    })
    it('a trailing column group stops the run', () => {
        const columns = [col({ id: 'actions', dataType: 'action' }), { metadata: { type: 'GridGroupColumn' } }]
        expect(withRowActionsPinnedToEnd(columns)).toBe(columns)
    })
})
