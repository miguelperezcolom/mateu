package io.mateu.ijp.auth

import java.util.concurrent.ConcurrentHashMap

/**
 * One OpenID Connect sign-in per UI — the desktop twin of the phone app's per-entry sessions
 * (`src/hub/uiStore.ts` keeps each UI's tokens apart).
 *
 * A session is keyed by the backend it talks to AND the identity provider that issued it
 * ([SessionKey]): the desktop hub switches the project between UIs, and switching must neither sign
 * you out of the one you leave (its refresh token stays stored, its access token stays cached) nor
 * hand one UI's token to another. Keying by the issuer too means a UI whose manifest moves to another
 * provider never sends the old provider's refresh token to the new one.
 *
 * Pure: the secret store is injected, so the keying, the migration and the switching are unit-tested
 * without the IDE (the plugin passes [MateuCredentials.store], PasswordSafe).
 */
class OidcSessions(private val secrets: SecretStore) {

    /** Where refresh tokens live (PasswordSafe in the IDE, a map in tests). */
    interface SecretStore {
        fun get(account: String): String?
        fun set(account: String, secret: String?)
    }

    data class SessionKey(val backend: String, val issuer: String, val clientId: String) {
        /** The PasswordSafe account of this session's refresh token. */
        val refreshAccount: String get() = "refresh_token@${norm(backend)}|${norm(issuer)}|$clientId"

        companion object {
            fun of(backend: String, issuer: String, clientId: String) =
                SessionKey(norm(backend), norm(issuer), clientId.trim())

            private fun norm(url: String) = url.trim().trimEnd('/')
        }
    }

    private val accessTokens = ConcurrentHashMap<SessionKey, String>()

    /** The cached access token of this session, if any (never another session's). */
    fun accessToken(key: SessionKey): String? = accessTokens[key]

    fun rememberAccessToken(key: SessionKey, token: String?) {
        if (token.isNullOrBlank()) accessTokens.remove(key) else accessTokens[key] = token
    }

    /** A token the backend refused: drop it only if it is still the cached one. */
    fun evict(key: SessionKey, rejected: String?) {
        if (rejected != null) accessTokens.remove(key, rejected)
    }

    /**
     * The stored refresh token of this session. Before per-UI sessions, the refresh token was keyed by
     * the backend alone ([legacyRefreshAccount]); one found there was obtained for the provider the
     * project was configured with, which is this key's — it is moved here once and the old entry removed.
     */
    fun refreshToken(key: SessionKey): String? {
        secrets.get(key.refreshAccount)?.ifBlank { null }?.let { return it }
        val legacy = secrets.get(legacyRefreshAccount(key.backend))?.ifBlank { null } ?: return null
        secrets.set(key.refreshAccount, legacy)
        secrets.set(legacyRefreshAccount(key.backend), null)
        return legacy
    }

    fun storeRefreshToken(key: SessionKey, token: String?) = secrets.set(key.refreshAccount, token?.ifBlank { null })

    fun isSignedIn(key: SessionKey): Boolean = accessToken(key) != null || refreshToken(key) != null

    /** Sign out of ONE UI: its cached and stored tokens (and a not yet migrated legacy one). */
    fun signOut(key: SessionKey) {
        accessTokens.remove(key)
        secrets.set(key.refreshAccount, null)
        secrets.set(legacyRefreshAccount(key.backend), null)
    }

    /** A UI removed from the hub: every session it may have had at that backend. */
    fun forget(backend: String, keys: Collection<SessionKey>) {
        keys.forEach(::signOut)
        val b = backend.trim().trimEnd('/')
        accessTokens.keys.removeIf { it.backend == b }
        secrets.set(legacyRefreshAccount(b), null)
    }

    companion object {
        /** The pre-per-UI account: `refresh_token@<backend>` (MateuCredentials.Kind.REFRESH_TOKEN). */
        fun legacyRefreshAccount(backend: String) = "refresh_token@${backend.trim().trimEnd('/')}"
    }
}
