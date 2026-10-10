/**
 * Listeners that live exactly as long as a component is connected.
 *
 * Every `addEventListener` on something that outlives the component (document, body, an element
 * appended to <head>) needs a matching remove, and the pairs drift: a listener re-assigned without
 * detaching the old one, an element appended to the body still calling back into a dead component.
 * Registering with `{ signal: scope.signal }` and calling `scope.abort()` in `disconnectedCallback`
 * removes all of them at once — and a re-connected component simply gets a fresh signal.
 */
export class ConnectionScope {
    private controller: AbortController | undefined

    /** A signal valid until the next {@link abort} (created lazily, renewed after an abort). */
    get signal(): AbortSignal {
        if (!this.controller || this.controller.signal.aborted) this.controller = new AbortController()
        return this.controller.signal
    }

    /** Removes every listener registered with the current signal. */
    abort() {
        this.controller?.abort()
        this.controller = undefined
    }
}

/**
 * A one-slot listener group: `replace()` aborts whatever the slot held and returns a fresh signal —
 * for "the" outside-click handler of a panel that can be (re)opened from several places.
 */
export class ListenerSlot {
    private controller: AbortController | undefined

    replace(): AbortSignal {
        this.controller?.abort()
        this.controller = new AbortController()
        return this.controller.signal
    }

    get active(): boolean {
        return !!this.controller && !this.controller.signal.aborted
    }

    clear() {
        this.controller?.abort()
        this.controller = undefined
    }
}
