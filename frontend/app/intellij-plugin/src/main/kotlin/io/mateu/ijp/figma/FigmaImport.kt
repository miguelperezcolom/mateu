package io.mateu.ijp.figma

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.newfile.MateuNewFiles
import io.mateu.ijp.newfile.MateuRoutes
import java.io.File

/**
 * The pure rules behind Tools › Import from Figma… — the same ones the Maven goal (`FigmaImport.java`)
 * and the VS Code extension (`figmaImport.ts`, the reference) apply, pinned for the three by the
 * shared corpus `conformance/client/figma-import.json`: a Figma URL → the file key, which routes file
 * gets the imported pages, the minimal routes.yaml append; plus where `node` and the token are looked
 * for. The conversion itself is the bundled `figma/import/figma-import.mjs`, run with node — never a
 * second implementation of it. Platform-free, so it is unit-tested.
 */
object FigmaImport {

    const val MIN_NODE_MAJOR = 20

    const val TOKEN_HELP = "Create a personal access token in Figma (Settings › Security › Personal access tokens) " +
        "with the scope \"File content: Read only\"."

    private val URL = Regex(
        "^(?:https?://)?(?:[\\w-]+\\.)?figma\\.com/(?:file|design|proto|board|slides|deck)/([A-Za-z0-9]+)(?:/[^/?#]*)?(?:/branch/([A-Za-z0-9]+))?",
    )
    private val KEY = Regex("^[A-Za-z0-9]{6,}$")
    private val MARKER = Regex("^(\\s*)#\\s*__ROUTES__\\s*$")

    /** The file key of a Figma URL (a branch URL → the BRANCH key) or of a bare key. */
    fun fileKey(input: String): String {
        val s = input.trim()
        URL.find(s)?.let { m -> return m.groupValues[2].ifEmpty { m.groupValues[1] } }
        if (KEY.matches(s)) return s
        throw IllegalArgumentException("Not a Figma file URL or key: \"$s\" (expected https://www.figma.com/design/<key>/…)")
    }

    /** The message to show inline for [input], null when it reads as a Figma file (or a payload on disk). */
    fun inputProblem(input: String): String? {
        if (isPayload(input)) return null
        return runCatching { fileKey(input); null }.getOrElse { it.message }
    }

    /** A downloaded `GET /v1/files/:key` payload rather than a URL. */
    fun isPayload(input: String): Boolean = input.trim().endsWith(".json") && File(input.trim()).isFile

    fun framesOf(input: String?): List<String> = input.orEmpty().split(',').map { it.trim() }.filter { it.isNotEmpty() }

    /** The route an imported page answers: its path under the specs root without `.yaml`. */
    fun routeOfPage(path: String): String = path.replace('\\', '/').replace(Regex("\\.ya?ml$"), "")

    /** `routes.yaml` when it is a routes file, else the first routes file in path order, else null (create it). */
    fun routesFileFor(routesFiles: List<String>): String? =
        if ("routes.yaml" in routesFiles) "routes.yaml" else routesFiles.sorted().firstOrNull()

    /**
     * Register an imported page: before a `# __ROUTES__` marker line when there is one (at its
     * indentation), else at the end of the `routes:` list (Add Route…'s own append). Null when the
     * route is already declared — a re-import registers nothing.
     */
    fun appendImportedRoute(routesText: String, route: String, layout: String): String? {
        val r = route.trim().trim('/')
        if (r in MateuRoutes.existingRoutes(routesText)) return null
        val nl = if (routesText.contains("\r\n")) "\r\n" else "\n"
        val lines = routesText.split(Regex("\r?\n")).toMutableList()
        val at = lines.indexOfFirst { MARKER.matches(it) }
        if (at >= 0) {
            val indent = MARKER.matchEntire(lines[at])!!.groupValues[1]
            lines.add(at, "$indent  layout: ${scalar(layout)}")
            lines.add(at, "$indent- route: ${scalar(r)}")
            return lines.joinToString(nl)
        }
        return MateuRoutes.appendRoute(routesText, MateuRoutes.NewRoute(route = r, layout = layout))
    }

    private fun scalar(s: String) = if (s.isEmpty()) "\"\"" else MateuNewFiles.yamlScalar(s)

    /** The node executables to try: the configured one alone, else each PATH entry, then the usual folders. */
    fun nodeCandidates(configured: String?, env: Map<String, String>, home: String, windows: Boolean): List<String> {
        configured?.trim()?.takeIf { it.isNotEmpty() }?.let { return listOf(it) }
        val names = if (windows) listOf("node.exe", "node.cmd") else listOf("node")
        val dirs = (env["PATH"] ?: env["Path"] ?: "").split(if (windows) ';' else ':').filter { it.isNotBlank() } +
            listOf("/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "$home/.volta/bin")
        return dirs.flatMap { d -> names.map { "${d.trimEnd('/', '\\')}/$it" } }.distinct()
    }

    /** `v20.11.1` → 20; null when it does not read as a node version. */
    fun nodeMajor(version: String): Int? = Regex("^v?(\\d+)\\.").find(version.trim())?.groupValues?.get(1)?.toInt()

    /** FIGMA_TOKEN, else `~/.mateu-secrets/figma-token`, else `~/.config/mateu/figma-token`. */
    fun tokenFromEnvOrFiles(env: Map<String, String>, home: String, read: (String) -> String?): String? {
        env["FIGMA_TOKEN"]?.trim()?.takeIf { it.isNotEmpty() }?.let { return it }
        for (p in listOf("$home/.mateu-secrets/figma-token", "$home/.config/mateu/figma-token")) {
            read(p)?.trim()?.takeIf { it.isNotEmpty() }?.let { return it }
        }
        return null
    }

    data class ImportedFile(val path: String, val frame: String, val type: String?, val partial: Boolean, val status: String)

    data class Report(val files: List<ImportedFile>, val warnings: List<String>)

    /** The driver's `--report json`. */
    fun parseReport(json: String): Report {
        val root = ObjectMapper().readTree(json)
        require(root != null && root.isObject) { "the import answered no report" }
        return Report(
            files = root.path("files").map {
                ImportedFile(
                    path = it.path("path").asText(),
                    frame = it.path("frame").asText(),
                    type = it.path("type").takeUnless { t -> t.isNull || t.isMissingNode }?.asText(),
                    partial = it.path("partial").asBoolean(),
                    status = it.path("status").asText(),
                )
            },
            warnings = root.path("warnings").map { it.asText() },
        )
    }

    /** The pages that get a route: screens (not partials, not an app shell) that were not skipped. */
    fun routablePages(report: Report): List<ImportedFile> =
        report.files.filter { !it.partial && it.type != "AppShell" && it.status != "skipped" }

    /**
     * Append every routable page of [report] (written to [prefix] under the specs root, "" = the root)
     * to [routesText]. Returns the new text and the routes added.
     */
    fun registerAll(routesText: String, report: Report, prefix: String): Pair<String, List<String>> {
        var text = routesText
        val added = ArrayList<String>()
        for (f in routablePages(report)) {
            val layout = if (prefix.isEmpty()) f.path else "$prefix/${f.path}"
            val route = routeOfPage(layout)
            appendImportedRoute(text, route, layout)?.let { text = it; added += route }
        }
        return text to added
    }

    fun summaryOf(report: Report, routesAdded: List<String>): String {
        fun count(s: String) = report.files.count { it.status == s }
        val parts = mutableListOf("${count("created")} created", "${count("updated")} updated", "${count("unchanged")} unchanged")
        if (count("skipped") > 0) parts += "${count("skipped")} skipped"
        return parts.joinToString(", ") + "; ${routesAdded.size} route(s) added" +
            (if (routesAdded.isEmpty()) "" else " (${routesAdded.joinToString(", ")})") +
            (if (report.warnings.isEmpty()) "" else "; ${report.warnings.size} warning(s)")
    }
}
