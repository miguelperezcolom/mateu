package io.mateu.ijp.auth

import junit.framework.TestCase

/** One OIDC session per UI (OidcSessions): keying, switching, sign-out, removal, migration. */
class OidcSessionsTest : TestCase() {

    private class MapStore : OidcSessions.SecretStore {
        val map = mutableMapOf<String, String>()
        override fun get(account: String) = map[account]
        override fun set(account: String, secret: String?) {
            if (secret == null) map.remove(account) else map[account] = secret
        }
    }

    private val store = MapStore()
    private val sessions = OidcSessions(store)
    private val museums = OidcSessions.SessionKey.of("https://museums.example.com/", "https://idp.example.com/realms/m", "mateu")
    private val space = OidcSessions.SessionKey.of("https://space.example.com", "https://idp.example.com/realms/s", "mateu")

    fun testSwitchingUisKeepsEachSession() {
        sessions.rememberAccessToken(museums, "a-museums")
        sessions.storeRefreshToken(museums, "r-museums")
        sessions.rememberAccessToken(space, "a-space")
        sessions.storeRefreshToken(space, "r-space")
        // back to museums: its own tokens, never space's
        assertEquals("a-museums", sessions.accessToken(museums))
        assertEquals("r-museums", sessions.refreshToken(museums))
        assertEquals("a-space", sessions.accessToken(space))
        assertTrue(sessions.isSignedIn(museums))
    }

    fun testKeysNormaliseTrailingSlashes() {
        assertEquals(museums, OidcSessions.SessionKey.of("https://museums.example.com", "https://idp.example.com/realms/m/", " mateu "))
    }

    fun testAnotherIssuerForTheSameBackendIsAnotherSession() {
        sessions.storeRefreshToken(museums, "r-old-idp")
        val moved = OidcSessions.SessionKey.of("https://museums.example.com", "https://other-idp.example.com", "mateu")
        assertNull("a refresh token never goes to another provider", sessions.refreshToken(moved))
    }

    fun testSignOutIsForOneUiOnly() {
        sessions.rememberAccessToken(museums, "a-museums")
        sessions.storeRefreshToken(museums, "r-museums")
        sessions.storeRefreshToken(space, "r-space")
        sessions.signOut(museums)
        assertFalse(sessions.isSignedIn(museums))
        assertEquals("r-space", sessions.refreshToken(space))
    }

    fun testEvictDropsOnlyTheRejectedToken() {
        sessions.rememberAccessToken(museums, "a1")
        sessions.evict(museums, "stale")
        assertEquals("a1", sessions.accessToken(museums))
        sessions.evict(museums, "a1")
        assertNull(sessions.accessToken(museums))
        sessions.evict(museums, null)
    }

    fun testRemovingAUiForgetsItsSessionsAndTheLegacyToken() {
        sessions.rememberAccessToken(museums, "a-museums")
        sessions.storeRefreshToken(museums, "r-museums")
        store.set(OidcSessions.legacyRefreshAccount("https://museums.example.com"), "legacy")
        sessions.storeRefreshToken(space, "r-space")
        sessions.forget("https://museums.example.com/", listOf(museums))
        assertNull(sessions.accessToken(museums))
        assertNull(sessions.refreshToken(museums))
        assertFalse(store.map.keys.any { it.contains("museums.example.com") })
        assertEquals("r-space", sessions.refreshToken(space))
    }

    fun testALegacyRefreshTokenIsDroppedNeverSentToTheIssuerTheManifestNamesNow() {
        // it carries no record of its issuer: moving it under today's issuer could hand it to another
        // provider (a re-pointed or compromised backend) — final review M12
        val legacy = OidcSessions.legacyRefreshAccount("https://museums.example.com")
        assertEquals("refresh_token@https://museums.example.com", legacy)
        store.set(legacy, "pre-per-ui")
        assertNull(sessions.refreshToken(museums))
        assertNull("deleted", store.get(legacy))
        assertNull(store.get(museums.refreshAccount))
    }

    fun testBlankTokensAreNotStored() {
        sessions.rememberAccessToken(museums, " ")
        sessions.storeRefreshToken(museums, "")
        assertFalse(sessions.isSignedIn(museums))
    }

    fun testTheIssuerHostIsCaseInsensitive() {
        assertEquals(
            OidcSessions.SessionKey.of("https://Museums.Example.com", "https://IDP.example.com/realms/m", "mateu"),
            museums,
        )
        // the path keeps its case (a realm name is case-sensitive)
        assertFalse(OidcSessions.SessionKey.of("https://museums.example.com", "https://idp.example.com/realms/M", "mateu") == museums)
    }

    fun testATokenStoredUnderAnEarlierProviderOrClientIsDeletedWhenTheNewOneIsStored() {
        sessions.storeRefreshToken(museums, "r-old-idp")
        val moved = OidcSessions.SessionKey.of("https://museums.example.com", "https://other-idp.example.com", "mateu")
        sessions.storeRefreshToken(moved, "r-new-idp")
        assertNull("the earlier provider's token is gone", store.get(museums.refreshAccount))
        assertEquals("r-new-idp", sessions.refreshToken(moved))
        // and removing the UI deletes whatever its index still lists
        val again = OidcSessions.SessionKey.of("https://museums.example.com", "https://third.example.com", "mateu")
        store.set(again.refreshAccount, "stray")
        store.set(OidcSessions.indexAccount("https://museums.example.com"), again.refreshAccount + "\n" + moved.refreshAccount)
        sessions.forget("https://museums.example.com", emptyList())
        assertFalse(store.map.keys.any { it.contains("museums.example.com") })
    }

    fun testSigningOutAndRemovingAskTheProviderToRevoke() {
        val revoked = mutableListOf<Pair<OidcSessions.SessionKey, String>>()
        val revoking = OidcSessions(store) { key, token -> revoked += key to token }
        revoking.storeRefreshToken(museums, "r-museums")
        revoking.storeRefreshToken(space, "r-space")
        revoking.signOut(museums)
        revoking.forget("https://space.example.com", listOf(space))
        assertEquals(listOf(museums to "r-museums", space to "r-space"), revoked)
        // nothing stored: nothing to revoke
        revoking.signOut(museums)
        assertEquals(2, revoked.size)
    }

    fun testOneRefreshAtATimePerSessionAcrossTheIde() {
        val inside = java.util.concurrent.atomic.AtomicInteger()
        val maxInside = java.util.concurrent.atomic.AtomicInteger()
        val threads = (1..4).map {
            Thread {
                sessions.refreshing(museums) {
                    maxInside.accumulateAndGet(inside.incrementAndGet(), ::maxOf)
                    Thread.sleep(20)
                    inside.decrementAndGet()
                }
            }
        }
        threads.forEach(Thread::start)
        threads.forEach(Thread::join)
        assertEquals(1, maxInside.get())
    }
}
