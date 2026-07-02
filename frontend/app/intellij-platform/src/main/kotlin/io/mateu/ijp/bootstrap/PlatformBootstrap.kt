package io.mateu.ijp.bootstrap

import com.intellij.ui.scale.JBUIScale

/**
 * EXPERIMENT (spike): can we render Kotlin UI DSL v2 panels standalone with ONLY the IntelliJ Look &
 * Feel installed + the HiDPI scale precomputed, and NO full platform Application booted?
 */
object PlatformBootstrap {

    @Volatile
    private var started = false

    @Synchronized
    fun boot() {
        if (started) return
        System.setProperty("java.awt.headless", "false")
        preparePaths()
        precomputeScale()
        installLookAndFeel()
        started = true
    }

    /** Even the L&F touches PathManager, which refuses to start without an installation home. */
    private fun preparePaths() {
        val base = java.nio.file.Files.createTempDirectory("mateu-ijp").toFile()
        fun sub(name: String) = java.io.File(base, name).apply { mkdirs() }.absolutePath
        System.setProperty("idea.home.path", base.absolutePath)
        System.setProperty("idea.config.path", sub("config"))
        System.setProperty("idea.system.path", sub("system"))
        System.setProperty("idea.plugins.path", sub("plugins"))
        System.setProperty("idea.log.path", sub("log"))
    }

    private fun precomputeScale() {
        runCatching {
            JBUIScale.setSystemScaleFactor(1f)
            JBUIScale.setUserScaleFactor(1f)
        }.onFailure { System.err.println("[bootstrap] scale precompute failed: $it") }
    }

    private fun installLookAndFeel() {
        val candidates = listOf(
            "com.intellij.ide.ui.laf.darcula.DarculaLaf",
            "com.intellij.ide.ui.laf.IntelliJLaf",
        )
        for (name in candidates) {
            try {
                val laf = Class.forName(name).getDeclaredConstructor().newInstance() as javax.swing.LookAndFeel
                javax.swing.UIManager.setLookAndFeel(laf)
                println("[bootstrap] L&F installed = $name; Label.font=${javax.swing.UIManager.getFont("Label.font")}")
                return
            } catch (t: Throwable) {
                System.err.println("[bootstrap] L&F $name failed: ${t.cause ?: t}")
                (t.cause ?: t).printStackTrace()
            }
        }
        println("[bootstrap] no IntelliJ L&F installed (default metal)")
    }
}
