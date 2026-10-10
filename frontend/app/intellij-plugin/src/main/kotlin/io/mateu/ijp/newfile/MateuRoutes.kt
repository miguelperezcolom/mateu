package io.mateu.ijp.newfile

import org.yaml.snakeyaml.LoaderOptions
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.constructor.SafeConstructor

/**
 * The pure logic behind the routes wizards (New | Mateu > Routes File, Add Route…, and the Page…
 * dialog's "Add a route" option): classify the specs/ui files, generate an empty routes file, and
 * edit a mount's `routes:` list or a routes file's entries with MINIMAL text edits — the user's
 * formatting and comments are never rewritten.
 *
 * Platform-free (no IntelliJ API), so it is unit-tested; the VS Code extension has a line-for-line
 * port in `src/routesWizard.ts`.
 */
object MateuRoutes {

    enum class SpecKind { MOUNT, ROUTES, SOURCES, TYPES, APP_SHELL, PAGE }

    /** A discovered specs/ui file; [path] is relative to the specs/ui root, `/`-separated. */
    data class SpecFile(val path: String, val kind: SpecKind) {
        override fun toString() = path
    }

    /** One entry to append. [layout] is relative to the specs/ui root; null = the view model's own tree. */
    data class NewRoute(
        val route: String,
        val layout: String? = null,
        val viewModel: String? = null,
        val parent: String? = null,
    )

    const val DOCS_URL = "https://mateu.io/java-ui-definition/route-registry/"

    private fun yaml() = Yaml(SafeConstructor(LoaderOptions()))

    private fun load(text: String): Any? =
        runCatching { yaml().load<Any?>(text) }.getOrElse { throw IllegalArgumentException("Not valid YAML: ${it.message}", it) }

    /**
     * The kind of a specs/ui file from its top-level `type:` — `UI` (mount), `Routes`, `Sources`, `Types`,
     * `AppShell`, anything else a page/definition. Null when it does not parse or is not a mapping.
     */
    fun classify(text: String): SpecKind? {
        val root = runCatching { yaml().load<Any?>(text) }.getOrNull() as? Map<*, *> ?: return null
        return when (root["type"]?.toString()) {
            "UI" -> SpecKind.MOUNT
            "Routes" -> SpecKind.ROUTES
            "Sources" -> SpecKind.SOURCES
            "Types" -> SpecKind.TYPES
            "AppShell" -> SpecKind.APP_SHELL
            else -> SpecKind.PAGE
        }
    }

    /** The specs/ui root containing [dir] (`…/specs/ui`), or [dir] itself when it is not under one. */
    fun specsRoot(dir: String): String {
        val path = dir.trimEnd('/')
        val marker = "/specs/ui"
        val i = path.indexOf("$marker/")
        return when {
            i >= 0 -> path.substring(0, i + marker.length)
            else -> path
        }
    }

    /** `customerOrders.yaml` → `customer-orders`; a subfolder is kept (`sales/Orders.yaml` → `sales/orders`). */
    fun routeNameOf(path: String): String =
        path.removeSuffix(".yaml").removeSuffix(".yml").split('/').joinToString("/") { seg ->
            seg.replace(Regex("(?<=[a-z0-9])(?=[A-Z])"), "-").replace(Regex("[\\s_]+"), "-").lowercase()
        }

    /** The path of [toFile] relative to the directory [fromDir] (both `/`-separated, same root). */
    fun relativePath(fromDir: String, toFile: String): String {
        val from = fromDir.trim('/').split('/').filter { it.isNotEmpty() && it != "." }
        val to = toFile.trim('/').split('/').filter { it.isNotEmpty() && it != "." }
        var common = 0
        while (common < from.size && common < to.size - 1 && from[common] == to[common]) common++
        return (List(from.size - common) { ".." } + to.drop(common)).joinToString("/")
    }

    /**
     * A new routes file: a short header, `type: Routes` and an EMPTY list — routes are added one at a
     * time (Add Route…). Identical to the bundled `Mateu Routes` file template (pinned by a test).
     */
    fun routesFileText(basePath: String? = null): String = withBasePath(
        "# Route registry of a mount. Each entry binds a route (relative to the mount; \"\" is its root)\n" +
            "# to a layout under specs/ui, an optional viewModel, and parameters it pins (fixedParams) or\n" +
            "# seeds (defaultParams); `children` nest sub-routes in a parent's slot. Add entries with\n" +
            "# Add Route…, see $DOCS_URL\n" +
            "type: Routes\n" +
            "routes: []\n",
        basePath,
    )

    /**
     * Insert the optional `basePath:` header (only for a class-declared @UI mount) right before the
     * top-level `type:` line; a blank [basePath] leaves the text unchanged.
     */
    fun withBasePath(text: String, basePath: String?): String {
        val bp = basePath?.trim()?.takeIf { it.isNotEmpty() } ?: return text
        val lines = text.split("\n").toMutableList()
        val at = lines.indexOfFirst { Regex("^type\\s*:.*$").matches(it) }.takeIf { it >= 0 } ?: 0
        lines.add(at, "basePath: ${MateuNewFiles.yamlScalar(bp)}")
        return lines.joinToString("\n")
    }

    /** The routes a routes file already answers, flattened to absolute routes (children joined to their parent). */
    fun existingRoutes(routesText: String): List<String> {
        val root = runCatching { yaml().load<Any?>(routesText) }.getOrNull()
        val list = when (root) {
            is Map<*, *> -> root["routes"] as? List<*>
            is List<*> -> root
            else -> null
        } ?: return emptyList()
        val out = ArrayList<String>()
        fun walk(entries: List<*>, prefix: String?) {
            for (e in entries) {
                val m = e as? Map<*, *> ?: continue
                val r = m["route"]?.toString() ?: continue
                val abs = if (prefix.isNullOrEmpty()) r else if (r.isEmpty()) prefix else "$prefix/$r"
                out += abs
                (m["children"] as? List<*>)?.let { walk(it, abs) }
            }
        }
        walk(list, null)
        return out
    }

    /**
     * Append one entry to a routes file's `routes:` list. Throws [IllegalArgumentException] when the
     * route is already there or the list cannot be edited safely.
     */
    fun appendRoute(routesText: String, route: NewRoute): String {
        val r = route.route.trim().trim('/')
        require(r !in existingRoutes(routesText)) { "Route \"$r\" is already declared in this file" }
        val entries = buildList {
            add("route" to r)
            route.layout?.trim()?.takeIf { it.isNotEmpty() }?.let { add("layout" to it) }
            route.viewModel?.trim()?.takeIf { it.isNotEmpty() }?.let { add("viewModel" to it) }
            route.parent?.trim()?.trim('/')?.takeIf { it.isNotEmpty() }?.let { add("parent" to it) }
        }
        return appendListItem(routesText, "routes", Item.Mapping(entries))
    }

    /**
     * Register a routes file in a mount's `routes:` list ([entry] relative to the mount file's
     * directory). Returns the text unchanged when it is already listed.
     */
    fun registerInMount(mountText: String, entry: String): String {
        val root = load(mountText) as? Map<*, *>
        val listed = (root?.get("routes") as? List<*>).orEmpty().map { it.toString().removePrefix("./") }
        if (entry.removePrefix("./") in listed) return mountText
        return appendListItem(mountText, "routes", Item.Scalar(entry))
    }

    /** The mount's `home:` route, or null. */
    fun homeOf(mountText: String): String? =
        (runCatching { yaml().load<Any?>(mountText) }.getOrNull() as? Map<*, *>)?.get("home")?.toString()

    /**
     * Set the mount's home page route: replace the top-level `home:` line, else insert one after
     * `basePath:`, else after `type: UI`, else at the top. Nothing else in the file moves.
     */
    fun setHome(mountText: String, route: String): String {
        val nl = if (mountText.contains("\r\n")) "\r\n" else "\n"
        val trailingNewline = mountText.endsWith("\n")
        val lines = mountText.split(Regex("\r?\n")).toMutableList()
        if (trailingNewline) lines.removeAt(lines.size - 1)
        val line = "home: ${scalar(route.trim().trim('/'))}"
        val home = lines.indexOfFirst { Regex("^home\\s*:.*$").matches(it) }
        if (home >= 0) {
            // A multi-line value (indented continuation) is replaced along with its key line.
            var end = home + 1
            while (end < lines.size && (lines[end].startsWith(" ") || lines[end].startsWith("\t"))) end++
            for (k in end - 1 downTo home) lines.removeAt(k)
            lines.add(home, line)
        } else {
            val after = lines.indexOfFirst { Regex("^basePath\\s*:.*$").matches(it) }.takeIf { it >= 0 }
                ?: lines.indexOfFirst { Regex("^type\\s*:\\s*[\"']?UI[\"']?\\s*(#.*)?$").matches(it) }
            lines.add(after + 1, line)
        }
        return lines.joinToString(nl) + if (trailingNewline) nl else ""
    }

    /**
     * The mount (among [mounts], path relative to the specs root → text) whose `routes:` list names
     * [routesFile] (relative to the specs root), or null. Entries are resolved against the mount's directory.
     */
    fun mountListing(mounts: Map<String, String>, routesFile: String): String? = mounts.entries.firstOrNull { (path, text) ->
        val dir = path.substringBeforeLast('/', "")
        val listed = ((runCatching { yaml().load<Any?>(text) }.getOrNull() as? Map<*, *>)?.get("routes") as? List<*>).orEmpty()
        listed.any { normalize(if (dir.isEmpty()) it.toString() else "$dir/$it") == normalize(routesFile) }
    }?.key

    private fun normalize(path: String): String {
        val out = ArrayList<String>()
        for (seg in path.trimStart('/').split('/')) {
            when (seg) {
                "", "." -> {}
                ".." -> if (out.isNotEmpty()) out.removeAt(out.size - 1)
                else -> out += seg
            }
        }
        return out.joinToString("/")
    }

    sealed interface Item {
        data class Scalar(val value: String) : Item
        data class Mapping(val entries: List<Pair<String, String>>) : Item
    }

    private fun scalar(s: String) = if (s.isEmpty()) "\"\"" else MateuNewFiles.yamlScalar(s)

    private fun blockLines(item: Item, indent: String): List<String> = when (item) {
        is Item.Scalar -> listOf("$indent- ${scalar(item.value)}")
        is Item.Mapping -> item.entries.mapIndexed { i, (k, v) ->
            (if (i == 0) "$indent- " else "$indent  ") + "$k: ${scalar(v)}"
        }
    }

    private fun flow(item: Item): String = when (item) {
        is Item.Scalar -> scalar(item.value)
        is Item.Mapping -> item.entries.joinToString(", ", "{", "}") { (k, v) -> "$k: ${scalar(v)}" }
    }

    /**
     * Append [item] to the top-level list [key] with a minimal edit: after the last item of a block
     * list (at its indentation), inside a one-line flow list (`[]` becomes a block list), or as a new
     * `key:` block at the end of the file when the key is absent.
     */
    fun appendListItem(text: String, key: String, item: Item): String {
        val nl = if (text.contains("\r\n")) "\r\n" else "\n"
        val lines = text.split(Regex("\r?\n")).toMutableList()
        val trailingNewline = text.endsWith("\n")
        if (trailingNewline) lines.removeAt(lines.size - 1)
        val keyRe = Regex("^" + Regex.escape(key) + "\\s*:(.*)$")
        val idx = lines.indexOfFirst { keyRe.matches(it) }
        if (idx < 0) {
            while (lines.isNotEmpty() && lines.last().isBlank()) lines.removeAt(lines.size - 1)
            lines += "$key:"
            lines += blockLines(item, "  ")
            return lines.joinToString(nl) + nl
        }
        val rest = keyRe.find(lines[idx])!!.groupValues[1]
        val value = stripComment(rest).trim()
        if (value.isEmpty()) {
            // Block list: the lines that belong to it are indented, or `- ` items at column 0.
            var last = idx
            var itemIndent: String? = null
            var j = idx + 1
            while (j < lines.size) {
                val l = lines[j]
                if (l.isBlank() || l.trimStart().startsWith("#")) { j++; continue }
                val belongs = l.startsWith(" ") || l.startsWith("\t") || l.startsWith("- ") || l == "-"
                if (!belongs) break
                if (itemIndent == null && l.trimStart().startsWith("-")) itemIndent = l.substring(0, l.length - l.trimStart().length)
                last = j
                j++
            }
            lines.addAll(last + 1, blockLines(item, itemIndent ?: "  "))
        } else if (value.startsWith("[") && value.endsWith("]")) {
            val inner = value.substring(1, value.length - 1).trim()
            val comment = rest.substring(stripComment(rest).length).trim().let { if (it.isEmpty()) "" else " $it" }
            if (inner.isEmpty()) {
                lines[idx] = "$key:$comment"
                lines.addAll(idx + 1, blockLines(item, "  "))
            } else {
                lines[idx] = "$key: [$inner, ${flow(item)}]$comment"
            }
        } else {
            throw IllegalArgumentException("`$key:` is not a list this tool can edit (${value.take(30)})")
        }
        return lines.joinToString(nl) + if (trailingNewline) nl else ""
    }

    /** The part of a line before a ` #` comment (quotes are respected). */
    private fun stripComment(s: String): String {
        var quote: Char? = null
        for (i in s.indices) {
            val c = s[i]
            if (quote != null) {
                if (c == quote) quote = null
            } else if (c == '"' || c == '\'') {
                quote = c
            } else if (c == '#' && (i == 0 || s[i - 1].isWhitespace())) {
                return s.substring(0, i)
            }
        }
        return s
    }
}
