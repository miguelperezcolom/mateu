package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.util.Locale

/** The navigator's user menu, the pure part — the same cases as libs/mateu's userMenu.test.ts. */
class UserMenuTest : TestCase() {

    fun testDrawsUpToTwoInitialsTheFirstAndTheLastWord() {
        assertEquals("AL", UserMenu.initialsOf("Ana María López"))
        assertEquals("M", UserMenu.initialsOf("miguelperezcolom"))
        assertEquals("AL", UserMenu.initialsOf("ana.lopez@example.com"))
        assertEquals("ÉD", UserMenu.initialsOf("élodie durand"))
        assertEquals("?", UserMenu.initialsOf("   "))
        assertEquals("ИП", UserMenu.initialsOf("Иван Петров"))
    }

    fun testDrawsOnlyAnHttpPicture() {
        assertEquals("https://avatars.example/1", UserMenu.pictureOf(UserMenu.User("a", picture = "https://avatars.example/1")))
        assertNull(UserMenu.pictureOf(UserMenu.User("a", picture = "javascript:alert(1)")))
        assertNull(UserMenu.pictureOf(UserMenu.User("a", picture = "data:image/png;base64,AAAA")))
        assertNull(UserMenu.pictureOf(UserMenu.User("a", picture = "file:///etc/passwd")))
        assertNull(UserMenu.pictureOf(UserMenu.User("a")))
    }

    fun testMenuForANamedUserBareSignOutForAnUnnamedSessionElseNothing() {
        assertEquals(UserMenu.Control.MENU, UserMenu.headerAccountControl(UserMenu.User("Ana"), true))
        assertEquals(UserMenu.Control.MENU, UserMenu.headerAccountControl(UserMenu.User("Ana"), false))
        assertEquals(UserMenu.Control.SIGN_OUT, UserMenu.headerAccountControl(null, true))
        assertEquals(UserMenu.Control.NONE, UserMenu.headerAccountControl(null, false))
    }

    fun testReadsAppDtoUser() {
        val m = ObjectMapper()
        val user = UserMenu.of(m.readTree("""{"user":{"name":"Ana López","email":"ana@example.com","picture":"https://x/y.png"}}"""))
        assertEquals(UserMenu.User("Ana López", "ana@example.com", "https://x/y.png"), user)
        assertEquals(UserMenu.User("Ana"), UserMenu.of(m.readTree("""{"user":{"name":"Ana"}}""")))
        assertNull(UserMenu.of(m.readTree("""{"title":"x"}""")))
        assertNull(UserMenu.of(m.readTree("""{"user":{"email":"a@b.c"}}""")))
    }

    fun testSpeaksTheSixLanguages() {
        assertEquals("Account: Ana", UserMenu.texts(Locale.ENGLISH).accountLabel("Ana"))
        assertEquals("Cuenta: Ana", UserMenu.texts(Locale.forLanguageTag("es-ES")).accountLabel("Ana"))
        assertEquals("Compte : Ana", UserMenu.texts(Locale.FRENCH).accountLabel("Ana"))
        assertEquals("Abmelden", UserMenu.texts(Locale.GERMAN).signOut)
        assertEquals("Terminar sessão", UserMenu.texts(Locale.forLanguageTag("pt-BR")).signOut)
        assertEquals("Esci", UserMenu.texts(Locale.ITALIAN).signOut)
        assertEquals("Sign out", UserMenu.texts(Locale.forLanguageTag("ja")).signOut)
        for (lang in ChromeLanguage.LANGUAGES) {
            val t = UserMenu.texts(Locale.forLanguageTag(lang))
            assertTrue(t.accountOf.contains("{name}"))
            assertTrue(t.signOut.isNotBlank())
        }
    }
}
