import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    cachedLayoutGuard,
    CachedLayoutSuperseded,
    isCachedLayoutRejection,
    SeedTracker,
    sendWithCachedLayoutRecovery,
} from './cachedLayoutRecovery.ts'
import { isStaleResponse } from '@infra/ui/staleViewGuard.ts'
import { classifyRequestFailure } from './requestPolicy.ts'

const refused = (status: number) => Object.assign(new Error('refused ' + status), { response: { status, data: 'Forbidden' } })

/** A transport whose answers are scripted, one per call; it records whether each call was fresh. */
const scripted = (...answers: Array<unknown | Error>) => {
    const calls: boolean[] = []
    const send = vi.fn(async (fresh: boolean) => {
        calls.push(fresh)
        const answer = answers.shift()
        if (answer instanceof Error) throw answer
        return answer
    })
    return { send, calls }
}

afterEach(() => vi.useRealTimers())

describe('isCachedLayoutRejection', () => {
    it('is a 403 or a 404/410 — what a view the server does not know gets', () => {
        expect(isCachedLayoutRejection(refused(403))).toBe(true)
        expect(isCachedLayoutRejection(refused(404))).toBe(true)
        expect(isCachedLayoutRejection(refused(410))).toBe(true)
        expect(isCachedLayoutRejection(refused(401))).toBe(false)
        expect(isCachedLayoutRejection(refused(500))).toBe(false)
        expect(isCachedLayoutRejection(new Error('Network Error'))).toBe(false)
        expect(isCachedLayoutRejection(undefined)).toBe(false)
    })
})

describe('sendWithCachedLayoutRecovery', () => {
    it('without a guard, a refusal is the caller\'s as always (no eviction, no retry)', async () => {
        const { send } = scripted(refused(403))
        await expect(sendWithCachedLayoutRecovery(send, undefined)).rejects.toThrow('refused 403')
        expect(send).toHaveBeenCalledTimes(1)
    })

    it('the seeded screen\'s own route load: evicts, and asks again at once without the cached ETag', async () => {
        const { send, calls } = scripted(refused(403), 'answer')
        const evict = vi.fn()
        await expect(sendWithCachedLayoutRecovery(send, { evict })).resolves.toBe('answer')
        expect(evict).toHaveBeenCalledTimes(1)
        expect(calls).toEqual([false, true])
    })

    it('retries ONCE: a second refusal is reported as any other', async () => {
        const { send } = scripted(refused(403), refused(403))
        const evict = vi.fn()
        await expect(sendWithCachedLayoutRecovery(send, { evict })).rejects.toThrow('refused 403')
        expect(send).toHaveBeenCalledTimes(2)
        expect(evict).toHaveBeenCalledTimes(1)
    })

    it('a request of a seeded screen the server CONFIRMED is sent again once it is', async () => {
        const tracker = new SeedTracker()
        tracker.open()
        const { send, calls } = scripted(refused(404), 'rows')
        const evict = vi.fn()
        const pending = sendWithCachedLayoutRecovery(send, { evict, settled: tracker.current() }, 'search')
        await Promise.resolve()
        expect(send).toHaveBeenCalledTimes(1)   // waits for the route load's answer
        tracker.settle('confirmed')
        await expect(pending).resolves.toBe('rows')
        expect(calls).toEqual([false, true])
        expect(evict).toHaveBeenCalledTimes(1)
    })

    it('a request of a seeded screen the server REPLACED ends cancelled, without a toast', async () => {
        const tracker = new SeedTracker()
        tracker.open()
        const { send } = scripted(refused(403))
        const pending = sendWithCachedLayoutRecovery(send, { evict: vi.fn(), settled: tracker.current() }, 'search')
        tracker.settle('replaced')
        const error = await pending.catch((e: unknown) => e)
        expect(error).toBeInstanceOf(CachedLayoutSuperseded)
        expect(send).toHaveBeenCalledTimes(1)
        // dies as the answer to a view no longer on screen does: cancelled, never "not allowed"
        expect(isStaleResponse(error)).toBe(true)
        expect(classifyRequestFailure(error).kind).toBe('cancelled')
        expect((error as CachedLayoutSuperseded).actionId).toBe('search')
    })

    it('other failures are not its business', async () => {
        const { send } = scripted(refused(500))
        const evict = vi.fn()
        await expect(sendWithCachedLayoutRecovery(send, { evict })).rejects.toThrow('refused 500')
        expect(evict).not.toHaveBeenCalled()
        expect(send).toHaveBeenCalledTimes(1)
    })
})

describe('SeedTracker', () => {
    it('has nothing pending until a seed is painted', () => {
        const tracker = new SeedTracker()
        expect(tracker.pending).toBe(false)
        expect(tracker.current()).toBeUndefined()
        tracker.settle('confirmed')   // harmless
        tracker.open()
        expect(tracker.pending).toBe(true)
    })

    it('a request keeps the outcome of the seed it was sent under, even if it settles first', async () => {
        const tracker = new SeedTracker()
        tracker.open()
        const outcome = tracker.current()!
        tracker.settle('confirmed')
        expect(tracker.pending).toBe(false)
        await expect(outcome()).resolves.toBe('confirmed')
    })

    it('a new seed replaces the pending one', async () => {
        const tracker = new SeedTracker()
        tracker.open()
        const first = tracker.current()!
        tracker.open()
        await expect(first()).resolves.toBe('replaced')
        expect(tracker.pending).toBe(true)
    })

    it('a seed nobody settles gives up after the timeout', async () => {
        vi.useFakeTimers()
        const tracker = new SeedTracker()
        tracker.open(1_000)
        const outcome = tracker.current()!
        vi.advanceTimersByTime(1_000)
        await expect(outcome()).resolves.toBe('replaced')
    })
})

describe('cachedLayoutGuard', () => {
    const evict = () => undefined

    it('is undefined when nothing on the way up is a cache seed', () => {
        expect(cachedLayoutGuard(new SeedTracker(), true, [new SeedTracker()], evict)).toBeUndefined()
    })

    it('the seeded ux\'s own route load is retried at once (it is what settles the seed)', () => {
        const own = new SeedTracker()
        own.open()
        const guard = cachedLayoutGuard(own, true, [], evict)
        expect(guard).toBeDefined()
        expect(guard!.settled).toBeUndefined()
    })

    it('anything else its components fire waits for the seed to settle', async () => {
        const own = new SeedTracker()
        own.open()
        const guard = cachedLayoutGuard(own, false, [], evict)!
        own.settle('replaced')
        await expect(guard.settled!()).resolves.toBe('replaced')
    })

    it('a ux nested in a seeded one (a shell\'s content) follows the nearest seeded ancestor', async () => {
        const shell = new SeedTracker()
        const outer = new SeedTracker()
        shell.open()
        outer.open()
        const guard = cachedLayoutGuard(new SeedTracker(), true, [new SeedTracker(), shell, outer], evict)!
        shell.settle('confirmed')
        outer.settle('replaced')
        await expect(guard.settled!()).resolves.toBe('confirmed')
    })
})
