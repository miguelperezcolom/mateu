// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    installAppContextWatcher, readAppContext, readAppContextLabels, writeAppContext,
} from './appContextStore.ts'
import { listRecentRoutes, pushRecentRoute } from './recentRoutesStore.ts'

beforeEach(() => localStorage.clear())

/**
 * The @AppContext selection (active hotel, company…) is merged into EVERY request, so what is kept
 * and what is forgotten here decides what the server sees on every screen.
 */
describe('appContextStore', () => {
    it('is empty before anything is picked', () => {
        expect(readAppContext()).toEqual({})
        expect(readAppContextLabels()).toEqual({})
    })

    it('keeps one value (and its label) per field, in one entry per origin', () => {
        writeAppContext('hotel', 'h1', 'Hotel One')
        writeAppContext('year', 2026)
        expect(readAppContext()).toEqual({ hotel: 'h1', year: 2026 })
        expect(readAppContextLabels()).toEqual({ hotel: 'Hotel One' })
        expect(JSON.parse(localStorage.getItem('mateu-app-context')!)).toEqual({ hotel: 'h1', year: 2026 })
    })

    it('clearing a field (null, undefined or blank) forgets value AND label', () => {
        writeAppContext('hotel', 'h1', 'Hotel One')
        writeAppContext('hotel', '')
        expect(readAppContext()).toEqual({})
        expect(readAppContextLabels()).toEqual({})
        writeAppContext('hotel', 'h2', 'Two')
        writeAppContext('hotel', null)
        expect(readAppContext()).toEqual({})
    })

    it('a corrupt entry reads as empty instead of breaking every request', () => {
        localStorage.setItem('mateu-app-context', '{not json')
        expect(readAppContext()).toEqual({})
    })

    it('storage that throws is survived: the selection is just not remembered', () => {
        const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
        expect(() => writeAppContext('hotel', 'h1')).not.toThrow()
        spy.mockRestore()
    })

    it('another tab changing the context reloads this one; unrelated keys do not', () => {
        const reload = vi.fn()
        const original = window.location
        Object.defineProperty(window, 'location', { configurable: true, value: { ...original, reload } })
        try {
            installAppContextWatcher()
            installAppContextWatcher() // idempotent: one listener
            window.dispatchEvent(new StorageEvent('storage', { key: 'other', oldValue: 'a', newValue: 'b' }))
            expect(reload).not.toHaveBeenCalled()
            window.dispatchEvent(new StorageEvent('storage', { key: 'mateu-app-context', oldValue: '{}', newValue: '{}' }))
            expect(reload).not.toHaveBeenCalled()
            window.dispatchEvent(new StorageEvent('storage', { key: 'mateu-app-context', oldValue: '{}', newValue: '{"hotel":"h2"}' }))
            expect(reload).toHaveBeenCalledTimes(1)
        } finally {
            Object.defineProperty(window, 'location', { configurable: true, value: original })
        }
    })
})

/** The command center's "Recent" list. */
describe('recentRoutesStore', () => {
    it('is most-recent-first, de-duplicated by route and capped at 8', () => {
        for (let i = 1; i <= 10; i++) pushRecentRoute('app', { route: `r${i}`, label: `R${i}` })
        pushRecentRoute('app', { route: 'r5', label: 'Five again' })
        const list = listRecentRoutes('app')
        expect(list).toHaveLength(8)
        expect(list[0]).toEqual({ route: 'r5', label: 'Five again' })
        expect(list.filter(e => e.route === 'r5')).toHaveLength(1)
        expect(list.map(e => e.route)).not.toContain('r1')
    })

    it('is scoped per app, so two apps on one origin do not share recents', () => {
        pushRecentRoute('appA', { route: 'orders', label: 'Orders' })
        pushRecentRoute('appB', { route: 'stock', label: 'Stock' })
        expect(listRecentRoutes('appA').map(e => e.route)).toEqual(['orders'])
        expect(listRecentRoutes('appB').map(e => e.route)).toEqual(['stock'])
        expect(listRecentRoutes('appC')).toEqual([])
    })

    it('a blank scope shares one bucket; an entry without route or label is ignored', () => {
        pushRecentRoute('', { route: 'x', label: 'X' })
        pushRecentRoute('', { route: '', label: 'no route' })
        pushRecentRoute('', { route: 'y', label: '' })
        expect(listRecentRoutes('')).toEqual([{ route: 'x', label: 'X' }])
    })

    it('a corrupt store reads as empty', () => {
        localStorage.setItem('mateu-recent-routes', 'nope')
        expect(listRecentRoutes('app')).toEqual([])
    })
})
