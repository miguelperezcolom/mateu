/**
 * Connectivity tracker — one honest answer to "are we reachable?".
 *
 * `navigator.onLine` is not that answer. It reports the link, not the path: it says true on a
 * captive portal, on a hotel wifi that has stopped forwarding, and on a VPN that dropped the
 * route to the backend. It is a useful NEGATIVE (false really does mean no network) and a
 * worthless positive.
 *
 * So this module combines both sources: the browser flag as a hard negative, and what actually
 * happened to our own requests as the positive. A request that failed with no response says more
 * about reachability than any flag; a request that came back proves the path end to end.
 *
 * Consumers use it for three things: to tell the user (the offline banner), to hold work until
 * the connection returns instead of failing it, and to classify failures accurately.
 */

type Listener = (online: boolean) => void

class Connectivity {
    /** What the browser claims. Hard negative only. */
    private linkUp = true
    /** What our own traffic proves. Undefined until the first request settles. */
    private reachable: boolean | undefined
    private listeners = new Set<Listener>()
    private waiters = new Set<() => void>()
    private started = false

    /** Attaches to the browser's online/offline events. Idempotent; safe to call at import. */
    start(): void {
        if (this.started || typeof window === 'undefined') return
        this.started = true
        this.linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
            ? navigator.onLine
            : true
        window.addEventListener('online', () => {
            this.linkUp = true
            // The link is back but the path is unproven — let the next request settle it. Anything
            // waiting to be re-sent is released now: that request IS the proof.
            this.reachable = undefined
            this.changed()
            this.releaseWaiters()
        })
        window.addEventListener('offline', () => {
            this.linkUp = false
            this.changed()
        })
    }

    /** Reachable unless the link is down or our own traffic proved otherwise. */
    isOnline(): boolean {
        if (!this.linkUp) return false
        return this.reachable !== false
    }

    /** A request came back: the path works, whatever the flag says. */
    noteReachable(): void {
        const was = this.isOnline()
        this.reachable = true
        if (!was) {
            this.changed()
            this.releaseWaiters()
        }
    }

    /** A request died without an answer: treat the backend as unreachable until one comes back. */
    noteUnreachable(): void {
        const was = this.isOnline()
        this.reachable = false
        if (was) this.changed()
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    /**
     * Runs `callback` once the connection is believed to be back. Returns a cancel function.
     * Used to hold a re-send instead of failing it outright while offline.
     */
    whenBack(callback: () => void): () => void {
        if (this.isOnline()) {
            callback()
            return () => {}
        }
        this.waiters.add(callback)
        return () => this.waiters.delete(callback)
    }

    /** Test seam: forget everything learned. */
    reset(): void {
        this.linkUp = true
        this.reachable = undefined
        this.waiters.clear()
    }

    private changed(): void {
        const online = this.isOnline()
        this.listeners.forEach((listener) => listener(online))
    }

    private releaseWaiters(): void {
        const pending = Array.from(this.waiters)
        this.waiters.clear()
        pending.forEach((callback) => callback())
    }
}

export const connectivity = new Connectivity()
connectivity.start()
