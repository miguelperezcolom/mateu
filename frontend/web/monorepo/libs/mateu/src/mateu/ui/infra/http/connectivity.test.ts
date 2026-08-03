import { describe, it, expect, beforeEach } from 'vitest'
import { connectivity } from './connectivity'

describe('connectivity', () => {

    beforeEach(() => connectivity.reset())

    it('starts optimistic — nothing has failed yet', () => {
        expect(connectivity.isOnline()).toBe(true)
    })

    it('believes our own traffic over any flag', () => {
        connectivity.noteUnreachable()
        expect(connectivity.isOnline()).toBe(false)
        connectivity.noteReachable()
        expect(connectivity.isOnline()).toBe(true)
    })

    it('announces each change once', () => {
        const seen: boolean[] = []
        const unsubscribe = connectivity.subscribe((online) => seen.push(online))
        connectivity.noteUnreachable()
        connectivity.noteUnreachable()   // still offline — not a change
        connectivity.noteReachable()
        unsubscribe()
        connectivity.noteUnreachable()   // after unsubscribe — not seen
        expect(seen).toEqual([false, true])
    })

    it('runs a waiter immediately when the connection is already up', () => {
        let ran = false
        connectivity.whenBack(() => { ran = true })
        expect(ran).toBe(true)
    })

    it('holds a waiter while offline and releases it on recovery', () => {
        connectivity.noteUnreachable()
        let ran = false
        connectivity.whenBack(() => { ran = true })
        expect(ran).toBe(false)
        connectivity.noteReachable()
        expect(ran).toBe(true)
    })

    it('releases each waiter only once', () => {
        connectivity.noteUnreachable()
        let runs = 0
        connectivity.whenBack(() => { runs++ })
        connectivity.noteReachable()
        connectivity.noteUnreachable()
        connectivity.noteReachable()
        expect(runs).toBe(1)
    })

    it('can cancel a waiter that is no longer wanted', () => {
        connectivity.noteUnreachable()
        let ran = false
        const cancel = connectivity.whenBack(() => { ran = true })
        cancel()
        connectivity.noteReachable()
        expect(ran).toBe(false)
    })
})
