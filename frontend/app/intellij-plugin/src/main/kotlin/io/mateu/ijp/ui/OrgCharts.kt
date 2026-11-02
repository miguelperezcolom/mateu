package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * The OrgChart's focus presentation (OrgChartDto.display = "focus", Redwood's hierarchy viewer): the
 * decisions that are not drawing — which presentation, where the chart opens, the ancestor chain,
 * the initials. Mirrors RN `src/renderer/orgChart.ts`; tested by OrgChartModelTest.
 */
object OrgChartModel {

    /** "focus" only when the wire says so; null, unknown or "tree" read as tree. */
    fun isFocus(metadata: JsonNode): Boolean =
        metadata.path("display").let { it.isTextual && it.asText().trim().equals("focus", ignoreCase = true) }

    /** A node's children (none when absent). */
    fun children(node: JsonNode?): List<JsonNode> {
        val arr = node?.get("children") ?: return emptyList()
        return if (arr.isArray) arr.filter { it != null && it.isObject } else emptyList()
    }

    /** The node's id as text, or null when it has none. */
    private fun idOf(node: JsonNode): String? = node.get("id")?.takeIf { !it.isNull }?.asText()

    /** The path root → … → the node whose `id` equals [id] (as strings), depth first; null when none. */
    fun pathTo(root: JsonNode?, id: String?): List<JsonNode>? {
        if (root == null || root.isNull || id.isNullOrEmpty()) return null
        fun walk(node: JsonNode, trail: List<JsonNode>): List<JsonNode>? {
            val path = trail + listOf(node) // not `+ node`: a JsonNode is Iterable, `+` would add its fields
            if (idOf(node) == id) return path
            for (child in children(node)) walk(child, path)?.let { return it }
            return null
        }
        return walk(root, emptyList())
    }

    /** Where a focused chart opens: the path to the node `focus` names, else just the root. */
    fun initialPath(metadata: JsonNode): List<JsonNode> {
        val root = metadata.get("root")?.takeIf { it.isObject } ?: return emptyList()
        val focus = metadata.get("focus")?.takeIf { !it.isNull }?.asText()
        return pathTo(root, focus) ?: listOf(root)
    }

    /** The ancestors of the focused node (root first): the path without its last node. */
    fun <T> ancestors(path: List<T>): List<T> = path.dropLast(1)

    /** The heading above the focused node's children. */
    fun reportsLabel(n: Int): String = "Reports ($n)"

    /**
     * The round badge's text: the avatar glyph (an emoji, a letter — not a picture or an icon token),
     * else the initials of the first two words of the title ("Ada Lovelace" → "AL"), else "?".
     */
    fun initials(title: String, avatar: String): String {
        val picture = avatar.startsWith("http") || avatar.startsWith("data:") || avatar.contains(':')
        if (avatar.isNotBlank() && !picture) return avatar
        val letters = title.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }.take(2)
            .joinToString("") { String(Character.toChars(it.codePointAt(0))) }.uppercase()
        return letters.ifEmpty { "?" }
    }

    /** A node as a screen reader names it: "title, subtitle". */
    fun label(title: String, subtitle: String): String = listOf(title, subtitle).filter { it.isNotBlank() }.joinToString(", ")
}
