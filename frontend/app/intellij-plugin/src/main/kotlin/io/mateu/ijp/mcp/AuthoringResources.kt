package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import java.util.Locale

/**
 * The authoring vocabulary an agent needs to compose a screen for `mateu_show_screen`, bundled into
 * the plugin so it works offline: COPIES of backend/shared/uidl/{authoring-guide.md, uidl-catalog.json,
 * specs-schema.json} under resources/mateu/authoring (pinned byte-equal by AuthoringResourcesTest —
 * re-copy them after regenerating the schemas). The same files the backends serve as mateu://guide,
 * mateu://catalog and mateu://schema/specs; [list] and [schemaOf] port the backends'
 * `ComponentSchemas` (same output).
 */
object AuthoringResources {

    const val GUIDE = "authoring-guide.md"
    const val CATALOG = "uidl-catalog.json"
    const val SPECS_SCHEMA = "specs-schema.json"

    val RESOURCES = listOf(
        McpResource("mateu://guide", "Authoring guide", "How to write Mateu YAML page definitions for mateu_show_screen.", "text/markdown") to GUIDE,
        McpResource("mateu://catalog", "Component catalog", "Every component type a YAML definition can use, with its attributes.", "application/json") to CATALOG,
        McpResource("mateu://schema/specs", "specs/ui schema", "The JSON schema of every specs/ui file kind (a page definition included).", "application/json") to SPECS_SCHEMA,
    )

    private val cache = java.util.concurrent.ConcurrentHashMap<String, String>()

    fun text(file: String): String = cache.getOrPut(file) {
        AuthoringResources::class.java.getResourceAsStream("/mateu/authoring/$file")?.use { it.readBytes().toString(Charsets.UTF_8) }
            ?: error("missing bundled resource mateu/authoring/$file")
    }

    fun byUri(uri: String): String? = RESOURCES.firstOrNull { it.first.uri == uri }?.let { text(it.second) }

    /** Components whose type or description contains [query] (ignoring case; all for a blank query). */
    fun list(query: String?, mapper: ObjectMapper): ObjectNode {
        val needle = query?.trim()?.lowercase(Locale.ROOT).orEmpty()
        val out = mapper.createObjectNode()
        val components = out.putArray("components")
        for (c in mapper.readTree(text(CATALOG)).path("components")) {
            val type = c.path("type").asText()
            val description = c.path("description").asText()
            if (needle.isNotEmpty() && !type.lowercase(Locale.ROOT).contains(needle) &&
                !description.lowercase(Locale.ROOT).contains(needle)) continue
            components.addObject().apply {
                put("type", type)
                put("description", description)
                val attributes = putArray("attributes")
                c.path("attributes").forEach { attributes.add(it.path("name").asText()) }
            }
        }
        out.put("count", components.size())
        return out
    }

    /** The `$def` of [type] with every definition it references (polymorphic families not walked into). */
    fun schemaOf(type: String, mapper: ObjectMapper): ObjectNode {
        val defs = mapper.readTree(text(SPECS_SCHEMA)).path("\$defs")
        val def = defs.get(type)
        if (def == null) {
            val names = defs.fieldNames().asSequence().toList()
            val suggestion = suggest(type, names)
            throw McpToolError("Unknown type \"$type\"." + (suggestion?.let { " Did you mean \"$it\"?" } ?: "") +
                " See mateu_list_components.")
        }
        val included = sortedSetOf<String>()
        val pending = ArrayDeque<String>()
        if (!def.has("oneOf")) refs(def, pending)
        while (pending.isNotEmpty()) {
            val name = pending.removeFirst()
            if (name == type || !included.add(name)) continue
            val referenced = defs.path(name)
            if (!referenced.has("oneOf")) refs(referenced, pending)
        }
        return mapper.createObjectNode().apply {
            put("type", type)
            set<JsonNode>("schema", def)
            val definitions = putObject("definitions")
            included.forEach { definitions.set<JsonNode>(it, defs.get(it)) }
        }
    }

    private fun refs(node: JsonNode, into: ArrayDeque<String>) {
        if (node.isObject) {
            val ref = node.get("\$ref")
            if (ref != null && ref.isTextual && ref.asText().startsWith("#/\$defs/")) into.addLast(ref.asText().removePrefix("#/\$defs/"))
            node.forEach { refs(it, into) }
        } else if (node.isArray) {
            node.forEach { refs(it, into) }
        }
    }

    internal fun suggest(value: String, candidates: List<String>): String? {
        val lower = value.lowercase(Locale.ROOT)
        candidates.firstOrNull { it.lowercase(Locale.ROOT) == lower }?.let { return it }
        var best: String? = null
        var bestDistance = Int.MAX_VALUE
        for (c in candidates) {
            val d = levenshtein(lower, c.lowercase(Locale.ROOT))
            if (d < bestDistance) { bestDistance = d; best = c }
        }
        return if (best != null && bestDistance <= 2 && bestDistance < value.length) best else null
    }

    private fun levenshtein(a: String, b: String): Int {
        var previous = IntArray(b.length + 1) { it }
        var current = IntArray(b.length + 1)
        for (i in 1..a.length) {
            current[0] = i
            for (j in 1..b.length) {
                val cost = if (a[i - 1] == b[j - 1]) 0 else 1
                current[j] = minOf(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
            }
            val swap = previous; previous = current; current = swap
        }
        return previous[b.length]
    }
}
