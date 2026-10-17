package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.text

/** Pure readings of wire component trees and routes that the view context bases decisions on. */
object ScreenShapes {
    private val CRUD_ONLY = setOf("Crud")

    /** A bare mediator/app shell: an App, or a ServerSide whose only child is an App. */
    fun isMediatorShell(component: JsonNode): Boolean {
        if (component.path("metadata").text("type") == "App") return true
        if (component.text("type") == "ServerSide") {
            val children = component.path("children")
            return children.isArray && children.size() == 1 &&
                children.get(0).path("metadata").text("type") == "App"
        }
        return false
    }

    /** Whether a Crud appears anywhere in the tree (children, or a Card-like `content`). */
    fun containsCrud(node: JsonNode): Boolean = containsType(node, CRUD_ONLY)

    fun containsType(node: JsonNode, types: Set<String>): Boolean {
        if (node.isNull || node.isMissingNode) return false
        if (node.path("metadata").text("type") in types) return true
        val children = node.path("children")
        if (children.isArray) for (c in children) if (containsType(c, types)) return true
        val content = node.path("metadata").path("content")
        if (content.isObject && containsType(content, types)) return true
        return false
    }

    /** A short tab title for a CRUD detail route suffix, e.g. "/0130" → "0130", "/new" → "New". */
    fun detailLabel(routeSuffix: String): String {
        val seg = routeSuffix.trim('/').substringAfterLast('/')
        return when {
            seg.isBlank() -> "Detail"
            seg.equals("new", ignoreCase = true) -> "New"
            else -> seg
        }
    }

    /** "28rem" → 448 px (16 px per rem); [def] when the size is not a rem length. */
    fun remToPx(size: String, def: Int): Int {
        val rem = size.removeSuffix("rem").trim().toDoubleOrNull() ?: return def
        return (rem * 16).toInt()
    }

    /** Navigate a dot path (`profile`, `data.address`) into a JSON value; an empty path is identity. */
    fun valueAtPath(node: JsonNode, path: String): JsonNode? {
        if (path.isBlank()) return node
        var cur: JsonNode? = node
        for (key in path.split('.')) {
            cur = cur?.get(key) ?: return null
        }
        return cur
    }
}
