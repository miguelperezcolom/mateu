package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import java.util.Locale

/** A `Progress` command read as a task, and what the platform's indicator shows for it. */
class ProgressTasksTest : TestCase() {

    private val json = ObjectMapper()

    private fun task(extra: String = "") = ProgressTasks.of(
        json.readTree("""{"taskId":"t1","title":"Importing","text":"Row 12","state":"running","blocking":true $extra}"""),
    )!!

    fun testACommandIsReadAsTheWholeTask() {
        val t = task(""","fraction":0.04,"done":12,"total":300,"cancellable":true,"startedAt":5,
            "resultActions":[{"label":"Open report","route":"/r/1"}]""")
        assertEquals("t1", t.taskId)
        assertEquals(0.04, t.fraction)
        assertEquals(12, t.done)
        assertEquals(300, t.total)
        assertTrue(t.cancellable)
        assertEquals(TaskState.RUNNING, t.state)
        assertEquals(listOf(NoticeAction("Open report", null, emptyMap(), "/r/1", null)), t.resultActions)
    }

    fun testNoFractionIsIndeterminate() {
        assertTrue(task().indeterminate)
        assertFalse(task(""","fraction":0.5""").indeterminate)
    }

    fun testTheSecondLineCountsTheWorkAndSaysWhatItDoes() {
        val t = task(""","done":12,"total":300""")
        assertEquals("Importing", ProgressTasks.indicatorText(t))
        assertEquals("12 of 300 · Row 12", ProgressTasks.indicatorText2(t, Locale.ENGLISH))
        assertEquals("12 de 300 · Row 12", ProgressTasks.indicatorText2(t, Locale.forLanguageTag("es")))
        assertEquals("Row 12", ProgressTasks.indicatorText2(task(), Locale.ENGLISH))
    }

    fun testHowThePlatformRunsIt() {
        assertEquals(TaskPresentation.MODAL, task().presentation)
        assertEquals(TaskPresentation.BACKGROUNDABLE, task(""","backgroundable":true""").presentation)
        assertEquals(TaskPresentation.BACKGROUND, ProgressTasks.of(json.readTree("""{"taskId":"t","blocking":false}"""))!!.presentation)
    }

    fun testOnlyProgressCommandsOfAnIncrementAreTasks() {
        val increment = json.readTree(
            """{"commands":[{"type":"NavigateTo","data":"/x"},{"type":"Progress","data":{"taskId":"a","state":"done"}},
                {"type":"Progress","data":{"title":"no id"}}]}""",
        )
        val tasks = ProgressTasks.commandsOf(increment)
        assertEquals(listOf("a"), tasks.map { it.taskId })
        assertEquals(TaskState.DONE, tasks.single().state)
    }

    fun testAFailureSaysWhatWentWrong() {
        val failed = task(""","state":"failed","error":"Disk full"""")
        assertEquals("Disk full", ProgressTasks.resultText(failed, Locale.ENGLISH))
    }

    fun testAResultNoticeUnlessCancelledOrAlreadyPostedToTheInbox() {
        val done = task(""","state":"done"""")
        assertTrue(ProgressTasks.notifiesResult(done, json.readTree("""{"messages":[]}""")))
        assertFalse(ProgressTasks.notifiesResult(done, json.readTree("""{"messages":[{"key":"task-t1","persistence":"inbox"}]}""")))
        assertFalse(ProgressTasks.notifiesResult(task(""","state":"cancelled""""), null))
        assertFalse(ProgressTasks.notifiesResult(task(), null))
    }

    fun testTheCancelNamesTheTask() {
        assertEquals("_progress-cancel", ProgressTasks.CANCEL_ACTION)
        assertEquals(mapOf("taskId" to "t1"), ProgressTasks.cancelParameters(task()))
    }

    // ── task center ──

    fun testTheTaskCenterUpsertsByIdAndIgnoresAnythingAfterTheEnd() {
        val center = TaskCenter()
        assertEquals(TaskCenter.Change.STARTED, center.upsert(task()))
        assertEquals(TaskCenter.Change.UPDATED, center.upsert(task(""","text":"Row 13"""")))
        assertEquals("Row 13", center.get("t1")!!.text)
        assertEquals(1, center.running().size)
        assertEquals(TaskCenter.Change.FINISHED, center.upsert(task(""","state":"cancelled"""")))
        // the cancel's own answer, after the stream's cancelled
        assertEquals(TaskCenter.Change.IGNORED, center.upsert(task(""","state":"cancelled"""")))
        assertTrue(center.running().isEmpty())
        assertEquals(1, center.finished().size)
    }

    fun testSeveralTasksRunAtOnceAndOnlyTheRecentFinishedAreKept() {
        val center = TaskCenter(keepFinished = 2)
        for (i in 1..4) center.upsert(ProgressTasks.of(json.readTree("""{"taskId":"t$i","state":"running"}"""))!!)
        assertEquals(4, center.running().size)
        for (i in 1..4) center.upsert(ProgressTasks.of(json.readTree("""{"taskId":"t$i","state":"done"}"""))!!)
        assertEquals(listOf("t3", "t4"), center.finished().map { it.taskId })
    }

    // ── channel ──

    fun testTheChannelHandsUpdatesOverUntilItIsClosedAndDrained() {
        val channel = TaskChannel()
        channel.offer(task())
        assertEquals("t1", channel.next(10)!!.taskId)
        assertNull(channel.next(10))
        channel.offer(task(""","text":"later""""))
        channel.close()
        assertFalse(channel.drained)
        assertEquals("later", channel.next(10)!!.text)
        assertTrue(channel.drained)
        channel.offer(task())
        assertNull("nothing goes in once closed", channel.next(10))
    }
}
