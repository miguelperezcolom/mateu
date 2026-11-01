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

    fun testALegacyRefreshTokenMovesToTheUisSessionOnce() {
        val legacy = OidcSessions.legacyRefreshAccount("https://museums.example.com")
        assertEquals("refresh_token@https://museums.example.com", legacy)
        store.set(legacy, "pre-per-ui")
        assertEquals("pre-per-ui", sessions.refreshToken(museums))
        assertNull("moved, not copied", store.get(legacy))
        assertEquals("pre-per-ui", store.get(museums.refreshAccount))
    }

    fun testBlankTokensAreNotStored() {
        sessions.rememberAccessToken(museums, " ")
        sessions.storeRefreshToken(museums, "")
        assertFalse(sessions.isSignedIn(museums))
    }
}
