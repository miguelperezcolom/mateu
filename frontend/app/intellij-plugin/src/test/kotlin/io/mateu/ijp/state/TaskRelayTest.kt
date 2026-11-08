package io.mateu.ijp.state

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Every Progress command goes through the relay: one platform task per id, then its result. */
class TaskRelayTest : TestCase() {

    private val json = ObjectMapper()

    private class Host : TaskHost {
        val started = mutableListOf<Pair<ProgressTask, TaskChannel>>()
        val finished = mutableListOf<Pair<ProgressTask, Boolean>>()
        override fun start(first: ProgressTask, channel: TaskChannel, cancel: () -> Unit) {
            started.add(first to channel)
        }
        override fun finished(task: ProgressTask, runAction: (NoticeAction) -> Unit, retry: (() -> Unit)?) {
            finished.add(task to (retry != null))
        }
    }

    private fun task(state: String, extra: String = "") =
        ProgressTasks.of(json.readTree("""{"taskId":"t1","title":"Import","state":"$state" $extra}"""))!!

    private fun relay(): Pair<TaskRelay, Host> {
        val host = Host()
        return TaskRelay().also { it.host = host } to host
    }

    private fun TaskRelay.report(t: ProgressTask, increment: String? = null) =
        report(t, increment?.let { json.readTree(it) }, cancel = {}, runAction = {}, retry = {})

    fun testATaskStartsOnePlatformTaskThatFollowsItsUpdates() {
        val (relay, host) = relay()
        relay.report(task("running"))
        relay.report(task("running", ""","text":"Row 2""""))
        assertEquals(1, host.started.size)
        val channel = host.started.single().second
        assertEquals("t1", channel.next(10)!!.taskId)
        assertEquals("Row 2", channel.next(10)!!.text)
    }

    fun testTheEndClosesTheChannelAndShowsTheResult() {
        val (relay, host) = relay()
        relay.report(task("running"))
        relay.report(task("done"))
        val channel = host.started.single().second
        channel.next(10)
        assertEquals(TaskState.DONE, channel.next(10)!!.state)
        assertTrue(channel.drained)
        assertEquals(listOf(TaskState.DONE to false), host.finished.map { it.first.state to it.second })
    }

    fun testRetryIsOfferedOnlyWhenAFailedTaskMayRunAgain() {
        val (relay, host) = relay()
        relay.report(task("failed", ""","retryable":true"""))
        val (relay2, host2) = relay()
        relay2.report(task("failed"))
        assertEquals(true, host.finished.single().second)
        assertEquals(false, host2.finished.single().second)
    }

    fun testNoSecondNoticeWhenTheTaskPostedItsInboxMessage() {
        val (relay, host) = relay()
        relay.report(task("running"))
        relay.report(task("done"), """{"messages":[{"key":"task-t1","persistence":"inbox"}]}""")
        assertTrue(host.finished.isEmpty())
    }

    fun testAStreamThatEndsStopsItsTasksFollowing() {
        val (relay, host) = relay()
        relay.report(task("running"))
        relay.streamEnded(listOf("t1"))
        val channel = host.started.single().second
        channel.next(10)
        assertTrue(channel.drained)
    }
}
