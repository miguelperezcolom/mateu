package io.mateu.ijp.api

/**
 * Where the transport gets its credentials from. Kept platform-free (no IntelliJ API) so the client
 * can be exercised headlessly; the plugin's implementation reads the IDE's credential store
 * (`io.mateu.ijp.auth.MateuAuthService`).
 */
interface TokenProvider {

    /** The bearer token to send, or null to send no `Authorization` header. */
    fun accessToken(): String?

    /**
     * The backend answered 401 with [rejected] (the token we sent, possibly null). Return true when a
     * NEW token is now available (refreshed, or the user signed in) and the call should be retried
     * once; false to fail the call. Called off the EDT.
     */
    fun onUnauthorized(rejected: String?): Boolean = false

    companion object {
        val NONE: TokenProvider = object : TokenProvider {
            override fun accessToken(): String? = null
        }

        /** A fixed token (tests, probes). */
        fun of(token: String?): TokenProvider = object : TokenProvider {
            override fun accessToken(): String? = token?.ifBlank { null }
        }
    }
}

/** `Authorization` header value for [token], or null when there is nothing to send. */
fun bearer(token: String?): String? = token?.trim()?.ifBlank { null }?.let { "Bearer $it" }
