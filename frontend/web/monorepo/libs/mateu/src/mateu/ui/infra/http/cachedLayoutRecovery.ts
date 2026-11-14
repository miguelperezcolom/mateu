/**
 * Self-heal for requests a CACHED structure made (routeStructureCache.ts).
 *
 * A screen seeded from the structure cache is a prediction: until the route's authoritative answer
 * lands, what is on screen — and what it fires, the OnLoad `search` of a listing, a nested ux's own
 * route load — is the cache's. When the cache was wrong about the app (another app served on the
 * same origin before, a redeploy that renamed a view), those requests name a view the server does
 * not know, and it answers 403 (the wire-type allowlist) or 404. That is not the user lacking a
 * permission, and it must not be shown as such.
 *
 * So a request sent while its screen was a cache seed carries a {@link CachedLayoutGuard}. When it
 * is refused that way, the cache for that backend is dropped and the request is settled once:
 * - the screen's authoritative answer CONFIRMS the seed (the same structure) → it is sent again,
 *   once; a second failure is reported as any other;
 * - the answer REPLACES the seed (another structure, or the route load itself failed) → the request
 *   belonged to components that are gone: it ends as cancelled, without a toast — the fresh
 *   components fire their own requests;
 * - the request IS the seeded screen's route load → it is sent again at once, without the cached
 *   structure's ETag.
 */
import { StaleResponse } from '@infra/ui/staleViewGuard.ts'

/** What became of the cache seed a request was sent under. */
export type SeedOutcome = 'confirmed' | 'replaced'

export interface CachedLayoutGuard {
    /** Drops what the cache holds for the backend (called once, on the first refusal). */
    evict: () => void
    /**
     * Resolves once the seed is settled by the server. Undefined for the seeded screen's own route
     * load, which is what settles it: that one is re-sent at once.
     */
    settled?: () => Promise<SeedOutcome>
}

/** Shape read off an axios-like error without depending on axios types. */
interface TransportError {
    response?: { status?: number }
}

/**
 * Whether a failure is what a request naming a view the server does not know gets: a 403 (the
 * wire-type allowlist, an access rule on a type of another app) or a 404/410.
 */
export const isCachedLayoutRejection = (error: unknown): boolean => {
    const status = (error as TransportError | undefined)?.response?.status
    return status === 403 || status === 404 || status === 410
}

/**
 * The end of a request whose cached screen was replaced: a {@link StaleResponse}, so it dies the
 * way the answer to a view no longer on screen does — cancelled, no toast, no OnError chain.
 */
export class CachedLayoutSuperseded extends StaleResponse {
    readonly __mateuCachedLayoutSuperseded = true
    constructor(actionId: string) {
        super(actionId, 'failed')
    }
}

/**
 * Sends a request; when it was driven by a cached structure (a guard is given) and is refused as
 * a stale view, evicts the cache and settles it as described above. `send(true)` is the retry:
 * the transport then leaves out what came from the cache (the structure ETag).
 */
export async function sendWithCachedLayoutRecovery<T>(
    send: (fresh: boolean) => Promise<T>,
    guard: CachedLayoutGuard | undefined,
    actionId = '',
): Promise<T> {
    try {
        return await send(false)
    } catch (error) {
        if (!guard || !isCachedLayoutRejection(error)) throw error
        guard.evict()
        if (guard.settled) {
            const outcome = await guard.settled()
            if (outcome === 'replaced') throw new CachedLayoutSuperseded(actionId)
        }
        return await send(true)
    }
}

/** How long a request of a cached screen waits for the server to settle it before giving up on it. */
export const SEED_SETTLE_TIMEOUT_MS = 30_000

/**
 * The cache seed a `mateu-ux` has on screen, from the moment it paints it until its route load is
 * answered: a request sent meanwhile captures it ({@link current}) and learns from it what became
 * of the screen that sent it.
 */
export class SeedTracker {
    private seed: { settled: Promise<SeedOutcome>, settle: (outcome: SeedOutcome) => void } | undefined

    /** A seed was painted: whatever seed was pending before is replaced by it. */
    open(timeoutMs: number = SEED_SETTLE_TIMEOUT_MS): void {
        this.settle('replaced')
        let settle!: (outcome: SeedOutcome) => void
        const settled = new Promise<SeedOutcome>((resolve) => { settle = resolve })
        // a route load that never settles must not keep the requests waiting on it for ever
        const timer = setTimeout(() => settle('replaced'), timeoutMs)
        this.seed = { settled, settle: (outcome) => { clearTimeout(timer); settle(outcome) } }
    }

    /** The server answered (or the screen moved on): the seed is no longer a prediction. */
    settle(outcome: SeedOutcome): void {
        const seed = this.seed
        this.seed = undefined
        seed?.settle(outcome)
    }

    get pending(): boolean {
        return this.seed !== undefined
    }

    /** The outcome of the seed pending now, for a request sent now; undefined when there is none. */
    current(): (() => Promise<SeedOutcome>) | undefined {
        const seed = this.seed
        return seed ? () => seed.settled : undefined
    }
}

/**
 * The guard a request gets when it is sent while a cache seed is on screen: the sending ux's own,
 * or that of a ux it is nested in (a shell's content ux painted inside a seeded shell). Undefined
 * when nothing on the way up is a prediction — the request is then sent and told as always.
 *
 * @param own the tracker of the ux the request goes through
 * @param ownRouteLoad whether the request is that ux's own route load (what settles its seed)
 * @param ancestors the trackers of the uxs it is nested in, nearest first
 * @param evict drops the cache of the backend(s) involved
 */
export const cachedLayoutGuard = (
    own: SeedTracker,
    ownRouteLoad: boolean,
    ancestors: SeedTracker[],
    evict: () => void,
): CachedLayoutGuard | undefined => {
    if (own.pending) {
        // the seeded screen's own load is what settles it: re-sent at once, fresh
        return ownRouteLoad ? { evict } : { evict, settled: own.current() }
    }
    const seeded = ancestors.find((tracker) => tracker.pending)
    return seeded ? { evict, settled: seeded.current() } : undefined
}
