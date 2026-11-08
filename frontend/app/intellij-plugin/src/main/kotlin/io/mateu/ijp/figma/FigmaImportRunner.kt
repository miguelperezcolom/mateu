package io.mateu.ijp.figma

import java.io.File
import java.nio.file.Files
import java.util.concurrent.TimeUnit

/**
 * Runs the bundled driver (`mateu/figma-import/…` in the plugin jar, staged by the Gradle task
 * `copyFigmaImport` with an `index.txt`) with a node ≥ 20: extracts it to a temp folder, hands the
 * token over in the child's ENVIRONMENT (never an argument — those show in process listings), reads
 * the JSON report. No IntelliJ API, so the suite runs it for real.
 */
class FigmaImportRunner(private val loader: ClassLoader = FigmaImportRunner::class.java.classLoader) {

    class ImportFailure(message: String) : Exception(message)

    companion object {
        const val BUNDLE = "mateu/figma-import/"
    }

    /** The first node ≥ 20 among [candidates]; the failure message says what was found instead. */
    fun findNode(candidates: List<String>): String {
        var seen: String? = null
        for (c in candidates) {
            val f = File(c)
            if (!f.isFile || !f.canExecute()) continue
            val version = runCatching {
                val p = ProcessBuilder(c, "--version").redirectErrorStream(true).start()
                val out = p.inputStream.readBytes().toString(Charsets.UTF_8).trim()
                if (!p.waitFor(20, TimeUnit.SECONDS)) p.destroyForcibly()
                out
            }.getOrNull() ?: continue
            val major = FigmaImport.nodeMajor(version)
            if (major != null && major >= FigmaImport.MIN_NODE_MAJOR) return c
            seen = "$c is $version"
        }
        throw ImportFailure(
            "Importing from Figma needs Node.js ${FigmaImport.MIN_NODE_MAJOR} or newer" +
                (if (seen == null) ", and none was found on the PATH" else " ($seen)") +
                ". Install it from https://nodejs.org, or point Settings › Languages & Frameworks › Node.js at one.",
        )
    }

    /** Copy the bundled driver out of the plugin into a fresh temp folder (the caller deletes it). */
    fun extract(): File {
        val index = loader.getResource("${BUNDLE}index.txt") ?: throw ImportFailure("The Figma converter is not bundled in this plugin.")
        val dir = Files.createTempDirectory("mateu-figma-import").toFile()
        for (rel in index.readText().lines().map { it.trim() }.filter { it.isNotEmpty() }) {
            val target = File(dir, rel).canonicalFile
            if (!target.path.startsWith(dir.canonicalPath)) continue
            target.parentFile.mkdirs()
            loader.getResourceAsStream(BUNDLE + rel)?.use { input -> target.outputStream().use { input.copyTo(it) } }
                ?: throw ImportFailure("The bundled Figma converter is incomplete ($rel).")
        }
        return dir
    }

    /**
     * `figma-import.mjs` with [args] (+ `--report json`); [token] (when not null) goes in FIGMA_TOKEN.
     * Throws [ImportFailure] with the driver's own message when it fails.
     */
    fun run(node: String, args: List<String>, token: String?, extraEnv: Map<String, String> = emptyMap()): FigmaImport.Report {
        val dir = extract()
        try {
            val cmd = listOf(node, File(dir, "import/figma-import.mjs").path) + args + listOf("--report", "json")
            val pb = ProcessBuilder(cmd)
            pb.environment().putAll(extraEnv)
            if (token != null) pb.environment()["FIGMA_TOKEN"] = token
            val err = File.createTempFile("mateu-figma", ".err")
            pb.redirectError(err)
            try {
                val p = pb.start()
                val stdout = p.inputStream.readBytes().toString(Charsets.UTF_8)
                if (!p.waitFor(10, TimeUnit.MINUTES)) {
                    p.destroyForcibly()
                    throw ImportFailure("The Figma import did not finish in 10 minutes.")
                }
                if (p.exitValue() != 0) throw ImportFailure(err.readText().trim().ifEmpty { "The Figma import failed (exit ${p.exitValue()})." })
                return runCatching { FigmaImport.parseReport(stdout) }.getOrElse { throw ImportFailure("The Figma import answered no report.") }
            } finally {
                err.delete()
            }
        } finally {
            dir.deleteRecursivelyNoLinks()
        }
    }

    /** Deletes a temp tree WITHOUT following links (File.deleteRecursively follows them — see CLAUDE.md). */
    private fun File.deleteRecursivelyNoLinks() {
        val path = toPath()
        if (!Files.exists(path, java.nio.file.LinkOption.NOFOLLOW_LINKS)) return
        Files.walk(path).use { s -> s.sorted(Comparator.reverseOrder()).forEach { Files.deleteIfExists(it) } }
    }
}
