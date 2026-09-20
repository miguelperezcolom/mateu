package io.mateu.ijp.api

/**
 * Session-expiry re-auth (parity with the web's `onSessionExpired`). When a Mateu request comes back
 * 401 (the session token expired mid-session), the plugin gets ONE chance to re-authenticate before
 * the call fails: register a handler that re-auths (e.g. a modal prompt, a token refresh) and returns
 * whether the caller should retry. Synchronous by design — the IntelliJ HTTP client is blocking, and
 * a Swing re-auth dialog blocks anyway.
 *
 * Opt-in: with no handler registered, a 401 fails normally. The client retries at most once.
 */
object SessionGuard {

    @Volatile
    private var handler: (() -> Boolean)? = null

    /** Register (or clear, with null) the re-auth handler. Returns true to retry, false to give up. */
    fun onSessionExpired(h: (() -> Boolean)?) {
        handler = h
    }

    /** Invoked by the API client on a 401: true if re-authenticated and the caller should retry once. */
    fun handleSessionExpired(): Boolean =
        try {
            handler?.invoke() ?: false
        } catch (e: Exception) {
            false
        }
}
