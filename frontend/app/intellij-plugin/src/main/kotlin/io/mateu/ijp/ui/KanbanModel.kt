package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode

/**
 * The pure half of a kanban board in the plugin: a LIVE board's cards from the items of its
 * rowsSource, what a move does to the columns and what the move action receives. The same rules as
 * the web's libs/mateu kanbanModel.ts, Redwood's poc/core/kanban.mjs and RN's core/kanban.ts. In
 * the plugin a card moves from its "Move…" popup (its ⋯ button, a right click, or Shift+F10).
 *
 * Side-effect-free, unit-tested by KanbanModelTest.
 */
object KanbanModel {

    data class Card(
        val id: String,
        val title: String,
        val description: String = "",
        val badge: String = "",
        val color: String = "",
        val actionId: String = "",
        /** The item a live card was drawn from (null for a declared card). */
        val row: JsonNode? = null,
    )

    data class Column(val id: String, val title: String, val color: String, val cards: List<Card>)

    data class Move(val cardId: String, val fromColumnId: String, val toColumnId: String, val toIndex: Int)

    private fun valueAt(row: JsonNode?, path: String): JsonNode? =
        path.split('.').fold(row) { node, key -> node?.get(key) }?.takeUnless { it.isNull || it.isMissingNode }

    /** `${'$'}{row.x}` (dotted paths too) against an item, values as they are: unresolved → "". */
    fun rowText(template: String?, row: JsonNode?): String? {
        if (template == null) return null
        return Regex("""\$\{\s*row\.([A-Za-z0-9_$.]+)\s*}""").replace(template) { m ->
            val v = valueAt(row, m.groupValues[1])
            when {
                v == null -> ""
                v.isValueNode -> v.asText()
                else -> v.toString()
            }
        }
    }

    /** The items of a source's answer: at its itemsPath, or the answer itself when it is a list. */
    fun itemsOf(json: JsonNode?, itemsPath: String?): List<JsonNode> {
        val items = if (itemsPath.isNullOrBlank()) json else valueAt(json, itemsPath)
        return if (items != null && items.isArray) items.filter { it.isObject } else emptyList()
    }

    private fun JsonNode.str(field: String): String = get(field)?.takeUnless { it.isNull }?.asText().orEmpty()

    /** The declared columns as the wire carries them (cards included). */
    fun declaredColumns(metadata: JsonNode): List<Column> =
        metadata.path("columns").map { col ->
            Column(col.str("id"), col.str("title"), col.str("color"), col.path("cards").map { c ->
                Card(c.str("id"), c.str("title"), c.str("description"), c.str("badge"), c.str("color"), c.str("actionId"))
            })
        }

    /** The declared columns filled with one card per item (its `columnField`, default `status`). */
    fun cardsFromRows(metadata: JsonNode, rows: List<JsonNode>): List<Column> {
        val field = metadata.str("columnField").ifBlank { "status" }
        val tpl = metadata.path("card")
        val colors = metadata.path("cardColors")
        fun t(name: String, row: JsonNode): String? = tpl.get(name)?.takeUnless { it.isNull }?.let { rowText(it.asText(), row) }
        return metadata.path("columns").map { col ->
            val id = col.str("id")
            Column(id, col.str("title"), col.str("color"), rows.filter { valueAt(it, field)?.asText() == id }.map { row ->
                val color = t("color", row).orEmpty()
                Card(
                    id = t("id", row)?.ifBlank { null } ?: row.str("id"),
                    title = t("title", row) ?: row.str("title").ifBlank { row.str("name") },
                    description = t("description", row).orEmpty(),
                    badge = t("badge", row).orEmpty(),
                    color = colors.get(color)?.asText() ?: color,
                    actionId = t("actionId", row).orEmpty(),
                    row = row,
                )
            })
        }
    }

    /** The columns after a move (the index is the position AFTER the card left its place, clamped). */
    fun moveCard(columns: List<Column>, move: Move): List<Column> {
        val from = columns.firstOrNull { it.id == move.fromColumnId } ?: return columns
        val to = columns.firstOrNull { it.id == move.toColumnId } ?: return columns
        val card = from.cards.firstOrNull { it.id == move.cardId } ?: return columns
        return columns.map { c ->
            var cards = if (c === from) c.cards.filter { it !== card } else c.cards
            if (c === to) {
                val at = move.toIndex.coerceIn(0, cards.size)
                cards = cards.take(at) + card + cards.drop(at)
            }
            if (c === from || c === to) c.copy(cards = cards) else c
        }
    }

    /** The moves a card's popup offers: up/down in its column, then to the end of each other column. */
    fun movesOf(columns: List<Column>, cardId: String, columnId: String): List<Pair<String, Move>> {
        val column = columns.firstOrNull { it.id == columnId } ?: return emptyList()
        val index = column.cards.indexOfFirst { it.id == cardId }
        if (index < 0) return emptyList()
        val out = mutableListOf<Pair<String, Move>>()
        if (index > 0) out += "Move up" to Move(cardId, columnId, columnId, index - 1)
        if (index < column.cards.size - 1) out += "Move down" to Move(cardId, columnId, columnId, index + 1)
        for (other in columns) {
            if (other.id == columnId || other.id.isBlank()) continue
            out += "Move to ${other.title.ifBlank { other.id }}" to Move(cardId, columnId, other.id, other.cards.size)
        }
        return out
    }

    /** What the move action receives: the card's item with `_cardId/_fromColumnId/_toColumnId/_toIndex`. */
    @Suppress("UNCHECKED_CAST")
    fun moveParameters(mapper: com.fasterxml.jackson.databind.ObjectMapper, card: Card?, move: Move): Map<String, Any?> {
        val row = card?.row?.let { mapper.convertValue(it, Map::class.java) as Map<String, Any?> } ?: emptyMap()
        return row + mapOf(
            "_cardId" to move.cardId,
            "_fromColumnId" to move.fromColumnId,
            "_toColumnId" to move.toColumnId,
            "_toIndex" to move.toIndex,
        )
    }

    /** Where a live card goes when clicked (`tasks/${'$'}{row.id}`), or null. */
    fun cardRouteOf(template: String?, card: Card): String? {
        if (template.isNullOrBlank() || card.row == null) return null
        return rowText(template, card.row)?.takeIf { it.isNotBlank() && !it.contains("\${") }
    }
}
