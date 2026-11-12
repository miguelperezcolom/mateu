// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    applyPresenceChange, initialsOf, isRecordRoute, namesText, newEditors, presenceChangesOf,
    presenceEnabled, presenceRouteOf, presenceSummary, resetPresence, syncPresence, watchRecord,
} from './presence.ts'

describe('record presence — pure helpers', () => {
    it('reads the PresenceChanged commands of an increment', () => {
        const increment = {
            commands: [
                { type: 'UpdateHeaderValue', data: { id: 'x', value: '1' } },
                { type: 'PresenceChanged', data: { key: 'orders/7|V', entries: [{ name: 'ana', editing: true }] } },
                { type: 'PresenceChanged', data: { entries: [] } },
            ],
        }
        expect(presenceChangesOf(increment)).toEqual([{ key: 'orders/7|V', entries: [{ name: 'ana', editing: true }] }])
        expect(presenceChangesOf(null)).toEqual([])
        expect(presenceChangesOf({})).toEqual([])
    })

    it('reports the route without the mount, the query or surrounding slashes', () => {
        expect(presenceRouteOf('/app/orders/7?x=1', '/app')).toBe('orders/7')
        expect(presenceRouteOf('/orders//7/', '')).toBe('orders/7')
        expect(presenceRouteOf('/application/orders/7', '/app')).toBe('application/orders/7')
        expect(presenceRouteOf('/orders/7#top', '/')).toBe('orders/7')
    })

    it('a record page is two segments or more, or a page that edits — never a create page', () => {
        expect(isRecordRoute('orders/7')).toBe(true)
        expect(isRecordRoute('orders/7/edit')).toBe(true)
        expect(isRecordRoute('orders/new')).toBe(false)
        expect(isRecordRoute('new', true)).toBe(false)
        expect(isRecordRoute('dashboard')).toBe(false)
        expect(isRecordRoute('profile', true)).toBe(true)
        expect(isRecordRoute('')).toBe(false)
        expect(isRecordRoute('orders/view')).toBe(false)
    })

    it('names one, two or many people', () => {
        expect(namesText(['Ana'], 'en')).toBe('Ana')
        expect(namesText(['Ana', 'Bob'], 'en')).toBe('Ana and Bob')
        expect(namesText(['Ana', 'Bob', 'Carol', 'Dan'], 'en')).toBe('Ana, Bob and 2 more')
        expect(namesText(['Ana', 'Bob'], 'es')).toBe('Ana y Bob')
    })

    it('says editors first, in a warning tone', () => {
        expect(presenceSummary([])).toBeNull()
        const viewing = presenceSummary([{ name: 'Bob', editing: false }], 'en')!
        expect(viewing.tone).toBe('neutral')
        expect(viewing.text).toBe('Bob is viewing it')
        const editing = presenceSummary([{ name: 'Bob', editing: false }, { name: 'Ana', editing: true }], 'en')!
        expect(editing.tone).toBe('warning')
        expect(editing.text).toBe('Ana is editing this record · Bob is viewing it')
        expect(presenceSummary([{ name: 'Ana', editing: true }, { name: 'Bob', editing: true }], 'en')!.text)
            .toBe('Ana and Bob are editing this record')
    })

    it('tells who STARTS editing, once', () => {
        const before = [{ name: 'Ana', editing: false }, { name: 'Bob', editing: true }]
        const after = [{ name: 'Ana', editing: true }, { name: 'Bob', editing: true }, { name: 'Carol', editing: true }]
        expect(newEditors(before, after)).toEqual(['Ana', 'Carol'])
        expect(newEditors(after, after)).toEqual([])
    })

    it('draws initials', () => {
        expect(initialsOf('Ana López')).toBe('AL')
        expect(initialsOf('ana@example.org')).toBe('A')
        expect(initialsOf('john.smith')).toBe('JS')
        expect(initialsOf('')).toBe('?')
    })
})

describe('record presence — the watch', () => {
    afterEach(() => {
        resetPresence()
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    const app = (presence: boolean) => ({ presence, rootRoute: '/desk', serverSideType: 'x.Desk' }) as never

    const answering = (entries: { name: string, editing: boolean }[]) => vi.fn(async () => ({
        ok: true,
        json: async () => ({ commands: [{ type: 'PresenceChanged', data: { key: 'orders/7|x.V', entries } }] }),
    }))

    it('is off unless the app asks for it', () => {
        const fetchMock = answering([])
        vi.stubGlobal('fetch', fetchMock)
        syncPresence(app(false), '')
        expect(presenceEnabled()).toBe(false)
        watchRecord('orders/7', 'x.V', () => undefined)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('reports the record, hears the others, follows the stream and leaves', async () => {
        vi.useFakeTimers()
        const fetchMock = answering([{ name: 'bob', editing: false }])
        vi.stubGlobal('fetch', fetchMock)
        syncPresence(app(true), 'http://h')
        expect(presenceEnabled()).toBe(true)
        const heard: unknown[] = []
        const stop = watchRecord('orders/7', 'x.V', (entries) => heard.push(entries))
        await vi.waitFor(() => expect(heard).toHaveLength(1))
        const [url, init] = fetchMock.mock.calls[0] as unknown as [string, { body: string }]
        expect(url).toBe('http://h/mateu/v3/sync/desk')
        const body = JSON.parse(init.body)
        expect(body.actionId).toBe('_presence')
        expect(body.parameters).toMatchObject({ route: 'orders/7', view: 'x.V', state: 'viewing' })

        // a change pushed on the event stream for THIS record reaches the watch; another's does not
        applyPresenceChange({ key: 'orders/8|x.V', entries: [] })
        expect(heard).toHaveLength(1)
        applyPresenceChange({ key: 'orders/7|x.V', entries: [{ name: 'bob', editing: true }] })
        expect(heard[1]).toEqual([{ name: 'bob', editing: true }])

        // the heartbeat
        await vi.advanceTimersByTimeAsync(10_000)
        expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2)

        stop()
        const last = JSON.parse((fetchMock.mock.calls.at(-1) as unknown as [string, { body: string }])[1].body)
        expect(last.parameters.state).toBe('leave')
    })

    it('a page that is no record reports nothing', () => {
        const fetchMock = answering([])
        vi.stubGlobal('fetch', fetchMock)
        syncPresence(app(true), '')
        watchRecord('orders/new', 'x.V', () => undefined)
        watchRecord('dashboard', 'x.V', () => undefined)
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
