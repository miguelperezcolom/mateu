import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACTIVITY_KEY, idlePhase, latestActivity, recordActivity, WRITE_EVERY_MS } from './idleSession'

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

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()))
afterEach(() => vi.unstubAllGlobals())

const idle = { timeoutSeconds: 60, warningSeconds: 20 }

describe('idle session', () => {
    it('is active, then warns with the seconds left, then expires', () => {
        expect(idlePhase(30_000, 0, idle)).toEqual({ phase: 'active', secondsLeft: 30 })
        expect(idlePhase(45_000, 0, idle)).toEqual({ phase: 'warning', secondsLeft: 15 })
        expect(idlePhase(59_200, 0, idle)).toEqual({ phase: 'warning', secondsLeft: 1 })
        expect(idlePhase(60_000, 0, idle)).toEqual({ phase: 'expired', secondsLeft: 0 })
    })

    it('never warns for longer than the timeout itself', () => {
        expect(idlePhase(0, 0, { timeoutSeconds: 10, warningSeconds: 60 }).phase).toBe('warning')
    })

    it('measures from the latest activity of ANY tab', () => {
        localStorage.setItem(ACTIVITY_KEY, '50000')
        expect(latestActivity(10_000)).toBe(50_000)
        expect(latestActivity(70_000)).toBe(70_000)
    })

    it('writes its own activity at most every few seconds, unless forced', () => {
        const state = { own: 0, written: 0 }
        recordActivity(state, 1000)
        expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull()
        recordActivity(state, WRITE_EVERY_MS + 1)
        expect(localStorage.getItem(ACTIVITY_KEY)).toBe(String(WRITE_EVERY_MS + 1))
        recordActivity(state, WRITE_EVERY_MS + 2, true)
        expect(localStorage.getItem(ACTIVITY_KEY)).toBe(String(WRITE_EVERY_MS + 2))
        expect(state.own).toBe(WRITE_EVERY_MS + 2)
    })
})
