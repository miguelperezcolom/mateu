package io.mateu.ijp.state

import java.util.concurrent.ConcurrentHashMap

/**
 * Reattach (design/progress-and-notifications.md, "Reattach"): a task keeps running on the server
 * for a grace period after its stream goes away, so the plugin remembers, for the IDE session, the
 * tasks its streams reported — where each came from (base url, route, server-side type) — and
 * picks them up again when a view/app reloads or a stream breaks under a running task: it asks
 * `_progress-tasks {taskIds}` and opens a `_progress-resume {taskId}` stream for each one still
 * running. Ids the server does not answer (finished long ago, unknown, not the caller's) are
 * forgotten.
 */
data class TaskOriginEntry(
    val taskId: String,
    val baseUrl: String,
    val route: String?,
    val serverSideType: String?,
)

/** The tasks of one app (base url) the session's streams reported and have not seen finish. */
class TaskLedger(private val max: Int = 50) {
    private val entries = LinkedHashMap<String, TaskOriginEntry>()

    /** A task update from a stream: a running one is remembered, a finished one forgotten. */
    @Synchronized
    fun observe(task: ProgressTask, origin: TaskOriginEntry) {
        if (task.state.terminal) {
            entries.remove(task.taskId)
            return
        }
        if (task.taskId !in entries) {
            entries[task.taskId] = origin.copy(taskId = task.taskId)
            // the server looks at 50 ids at most: the oldest go first
            while (entries.size > max) entries.remove(entries.keys.first())
        }
    }

    @Synchronized fun forget(taskIds: Collection<String>) = taskIds.forEach { entries.remove(it) }

    @Synchronized fun get(taskId: String): TaskOriginEntry? = entries[taskId]

    @Synchronized fun all(): List<TaskOriginEntry> = entries.values.toList()

    @Synchronized fun isEmpty(): Boolean = entries.isEmpty()
}

/** One ledger per app for the whole IDE session: a new [AppSession] of the same app finds its tasks. */
object TaskLedgers {
    private val ledgers = ConcurrentHashMap<String, TaskLedger>()

    fun of(baseUrl: String): TaskLedger = ledgers.computeIfAbsent(baseUrl.trimEnd('/')) { TaskLedger() }

    /** test hook */
    fun clear() = ledgers.clear()
}

/** What to do with the server's answer to `_progress-tasks`. */
data class ReattachPlan(
    /** the tasks to show again (their current or terminal state) */
    val report: List<ProgressTask>,
    /** the running ones: a `_progress-resume` stream each */
    val resume: List<TaskOriginEntry>,
    /** ids the server did not answer, or that finished: nothing more will come for them */
    val forget: List<String>,
)

object TaskReattach {

    /** The remembered tasks no stream feeds any more (the ones worth asking the server about). */
    fun lost(ledger: TaskLedger, following: (String) -> Boolean): List<TaskOriginEntry> =
        ledger.all().filterNot { following(it.taskId) }

    /**
     * Pure: [asked] were sent in `_progress-tasks`, [answered] is what came back. A reattached task
     * is shown in the background (its blocking surface belonged to the screen that is gone).
     */
    fun plan(asked: List<TaskOriginEntry>, answered: List<ProgressTask>): ReattachPlan {
        val askedIds = asked.associateBy { it.taskId }
        val own = answered.filter { it.taskId in askedIds }
        val running = own.filter { !it.state.terminal }.map { it.taskId }.toSet()
        return ReattachPlan(
            report = own.map { reattached(it) },
            resume = asked.filter { it.taskId in running },
            forget = asked.map { it.taskId }.filterNot { it in running },
        )
    }

    /**
     * A task shown again after a reload: in the background, and its actions limited to the ones
     * that do not need the screen that started it (a `route`); Retry needs that screen too.
     */
    fun reattached(task: ProgressTask): ProgressTask = task.copy(
        blocking = false,
        backgroundable = false,
        retryable = false,
        resultActions = task.resultActions.filter { it.route != null },
    )

    /** The `Progress` updates of a resume stream, the same way (it is a reattached task too). */
    fun resumed(tasks: List<ProgressTask>): List<ProgressTask> = tasks.map { reattached(it) }
}
