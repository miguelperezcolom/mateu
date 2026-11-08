package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** When an event leaves the IDE for the OS, and what it says there. */
class OsNoticesTest : TestCase() {

    private val json = ObjectMapper()

    private fun task(state: String, extra: String = "") =
        ProgressTasks.of(json.readTree("""{"taskId":"t1","title":"Import","text":"3 errors","state":"$state" $extra}"""))!!

    private fun item(unread: Boolean = true, resolved: Boolean = false) =
        InboxItem("e1", "Approve", "Expense 12", null, unread, null, "Expenses", null, resolved, emptyList(), false)

    private fun message(persistence: Persistence, text: String = "Import finished") =
        MessageSpec("Imports", text, "success", persistence, emptyList(), "k1")

    private fun notifies(event: OsNotices.Event, enabled: Boolean = true, active: Boolean = false) =
        OsNotices.shouldNotify(enabled, active, event)

    fun testOnlyAnAppThatOptsInAndOnlyWhileTheIdeIsNotInFront() {
        val event = OsNotices.Event.TaskFinished(task("done"))
        assertTrue(notifies(event))
        assertFalse(notifies(event, enabled = false))
        assertFalse(notifies(event, active = true))
    }

    fun testANewUnreadEntryPushedLiveButNeverTheFetchedList() {
        assertTrue(notifies(OsNotices.Event.InboxEntry(item(), live = true)))
        assertFalse(notifies(OsNotices.Event.InboxEntry(item(), live = false)))
        assertFalse(notifies(OsNotices.Event.InboxEntry(item(unread = false), live = true)))
        assertFalse(notifies(OsNotices.Event.InboxEntry(item(resolved = true), live = true)))
    }

    fun testAnInboxMessageButNotAToastOrASticky() {
        assertTrue(notifies(OsNotices.Event.InboxMessage(message(Persistence.INBOX))))
        assertFalse(notifies(OsNotices.Event.InboxMessage(message(Persistence.TOAST))))
        assertFalse(notifies(OsNotices.Event.InboxMessage(message(Persistence.STICKY))))
        assertFalse(notifies(OsNotices.Event.InboxMessage(message(Persistence.INBOX, text = " "))))
    }

    fun testABackgroundTaskThatEndedDoneOrFailed() {
        assertTrue(notifies(OsNotices.Event.TaskFinished(task("done"))))
        assertTrue(notifies(OsNotices.Event.TaskFinished(task("failed"))))
        assertTrue(notifies(OsNotices.Event.TaskFinished(task("done", ""","blocking":true,"backgroundable":true"""))))
        // the user cancelled it, or watched it in a modal: nothing to tell
        assertFalse(notifies(OsNotices.Event.TaskFinished(task("cancelled"))))
        assertFalse(notifies(OsNotices.Event.TaskFinished(task("done", ""","blocking":true"""))))
        assertFalse(notifies(OsNotices.Event.TaskFinished(task("running"))))
    }

    fun testTheTextIsPlainNeverMarkup() {
        val beacon = "<html><img src=http://127.0.0.1:1/x>Done &amp; dusted</html>"
        val notice = OsNotices.noticeOf(OsNotices.Event.InboxMessage(MessageSpec(beacon, "<b>3</b> rows", "info", Persistence.INBOX, emptyList(), null)))
        assertEquals("Done & dusted", notice.title)
        assertEquals("3 rows", notice.text)
        assertFalse(notice.title.contains("<"))
        assertEquals("Expenses · Approve", OsNotices.noticeOf(OsNotices.Event.InboxEntry(item(), true)).title)
        assertEquals("Mateu", OsNotices.noticeOf(OsNotices.Event.TaskFinished(task("done").copy(title = ""))).title)
    }

    fun testAnInboxMessageAndTheStoredEntryItBecomesPopTheOsOnce() {
        val posted = OsNotices.Posted()
        val messageKey = OsNotices.keyOf(OsNotices.Event.InboxMessage(message(Persistence.INBOX)))
        val entryKey = OsNotices.keyOf(OsNotices.Event.InboxEntry(item().copy(id = "k1"), true))
        assertEquals(messageKey, entryKey)
        assertTrue(posted.first(messageKey))
        assertFalse(posted.first(entryKey))
        assertTrue(posted.first(null))
        assertTrue(posted.first(null))
    }
}
