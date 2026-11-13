package io.mateu.ijp.plugin

import com.intellij.openapi.diagnostic.Logger

/**
 * Can this plugin's classloader reach every library and platform module it was compiled against? The
 * platform keeps moving code out of the core classloader (2026.x: Jackson became the non-embedded
 * content module intellij.libraries.jackson.databind, JCEF a plugin of its own, the debugger API the
 * module intellij.platform.debugger), and a class the plugin no longer sees fails only when that code
 * path runs — 3.0-beta.64's desktop app died on its first `ObjectMapper` and the hub never showed. So
 * the plugin looks once, at startup, and logs ONE line the desktop smoke test
 * (scripts/desktop-smoke.sh) reads: [OK], or [FAILED] naming the classes it cannot reach.
 * scripts/intellij-class-visibility.mjs checks the same thing statically, for every referenced class.
 */
object MateuSelfCheck {
    const val OK = "Mateu self-check: OK"
    const val FAILED = "Mateu self-check FAILED"

    /** One class per library / platform module / plugin the Mateu plugin uses outside the core API. */
    val REQUIRED_CLASSES = listOf(
        "com.fasterxml.jackson.databind.ObjectMapper", // bundled (build.gradle.kts)
        "com.fasterxml.jackson.core.JsonFactory", // bundled, with databind
        "com.google.zxing.MultiFormatReader", // bundled
        "com.github.weisj.jsvg.parser.SVGLoader", // bundled
        "org.yaml.snakeyaml.Yaml", // platform (an embedded library module in 2026.x)
        "kotlinx.coroutines.Dispatchers", // platform
        "com.jetbrains.jsonSchema.extension.JsonSchemaProviderFactory", // the JSON plugin (depends)
        "org.jetbrains.yaml.psi.YAMLFile", // the YAML plugin (depends)
        "com.intellij.psi.PsiClass", // the Java plugin (depends)
        "com.intellij.execution.remote.RemoteConfigurationType", // Live run (a Java plugin module)
        "com.intellij.debugger.ui.HotSwapUI", // Live run (a Java plugin module)
        "com.intellij.ui.jcef.JBCefBrowser", // the visual editor (2026.x: the JCEF plugin)
        "org.cef.browser.CefBrowser", // the visual editor (2026.x: the JCEF plugin)
        "com.sun.net.httpserver.HttpServer", // the JDK (jdk.httpserver)
    )

    fun missing(names: List<String>, loader: ClassLoader): List<String> =
        names.filter { name -> runCatching { Class.forName(name, false, loader) }.isFailure }

    /** The log line, pure for the test. */
    fun report(missing: List<String>): String =
        if (missing.isEmpty()) "$OK (${REQUIRED_CLASSES.size} libraries and modules reachable)"
        else "$FAILED — not reachable from the plugin's classloader: ${missing.joinToString()}"

    private val ran = java.util.concurrent.atomic.AtomicBoolean()

    /** Once per IDE session (called by the first project's startup activity). */
    fun runOnce() {
        if (ran.compareAndSet(false, true)) run()
    }

    fun run() {
        val line = report(missing(REQUIRED_CLASSES, MateuSelfCheck::class.java.classLoader))
        val log = Logger.getInstance(MateuSelfCheck::class.java)
        if (line.startsWith(FAILED)) log.warn(line) else log.info(line)
    }
}
