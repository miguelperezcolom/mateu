import { describe, it, expect, vi } from 'vitest'
import { nextIndexForKey, onActivate } from './activate'

const key = (k: string) => {
    let prevented = false
    return {
        event: { key: k, preventDefault: () => { prevented = true } } as unknown as KeyboardEvent,
        get prevented() { return prevented },
    }
}

describe('onActivate', () => {

    it('runs on Enter, like a native button', () => {
        const run = vi.fn()
        const k = key('Enter')
        onActivate(run)(k.event)
        expect(run).toHaveBeenCalledOnce()
    })

    it('runs on Space and swallows the page scroll', () => {
        const run = vi.fn()
        const k = key(' ')
        onActivate(run)(k.event)
        expect(run).toHaveBeenCalledOnce()
        expect(k.prevented).toBe(true)
    })

    it('accepts the legacy Spacebar key value', () => {
        const run = vi.fn()
        onActivate(run)(key('Spacebar').event)
        expect(run).toHaveBeenCalledOnce()
    })

    it('leaves Enter alone so a form can still submit on it', () => {
        const run = vi.fn()
        const k = key('Enter')
        onActivate(run)(k.event)
        expect(k.prevented).toBe(false)
    })

    it('ignores every other key', () => {
        const run = vi.fn()
        const activate = onActivate(run)
        ;['a', 'Tab', 'Escape', 'ArrowDown', 'Shift'].forEach((k) => activate(key(k).event))
        expect(run).not.toHaveBeenCalled()
    })
})

describe('nextIndexForKey', () => {

    it('steps through a list with Left/Right', () => {
        expect(nextIndexForKey('ArrowRight', 0, 5)).toBe(1)
        expect(nextIndexForKey('ArrowLeft', 3, 5)).toBe(2)
    })

    it('stops at the ends by default rather than wrapping', () => {
        // Wrapping surprises a screen-reader user, who gets no signal that they crossed the edge.
        expect(nextIndexForKey('ArrowLeft', 0, 5)).toBe(0)
        expect(nextIndexForKey('ArrowRight', 4, 5)).toBe(4)
    })

    it('wraps when the widget asks for it', () => {
        expect(nextIndexForKey('ArrowLeft', 0, 5, { loop: true })).toBe(4)
        expect(nextIndexForKey('ArrowRight', 4, 5, { loop: true })).toBe(0)
    })

    it('moves by a row in a grid', () => {
        // 3 columns: down from 1 lands on 4, up from 4 lands back on 1.
        expect(nextIndexForKey('ArrowDown', 1, 9, { columns: 3 })).toBe(4)
        expect(nextIndexForKey('ArrowUp', 4, 9, { columns: 3 })).toBe(1)
    })

    it('treats Up/Down as one step in a plain list', () => {
        expect(nextIndexForKey('ArrowDown', 1, 5)).toBe(2)
        expect(nextIndexForKey('ArrowUp', 1, 5)).toBe(0)
    })

    it('jumps to the ends with Home and End', () => {
        expect(nextIndexForKey('Home', 3, 5)).toBe(0)
        expect(nextIndexForKey('End', 1, 5)).toBe(4)
    })

    it('returns null for a key that means nothing here, so the widget can ignore it', () => {
        expect(nextIndexForKey('a', 0, 5)).toBeNull()
        expect(nextIndexForKey('Enter', 0, 5)).toBeNull()
    })

    it('returns null for an empty collection', () => {
        expect(nextIndexForKey('ArrowRight', 0, 0)).toBeNull()
    })
})
