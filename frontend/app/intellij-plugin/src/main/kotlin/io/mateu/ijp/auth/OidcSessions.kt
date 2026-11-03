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
class OidcSessions(
    private val secrets: SecretStore,
    /** Told about every refresh token signing out / removing a UI throws away, so the provider can
     *  revoke it too (MateuCredentials calls the provider's revocation endpoint, off the EDT). */
    private val revoker: (SessionKey, String) -> Unit = { _, _ -> },
) {

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

            /** No trailing slash, and the scheme and host in lower case (`https://ID.acme.com` is the
             *  same provider as `https://id.acme.com`); the path keeps its case. */
            internal fun norm(url: String): String {
                val u = url.trim().trimEnd('/')
                val m = Regex("^([a-zA-Z][a-zA-Z0-9+.-]*://[^/?#]*)(.*)$").find(u) ?: return u
                return m.groupValues[1].lowercase() + m.groupValues[2]
            }
        }
    }

    private val accessTokens = ConcurrentHashMap<SessionKey, String>()
    private val refreshLocks = ConcurrentHashMap<SessionKey, Any>()

    /** One refresh at a time PER SESSION, for the whole IDE — every project shares these sessions (the
     *  lock used to be each project's own: two windows on one UI refreshed the same token twice). */
    fun <T> refreshing(key: SessionKey, block: () -> T): T = synchronized(refreshLocks.computeIfAbsent(key) { Any() }) { block() }

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
     * the backend alone ([legacyRefreshAccount]), with no record of the provider that issued it. It
     * is NOT moved to this key: the key's issuer is whatever the backend's manifest names NOW, and a
     * re-pointed (or compromised) backend naming another issuer would have received the old
     * provider's refresh token (final review M12). It is deleted instead — one more sign-in.
     */
    fun refreshToken(key: SessionKey): String? {
        secrets.get(key.refreshAccount)?.ifBlank { null }?.let { return it }
        if (secrets.get(legacyRefreshAccount(key.backend)) != null) {
            secrets.set(legacyRefreshAccount(key.backend), null)
        }
        return null
    }

    /**
     * Keeps this session's refresh token. The backend's index of stored sessions ([indexAccount]) is
     * how an earlier one is found again: a token stored under the provider or client the manifest
     * named BEFORE is deleted now (the credential store cannot be listed), not left there for ever.
     */
    fun storeRefreshToken(key: SessionKey, token: String?) {
        val value = token?.ifBlank { null }
        secrets.set(key.refreshAccount, value)
        val others = indexOf(key.backend).filter { it != key.refreshAccount }
        if (value == null) {
            writeIndex(key.backend, others)
        } else {
            others.forEach { secrets.set(it, null) }
            writeIndex(key.backend, listOf(key.refreshAccount))
        }
    }

    private fun indexOf(backend: String): List<String> =
        secrets.get(indexAccount(backend))?.split('\n')?.map { it.trim() }?.filter { it.startsWith("refresh_token@") }.orEmpty()

    private fun writeIndex(backend: String, accounts: List<String>) =
        secrets.set(indexAccount(backend), accounts.distinct().joinToString("\n").ifBlank { null })

    fun isSignedIn(key: SessionKey): Boolean = accessToken(key) != null || refreshToken(key) != null

    /** Sign out of ONE UI: its cached and stored tokens (and a not yet migrated legacy one); the
     *  provider is asked to revoke the refresh token ([revoker]). */
    fun signOut(key: SessionKey) {
        accessTokens.remove(key)
        secrets.get(key.refreshAccount)?.ifBlank { null }?.let { revoker(key, it) }
        storeRefreshToken(key, null)
        secrets.set(legacyRefreshAccount(key.backend), null)
    }

    /** A UI removed from the hub: every session it may have had at that backend — the ones named and
     *  every one its index still lists (an earlier provider or client). */
    fun forget(backend: String, keys: Collection<SessionKey>) {
        keys.forEach(::signOut)
        val b = SessionKey.norm(backend)
        accessTokens.keys.removeIf { it.backend == b }
        indexOf(b).forEach { secrets.set(it, null) }
        secrets.set(indexAccount(b), null)
        secrets.set(legacyRefreshAccount(b), null)
    }

    companion object {
        /** The pre-per-UI account: `refresh_token@<backend>` (MateuCredentials.Kind.REFRESH_TOKEN). */
        fun legacyRefreshAccount(backend: String) = "refresh_token@${backend.trim().trimEnd('/')}"

        /** The accounts this backend's sessions were stored under (newline-separated; no secret in it). */
        fun indexAccount(backend: String) = "refresh_index@${SessionKey.norm(backend)}"
    }
}
