package io.mateu.ijp.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * The Windows installer cannot run here (and an installer build is CI-only: one deleted a developer's
 * /Applications), so what must never come back is pinned on its text — in the spirit of the CI guard
 * against `deleteRecursively()`.
 */
class InstallerScriptsTest {

    private val windows = File("installer/windows")
    private val nsi = File(windows, "mateu.nsi").readText()
    private val bat = File(windows, "mateu.bat").readText()
    private val gradle = File("build.gradle.kts").readText()

    /** The script without its comments, which are allowed to talk about all this. */
    private val code = nsi.lines().filterNot { it.trimStart().startsWith(";") }

    private fun section(name: String): String {
        val text = code.joinToString("\n")
        val start = text.indexOf("Section \"$name\"")
        check(start >= 0) { "no section $name" }
        return text.substring(start, text.indexOf("SectionEnd", start))
    }

    private fun function(name: String): String {
        val text = code.joinToString("\n")
        val start = text.indexOf("Function $name")
        check(start >= 0) { "no function $name" }
        return text.substring(start, text.indexOf("FunctionEnd", start))
    }

    @Test
    fun `nothing is ever removed recursively at the install folder itself`() {
        val bareInstallDir = "\"${'$'}INSTDIR\""
        val recursive = code.filter { Regex("RMDir\\s+/r").containsMatchIn(it) }
        assertTrue("the uninstaller still clears its own folders", recursive.isNotEmpty())
        for (line in recursive) {
            assertTrue(line, "\"${'$'}INSTDIR\\" in line)
            assertFalse(line, bareInstallDir in line)
        }
        assertTrue("then only an empty folder goes", section("Uninstall").contains("RMDir $bareInstallDir"))
    }

    @Test
    fun `the upgrade and uninstall lists are named entries of the bundle`() {
        val installDirEntry = "\\\"\\${'$'}INSTDIR\\\\${'$'}{it.name}\\\""
        assertTrue(gradle, gradle.contains("RMDir /r $installDirEntry"))
        assertTrue(gradle, gradle.contains("Delete $installDirEntry"))
        assertTrue("the uninstaller removes the same list", section("Uninstall").contains("!include \"${'$'}{CLEAN_NSH}\""))
    }

    @Test
    fun `the user cannot point the install at a folder of theirs`() {
        assertFalse(code.any { "MUI_PAGE_DIRECTORY" in it })
        assertFalse("a registry value must not move it either", code.any { "InstallDirRegKey" in it })
        val init = function(".onInit")
        assertTrue("/D= is overridden", init.contains("StrCpy ${'$'}INSTDIR \"${'$'}LOCALAPPDATA\\Programs\\${'$'}{PRODUCT}\""))
        assertTrue("a non-empty folder that is not ours is refused",
            init.contains("IfFileExists \"${'$'}INSTDIR\\Uninstall.exe\"") && init.contains("Abort"))
    }

    @Test
    fun `a copied uninstaller removes nothing`() {
        val init = function("un.onInit")
        assertTrue(init.contains("ReadRegStr ${'$'}0 HKCU \"Software\\${'$'}{SLUG}\" \"InstallDir\""))
        assertTrue(init.contains("Abort"))
    }

    @Test
    fun `a mateu link goes to an executable, never through cmd`() {
        val command = code.single { "shell\\open\\command\" \"\"" in it && "WriteRegStr" in it }
        assertTrue(command, command.contains("'\"${'$'}INSTDIR\\bin\\idea64.exe\" \"%1\"'"))
        assertFalse(command, command.contains(".bat") || command.contains(".cmd") || command.contains("cmd.exe"))
    }

    @Test
    fun `the launcher takes no arguments from anybody`() {
        val lines = bat.lines().filterNot { it.trimStart().startsWith("rem", ignoreCase = true) }.joinToString("\n")
        assertFalse(lines, lines.contains("%*"))
        assertFalse(lines, Regex("%[1-9]").containsMatchIn(lines))
    }

    @Test
    fun `a session started by a link says how to update instead of restarting into the old version`() {
        assertTrue(MateuUpdater.startedWithoutLauncher("Windows 11", null))
        assertFalse(MateuUpdater.startedWithoutLauncher("Windows 11", "88"))
        assertFalse(MateuUpdater.startedWithoutLauncher("Linux", null))
        assertFalse(MateuUpdater.startedWithoutLauncher("Mac OS X", null))
        assertEquals(1, nsi.lines().count { "idea64.exe" in it && "WriteRegStr" in it })
    }
}
