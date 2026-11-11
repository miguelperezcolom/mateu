package io.mateu.ijp.plugin

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** The desktop app's About box and splash: the app's name, never IntelliJ IDEA's chrome. */
class MateuAboutTest {

    @Test
    fun `the about box names the app, its Mateu release and what it is built on`() {
        val text = MateuAbout.text("Acme Ops", "3.0-beta.59", "IntelliJ IDEA", "2026.3", "263.7307.200")
        assertTrue(text, text.startsWith("Acme Ops\nMateu 3.0-beta.59\n"))
        assertTrue(text, text.contains("Built on IntelliJ IDEA 2026.3 (build 263.7307.200)"))
        assertTrue(text, text.contains("not a JetBrains product"))
        assertEquals("About Acme Ops", MateuAbout.title("Acme Ops"))
    }

    @Test
    fun `outside a running IDE it still names the app`() {
        val text = MateuAbout.text("", "0.0.0", null, null, null)
        assertTrue(text, text.startsWith("Mateu\nMateu 0.0.0"))
        assertFalse(text, text.contains("Built on"))
        assertEquals("About Mateu", MateuAbout.title(" "))
    }

    @Test
    fun `every launcher starts the IDE without its splash screen`() {
        val installer = File("installer")
        for (path in listOf("linux/mateu.sh", "windows/mateu.bat", "macos/launcher.sh")) {
            val launches = File(installer, path).readLines()
                .filter { it.trimStart().let { l -> !l.startsWith("#") && !l.startsWith("rem", ignoreCase = true) } }
                .filter { "idea.sh" in it || "idea64.exe" in it || "-original" in it }
            assertTrue(path, launches.isNotEmpty())
            for (line in launches) assertTrue("$path: $line", Regex("""["'](\s+)nosplash\s""").containsMatchIn(line))
        }
    }
}
