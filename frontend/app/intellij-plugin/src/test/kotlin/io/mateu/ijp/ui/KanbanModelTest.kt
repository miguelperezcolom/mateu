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
}
