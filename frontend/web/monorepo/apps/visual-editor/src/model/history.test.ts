import { describe, it, expect } from 'vitest'
import { EditHistory } from './history'

describe('EditHistory', () => {
    it('undoes and redoes, and a new edit drops the redo branch', () => {
        const h = new EditHistory('a')
        h.push('b'); h.push('c')
        expect(h.undo()).toBe('b')
        expect(h.undo()).toBe('a')
        expect(h.undo()).toBeUndefined()
        expect(h.redo()).toBe('b')
        h.push('x')
        expect(h.canRedo).toBe(false)
        expect(h.undo()).toBe('b')
    })
    it('ignores a no-op push, resets, and stays bounded', () => {
        const h = new EditHistory('a', 3)
        h.push('a')
        expect(h.canUndo).toBe(false)
        for (const t of ['1', '2', '3', '4', '5']) h.push(t)
        let n = 0
        while (h.undo() !== undefined) n++
        expect(n).toBe(3)
        h.reset('z')
        expect(h.canUndo || h.canRedo).toBe(false)
        expect(h.text).toBe('z')
    })
})
