package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import java.io.File
import junit.framework.TestCase

/**
 * The Kanban `orderField` corpus (conformance/client/kanban-order.json) — the same file the web,
 * Redwood and React Native suites run: how a live board sorts a column and the order value a moved
 * card takes.
 */
class KanbanOrderConformanceTest : TestCase() {

    private val mapper = ObjectMapper()

    private fun corpus(): JsonNode {
        var dir: File? = File("").absoluteFile
        while (dir != null) {
            val f = File(dir, "conformance/client/kanban-order.json")
            if (f.isFile) return mapper.readTree(f)
            dir = dir.parentFile
        }
        error("conformance/client/kanban-order.json not found above ${File("").absolutePath}")
    }

    private fun boardOf(corpus: JsonNode, orderField: String?): JsonNode {
        val board = mapper.createObjectNode()
        val columns = board.putArray("columns")
        corpus.path("columns").forEach { columns.addObject().put("id", it.asText()).put("title", it.asText()) }
        if (orderField != null) board.put("orderField", orderField)
        return board
    }

    private fun ObjectNode.orNull(field: String) = get(field)?.takeUnless { it.isNull }?.asText()

    fun testTheSortCases() {
        val corpus = corpus()
        val failures = ArrayList<String>()
        for (c in corpus.path("sort")) {
            val columns = KanbanModel.cardsFromRows(boardOf(corpus, (c as ObjectNode).orNull("orderField")), c.path("rows").toList())
            val actual = columns.associate { col -> col.id to col.cards.map { it.id } }
            val expected = c.path("expected").fields().asSequence().associate { (k, v) -> k to v.map { it.asText() } }
            if (actual != expected) failures += "${c.path("name").asText()}: expected $expected, got $actual"
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }

    fun testTheMoveCases() {
        val corpus = corpus()
        val failures = ArrayList<String>()
        for (c in corpus.path("move")) {
            val orderField = c.path("orderField").asText()
            val rows = (if (c.has("rows")) c.path("rows") else corpus.path("rows")).toList()
            val columns = KanbanModel.cardsFromRows(boardOf(corpus, orderField), rows)
            val m = c.path("move")
            val move = KanbanModel.Move(m.path("cardId").asText(), m.path("fromColumnId").asText(), m.path("toColumnId").asText(), m.path("toIndex").asInt())
            val card = columns.first { it.id == move.fromColumnId }.cards.first { it.id == move.cardId }
            val parameters = KanbanModel.moveParameters(mapper, card, move, orderField, KanbanModel.moveCard(columns, move))
            val expected = c.path("expectedOrder").asDouble()
            val toOrder = (parameters["_toOrder"] as Number).toDouble()
            val own = (parameters[orderField] as Number).toDouble()
            if (toOrder != expected || own != expected) failures += "${c.path("name").asText()}: expected $expected, got $toOrder / $own"
        }
        assertTrue(failures.joinToString("\n"), failures.isEmpty())
    }

    fun testAWholeOrderIsSentAsAnIntegerSoABodyReadsFourNotFourPointZero() {
        val corpus = corpus()
        val columns = KanbanModel.cardsFromRows(boardOf(corpus, "rank"), corpus.path("rows").toList())
        val move = KanbanModel.Move("a", "todo", "todo", 2)
        val parameters = KanbanModel.moveParameters(mapper, columns[0].cards.first { it.id == "a" }, move, "rank", KanbanModel.moveCard(columns, move))
        assertEquals(4L, parameters["_toOrder"])
    }

    fun testWithoutAnOrderFieldNoOrderIsSent() {
        val corpus = corpus()
        val columns = KanbanModel.cardsFromRows(boardOf(corpus, null), corpus.path("rows").toList())
        val move = KanbanModel.Move("a", "todo", "doing", 0)
        val parameters = KanbanModel.moveParameters(mapper, columns[0].cards.first { it.id == "a" }, move, null, KanbanModel.moveCard(columns, move))
        assertFalse(parameters.containsKey("_toOrder"))
    }
}
