/**
 * Pending-action registry — one in-flight run per (component, action).
 *
 * On a fast backend a user has no chance to press Save twice; on a slow one they always do,
 * because nothing tells them the first press was heard. Until this guard existed the only thing
 * standing between a double press and two POSTs was the loading veil's `pointer-events` — which
 * covers neither `background` actions (no veil at all), nor keyboard shortcuts, nor the 300ms
 * before the veil was mounted. Two POSTs of a create action means two rows.
 *
 * So the guard is here, at the dispatch chokepoint, and it is about IDENTITY, not about pixels:
 * while a given action of a given component is in flight, the same action of the same component
 * is refused. Different components, or different actions of one component, run concurrently as
 * they always did.
 *
 * Mirrors the singleton-module shape of {@link ./loopGuard} and {@link ./dirtyGuard}.
 */

/**
 * Safety valve. Every release path is covered (success, failure, cancellation), but a listener
 * that never fires — a renderer that swallows the event, a stream that neither ends nor errors —
 * must not lock a button for the rest of the session. Past this age a pending entry is treated
 * as dead and the retry is allowed through. Deliberately longer than the default request timeout
 * so a legitimately slow call is never mistaken for a leak.
 */
const STALE_MS = 120_000

export const pendingKey = (componentId: string | undefined, actionId: string): string =>
    `${componentId ?? '_'}::${actionId}`

type Listener = (pending: ReadonlySet<string>) => void

class PendingActions {
    private started = new Map<string, number>()
    private listeners = new Set<Listener>()

    /**
     * Claims the slot for `key`. Returns true when the caller owns the run and must send the
     * request; false when an identical run is already in flight and this one is a duplicate to
     * drop. `now` is injectable for deterministic tests.
     */
    begin(key: string, now: number = Date.now()): boolean {
        const startedAt = this.started.get(key)
        if (startedAt !== undefined && now - startedAt < STALE_MS) {
            return false
        }
        this.started.set(key, now)
        this.emit()
        return true
    }

    /** Releases the slot. Safe to call for a key that was never begun. */
    end(key: string): void {
        if (this.started.delete(key)) {
            this.emit()
        }
    }

    isPending(key: string, now: number = Date.now()): boolean {
        const startedAt = this.started.get(key)
        return startedAt !== undefined && now - startedAt < STALE_MS
    }

    /** Every key currently in flight — the signal a UI can render a busy state from. */
    snapshot(): ReadonlySet<string> {
        return new Set(this.started.keys())
    }

    /** Subscribe to changes. Returns the unsubscribe function. */
    subscribe(listener: Listener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    /** Drops everything (e.g. a hard navigation that abandons all in-flight work). */
    reset(): void {
        this.started.clear()
        this.emit()
    }

    private emit(): void {
        const snapshot = this.snapshot()
        this.listeners.forEach((listener) => listener(snapshot))
    }
}

export const pendingActions = new PendingActions()
