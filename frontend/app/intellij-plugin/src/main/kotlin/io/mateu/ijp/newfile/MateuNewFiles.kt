package io.mateu.ijp.newfile

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper

/**
 * The New | Mateu catalogue: which files can be created and from which skeleton. The data lives in
 * `/mateu/new-file-kinds.json` (shared with the VS Code extension, which stages it at packaging);
 * the skeletons are internal file templates (`fileTemplates/internal/<template>.yaml.ft`), so users
 * can customise them in Settings | Editor | File and Code Templates.
 *
 * Platform-free, so it is unit-tested (every skeleton is validated against the specs schema).
 */
object MateuNewFiles {

    data class FileKind(
        val id: String,
        val label: String,
        val description: String,
        val fileName: String,
        val template: String?,
        val page: Boolean,
    )

    data class PageWidth(val id: String, val label: String, val style: String?) {
        override fun toString() = label
    }

    data class PageTemplate(
        val id: String,
        val label: String,
        val description: String,
        val family: String,
        val pageWidth: String,
        val template: String,
    ) {
        override fun toString() = label
    }

    data class Catalogue(
        val files: List<FileKind>,
        val pageWidths: List<PageWidth>,
        val pageTemplates: List<PageTemplate>,
    )

    const val RESOURCE = "/mateu/new-file-kinds.json"
    const val PAGE_WIDTH_MARKER = "__PAGE_WIDTH__"

    val catalogue: Catalogue by lazy { parse(ObjectMapper().readTree(javaClass.getResourceAsStream(RESOURCE))) }

    fun parse(root: JsonNode): Catalogue = Catalogue(
        files = root.path("files").map {
            FileKind(
                id = it.path("id").asText(),
                label = it.path("label").asText(),
                description = it.path("description").asText(),
                fileName = it.path("fileName").asText(),
                template = it.path("template").takeIf { t -> t.isTextual }?.asText(),
                page = it.path("page").asBoolean(false),
            )
        },
        pageWidths = root.path("pageWidths").map {
            PageWidth(it.path("id").asText(), it.path("label").asText(), it.path("style").takeIf { s -> s.isTextual }?.asText())
        },
        pageTemplates = root.path("pageTemplates").map {
            PageTemplate(
                id = it.path("id").asText(),
                label = it.path("label").asText(),
                description = it.path("description").asText(),
                family = it.path("family").asText(),
                pageWidth = it.path("pageWidth").asText("auto"),
                template = it.path("template").asText(),
            )
        },
    )

    /** The skeleton text bundled with the plugin (the defaults, before any user customisation). */
    fun bundledTemplateText(template: String): String =
        javaClass.getResourceAsStream("/fileTemplates/internal/$template.yaml.ft")?.use { String(it.readBytes()) }
            ?: error("No bundled file template '$template'")

    /**
     * Fill a skeleton: `__TITLE__` → a YAML-safe title, `__NAME__` → the file base name, and the line
     * holding only `__PAGE_WIDTH__` → `style: "<css>"` at the same indentation, or nothing.
     */
    fun render(templateText: String, name: String, title: String = titleOf(name), pageWidthStyle: String? = null): String {
        val lines = templateText.replace("\r\n", "\n").split("\n").mapNotNull { line ->
            if (line.trim() == PAGE_WIDTH_MARKER) {
                pageWidthStyle?.ifBlank { null }?.let { line.substringBefore(PAGE_WIDTH_MARKER) + "style: " + quoted(it) }
            } else {
                line
            }
        }
        return lines.joinToString("\n")
            .replace("__TITLE__", yamlScalar(title))
            .replace("__NAME__", yamlScalar(name))
    }

    /** "customer-orders" → "Customer orders". */
    fun titleOf(fileName: String): String {
        val base = fileName.substringAfterLast('/').removeSuffix(".yaml").removeSuffix(".yml")
            .removeSuffix(".ui").replace(Regex("[-_.]+"), " ").trim()
        val spaced = base.replace(Regex("(?<=[a-z0-9])(?=[A-Z])"), " ").lowercase()
        return spaced.replaceFirstChar { it.uppercase() }.ifBlank { "Untitled" }
    }

    /** A plain scalar when safe in block AND flow context, otherwise a double-quoted string. */
    fun yamlScalar(s: String): String {
        val plainSafe = s.isNotBlank() && s == s.trim() &&
            Regex("^[\\p{L}\\p{N}][\\p{L}\\p{N} ._'()/-]*$").matches(s) &&
            s.lowercase() !in setOf("true", "false", "yes", "no", "on", "off", "null", "y", "n")
        return if (plainSafe) s else quoted(s)
    }

    private fun quoted(s: String) = "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

    /** `orders` → `orders.yaml`; keeps an explicit .yaml/.yml. */
    fun fileNameOf(name: String): String {
        val n = name.trim()
        return if (n.endsWith(".yaml") || n.endsWith(".yml")) n else "$n.yaml"
    }

    /**
     * Where a new spec goes, given the folder the user right-clicked ([selected], a `/`-separated
     * path). Inside a `specs/ui` folder → that folder. Otherwise the nearest `specs/ui` that exists at
     * or above it (as `src/main/resources/specs/ui` or `specs/ui`), else a new
     * `src/main/resources/specs/ui` when the folder is a module with Maven/Gradle resources, else
     * `<selected>/specs/ui`. The upward search stops at [projectRoot]. Returns a path that may not exist yet.
     */
    fun targetDir(selected: String, projectRoot: String?, exists: (String) -> Boolean): String {
        val path = selected.trimEnd('/')
        val marker = "/specs/ui"
        val idx = path.indexOf("$marker/").takeIf { it >= 0 } ?: if (path.endsWith(marker)) path.length - marker.length else -1
        if (idx >= 0) return path
        var dir: String? = path
        val stop = projectRoot?.trimEnd('/')
        while (dir != null && dir.isNotEmpty() && (stop == null || dir == stop || dir.startsWith("$stop/"))) {
            for (candidate in listOf("$dir/src/main/resources/specs/ui", "$dir/specs/ui")) {
                if (exists(candidate)) return candidate
            }
            dir = dir.substringBeforeLast('/', "").ifEmpty { null }
        }
        return if (exists("$path/src/main/resources")) "$path/src/main/resources/specs/ui" else "$path/specs/ui"
    }
}
