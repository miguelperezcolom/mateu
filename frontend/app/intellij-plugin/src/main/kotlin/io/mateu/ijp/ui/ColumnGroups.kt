package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import io.mateu.ijp.api.arr

/**
 * Column groups (`GridGroupColumn` — a header spanning several columns). A Swing [javax.swing.JTable]
 * header is flat, so a group is FLATTENED into its leaf columns and the group's label prefixes each
 * of theirs ("Occupancy · Adults"): no grouped column is lost and the grouping still reads. Same
 * rule as the Redwood renderer (`leafColumnsOf`) and React Native (`columnGroups.ts`).
 */
object ColumnGroups {

    const val SEPARATOR = " · "

    private fun metaOf(node: JsonNode): JsonNode = node.path("metadata").takeIf { it.isObject } ?: node

    /** The leaf columns of a wire column list, in wire order and in the shape they arrived in (a
     *  ClientSide node keeps its envelope); a grouped column's label carries its group's prefix. */
    fun flatten(columns: List<JsonNode>): List<JsonNode> {
        val out = ArrayList<JsonNode>()
        fun walk(col: JsonNode, prefix: String) {
            if (!col.isObject) return
            val m = metaOf(col)
            if (m.path("type").asText("") == "GridGroupColumn") {
                val label = m.path("label").asText("")
                val next = if (label.isBlank()) prefix else if (prefix.isBlank()) label else prefix + SEPARATOR + label
                m.arr("columns").forEach { walk(it, next) }
                col.arr("children").forEach { walk(it, next) }
                return
            }
            if (prefix.isBlank()) { out.add(col); return }
            val own = m.path("label").asText("").ifBlank { m.path("id").asText(col.path("id").asText("")) }
            val meta = (m.deepCopy<JsonNode>() as ObjectNode).put("label", prefix + SEPARATOR + own)
            out.add(if (col.path("metadata").isObject) (col.deepCopy<JsonNode>() as ObjectNode).set<JsonNode>("metadata", meta) else meta)
        }
        columns.forEach { walk(it, "") }
        return out
    }
}

/** [field]'s columns with every column group flattened ([ColumnGroups.flatten]). */
fun JsonNode?.leafColumns(field: String = "columns"): List<JsonNode> = ColumnGroups.flatten(this.arr(field))
