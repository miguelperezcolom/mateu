package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The inbox: the server's list, live changes on top, and what the IDE must show or withdraw. */
class InboxModelTest : TestCase() {

    private val json = ObjectMapper()

    private fun item(id: String, unread: Boolean = true, extra: String = "") =
        InboxItem.of(json.readTree("""{"id":"$id","title":"T $id","unread":$unread $extra}"""))!!

    fun testAnEntryIsReadWithItsActionsAndDetail() {
        val i = item("n1", extra = ""","category":"Approvals","variant":"warning","hasDetail":true,
            "actions":[{"label":"Approve","actionId":"approve","style":"primary"}]""")
        assertEquals("Approvals", i.category)
        assertTrue(i.hasDetail)
        assertEquals("approve", i.actions.single().actionId)
        assertTrue(i.pending)
        assertFalse(item("n2", extra = ""","resolved":true""").pending)
    }

    fun testTheFirstListShowsOnlyThePendingEntries() {
        val model = InboxModel()
        val diff = model.replaceServerList(listOf(item("a"), item("b", unread = false)))
        assertEquals(listOf("a"), diff.shown.map { it.id })
        assertEquals(1, model.unreadCount())
    }

    fun testAnEntryReadResolvedOrGoneIsWithdrawn() {
        val model = InboxModel()
        model.replaceServerList(listOf(item("a"), item("b"), item("c")))
        val diff = model.replaceServerList(listOf(item("a", unread = false), item("b", extra = ""","resolved":true""")))
        assertEquals(emptyList<InboxItem>(), diff.shown)
        assertEquals(setOf("a", "b", "c"), diff.withdrawn.toSet())
        assertEquals(0, model.unreadCount())
    }

    fun testAnUnchangedListChangesNothing() {
        val model = InboxModel()
        model.replaceServerList(listOf(item("a")))
        assertTrue(model.replaceServerList(listOf(item("a"))).isEmpty)
    }

    fun testALivePushIsShownAndSurvivesAListThatHasNotCaughtUp() {
        val model = InboxModel()
        model.replaceServerList(listOf(item("a")))
        val pushed = model.apply(InboxChange.Upsert(item("b")))
        assertEquals(listOf("b"), pushed.shown.map { it.id })
        model.replaceServerList(listOf(item("a")))
        assertNotNull(model.get("b"))
        assertEquals(2, model.unreadCount())
        assertEquals(listOf("b"), model.apply(InboxChange.Remove("b")).withdrawn)
        assertNull(model.get("b"))
    }

    fun testTheSameIdReplacesTheEntry() {
        val model = InboxModel()
        model.apply(InboxChange.Upsert(item("a")))
        val diff = model.apply(InboxChange.Upsert(item("a", extra = ""","text":"updated"""")))
        assertEquals("updated", diff.shown.single().text)
        assertEquals(1, model.items().size)
    }

    fun testChangesAndListsAreReadOffTheWire() {
        val increment = json.readTree(
            """{"commands":[{"type":"NotificationsChanged","data":{"notification":{"id":"x","title":"New","unread":true}}},
                {"type":"NotificationsChanged","data":{"removedId":"y"}},
                {"type":"NotificationsChanged","data":{}}],
              "fragments":[{"data":{"_notifications":[{"id":"z","title":"Z","unread":true}]}}]}""",
        )
        val changes = InboxItems.changesOf(increment)
        assertEquals("x", (changes[0] as InboxChange.Upsert).item.id)
        assertEquals(InboxChange.Remove("y"), changes[1])
        assertEquals(InboxChange.Refetch, changes[2])
        assertEquals(listOf("z"), InboxItems.listOf(increment)!!.map { it.id })
        assertNull(InboxItems.listOf(json.readTree("""{"fragments":[]}""")))
    }

    fun testAnActionsAnswerIsAppliedWithoutTheListFragment() {
        val answer = json.readTree(
            """{"messages":[{"text":"Approved"}],"fragments":[{"data":{"_notifications":[]}},{"component":{"type":"x"}}]}""",
        )
        val applied = InboxSync.withoutInboxList(answer)
        assertEquals(1, applied.path("fragments").size())
        assertEquals("Approved", applied.path("messages")[0].path("text").asText())
    }
}
