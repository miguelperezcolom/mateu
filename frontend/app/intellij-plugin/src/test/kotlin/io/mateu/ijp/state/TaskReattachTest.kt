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

    // ── surviving an IDE restart ──

    private class MemoryStore(var kept: List<StoredTask> = emptyList()) : TaskLedgerStore {
        override fun load() = kept
        override fun save(tasks: List<StoredTask>) {
            kept = tasks
        }
    }

    private fun stored(id: String, base: String = "http://app", at: Long) =
        StoredTask(TaskOriginEntry(id, base, "/imports", "app.Imports"), at)

    override fun tearDown() {
        TaskLedgers.clear()
        super.tearDown()
    }

    fun testWhatARunRememberedIsThereForTheNextOne() {
        TaskLedgers.clear()
        TaskLedgers.now = { 1_000L }
        val store = MemoryStore()
        TaskLedgers.attach(store)
        TaskLedgers.of("http://app").observe(task("t1", "running"), origin("t1"))
        assertEquals(listOf(stored("t1", at = 1_000L)), store.kept)

        // the IDE is opened again: nothing in memory, the same store
        TaskLedgers.clear()
        TaskLedgers.now = { 2_000L }
        TaskLedgers.attach(store)
        val back = TaskLedgers.of("http://app").get("t1")!!
        assertEquals("/imports", back.route)
        assertEquals("app.Imports", back.serverSideType)
    }

    fun testARestoredTaskIsAskedAboutAndForgottenWhenTheServerHasNoIdea() {
        TaskLedgers.clear()
        val now = System.currentTimeMillis()
        val store = MemoryStore(listOf(stored("t1", at = now)))
        TaskLedgers.attach(store)
        val ledger = TaskLedgers.of("http://app")
        assertEquals(listOf("t1"), TaskReattach.lost(ledger) { false }.map { it.taskId })
        ledger.forget(listOf("t1"))
        assertEquals(emptyList<StoredTask>(), store.kept)
    }

    fun testAFinishedTaskLeavesTheDisk() {
        TaskLedgers.clear()
        val store = MemoryStore()
        TaskLedgers.attach(store)
        val ledger = TaskLedgers.of("http://app")
        ledger.observe(task("t1", "running"), origin("t1"))
        ledger.observe(task("t1", "done"), origin("t1"))
        assertEquals(emptyList<StoredTask>(), store.kept)
    }

    fun testEachBackendKeepsItsOwnTasks() {
        TaskLedgers.clear()
        val now = System.currentTimeMillis()
        TaskLedgers.attach(MemoryStore(listOf(stored("a1", "http://a/", now), stored("b1", "http://b", now))))
        assertEquals(listOf("a1"), TaskLedgers.of("http://a").all().map { it.taskId })
        assertEquals(listOf("b1"), TaskLedgers.of("http://b/").all().map { it.taskId })
    }

    fun testAnOldEntryIsNotBroughtBackAndLeavesTheDisk() {
        TaskLedgers.clear()
        val now = 10L * TaskLedgers.TTL_MILLIS
        TaskLedgers.now = { now }
        val store = MemoryStore(
            listOf(stored("old", at = now - TaskLedgers.TTL_MILLIS - 1), stored("fresh", at = now - TaskLedgers.TTL_MILLIS)),
        )
        TaskLedgers.attach(store)
        assertEquals(listOf("fresh"), TaskLedgers.of("http://app").all().map { it.taskId })
        assertEquals(listOf("fresh"), store.kept.map { it.origin.taskId })
    }

    fun testAttachingTheSameStoreAgainDoesNotDisturbARunningLedger() {
        TaskLedgers.clear()
        val store = MemoryStore()
        TaskLedgers.attach(store)
        val ledger = TaskLedgers.of("http://app")
        ledger.observe(task("t1", "running"), origin("t1"))
        store.kept = emptyList() // a second project opening must not re-read the store
        TaskLedgers.attach(store)
        assertEquals(listOf("t1"), ledger.all().map { it.taskId })
    }

    fun testARestoredLedgerStillKeepsAtMostWhatTheServerLooksAt() {
        val ledger = TaskLedger(max = 2, now = { 5L })
        ledger.restore((1..4).map { stored("t$it", at = it.toLong()) })
        assertEquals(listOf("t3", "t4"), ledger.all().map { it.taskId })
        assertEquals(listOf(3L, 4L), ledger.stored().map { it.rememberedAt })
    }

    fun testWhatThisRunKnowsWinsOverTheDisk() {
        val ledger = TaskLedger(now = { 5L })
        ledger.observe(task("t1", "running"), origin("t1"))
        ledger.restore(listOf(StoredTask(TaskOriginEntry("t1", "http://app", "/stale", null), 1L)))
        assertEquals("/imports", ledger.get("t1")!!.route)
        assertEquals(5L, ledger.stored().single().rememberedAt)
    }

    fun testAReattachedTaskCoversNoView() {
        val block = ViewBlock()
        assertFalse(block.observe(TaskReattach.reattached(task("t1", "running", ""","blocking":true"""))))
        assertFalse(block.isBlocked)
    }
}
