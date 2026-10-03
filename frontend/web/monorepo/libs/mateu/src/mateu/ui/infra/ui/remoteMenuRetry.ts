/**
 * The remote sections waiting to be asked again: each failed remote-menu completion registers how
 * to ask its remotes again (ConnectedElement.askRemotes). The background timer runs it; so does a
 * click on the unavailable section — the user saying «try now» should not have to wait for it.
 */
const pending = new Set<() => void>()

/** Registers a retry; returns the function that takes it back out. */
export function registerRemoteMenuRetry(retry: () => void): () => void {
    pending.add(retry)
    return () => { pending.delete(retry) }
}

/** Asks again, now, every remote that did not answer. */
export function retryUnavailableMenus(): void {
    const now = [...pending]
    pending.clear()
    now.forEach(retry => retry())
}
