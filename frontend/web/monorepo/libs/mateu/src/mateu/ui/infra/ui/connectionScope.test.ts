import { describe, expect, it, vi } from 'vitest'
import { ConnectionScope, ListenerSlot } from './connectionScope'

describe('ConnectionScope', () => {
    it('removes every listener registered with its signal on abort, and renews the signal', () => {
        const target = new EventTarget()
        const scope = new ConnectionScope()
        const a = vi.fn()
        const b = vi.fn()
        target.addEventListener('x', a, { signal: scope.signal })
        target.addEventListener('y', b, { signal: scope.signal })
        target.dispatchEvent(new Event('x'))
        scope.abort()
        target.dispatchEvent(new Event('x'))
        target.dispatchEvent(new Event('y'))
        expect(a).toHaveBeenCalledTimes(1)
        expect(b).not.toHaveBeenCalled()

        // re-connected: a fresh, live signal
        expect(scope.signal.aborted).toBe(false)
        target.addEventListener('x', a, { signal: scope.signal })
        target.dispatchEvent(new Event('x'))
        expect(a).toHaveBeenCalledTimes(2)
    })
})

describe('ListenerSlot', () => {
    it('keeps at most one listener: replacing drops the previous one', () => {
        const target = new EventTarget()
        const slot = new ListenerSlot()
        const first = vi.fn()
        const second = vi.fn()
        target.addEventListener('mousedown', first, { signal: slot.replace() })
        target.addEventListener('mousedown', second, { signal: slot.replace() })
        target.dispatchEvent(new Event('mousedown'))
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
        expect(slot.active).toBe(true)
        slot.clear()
        expect(slot.active).toBe(false)
        target.dispatchEvent(new Event('mousedown'))
        expect(second).toHaveBeenCalledTimes(1)
    })
})
