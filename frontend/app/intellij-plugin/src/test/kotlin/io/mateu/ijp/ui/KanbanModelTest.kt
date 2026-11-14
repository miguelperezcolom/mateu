package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Kanban moves and live boards: mirrors libs/mateu kanbanModel.test.ts, Redwood test-display and RN kanban.test. */
class KanbanModelTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private val board = json("""
        {"columns":[{"id":"backlog","title":"Backlog"},{"id":"done","title":"Done"}],
         "card":{"title":"${'$'}{row.title}","badge":"${'$'}{row.priority}","color":"${'$'}{row.priority}"},
         "cardColors":{"urgent":"#dc2626"}}
    """)
    private val items = json("""{"content":[
        {"id":1,"title":"Varnish","status":"backlog","priority":"urgent"},
        {"id":2,"title":"Inpaint","status":"backlog","priority":"high"},
        {"id":3,"title":"Mount","status":"done","priority":"low"},
        {"id":4,"title":"Lost","status":"archived"}]}""")

    fun testALiveBoardDrawsOneCardPerItemInTheColumnItsStatusNames() {
        val columns = KanbanModel.cardsFromRows(board, KanbanModel.itemsOf(items, "content"))
        assertEquals(listOf(listOf("Varnish", "Inpaint"), listOf("Mount")), columns.map { c -> c.cards.map { it.title } })
        assertEquals("#dc2626", columns[0].cards[0].color)
        assertEquals("high", columns[0].cards[1].color)
        assertEquals("1", columns[0].cards[0].id)
        assertEquals("tasks/1", KanbanModel.cardRouteOf("tasks/${'$'}{row.id}", columns[0].cards[0]))
        assertEquals("7", KanbanModel.rowText("${'$'}{row.a.b}", json("""{"a":{"b":7}}""")))
    }

    fun testTheMovePopupAndAMove() {
        val columns = KanbanModel.cardsFromRows(board, KanbanModel.itemsOf(items, "content"))
        assertEquals(listOf("Move down", "Move to Done"), KanbanModel.movesOf(columns, "1", "backlog").map { it.first })
        assertEquals(listOf("Move up", "Move to Done"), KanbanModel.movesOf(columns, "2", "backlog").map { it.first })
        val move = KanbanModel.movesOf(columns, "1", "backlog")[1].second
        assertEquals(KanbanModel.Move("1", "backlog", "done", 1), move)
        assertEquals(listOf(listOf("2"), listOf("3", "1")), KanbanModel.moveCard(columns, move).map { c -> c.cards.map { it.id } })
        assertSame(columns, KanbanModel.moveCard(columns, move.copy(cardId = "nope")))
        val params = KanbanModel.moveParameters(mapper, columns[0].cards[0], move)
        assertEquals("Varnish", params["title"])
        assertEquals("1", params["_cardId"])
        assertEquals("done", params["_toColumnId"])
        assertEquals(1, params["_toIndex"])
    }

    fun testADeclaredBoardKeepsItsCards() {
        val declared = KanbanModel.declaredColumns(json("""{"columns":[{"id":"a","title":"A","cards":[{"id":"x","title":"X","actionId":"open"}]}]}"""))
        assertEquals("open", declared[0].cards[0].actionId)
        assertNull(declared[0].cards[0].row)
    }

    fun testAClickSendsTheCardsRowWithItsOwnUnderscoreKeysButNoMoveKeys() {
        val mapper = com.fasterxml.jackson.databind.ObjectMapper()
        val card = KanbanModel.Card("7", "Varnish", row = mapper.readTree("""{"id":7,"_version":3,"title":"Varnish"}"""))
        val params = KanbanModel.clickParameters(mapper, card)
        assertEquals(3, params["_version"])
        assertEquals(mapOf("id" to "7", "title" to "Varnish"), params["_clickedCard"])
        listOf("_cardId", "_fromColumnId", "_toColumnId", "_toIndex").forEach { assertFalse(it, params.containsKey(it)) }
    }

    fun testADropLandsInTheColumnUnderThePointerAtThePlaceBetweenItsCards() {
        val spans = listOf(0 until 220, 232 until 452)
        assertEquals(0, KanbanModel.columnAt(spans, 10))
        assertEquals(1, KanbanModel.columnAt(spans, 300))
        assertEquals("the gap goes to the nearest", 1, KanbanModel.columnAt(spans, 230))
        assertEquals("past the last one", 1, KanbanModel.columnAt(spans, 900))
        assertEquals(-1, KanbanModel.columnAt(emptyList(), 5))
        assertEquals(0, KanbanModel.insertionIndex(listOf(40, 90), 10))
        assertEquals(1, KanbanModel.insertionIndex(listOf(40, 90), 60))
        assertEquals(2, KanbanModel.insertionIndex(listOf(40, 90), 200))
        assertEquals(0, KanbanModel.insertionIndex(emptyList(), 200))
    }

    fun testTheMoveADropMakes() {
        val columns = KanbanModel.cardsFromRows(board, KanbanModel.itemsOf(items, "content"))
        assertEquals(KanbanModel.Move("1", "backlog", "done", 1), KanbanModel.dropMove(columns, "1", "done", 1))
        assertEquals("clamped", KanbanModel.Move("1", "backlog", "done", 1), KanbanModel.dropMove(columns, "1", "done", 9))
        assertEquals("reorder", KanbanModel.Move("2", "backlog", "backlog", 0), KanbanModel.dropMove(columns, "2", "backlog", 0))
        assertNull("same place", KanbanModel.dropMove(columns, "1", "backlog", 0))
        assertNull("unknown column", KanbanModel.dropMove(columns, "1", "nope", 0))
        assertNull("unknown card", KanbanModel.dropMove(columns, "x", "done", 0))
    }
}
