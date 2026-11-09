package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import java.util.concurrent.ConcurrentHashMap

/**
 * Where long-running tasks are shown: the host (the plugin) runs each one as a PLATFORM task — a
 * `Task.Modal`, a `Task.Backgroundable` with the platform's "Background" button, or one in the
 * status bar — reading its updates from a [TaskChannel], and shows the result as a notification.
 */
interface TaskHost {
    /** A task started: run a platform task that follows [channel]; [cancel] asks the server to stop it. */
    fun start(first: ProgressTask, channel: TaskChannel, cancel: () -> Unit)

    /** A task finished (done / failed): its result notice, with its actions and, when it may run again, Retry. */
    fun finished(task: ProgressTask, runAction: (NoticeAction) -> Unit, retry: (() -> Unit)?)
}

/**
 * The session's task center: every `Progress` command goes through [report], which keeps the
 * [TaskCenter] and feeds the platform task of each task id. Several tasks run at once; a task keeps
 * going when the view that started it is closed (the stream belongs to the session, not the view).
 */
class TaskRelay {
    val center = TaskCenter()
    private val channels = ConcurrentHashMap<String, TaskChannel>()

    @Volatile var host: TaskHost? = null

    /**
     * One task update. [cancel] stops it on the server, [runAction] runs one of its result actions,
     * [retry] runs the action that started it again; [increment] is the answer that carried it (a
     * finished task that already posted its inbox message gets no second notice).
     */
    fun report(
        task: ProgressTask,
        increment: JsonNode?,
        cancel: () -> Unit,
        runAction: (NoticeAction) -> Unit,
        retry: (() -> Unit)?,
    ) {
        when (center.upsert(task)) {
            TaskCenter.Change.STARTED -> {
                val channel = TaskChannel()
                channels[task.taskId] = channel
                channel.offer(task)
                host?.start(task, channel, cancel)
            }
            TaskCenter.Change.UPDATED -> channels[task.taskId]?.offer(task)
            TaskCenter.Change.FINISHED -> {
                channels.remove(task.taskId)?.let { it.offer(task); it.close() }
                if (ProgressTasks.notifiesResult(task, increment)) {
                    host?.finished(task, runAction, if (task.state == TaskState.FAILED && task.retryable) retry else null)
                }
            }
            TaskCenter.Change.IGNORED -> Unit
        }
    }

    /** Whether a platform task still follows [taskId] (a stream — first or resumed — feeds it). */
    fun isFollowing(taskId: String): Boolean = channels[taskId]?.isClosed == false

    /** The ids among [taskIds] whose task has not finished (a stream ending under them lost them). */
    fun unfinished(taskIds: Collection<String>): List<String> =
        taskIds.filter { id -> center.get(id)?.state?.terminal == false }

    /** The stream that carried these tasks ended: whatever did not finish will not move any more. */
    fun streamEnded(taskIds: Collection<String>) {
        taskIds.forEach { channels.remove(it)?.close() }
    }

    /** The session ends: every platform task stops following. */
    fun closeAll() {
        channels.values.forEach { it.close() }
        channels.clear()
    }
}
