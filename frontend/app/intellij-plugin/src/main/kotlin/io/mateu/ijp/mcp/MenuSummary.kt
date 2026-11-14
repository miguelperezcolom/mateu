package io.mateu.ijp.mcp

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text

/**
 * The app shell's menu (`App.menu`, `MenuOptionDto`s) as a tree an agent reads — pure. Each entry:
 * its label, the route it opens (or the action it runs), and its entries. Separators and entries
 * the server marked invisible are left out; the server already removed what the user may not see.
 */
object MenuSummary {

    const val MAX_ENTRIES = 500

    fun build(menu: JsonNode?, mapper: ObjectMapper = ObjectMapper()): ArrayNode {
        val out = mapper.createArrayNode()
        var count = 0
        fun walk(items: JsonNode, into: ArrayNode, depth: Int) {
            if (!items.isArray || depth > 8) return
            for (item in items) {
                if (item.bool("separator")) continue
                if (item.has("visible") && !item.bool("visible")) continue
                if (++count > MAX_ENTRIES) return
                into.addObject().apply {
                    put("label", item.text("label"))
                    item.text("route").takeIf { it.isNotBlank() }?.let { put("route", it) }
                    item.text("actionId").takeIf { it.isNotBlank() }?.let { put("actionId", it) }
                    item.text("description").takeIf { it.isNotBlank() }?.let { put("description", it) }
                    if (item.bool("disabled")) put("enabled", false)
                    if (item.bool("selected")) put("selected", true)
                    if (item.bool("remote") || item.text("baseUrl").isNotBlank()) put("remote", true)
                    val subs = item.path("submenus")
                    if (subs.isArray && !subs.isEmpty) walk(subs, putArray("entries"), depth + 1)
                }
            }
        }
        walk(menu ?: mapper.createArrayNode(), out, 0)
        return out
    }

    /** The menu entry whose route is [route] (ignoring a leading/trailing `/`), depth first. */
    fun find(menu: JsonNode?, route: String): JsonNode? {
        val wanted = route.trim().trim('/')
        fun walk(items: JsonNode?): JsonNode? {
            if (items == null || !items.isArray) return null
            for (item in items) {
                if (item.text("route").trim('/') == wanted && wanted.isNotEmpty()) return item
                walk(item.path("submenus"))?.let { return it }
            }
            return null
        }
        return walk(menu)
    }
}
