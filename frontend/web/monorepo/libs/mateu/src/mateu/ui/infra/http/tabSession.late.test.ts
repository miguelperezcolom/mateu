import { afterEach, describe, expect, it } from 'vitest'
import { AGENT_SECRET_KEY, claimTabSession, onTabSessionRekeyed, resetTabSession } from './tabSession'
import { SESSION_ID_KEY } from './authToken'

/**
 * The tab that holds an id answers "mine" from its main thread. Busy with a heavy render, its answer
 * can arrive AFTER the duplicate's wait — the duplicate then kept the copied id and two tabs shared
 * one session. Here the bus delivers to the original late, on purpose.
 */

type Storage = { m: Map<string, string>, get(k: string): string | null, set(k: string, v: string): boolean, remove(k: string): void }

const storageOf = (entries: Record<string, string> = {}): Storage => {
    const m = new Map(Object.entries(entries))
    return { m, get: (k) => m.get(k) ?? null, set: (k, v) => { m.set(k, v); return true }, remove: (k) => { m.delete(k) } }
}

/** A bus where whatever reaches an instance marked `slow` waits `delayMs` first (a blocked main thread). */
const slowBusOf = (delayMs: number) => {
    const open = new Set<FakeChannel>()
    class FakeChannel {
        onmessage: ((e: { data: unknown }) => void) | null = null
        slow = false
        constructor(readonly name: string) { open.add(this) }
        postMessage(data: unknown) {
            for (const other of open) {
                if (other === this || other.name !== this.name) continue
                setTimeout(() => other.onmessage?.({ data: structuredClone(data) }), other.slow ? delayMs : 0)
            }
        }
        close() { open.delete(this) }
    }
    return { Channel: FakeChannel as unknown as new (name: string) => BroadcastChannel, open }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

afterEach(() => resetTabSession())

describe('a late "mine" answer', () => {
    it('still re-keys the duplicate (and tells who listens); the original keeps its id', async () => {
        const { Channel, open } = slowBusOf(80)
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1', [AGENT_SECRET_KEY]: 'secret-1' })
        await claimTabSession({ storage: original, Channel, waitMs: 10, navigationType: 'navigate' })
        ;[...open][0].slow = true  // the original's main thread is busy from now on

        let rekeyed = 0
        const stop = onTabSessionRekeyed(() => { rekeyed++ })
        const duplicate = storageOf(Object.fromEntries(original.m))
        // the wait is over before the original even reads the question: the claim settles first…
        expect(await claimTabSession({ storage: duplicate, Channel, waitMs: 20, navigationType: 'navigate' })).toBe(false)
        expect(duplicate.get(SESSION_ID_KEY)).toBe('id-1')
        // …and the late answer re-keys it all the same
        await sleep(150)
        expect(duplicate.get(SESSION_ID_KEY)).not.toBe('id-1')
        expect(duplicate.get(AGENT_SECRET_KEY)).toBeNull()
        expect(rekeyed).toBe(1)
        expect(original.get(SESSION_ID_KEY)).toBe('id-1')
        stop()
    })

    it('does not re-key past the late window, nor a tab that never asked', async () => {
        const { Channel, open } = slowBusOf(80)
        const original = storageOf({ [SESSION_ID_KEY]: 'id-1' })
        await claimTabSession({ storage: original, Channel, waitMs: 10, navigationType: 'reload' })  // asked nothing
        ;[...open][0].slow = true
        const duplicate = storageOf(Object.fromEntries(original.m))
        await claimTabSession({ storage: duplicate, Channel, waitMs: 20, lateMs: 30, navigationType: 'navigate' })
        await sleep(150)
        // the answer came after the window: kept (better a shared id than a re-key nobody asked for)
        expect(duplicate.get(SESSION_ID_KEY)).toBe('id-1')
        // and the original, which never asked, never re-keys on anybody's "mine"
        expect(original.get(SESSION_ID_KEY)).toBe('id-1')
    })
})
