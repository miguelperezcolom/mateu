import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    ColumnLike,
    applyColumnPrefs,
    clearColumnPrefs,
    isProtectedColumn,
    readColumnPrefs,
    writeColumnPrefs,
} from './columnPrefsStore.ts'

// the vitest environment is plain node: back localStorage with a Map
const backing = new Map<string, string>()
vi.stubGlobal('localStorage', {
    getItem: (key: string) => backing.get(key) ?? null,
    setItem: (key: string, value: string) => void backing.set(key, value),
    removeItem: (key: string) => void backing.delete(key),
    clear: () => backing.clear(),
})

beforeEach(() => localStorage.clear())

const SCOPE = '/products'

describe('columnPrefsStore', () => {
    it('writes and reads prefs per scope', () => {
        writeColumnPrefs(SCOPE, { hidden: ['price'], order: ['name', 'price'] })
        writeColumnPrefs('/other', { hidden: [], order: ['b', 'a'] })
        expect(readColumnPrefs(SCOPE)).toEqual({ hidden: ['price'], order: ['name', 'price'] })
        expect(readColumnPrefs('/other')).toEqual({ hidden: [], order: ['b', 'a'] })
        expect(readColumnPrefs('/empty')).toBeUndefined()
    })

    it('clears a scope without touching the others', () => {
        writeColumnPrefs(SCOPE, { hidden: ['price'], order: [] })
        writeColumnPrefs('/other', { hidden: ['x'], order: [] })
        clearColumnPrefs(SCOPE)
        expect(readColumnPrefs(SCOPE)).toBeUndefined()
        expect(readColumnPrefs('/other')).toEqual({ hidden: ['x'], order: [] })
    })

    it('drops the scope entry when writing empty prefs', () => {
        writeColumnPrefs(SCOPE, { hidden: ['price'], order: [] })
        writeColumnPrefs(SCOPE, { hidden: [], order: [] })
        expect(readColumnPrefs(SCOPE)).toBeUndefined()
        expect(localStorage.getItem('mateu-column-prefs')).toBe('{}')
    })

    it('survives corrupt storage', () => {
        localStorage.setItem('mateu-column-prefs', 'not json')
        expect(readColumnPrefs(SCOPE)).toBeUndefined()
        writeColumnPrefs(SCOPE, { hidden: ['a'], order: [] })
        expect(readColumnPrefs(SCOPE)).toEqual({ hidden: ['a'], order: [] })
    })

    it('sanitizes malformed scope entries', () => {
        localStorage.setItem('mateu-column-prefs', JSON.stringify({
            [SCOPE]: { hidden: 'nope', order: [1, 'a', null, 'b'] },
        }))
        expect(readColumnPrefs(SCOPE)).toEqual({ hidden: [], order: ['a', 'b'] })
    })
})

describe('isProtectedColumn', () => {
    it('protects identifier, action-flavoured and select/menu columns', () => {
        expect(isProtectedColumn({ id: 'name', identifier: true })).toBe(true)
        expect(isProtectedColumn({ id: 'view', dataType: 'action' })).toBe(true)
        expect(isProtectedColumn({ id: 'ops', dataType: 'actionGroup' })).toBe(true)
        expect(isProtectedColumn({ id: 'ops', dataType: 'menu' })).toBe(true)
        expect(isProtectedColumn({ id: 'select' })).toBe(true)
        expect(isProtectedColumn({ id: 'menu' })).toBe(true)
        expect(isProtectedColumn({ id: 'price', dataType: 'number' })).toBe(false)
        expect(isProtectedColumn(undefined)).toBe(false)
    })
})

describe('applyColumnPrefs', () => {
    const col = (id: string, extra: Partial<ColumnLike> = {}): ColumnLike & { id: string } => ({ id, ...extra })
    const columns = () => [col('name'), col('price'), col('stock'), col('active')]
    const ids = (cols: { id?: string }[]) => cols.map(c => c.id)

    it('drops hidden columns', () => {
        expect(ids(applyColumnPrefs(columns(), { hidden: ['price', 'active'], order: [] })))
            .toEqual(['name', 'stock'])
    })

    it('reorders by the order list, appending unknown/new columns in original order', () => {
        expect(ids(applyColumnPrefs(columns(), { hidden: [], order: ['stock', 'name'] })))
            .toEqual(['stock', 'name', 'price', 'active'])
    })

    it('ignores order ids that no longer exist', () => {
        expect(ids(applyColumnPrefs(columns(), { hidden: [], order: ['gone', 'active', 'alsoGone'] })))
            .toEqual(['active', 'name', 'price', 'stock'])
    })

    it('hides and reorders together (hidden ids in the order list are still dropped)', () => {
        expect(ids(applyColumnPrefs(columns(), { hidden: ['price'], order: ['active', 'price', 'name'] })))
            .toEqual(['active', 'name', 'stock'])
    })

    it('never hides protected columns even when a corrupt store lists them', () => {
        const cols = [col('select', { dataType: 'action' }), col('name', { identifier: true }), col('price'), col('menu')]
        expect(ids(applyColumnPrefs(cols, { hidden: ['select', 'name', 'price', 'menu'], order: [] })))
            .toEqual(['select', 'name', 'menu'])
    })

    it('returns the original array (identity) when there are no effective prefs', () => {
        const cols = columns()
        expect(applyColumnPrefs(cols, undefined)).toBe(cols)
        expect(applyColumnPrefs(cols, { hidden: [], order: [] })).toBe(cols)
        // an order matching the original order changes nothing → identity preserved
        expect(applyColumnPrefs(cols, { hidden: [], order: ['name', 'price', 'stock', 'active'] })).toBe(cols)
    })

    it('tolerates malformed prefs shapes', () => {
        const cols = columns()
        expect(applyColumnPrefs(cols, { hidden: 'price', order: null } as any)).toBe(cols)
        expect(ids(applyColumnPrefs(cols, { hidden: [null, 'price'], order: [42] } as any)))
            .toEqual(['name', 'stock', 'active'])
    })

    it('reads the id through the metaOf extractor (wire shape: wrappers with metadata)', () => {
        const wrapped = [
            { id: 'w1', metadata: col('name') },
            { id: 'w2', metadata: col('price') },
            { id: 'w3', metadata: col('view', { dataType: 'action' }) },
        ]
        const result = applyColumnPrefs(wrapped, { hidden: ['price', 'view'], order: ['name'] }, w => w.metadata)
        expect(result.map(w => w.metadata.id)).toEqual(['name', 'view'])
    })
})
