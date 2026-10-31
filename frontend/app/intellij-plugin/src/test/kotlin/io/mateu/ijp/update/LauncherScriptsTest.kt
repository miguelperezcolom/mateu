package io.mateu.ijp.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeFalse
import org.junit.Before
import org.junit.Test
import java.io.File
import java.nio.file.Files
import java.nio.file.Path

/**
 * The POSIX launcher scripts `buildInstaller` ships (installer/), run with `sh` on temp layouts: the
 * pre-launch swap of a staged update, the Linux restart loop and the macOS wrapper. (The Windows
 * twins — apply-update.cmd, mateu.bat — mirror these step by step; there is no cmd.exe here.)
 */
class LauncherScriptsTest {

    private val installer = File("installer").absoluteFile
    private val tmp: Path = Files.createTempDirectory("mateu-launcher")
    private val plugins: Path = tmp.resolve("plugins")
    private val update: Path = tmp.resolve("mateu-update")

    @Before
    fun posixOnly() = assumeFalse(System.getProperty("os.name").lowercase().contains("win"))

    private fun sh(script: File, vararg args: String, env: Map<String, String> = emptyMap()): Pair<Int, String> {
        val pb = ProcessBuilder(listOf("sh", script.absolutePath) + args).redirectErrorStream(true)
        pb.environment().putAll(env)
        val p = pb.start()
        val out = p.inputStream.readBytes().decodeToString()
        return p.waitFor() to out
    }

    private fun applyUpdate() = sh(File(installer, "apply-update.sh"), plugins.toString(), update.toString())

    private fun installed(marker: String) = write(plugins.resolve("mateu-intellij-plugin/lib/plugin.jar"), marker)

    private fun staged(marker: String, version: String = "3.0-beta.27", ready: Boolean = true) {
        write(update.resolve("pending/mateu-intellij-plugin/lib/plugin.jar"), marker)
        write(update.resolve("pending/version.txt"), version)
        if (ready) write(update.resolve("pending/READY"), "")
    }

    private fun write(path: Path, text: String): Path {
        Files.createDirectories(path.parent)
        return Files.writeString(path, text)
    }

    private fun jar(): String = Files.readString(plugins.resolve("mateu-intellij-plugin/lib/plugin.jar"))

    // ── apply-update.sh ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `nothing staged leaves the installed plugin alone`() {
        installed("old")
        assertEquals(0, applyUpdate().first)
        assertEquals("old", jar())
    }

    @Test
    fun `a staged update replaces the installed plugin and is consumed`() {
        installed("old")
        staged("new")
        assertEquals(0, applyUpdate().first)
        assertEquals("new", jar())
        assertFalse(Files.exists(update.resolve("pending")))
        assertFalse(Files.exists(update.resolve("previous")))
        assertEquals("3.0-beta.27", Files.readString(update.resolve("applied.txt")))
    }

    @Test
    fun `a staged update installs even when no plugin is installed yet`() {
        staged("new")
        applyUpdate()
        assertEquals("new", jar())
    }

    @Test
    fun `a torn stage (no READY) is ignored`() {
        installed("old")
        staged("new", ready = false)
        applyUpdate()
        assertEquals("old", jar())
        assertTrue(Files.exists(update.resolve("pending/mateu-intellij-plugin")))
    }

    @Test
    fun `when the new plugin cannot be moved in, the installed one is put back`() {
        installed("old")
        staged("new")
        // the pending dir cannot lose its entry → the second rename fails
        val pending = update.resolve("pending").toFile()
        check(pending.setWritable(false))
        try {
            val (code, out) = applyUpdate()
            assertEquals(0, code)
            assertTrue(out, out.contains("could not apply"))
            assertEquals("old", jar())
            assertFalse(Files.exists(update.resolve("previous")))
        } finally {
            check(pending.setWritable(true))
        }
    }

    @Test
    fun `a swap interrupted between the two renames is repaired on the next launch`() {
        // the installed plugin was moved aside, then the launcher died
        write(update.resolve("previous/lib/plugin.jar"), "old")
        Files.createDirectories(plugins)
        applyUpdate()
        assertEquals("old", jar())
        assertFalse(Files.exists(update.resolve("previous")))
        // …and with the staged update still there, the same launch then applies it
        installed("old")
        write(update.resolve("previous/lib/plugin.jar"), "stale")
        staged("new")
        applyUpdate()
        assertEquals("new", jar())
    }

    // ── linux/mateu.sh: apply, launch, relaunch on exit code 88 ────────────────────────────────

    @Test
    fun `the linux launcher applies the update, passes the link once and relaunches on 88`() {
        val root = tmp.resolve("bundle")
        Files.copy(File(installer, "apply-update.sh").toPath(), root.also { Files.createDirectories(it) }.resolve("apply-update.sh"))
        Files.copy(File(installer, "linux/mateu.sh").toPath(), root.resolve("mateu.sh"))
        write(root.resolve("data/plugins/mateu-intellij-plugin/lib/plugin.jar"), "old")
        write(root.resolve("data/mateu-update/pending/mateu-intellij-plugin/lib/plugin.jar"), "new")
        write(root.resolve("data/mateu-update/pending/READY"), "")
        // a fake IDE: logs its args + the plugin it sees; the first run "restarts" (exit 88)
        write(
            root.resolve("bin/idea.sh"),
            """
            #!/bin/sh
            HERE="${'$'}(cd "${'$'}(dirname "${'$'}0")/.." && pwd)"
            echo "run ${'$'}IDEA_RESTART_VIA_EXIT_CODE ${'$'}(cat "${'$'}HERE/data/plugins/mateu-intellij-plugin/lib/plugin.jar") ${'$'}*" >> "${'$'}HERE/log"
            if [ ! -f "${'$'}HERE/restarted" ]; then touch "${'$'}HERE/restarted"; exit 88; fi
            exit 3
            """.trimIndent() + "\n",
        ).toFile().setExecutable(true).let(::check)
        val (code, _) = sh(root.resolve("mateu.sh").toFile(), "mateu://add?u=x")
        assertEquals(3, code)
        val log = Files.readAllLines(root.resolve("log"))
        assertEquals(listOf("run 88 new ${root.resolve("workspace")} mateu://add?u=x", "run 88 new ${root.resolve("workspace")}"), log)
    }

    // ── macos/launcher.sh: first-run install, reinstall, apply ────────────────────────────────

    @Test
    fun `the mac wrapper installs the bundled plugin, re-installs it when the app changes and applies updates`() {
        val macos = tmp.resolve("App.app/Contents/MacOS")
        val res = tmp.resolve("App.app/Contents/Resources")
        val support = tmp.resolve("support")
        Files.createDirectories(macos)
        write(res.resolve("mateu-plugin/mateu-intellij-plugin/lib/plugin.jar"), "bundled")
        write(res.resolve("mateu-plugin-version.txt"), "3.0-beta.26\n")
        Files.copy(File(installer, "apply-update.sh").toPath(), res.resolve("apply-update.sh"))
        Files.copy(File(installer, "updates.xml").toPath(), res.resolve("updates.xml"))
        val wrapper = macos.resolve("idea")
        Files.writeString(wrapper, File(installer, "macos/launcher.sh").readText().replace("@PRODUCT@", "Mateu").replace("@EXEC@", "idea"))
        write(macos.resolve("idea-original"), "#!/bin/sh\necho \"started ${'$'}*\"\n").toFile().setExecutable(true).let(::check)
        val env = mapOf("MATEU_SUPPORT_DIR" to support.toString())
        fun supportJar() = Files.readString(support.resolve("plugins/mateu-intellij-plugin/lib/plugin.jar"))

        // first run: bundled plugin installed, IDE update checks off, workspace + link passed through
        val (code, out) = sh(wrapper.toFile(), "mateu://add?u=x", env = env)
        assertEquals(0, code)
        assertTrue(out, out.contains("started $macos/../Resources/workspace mateu://add?u=x"))
        assertEquals("bundled", supportJar())
        assertTrue(Files.readString(support.resolve("config/options/updates.xml")).contains("PLUGINS_CHECK_NEEDED"))

        // an update staged by the app is applied by the next launch
        write(support.resolve("mateu-update/pending/mateu-intellij-plugin/lib/plugin.jar"), "updated")
        write(support.resolve("mateu-update/pending/READY"), "")
        sh(wrapper.toFile(), env = env)
        assertEquals("updated", supportJar())

        // the app reinstalled with another bundled plugin: it wins, and a stale stage is dropped
        write(res.resolve("mateu-plugin/mateu-intellij-plugin/lib/plugin.jar"), "reinstalled")
        write(res.resolve("mateu-plugin-version.txt"), "3.0-beta.30\n")
        write(support.resolve("mateu-update/pending/mateu-intellij-plugin/lib/plugin.jar"), "stale")
        write(support.resolve("mateu-update/pending/READY"), "")
        sh(wrapper.toFile(), env = env)
        assertEquals("reinstalled", supportJar())
        assertFalse(Files.exists(support.resolve("mateu-update/pending")))
    }

    // ── linux/install.sh: per-user install keeps settings and workspace ─────────────────────────

    @Test
    fun `install sh installs per user, registers the desktop entry and keeps settings on upgrade`() {
        val bundle = tmp.resolve("bundle")
        val home = tmp.resolve("home")
        fun bundleWith(marker: String) {
            bundle.toFile().deleteRecursively()
            write(bundle.resolve("mateu.sh"), "#!/bin/sh\n")
            write(bundle.resolve("apply-update.sh"), "#!/bin/sh\n")
            write(bundle.resolve("bin/idea.sh"), marker)
            write(bundle.resolve("data/config/options/updates.xml"), "seed")
            write(bundle.resolve("workspace/README.txt"), "seed")
            val desktop = File(installer, "linux/mateu.desktop").readText()
                .replace("@PRODUCT@", "Mateu").replace("@SLUG@", "mateu").replace("@MIME@\n", "MimeType=x-scheme-handler/mateu;\n")
            write(bundle.resolve("mateu.desktop"), desktop)
            write(
                bundle.resolve("install.sh"),
                File(installer, "linux/install.sh").readText().replace("@PRODUCT@", "Mateu").replace("@SLUG@", "mateu").replace("@HUB@", "true"),
            )
        }
        val env = mapOf("HOME" to home.toString(), "XDG_DATA_HOME" to home.resolve(".local/share").toString(), "PATH" to "/usr/bin:/bin")
        val dest = home.resolve(".local/share/mateu")

        bundleWith("v1")
        assertEquals(0, sh(bundle.resolve("install.sh").toFile(), env = env).first)
        assertEquals("v1", Files.readString(dest.resolve("bin/idea.sh")))
        val entry = Files.readString(home.resolve(".local/share/applications/mateu.desktop"))
        assertTrue(entry, entry.contains("Exec=\"$dest/mateu.sh\" %u"))
        assertTrue(entry.contains("MimeType=x-scheme-handler/mateu;"))

        // the user's settings and workspace survive an upgrade; the IDE is replaced
        write(dest.resolve("data/config/options/mine.xml"), "mine")
        write(dest.resolve("workspace/.idea/mateu.xml"), "mine")
        write(dest.resolve("data/mateu-update/pending/READY"), "")
        bundleWith("v2")
        assertEquals(0, sh(bundle.resolve("install.sh").toFile(), env = env).first)
        assertEquals("v2", Files.readString(dest.resolve("bin/idea.sh")))
        assertEquals("mine", Files.readString(dest.resolve("data/config/options/mine.xml")))
        assertEquals("mine", Files.readString(dest.resolve("workspace/.idea/mateu.xml")))
        assertFalse(Files.exists(dest.resolve("data/mateu-update/pending")))

        assertEquals(0, sh(bundle.resolve("install.sh").toFile(), "--uninstall", env = env).first)
        assertFalse(Files.exists(dest))
        assertFalse(Files.exists(home.resolve(".local/share/applications/mateu.desktop")))
    }
}
