package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Reattach bookkeeping: what the session remembers, what it asks the server, what it resumes. */
class TaskReattachTest : TestCase() {

    private val json = ObjectMapper()

    private fun task(id: String, state: String, extra: String = "") =
        ProgressTasks.of(json.readTree("""{"taskId":"$id","title":"Import","state":"$state" $extra}"""))!!

    private fun origin(id: String) = TaskOriginEntry(id, "http://app", "/imports", "app.Imports")

    fun testARunningTaskIsRememberedAndForgottenOnceItFinishes() {
        val ledger = TaskLedger()
        ledger.observe(task("t1", "running"), origin("t1"))
        ledger.observe(task("t1", "running", ""","text":"Row 2""""), origin("t1"))
        assertEquals(listOf("t1"), ledger.all().map { it.taskId })
        assertEquals("/imports", ledger.get("t1")!!.route)
        ledger.observe(task("t1", "done"), origin("t1"))
        assertTrue(ledger.isEmpty())
    }

    fun testTheLedgerKeepsAtMostWhatTheServerLooksAt() {
        val ledger = TaskLedger(max = 3)
        (1..5).forEach { ledger.observe(task("t$it", "running"), origin("t$it")) }
        assertEquals(listOf("t3", "t4", "t5"), ledger.all().map { it.taskId })
    }

    fun testOneLedgerPerAppForTheIdeSession() {
        TaskLedgers.clear()
        val a = TaskLedgers.of("http://app/")
        a.observe(task("t1", "running"), origin("t1"))
        assertSame(a, TaskLedgers.of("http://app"))
        assertTrue(TaskLedgers.of("http://other").isEmpty())
        TaskLedgers.clear()
    }

    fun testOnlyTasksNoStreamFollowsAreAskedFor() {
        val ledger = TaskLedger()
        ledger.observe(task("t1", "running"), origin("t1"))
        ledger.observe(task("t2", "running"), origin("t2"))
        assertEquals(listOf("t2"), TaskReattach.lost(ledger) { it == "t1" }.map { it.taskId })
    }

    fun testTheAnswerDecidesWhatIsShownResumedAndForgotten() {
        val asked = listOf(origin("run"), origin("done"), origin("gone"))
        val plan = TaskReattach.plan(
            asked,
            listOf(
                task("run", "running", ""","blocking":true"""),
                task("done", "done"),
                // an id nobody asked about is not taken (a server must not add tasks to the session)
                task("stranger", "running"),
            ),
        )
        assertEquals(listOf("run", "done"), plan.report.map { it.taskId })
        assertEquals(listOf("run"), plan.resume.map { it.taskId })
        // unknown / foreign / expired ids are simply absent from the answer: forgotten, like finished ones
        assertEquals(listOf("done", "gone"), plan.forget)
    }

    fun testAReattachedTaskRunsInTheBackgroundWithOnlyItsRouteActions() {
        val t = TaskReattach.reattached(
            task(
                "t1", "failed",
                ""","blocking":true,"backgroundable":true,"retryable":true,
                "resultActions":[{"label":"Open","route":"/r/1"},{"label":"Fix","actionId":"fix"}]""",
            ),
        )
        assertEquals(TaskPresentation.BACKGROUND, t.presentation)
        assertFalse(t.retryable)
        assertEquals(listOf("/r/1"), t.resultActions.map { it.route })
    }

    fun testTheRelaySaysWhichTasksAStreamLeftUnfinished() {
        val relay = TaskRelay()
        relay.report(task("a", "running"), null, {}, {}, null)
        relay.report(task("b", "running"), null, {}, {}, null)
        relay.report(task("b", "done"), null, {}, {}, null)
        assertEquals(listOf("a"), relay.unfinished(listOf("a", "b", "unknown")))
    }

    fun testTheReservedActionsAndTheirParameters() {
        assertEquals("_progress-tasks", ProgressTasks.TASKS_ACTION)
        assertEquals("_progress-resume", ProgressTasks.RESUME_ACTION)
        assertEquals(mapOf("taskIds" to listOf("a", "b")), ProgressTasks.tasksParameters(linkedSetOf("a", "b")))
        assertEquals(mapOf("taskId" to "a"), ProgressTasks.resumeParameters("a"))
    }
}
