package io.mateu.ijp.newproject

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.newfile.MateuNewFiles
import java.io.File
import java.net.HttpURLConnection
import java.net.URI

/**
 * New Mateu project — the generation logic behind the New Project wizard. A faithful port of the VS
 * Code extension's src/newProject.ts: both apply the SAME data — the repository's starters
 * (`starters/<dir>`, compiled and booted by CI) plus `starters/generator/new-project.json` and its
 * overlays, bundled under `/mateu/starters/` by the `copyStarters` Gradle task — and are kept
 * identical by the shared cases in `starters/generator/cases.json`.
 *
 * Platform-free, so it is unit-tested with a temp dir.
 */
object MateuProjectGenerator {

    /** Where the starters come from: the bundled resources, or a directory (the repository's starters/). */
    interface Sources {
        /** Every file path, `/`-separated and relative to the starters root. */
        fun list(): List<String>
        fun read(path: String): ByteArray?
    }

    /** The copy bundled with the plugin: `/mateu/starters/<path>`, listed by `/mateu/starters/index.txt`. */
    object Bundled : Sources {
        private val index: List<String> by lazy {
            javaClass.getResourceAsStream("/mateu/starters/index.txt")?.use { String(it.readBytes()) }
                ?.lines()?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        }
        override fun list() = index
        override fun read(path: String): ByteArray? = javaClass.getResourceAsStream("/mateu/starters/$path")?.use { it.readBytes() }
    }

    class Directory(private val root: File) : Sources {
        override fun list(): List<String> = root.walkTopDown().filter { it.isFile }
            .map { it.relativeTo(root).invariantSeparatorsPath }.sorted().toList()
        override fun read(path: String): ByteArray? = File(root, path).takeIf { it.isFile }?.readBytes()
    }

    data class Options(
        /** `code` | `yaml` | `static` | `both` (new-project.json `authoring`). */
        val authoring: String,
        /** Required when the flavour lists runtimes. */
        val runtime: String? = null,
        val buildTool: String? = "maven",
        val renderer: String? = null,
        val sample: String,
        /** Page template ids (new-file-kinds.json `pageTemplates`), for the flavours with `pages`. */
        val pages: List<String> = emptyList(),
        val groupId: String,
        val artifactId: String,
        val packageName: String,
        /** The Mateu release; resolve it with [latestMateuVersion]. */
        val version: String,
    )

    data class Choice(val id: String, val label: String, val description: String = "") {
        override fun toString() = label
    }

    /** What the choices resolve to: the flavour, the runtime (if any), the language and what is offered. */
    data class Resolved(
        val authoring: JsonNode,
        val runtime: JsonNode?,
        val language: String,
        val starter: String,
        val renderers: List<String>,
        val samples: List<String>,
    )

    val ARTIFACT_ID_PATTERN = Regex("^[a-z][a-z0-9]*([-._][a-z0-9]+)*$")
    val JAVA_NAME_PATTERN = Regex("^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$")

    fun manifest(sources: Sources): JsonNode =
        ObjectMapper().readTree(sources.read("generator/new-project.json") ?: error("No generator/new-project.json in the starters"))

    fun authoring(manifest: JsonNode): List<Choice> = manifest.path("authoring").map { choice(it) }
    fun runtimes(manifest: JsonNode): List<Choice> = manifest.path("runtimes").map { choice(it) }
    fun renderers(manifest: JsonNode): List<Choice> = manifest.path("renderers").map { choice(it) }
    fun samples(manifest: JsonNode): List<Choice> = manifest.path("samples").map { choice(it) }

    private fun choice(n: JsonNode) = Choice(n.path("id").asText(), n.path("label").asText(), n.path("description").asText(""))
    private fun strings(n: JsonNode): List<String> = n.map { it.asText() }
    private fun byId(array: JsonNode, id: String?): JsonNode? = array.firstOrNull { it.path("id").asText() == id }

    /** The resolved choices, or the reason they do not resolve. */
    fun resolve(manifest: JsonNode, authoringId: String, runtimeId: String?): Result<Resolved> {
        val authoring = byId(manifest.path("authoring"), authoringId)
            ?: return Result.failure(IllegalArgumentException("Unknown authoring '$authoringId'"))
        val offered = strings(authoring.path("runtimes"))
        var runtime: JsonNode? = null
        if (offered.isNotEmpty()) {
            if (runtimeId == null || runtimeId !in offered) {
                return Result.failure(IllegalArgumentException("'${authoring.path("label").asText()}' runs on: ${offered.joinToString(", ")}"))
            }
            runtime = byId(manifest.path("runtimes"), runtimeId)
                ?: return Result.failure(IllegalArgumentException("Unknown runtime '$runtimeId'"))
        }
        val language = runtime?.path("language")?.asText() ?: authoring.path("language").asText("java")
        val renderers = if (authoring.has("renderers")) strings(authoring.path("renderers")) else runtime?.let { strings(it.path("renderers")) } ?: emptyList()
        val samples = strings(authoring.path("samples")).filter { runtime == null || it in strings(runtime.path("samples")) }
        val starter = expand(authoring.path("starter").asText(), mapOf("runtime" to (runtime?.path("id")?.asText() ?: "")))
        return Result.success(Resolved(authoring, runtime, language, starter, renderers, samples))
    }

    /** The reason the combination is refused (new-project.json `incompatible`), or null. */
    fun incompatibility(manifest: JsonNode, authoring: String?, runtime: String?, renderer: String?, sample: String?): String? {
        for (x in manifest.path("incompatible")) {
            fun matches(key: String, value: String?) = !x.has(key) || x.path(key).asText() == value
            if (matches("renderer", renderer) && matches("sample", sample) && matches("authoring", authoring) && matches("runtime", runtime)) {
                return x.path("reason").asText()
            }
        }
        return null
    }

    // ------------------------------------------------------------------------------------- naming

    /** `my-shop` → `My shop`. */
    fun appTitleOf(artifactId: String): String {
        val t = artifactId.split(Regex("[-._]+")).filter { it.isNotEmpty() }.joinToString(" ")
        return if (t.isEmpty()) "My app" else t.replaceFirstChar { it.uppercase() }
    }

    /** `my-shop` → `MyShop` (the C# namespace and project name). */
    fun namespaceOf(artifactId: String): String {
        val n = artifactId.split(Regex("[^A-Za-z0-9]+")).filter { it.isNotEmpty() }.joinToString("") { it.replaceFirstChar { c -> c.uppercase() } }
        return if (n.isNotEmpty() && n[0].isLetter()) n else "App$n"
    }

    /** `com.acme` + `my-shop` → `com.acme.myshop`. */
    fun defaultPackage(groupId: String, artifactId: String): String {
        val tail = artifactId.lowercase().replace(Regex("[^a-z0-9]"), "")
        val safeTail = if (tail.isNotEmpty() && tail[0].isLetter()) tail else "app$tail"
        return if (groupId.isBlank()) safeTail else "${groupId.trim()}.$safeTail"
    }

    /** `3.0-alpha.408` → `3.0.0-alpha.408` (what the release job publishes to NuGet). */
    fun nugetVersion(version: String): String = version.replaceFirst(Regex("^(\\d+)\\.(\\d+)(-|$)"), "$1.$2.0$3")

    /** `3.0-alpha.408` → `3.0.0a408` (PEP 440, backend/python/scripts/set_version.py). */
    fun pypiVersion(version: String): String {
        val m = Regex("^(\\d+(?:\\.\\d+)*)(?:[-.]?([A-Za-z]+)[-.]?(\\d+)?)?$").matchEntire(version.trim().removePrefix("v").removePrefix("V"))
            ?: return version
        val parts = m.groupValues[1].split(".").toMutableList()
        while (parts.size < 3) parts.add("0")
        var v = parts.joinToString(".") { it.toInt().toString() }
        val label = m.groupValues[2]
        if (label.isNotEmpty()) {
            val pre = mapOf("alpha" to "a", "a" to "a", "beta" to "b", "b" to "b", "rc" to "rc", "cr" to "rc")
            v += (pre[label.lowercase()] ?: label.lowercase()) + (m.groupValues[3].ifEmpty { "0" }.toInt())
        }
        return v
    }

    // ----------------------------------------------------------------------------------- versions

    /** The `<mateu.version>` the starters pin (moved by scripts/bump-example-version.sh after each release). */
    fun pinnedVersion(sources: Sources, starterDir: String = "spring-mvc"): String {
        for (dir in listOf(starterDir, "spring-mvc")) {
            val pom = sources.read("$dir/pom.xml")?.let { String(it) } ?: continue
            Regex("<mateu\\.version>([^<]+)</mateu\\.version>").find(pom)?.let { return it.groupValues[1] }
        }
        error("No <mateu.version> pinned in the starters")
    }

    /** The release in a maven-metadata.xml (`<release>`, else `<latest>`), or null. */
    fun versionFromMetadata(xml: String): String? =
        (Regex("<release>([^<]+)</release>").find(xml) ?: Regex("<latest>([^<]+)</latest>").find(xml))?.groupValues?.get(1)?.trim()

    /** The latest io.mateu:mateu-bom on Maven Central, or [fallback] when it cannot be read. */
    fun latestMateuVersion(manifest: JsonNode, fallback: String, fetch: (String) -> String = ::httpGet): String =
        try {
            versionFromMetadata(fetch(manifest.path("versionMetadataUrl").asText())) ?: fallback
        } catch (_: Exception) {
            fallback
        }

    private fun httpGet(url: String): String {
        val c = URI(url).toURL().openConnection() as HttpURLConnection
        c.connectTimeout = 5000
        c.readTimeout = 5000
        try {
            if (c.responseCode !in 200..299) error("HTTP ${c.responseCode}")
            return c.inputStream.use { String(it.readBytes()) }
        } finally {
            c.disconnect()
        }
    }

    // --------------------------------------------------------------------------------- validation

    /** Problems with [o]; empty when it can be generated. */
    fun validate(manifest: JsonNode, o: Options): List<String> {
        val r = resolve(manifest, o.authoring, o.runtime).getOrElse { return listOf(it.message ?: "Invalid choice") }
        val errors = mutableListOf<String>()
        val label = r.authoring.path("label").asText()
        if (o.sample !in r.samples) errors += "'$label' offers the samples: ${r.samples.joinToString(", ")}"
        if (r.renderers.isNotEmpty() && o.renderer !in r.renderers) errors += "The renderer must be one of: ${r.renderers.joinToString(", ")}"
        incompatibility(manifest, o.authoring, o.runtime, o.renderer, o.sample)?.let { errors += it }
        if (r.language == "java") {
            val tools = manifest.path("buildTools").filter { b -> b.path("languages").any { it.asText() == "java" } }.map { it.path("id").asText() }
            if ((o.buildTool ?: "maven") !in tools) errors += "Build tool must be one of: ${tools.joinToString(", ")}"
            if (!JAVA_NAME_PATTERN.matches(o.groupId)) errors += "Group id must be a dotted Java name (e.g. com.acme)"
            if (!JAVA_NAME_PATTERN.matches(o.packageName)) errors += "Package must be a dotted Java name (e.g. com.acme.shop)"
        }
        if (!ARTIFACT_ID_PATTERN.matches(o.artifactId)) errors += "Artifact id must be lower-case letters, digits and - . _ (e.g. my-shop)"
        if (o.pages.isNotEmpty() && !r.authoring.path("pages").asBoolean(false)) errors += "'$label' takes no page templates"
        if (!Regex("^\\d+\\.\\d+").containsMatchIn(o.version)) errors += "Not a Mateu version: '${o.version}'"
        return errors
    }

    // --------------------------------------------------------------------------------- generation

    /** Generates the project: relative path → content, sorted by path. */
    fun generate(sources: Sources, o: Options): Map<String, ByteArray> {
        val manifest = manifest(sources)
        val errors = validate(manifest, o)
        require(errors.isEmpty()) { errors.joinToString("; ") }
        val r = resolve(manifest, o.authoring, o.runtime).getOrThrow()
        val flavour = r.authoring
        val lang = manifest.path("languages").path(r.language)
        val exclude = strings(manifest.path("exclude")).toSet()
        val binaryExt = strings(manifest.path("binaryExtensions"))
        fun isBinary(p: String) = binaryExt.any { p.lowercase().endsWith(it) }

        // Text files are kept as String, binaries as ByteArray.
        val files = linkedMapOf<String, Any>()
        fun under(prefix: String): List<String> = sources.list()
            .filter { it.startsWith("$prefix/") }
            .map { it.removePrefix("$prefix/") }
            .filter { rel -> rel.split('/').let { segs -> segs.dropLast(1).none { "$it/" in exclude } && segs.last() !in exclude } }
        fun load(prefix: String, rel: String): Any {
            val bytes = sources.read("$prefix/$rel")!!
            return if (isBinary(rel)) bytes else String(bytes).replace("\r\n", "\n")
        }
        // (1) the starter
        for (p in under(r.starter)) files[p] = load(r.starter, p)
        // (2) the sample
        val keepSample = flavour.path("keepsSample").asBoolean(false) && o.sample != "empty"
        if (!keepSample) strings(lang.path("sampleFiles")).forEach { files.remove(it) }
        // (3) unmount it
        val unmount = lang.path("unmount")
        if (keepSample && flavour.path("unmountsSample").asBoolean(false) && !unmount.isMissingNode && files.containsKey(unmount.path("file").asText())) {
            val drop = strings(unmount.path("removeLines")).toSet()
            val file = unmount.path("file").asText()
            files[file] = (files[file] as String).split("\n").filter { it.trim() !in drop }.joinToString("\n")
        }
        // (4) overlays: common, the language's own, the flavour's (by sample, else "*"), the renderer's
        val overlays = strings(lang.path("overlays")).toMutableList()
        val flavourOverlays = flavour.path("overlays")
        (flavourOverlays.path(o.sample).takeIf { it.isTextual } ?: flavourOverlays.path("*").takeIf { it.isTextual })?.let { overlays += it.asText() }
        o.renderer?.let { lang.path("rendererOverlays").path(it).takeIf { n -> n.isTextual }?.let { n -> overlays += n.asText() } }
        for (prefix in listOf("generator/overlays/common") + overlays.map { "generator/overlays/${r.language}/$it" }) {
            for (p in under(prefix)) files[p] = load(prefix, p)
        }
        // (5) YAML pages + the routes / menu entries
        val specsDir = lang.path("specsDir").takeIf { it.isTextual }?.asText()
        if (specsDir != null) {
            val routes = mutableListOf<String>()
            val menu = mutableListOf<String>()
            val sampleRoute = lang.path("sampleRoute")
            if (keepSample && flavour.path("unmountsSample").asBoolean(false) && !sampleRoute.isMissingNode) {
                val route = sampleRoute.path("route").asText()
                routes += listOf("  - route: $route", "    viewModel: ${sampleRoute.path("viewModel").asText()}")
                menu += listOf("  - type: RouteLink", "    label: ${sampleRoute.path("label").asText()}", "    route: $route")
            }
            if (flavour.path("pages").asBoolean(false) && o.pages.isNotEmpty()) {
                val catalogue = MateuNewFiles.catalogue
                for (id in o.pages) {
                    val t = catalogue.pageTemplates.firstOrNull { it.id == id } ?: error("Unknown page template '$id'")
                    val name = pageFileName(t.id)
                    val width = catalogue.pageWidths.firstOrNull { it.id == t.pageWidth }?.style
                    files["$specsDir/$name.yaml"] = MateuNewFiles.render(MateuNewFiles.bundledTemplateText(t.template), name, t.label, width)
                    routes += listOf("  - route: $name", "    layout: $name.yaml")
                    menu += listOf("  - type: RouteLink", "    label: ${t.label}", "    route: $name")
                }
            }
            fillMarker(files, "$specsDir/routes.yaml", "# __ROUTES__", routes)
            fillMarker(files, "$specsDir/app.yaml", "# __MENU__", menu)
        }
        // (6) replacements, renames, the package directory
        val renderer = o.renderer ?: "vaadin"
        val vars = mapOf(
            "groupId" to o.groupId,
            "artifactId" to o.artifactId,
            "package" to o.packageName,
            "packagePath" to o.packageName.replace('.', '/'),
            "namespace" to namespaceOf(o.artifactId),
            "appTitle" to appTitleOf(o.artifactId),
            "version" to o.version,
            "nugetVersion" to nugetVersion(o.version),
            "pypiVersion" to pypiVersion(o.version),
            "renderer" to renderer,
            "rendererArtifactId" to (byId(manifest.path("renderers"), renderer)?.path("artifactId")?.asText() ?: "mateu-vaadin"),
            "runtime" to (r.runtime?.path("id")?.asText() ?: ""),
            "starter" to r.starter,
        )
        val sourceRoot = lang.path("sourceRoot").takeIf { it.isTextual }?.asText()
        val packageDir = lang.path("packageDir").takeIf { it.isTextual }?.asText()
        val out = sortedMapOf<String, ByteArray>()
        for ((path, content) in files) {
            var c = content
            if (c is String) {
                for (rep in lang.path("replacements")) {
                    val to = expand(rep.path("to").asText(), vars)
                    c = if (rep.has("regex")) {
                        (c as String).replace(Regex(rep.path("regex").asText()), Regex.escapeReplacement(to))
                    } else {
                        (c as String).replace(expand(rep.path("from").asText(), vars), to)
                    }
                }
            }
            var p = path
            for (rn in lang.path("renames")) if (p == expand(rn.path("from").asText(), vars)) p = expand(rn.path("to").asText(), vars)
            if (packageDir != null && sourceRoot != null && p.startsWith("$packageDir/")) {
                p = "$sourceRoot/${vars["packagePath"]}/${p.removePrefix("$packageDir/")}"
            }
            out[p] = if (c is String) c.toByteArray() else c as ByteArray
        }
        return out
    }

    /** How to run the generated project (the flavour's or the runtime's `run`, variables expanded). */
    fun runCommand(manifest: JsonNode, o: Options): String {
        val r = resolve(manifest, o.authoring, o.runtime).getOrNull() ?: return ""
        val run = r.authoring.path("run").takeIf { it.isTextual }?.asText() ?: r.runtime?.path("run")?.asText() ?: ""
        return expand(run, mapOf("artifactId" to o.artifactId))
    }

    /**
     * Writes [files] under [target], which must not exist or be empty — or, with [requireEmpty] false
     * (the New Project wizard, where the IDE may have created `.idea/` already), must not hold any of them.
     */
    fun write(files: Map<String, ByteArray>, target: File, requireEmpty: Boolean = true) {
        require(!(requireEmpty && target.exists() && (target.list()?.isNotEmpty() == true))) { "$target is not empty" }
        val clash = files.keys.firstOrNull { File(target, it).exists() }
        require(clash == null) { "$target already has $clash" }
        for ((p, content) in files) {
            val f = File(target, p)
            f.parentFile.mkdirs()
            f.writeBytes(content)
        }
    }

    /** `smartSearch` → `smart-search` (the same file name New › Mateu › Page… proposes). */
    fun pageFileName(templateId: String): String = templateId.replace(Regex("(?<=[a-z])(?=[A-Z])"), "-").lowercase()

    private fun expand(s: String, vars: Map<String, String>): String =
        Regex("\\$\\{([A-Za-z]+)\\}").replace(s) { m -> vars[m.groupValues[1]] ?: m.value }

    /** Replaces each line that is exactly [marker] (ignoring indentation) by [lines]. */
    private fun fillMarker(files: MutableMap<String, Any>, path: String, marker: String, lines: List<String>) {
        val text = files[path] as? String ?: return
        files[path] = text.split("\n").flatMap { if (it.trim() == marker) lines else listOf(it) }.joinToString("\n")
    }
}
