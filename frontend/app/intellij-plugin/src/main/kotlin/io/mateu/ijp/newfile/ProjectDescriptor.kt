package io.mateu.ijp.newfile

import org.yaml.snakeyaml.Yaml

/**
 * The project descriptor (`specs/ui/project.yaml`, `type: Project`) — the settings true of the whole
 * project, today the RENDERER it paints with. The file is the truth: Settings | Tools | Mateu reads
 * it on open and writes it on Apply, New | Mateu creates it, and the wizards ask it which renderer
 * (and so which Maven artifact) the project uses. Absent file or key = Vaadin.
 *
 * ```yaml
 * type: Project
 * renderer: redwood   # vaadin | redwood
 * ```
 *
 * Platform-free (text in, text out), so it is unit-tested. Mirrors io.mateu.uidl.data.ProjectSettings
 * / ProjectRenderer on the backend.
 */
object ProjectDescriptor {

    const val TYPE = "Project"
    const val FILE_NAME = "project.yaml"

    /**
     * Each renderer and the Maven artifact that serves it — the ONE place the plugin spells those
     * coordinates (the artifacts are due to be renamed; that rename is a change here only).
     */
    enum class Renderer(val id: String, val label: String, val artifactId: String) {
        VAADIN("vaadin", "Vaadin (Lumo)", "vaadin-lit"),
        REDWOOD("redwood", "Redwood (Oracle)", "redwood");

        val coordinates: String get() = "$GROUP_ID:$artifactId"

        override fun toString() = label

        companion object {
            /** The renderer [value] names (case-insensitive), or null. */
            fun parse(value: String?): Renderer? = entries.firstOrNull { it.id.equals(value?.trim(), ignoreCase = true) }
        }
    }

    const val GROUP_ID = "io.mateu"

    /** Whether [text] is a project descriptor (`type: Project`). */
    fun isProject(text: String?): Boolean = rootOf(text)?.get("type")?.toString() == TYPE

    /** The renderer [text] declares; Vaadin when the file is absent, unreadable or names none. */
    fun rendererOf(text: String?): Renderer = Renderer.parse(rootOf(text)?.get("renderer")?.toString()) ?: Renderer.VAADIN

    /** A fresh descriptor for [renderer]. */
    fun newText(renderer: Renderer): String =
        "# The project descriptor: settings true of the whole project, not of one page.\n" +
            "# renderer — the design system the project paints with: vaadin (io.mateu:vaadin-lit, the\n" +
            "# default) or redwood (io.mateu:redwood). The visual editor and Play open in it and the static\n" +
            "# bundle ships it; a served app still renders with its Maven dependency (the server warns when\n" +
            "# the two disagree).\n" +
            "type: $TYPE\n" +
            "renderer: ${renderer.id}\n"

    /**
     * [text] with its `renderer:` set to [renderer], touching nothing else: the top-level `renderer:`
     * line is replaced (keeping a trailing comment), or added after `type:` (or at the end). A blank
     * or absent file becomes a fresh descriptor.
     */
    fun withRenderer(text: String?, renderer: Renderer): String {
        if (text.isNullOrBlank()) return newText(renderer)
        val lines = text.replace("\r\n", "\n").split("\n").toMutableList()
        val at = lines.indexOfFirst { RENDERER_LINE.matches(it) }
        if (at >= 0) {
            val comment = lines[at].substringAfter("renderer:").let { rest -> Regex("\\s+#.*$").find(rest)?.value.orEmpty() }
            lines[at] = "renderer: ${renderer.id}$comment"
        } else {
            val typeAt = lines.indexOfFirst { Regex("^type\\s*:.*").matches(it) }
            if (typeAt >= 0) lines.add(typeAt + 1, "renderer: ${renderer.id}")
            else {
                val end = if (lines.last().isEmpty()) lines.size - 1 else lines.size
                lines.add(end, "renderer: ${renderer.id}")
            }
        }
        return lines.joinToString("\n")
    }

    /** The `<dependency>` a pom needs to serve [renderer] — for the wizards that write a pom. */
    fun dependencyXml(renderer: Renderer, version: String = "\${mateu.version}", indent: String = "        "): String =
        "$indent<dependency>\n" +
            "$indent    <groupId>$GROUP_ID</groupId>\n" +
            "$indent    <artifactId>${renderer.artifactId}</artifactId>\n" +
            "$indent    <version>$version</version>\n" +
            "$indent</dependency>"

    private val RENDERER_LINE = Regex("^renderer\\s*:.*")

    private fun rootOf(text: String?): Map<*, *>? =
        if (text.isNullOrBlank()) null else runCatching { Yaml().load<Any?>(text) }.getOrNull() as? Map<*, *>
}
