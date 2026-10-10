import { afterEach, describe, expect, it, vi } from 'vitest'
import { safeLocalStorage, safeSessionStorage } from './safeStorage'

const memoryStorage = (): Storage => {
    const m = new Map<string, string>()
    return {
        get length() { return m.size },
        clear: () => m.clear(),
        getItem: (k) => m.get(k) ?? null,
        setItem: (k, v) => { m.set(k, String(v)) },
        removeItem: (k) => { m.delete(k) },
        key: (i) => [...m.keys()][i] ?? null,
    }
}

afterEach(() => vi.unstubAllGlobals())

describe('safeStorage', () => {
    it('reads, writes and removes when storage works', () => {
        vi.stubGlobal('localStorage', memoryStorage())
        expect(safeLocalStorage.set('a', '1')).toBe(true)
        expect(safeLocalStorage.get('a')).toBe('1')
        safeLocalStorage.remove('a')
        expect(safeLocalStorage.get('a')).toBeNull()
        safeLocalStorage.setJson('j', { x: 1 })
        expect(safeLocalStorage.getJson('j', {})).toEqual({ x: 1 })
    })

    it('degrades to "not remembered" when storage is missing', () => {
        vi.stubGlobal('sessionStorage', undefined)
        expect(safeSessionStorage.get('a')).toBeNull()
        expect(safeSessionStorage.set('a', '1')).toBe(false)
        expect(() => safeSessionStorage.remove('a')).not.toThrow()
    })

    it('never throws when every call throws (sandboxed iframe, quota exceeded)', () => {
        const boom = () => { throw new Error('SecurityError') }
        vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom })
        expect(safeLocalStorage.get('a')).toBeNull()
        expect(safeLocalStorage.set('a', '1')).toBe(false)
        expect(() => safeLocalStorage.remove('a')).not.toThrow()
        expect(safeLocalStorage.getJson('a', 'fallback')).toBe('fallback')
    })

    it('falls back on unparseable JSON and unserialisable values', () => {
        vi.stubGlobal('localStorage', memoryStorage())
        safeLocalStorage.set('bad', '{nope')
        expect(safeLocalStorage.getJson('bad', [])).toEqual([])
        const cyclic: Record<string, unknown> = {}
        cyclic.self = cyclic
        expect(safeLocalStorage.setJson('c', cyclic)).toBe(false)
    })
})
