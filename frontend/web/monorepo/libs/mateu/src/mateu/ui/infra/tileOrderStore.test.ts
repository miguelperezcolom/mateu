import { describe, expect, it, beforeEach } from 'vitest'
import { moveTile, moveTileBy, orderedTileIndices, readTileOrder, tileGridStyle, tileKeyOf, writeTileOrder } from './tileOrderStore'

const memory = () => {
    const store: Record<string, string> = {}
    return {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => { store[k] = v },
        removeItem: (k: string) => { delete store[k] },
        clear: () => { for (const k of Object.keys(store)) delete store[k] },
    }
}

describe('tile order (reorderable dashboards)', () => {
    beforeEach(() => { (globalThis as any).localStorage = memory() })

    it('keys a tile by its id, or by its position when it has none', () => {
        expect(tileKeyOf({ id: 'arrivals' }, 0)).toBe('arrivals')
        expect(tileKeyOf({}, 2)).toBe('#2')
    })

    it('paints the saved order first, then the tiles never placed in server order', () => {
        expect(orderedTileIndices(['a', 'b', 'c', 'd'], null)).toEqual([0, 1, 2, 3])
        expect(orderedTileIndices(['a', 'b', 'c', 'd'], ['c', 'gone', 'a'])).toEqual([2, 0, 1, 3])
    })

    it('drops a tile where the target is, both ways', () => {
        expect(moveTile(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c'])
        expect(moveTile(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd'])
        expect(moveTile(['a', 'b'], 'a', 'a')).toEqual(['a', 'b'])
    })

    it('moves a tile one place with the keyboard, never past the ends', () => {
        expect(moveTileBy(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c'])
        expect(moveTileBy(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b'])
        expect(moveTileBy(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c'])
    })

    it('remembers the order per scope and survives broken storage', () => {
        writeTileOrder('/home#dash', ['b', 'a'])
        expect(readTileOrder('/home#dash')).toEqual(['b', 'a'])
        expect(readTileOrder('/other#dash')).toBeNull()
        ;(globalThis as any).localStorage = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
        expect(readTileOrder('/home#dash')).toBeNull()
        expect(() => writeTileOrder('/home#dash', ['a'])).not.toThrow()
    })

    it('the draggable wrapper takes over the tile placement', () => {
        expect(tileGridStyle({ type: 'DashboardPanel', colSpan: 2, rowSpan: 2 }, undefined)).toBe('grid-column: span 2; grid-row: span 2;')
        expect(tileGridStyle({ type: 'Scoreboard' }, undefined)).toBe('grid-column: 1 / -1;')
        expect(tileGridStyle({ type: 'Text' }, 3)).toBe('grid-column: span 3;')
        expect(tileGridStyle({ type: 'Text' }, 1)).toBe('')
    })
})
