import { describe, it, expect, beforeEach } from 'vitest'
import { pendingActions, pendingKey } from './pendingActions'

const SAVE = pendingKey('form-1', 'save')

describe('pendingActions', () => {

    beforeEach(() => pendingActions.reset())

    it('lets the first run through and refuses an identical one while it is in flight', () => {
        // The double-click on Save that a slow backend invites.
        expect(pendingActions.begin(SAVE)).toBe(true)
        expect(pendingActions.begin(SAVE)).toBe(false)
        expect(pendingActions.begin(SAVE)).toBe(false)
    })

    it('lets the action run again once it has settled', () => {
        pendingActions.begin(SAVE)
        pendingActions.end(SAVE)
        expect(pendingActions.begin(SAVE)).toBe(true)
    })

    it('scopes the block to one action of one component', () => {
        pendingActions.begin(SAVE)
        // A different action of the same component, and the same action of another component,
        // are unrelated runs and must not be blocked.
        expect(pendingActions.begin(pendingKey('form-1', 'delete'))).toBe(true)
        expect(pendingActions.begin(pendingKey('form-2', 'save'))).toBe(true)
    })

    it('releases a slot nobody can settle after the stale window', () => {
        // Safety valve: a lost outcome event must not lock a button for the rest of the session.
        const start = 1_000_000
        expect(pendingActions.begin(SAVE, start)).toBe(true)
        expect(pendingActions.begin(SAVE, start + 119_000)).toBe(false)
        expect(pendingActions.begin(SAVE, start + 121_000)).toBe(true)
    })

    it('tolerates releasing a key that was never claimed', () => {
        expect(() => pendingActions.end('never::begun')).not.toThrow()
    })

    it('notifies subscribers as work starts and finishes', () => {
        const seen: number[] = []
        const unsubscribe = pendingActions.subscribe((pending) => seen.push(pending.size))
        pendingActions.begin(SAVE)
        pendingActions.begin(pendingKey('form-1', 'delete'))
        pendingActions.end(SAVE)
        unsubscribe()
        pendingActions.begin(pendingKey('form-9', 'save'))
        expect(seen).toEqual([1, 2, 1])
    })

    it('reports what is in flight', () => {
        pendingActions.begin(SAVE)
        expect(pendingActions.isPending(SAVE)).toBe(true)
        expect(pendingActions.isPending(pendingKey('form-1', 'other'))).toBe(false)
        expect(Array.from(pendingActions.snapshot())).toEqual([SAVE])
    })
})
