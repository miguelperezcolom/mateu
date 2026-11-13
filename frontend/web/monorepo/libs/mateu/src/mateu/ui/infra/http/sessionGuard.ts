// Session-expiry guard: when a request comes back 401 (the Bearer token expired mid-session),
// the action is NOT failed and the page is NOT navigated — the user's in-progress work (form
// state, wizard position) stays intact. Instead the app gets a chance to re-authenticate and
// RETRY the same request, resolving the original promise chain as if nothing happened.
//
// Two ways to plug the re-auth flow:
//  1. Programmatic: onSessionExpired(handler) — the handler re-authenticates however the app
//     does it (refresh token, login popup…), stores the new token in localStorage
//     '__mateu_auth_token', then calls context.retry(); or context.giveUp() to fail normally.
//  2. DOM: a cancelable 'mateu-session-expired' CustomEvent on document with the same
//     {retry, giveUp} detail — preventDefault() to take ownership.
// With neither, the BUILT-IN sign-in (infra/auth, when the page declares providers in
// <meta name="mateu-auth">) refreshes the token and retries, or asks the user to sign in again.
// Without that either, the request fails exactly as before (no behavior change).

import { clearStructureCache } from '@infra/routeStructureCache.ts'

export interface SessionExpiredContext {
    /** Re-run the failed request with the (re-newed) credentials; resolves the original call. */
    retry: () => void
    /** Fail the original call with the 401 (the user declined to re-authenticate). */
    giveUp: () => void
}

type SessionExpiredHandler = (context: SessionExpiredContext) => void

let handler: SessionExpiredHandler | undefined

export const onSessionExpired = (h: SessionExpiredHandler | undefined) => {
    handler = h
}

let builtIn: SessionExpiredHandler | undefined

/**
 * The handler of the built-in sign-in (signIn.ts installs it when the page declares providers):
 * consulted only when no app handler is registered and nobody claimed the DOM event.
 */
export const setBuiltInSessionExpiredHandler = (h: SessionExpiredHandler | undefined) => {
    builtIn = h
}

/**
 * Bridges a 401 into the re-auth contract. `retryRequest` re-runs the original request and
 * returns its response promise. Returns a promise that settles when the handler decides.
 */
export const handleSessionExpired = <T>(
    error: unknown,
    retryRequest: () => Promise<T>,
): Promise<T> => {
    // the session that saw those screens is over: what the structure cache kept of them goes (W-2)
    clearStructureCache()
    return new Promise<T>((resolve, reject) => {
        let settled = false
        const context: SessionExpiredContext = {
            retry: () => {
                if (settled) return
                settled = true
                retryRequest().then(resolve, reject)
            },
            giveUp: () => {
                if (settled) return
                settled = true
                reject(error)
            },
        }
        if (handler) {
            handler(context)
            return
        }
        const event = new CustomEvent('mateu-session-expired', {
            detail: context,
            cancelable: true,
            bubbles: false,
        })
        const claimed = typeof document !== 'undefined' ? !document.dispatchEvent(event) : false
        if (!claimed) {
            if (builtIn) {
                builtIn(context)
                return
            }
            // nobody re-authenticates: fail exactly like before the guard existed
            context.giveUp()
        }
    })
}
