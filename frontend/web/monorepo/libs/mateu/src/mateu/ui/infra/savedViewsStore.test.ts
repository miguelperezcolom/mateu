import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    defaultView,
    deleteView,
    listSavedViews,
    saveView,
    setDefaultView,
} from './savedViewsStore.ts'

// the vitest environment is plain node: back localStorage with a Map
const backing = new Map<string, string>()
vi.stubGlobal('localStorage', {
    getItem: (key: string) => backing.get(key) ?? null,
    setItem: (key: string, value: string) => void backing.set(key, value),
    removeItem: (key: string) => void backing.delete(key),
    clear: () => backing.clear(),
})

beforeEach(() => localStorage.clear())

const SCOPE = '/invoices'

describe('savedViewsStore', () => {
    it('saves and lists views per scope', () => {
        saveView(SCOPE, { name: 'Pendientes', values: { searchText: 'acme', approved: false } })
        saveView('/other', { name: 'Otra', values: { x: 1 } })
        expect(listSavedViews(SCOPE).map(v => v.name)).toEqual(['Pendientes'])
        expect(listSavedViews('/other').map(v => v.name)).toEqual(['Otra'])
        expect(listSavedViews('/empty')).toEqual([])
    })

    it('replaces a view saved with the same name instead of duplicating it', () => {
        saveView(SCOPE, { name: 'Pendientes', values: { approved: false } })
        saveView(SCOPE, { name: 'Pendientes', values: { approved: true } })
        const views = listSavedViews(SCOPE)
        expect(views).toHaveLength(1)
        expect(views[0].values).toEqual({ approved: true })
    })

    it('ignores empty names and empty snapshots', () => {
        saveView(SCOPE, { name: '   ', values: { a: 1 } })
        saveView(SCOPE, { name: 'Vacía', values: {} })
        expect(listSavedViews(SCOPE)).toEqual([])
    })

    it('keeps range bounds and lists as plain values', () => {
        saveView(SCOPE, {
            name: 'Junio caras',
            values: { fecha_from: '2026-06-01', fecha_to: '2026-06-30', estado: ['NEW', 'PAID'] },
        })
        expect(listSavedViews(SCOPE)[0].values).toEqual({
            fecha_from: '2026-06-01',
            fecha_to: '2026-06-30',
            estado: ['NEW', 'PAID'],
        })
    })

    it('deletes views and drops the scope when the last one goes', () => {
        saveView(SCOPE, { name: 'A', values: { a: 1 } })
        saveView(SCOPE, { name: 'B', values: { b: 2 } })
        deleteView(SCOPE, 'A')
        expect(listSavedViews(SCOPE).map(v => v.name)).toEqual(['B'])
        deleteView(SCOPE, 'B')
        expect(listSavedViews(SCOPE)).toEqual([])
        expect(localStorage.getItem('mateu-saved-views')).toBe('{}')
    })

    it('marks a single default per scope, toggling on repeat', () => {
        saveView(SCOPE, { name: 'A', values: { a: 1 } })
        saveView(SCOPE, { name: 'B', values: { b: 2 } })
        setDefaultView(SCOPE, 'A')
        expect(defaultView(SCOPE)?.name).toBe('A')
        setDefaultView(SCOPE, 'B')
        expect(defaultView(SCOPE)?.name).toBe('B')
        expect(listSavedViews(SCOPE).find(v => v.name === 'A')?.isDefault).toBe(false)
        // toggling the current default clears it
        setDefaultView(SCOPE, 'B')
        expect(defaultView(SCOPE)).toBeUndefined()
    })

    it('survives corrupt storage', () => {
        localStorage.setItem('mateu-saved-views', 'not json')
        expect(listSavedViews(SCOPE)).toEqual([])
        saveView(SCOPE, { name: 'A', values: { a: 1 } })
        expect(listSavedViews(SCOPE)).toHaveLength(1)
    })
})
