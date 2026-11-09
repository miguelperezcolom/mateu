package io.mateu.ijp.auth

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** The credentials of an open UI: the hub switching to another UI must not hand them the next UI's. */
class SessionBoundTokensTest {

    private var project = "https://a"
    private val asked = mutableListOf<String>()
    private val reauthenticated = mutableListOf<String>()

    private val tokens = SessionBoundTokens(
        boundBackend = "https://a",
        currentBackend = { project },
        scope = "https://idp|client",
        tokenFor = { backend -> asked += backend; "token-of-$backend" },
        reauthenticateFor = { backend, _ -> reauthenticated += backend; true },
    )

    @Test
    fun `while the project is on its UI it answers for that UI`() {
        assertEquals("token-of-https://a", tokens.accessToken())
        assertTrue(tokens.onUnauthorized("old"))
        assertEquals(listOf("https://a"), reauthenticated)
        assertEquals("https://idp|client", tokens.sessionScope())
    }

    @Test
    fun `once the hub has moved on, an island of the old UI gets nothing`() {
        project = "https://b"
        assertNull(tokens.accessToken())
        assertEquals("the next UI's credentials are never even read", emptyList<String>(), asked)
    }

    @Test
    fun `a 401 that arrives after the switch is not retried with the next UI's token`() {
        project = "https://b"
        assertFalse(tokens.onUnauthorized("rejected"))
        assertEquals(emptyList<String>(), reauthenticated)
    }

    @Test
    fun `the request always asks for the bound backend, never for whatever the project says now`() {
        tokens.accessToken()
        assertEquals(listOf("https://a"), asked)
    }
}
