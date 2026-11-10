package io.mateu.ijp.state

import java.util.concurrent.ConcurrentHashMap

/**
 * Reattach (design/progress-and-notifications.md, "Reattach"): a task keeps running on the server
 * for a grace period after its stream goes away, so the plugin remembers the tasks its streams
 * reported — where each came from (base url, route, server-side type) — and picks them up again
 * when a view/app reloads, a stream breaks under a running task, or the IDE is opened again (the
 * ledger is persisted, see [TaskLedgerStore]): it asks `_progress-tasks {taskIds}` and opens a
 * `_progress-resume {taskId}` stream for each one still running. Ids the server does not answer
 * (finished long ago, unknown, not the caller's) are forgotten.
 */
data class TaskOriginEntry(
    val taskId: String,
    val baseUrl: String,
    val route: String?,
    val serverSideType: String?,
)

/** A remembered task as it is kept on disk: where it came from, since when, and whose session it was. */
data class StoredTask(val origin: TaskOriginEntry, val rememberedAt: Long, val scope: String)

/** Where the ledgers are kept between IDE runs (the plugin's application-level state). */
interface TaskLedgerStore {
    fun load(): List<StoredTask>
    fun save(tasks: List<StoredTask>)
}

/** The tasks of one app (base url) the session's streams reported and have not seen finish. */
class TaskLedger(
    private val max: Int = 50,
    private val now: () -> Long = System::currentTimeMillis,
    private val onChange: () -> Unit = {},
    /** Whose session these tasks belong to ([io.mateu.ijp.api.TokenProvider.sessionScope]); null = anonymous. */
    val scope: String? = null,
) {
    private val entries = LinkedHashMap<String, TaskOriginEntry>()
    private val rememberedAt = HashMap<String, Long>()

    /** A task update from a stream: a running one is remembered, a finished one forgotten. */
    fun observe(task: ProgressTask, origin: TaskOriginEntry) {
        val changed = synchronized(this) {
            when {
                task.state.terminal -> drop(task.taskId)
                task.taskId in entries -> false
                else -> {
                    remember(origin.copy(taskId = task.taskId), now())
                    true
                }
            }
        }
        // outside the lock: saving looks into every ledger
        if (changed) onChange()
    }

    private fun drop(taskId: String): Boolean {
        rememberedAt.remove(taskId)
        return entries.remove(taskId) != null
    }

    private fun remember(entry: TaskOriginEntry, at: Long) {
        entries[entry.taskId] = entry
        rememberedAt[entry.taskId] = at
        // the server looks at 50 ids at most: the oldest go first
        while (entries.size > max) drop(entries.keys.first())
    }

    fun forget(taskIds: Collection<String>) {
        val changed = synchronized(this) { taskIds.map { drop(it) }.any { it } }
        if (changed) onChange()
    }

    /** Back from disk: tasks a previous IDE run remembered (never replaces what this run knows). */
    @Synchronized
    fun restore(tasks: List<StoredTask>) {
        for (task in tasks) if (task.origin.taskId !in entries) remember(task.origin, task.rememberedAt)
    }

    /** What goes to disk. */
    @Synchronized
    fun stored(): List<StoredTask> = entries.values.map { StoredTask(it, rememberedAt[it.taskId] ?: 0L, scope.orEmpty()) }

    @Synchronized fun get(taskId: String): TaskOriginEntry? = entries[taskId]

    @Synchronized fun all(): List<TaskOriginEntry> = entries.values.toList()

    @Synchronized fun isEmpty(): Boolean = entries.isEmpty()
}

/**
 * One ledger per app for the whole IDE: a new [AppSession] of the same app finds its tasks, and with
 * a [TaskLedgerStore] attached so does the next IDE run. Each backend and identity keeps its own list
 * (at most 50 tasks each, like the web's memory), and an entry older than [TTL_MILLIS] is not brought
 * back: the server's grace period is a minute by default and a remembered id is worth one question at
 * most. An ANONYMOUS session's tasks never reach the disk: there the id is the capability to see and
 * cancel the task, and the next person on this profile must not inherit it.
 */
object TaskLedgers {
    const val TTL_MILLIS = 60L * 60L * 1000L

    private val ledgers = ConcurrentHashMap<String, TaskLedger>()

    @Volatile private var store: TaskLedgerStore? = null

    /** The clock of the ledgers (test hook). */
    @Volatile var now: () -> Long = System::currentTimeMillis

    fun of(baseUrl: String, scope: String? = null): TaskLedger = ledgers.computeIfAbsent(keyOf(baseUrl, scope)) {
        TaskLedger(now = { now() }, onChange = { persist() }, scope = scope)
    }

    /** Brings back what [store] kept (once per store; it is application-wide) and saves from now on. */
    @Synchronized
    fun attach(store: TaskLedgerStore) {
        if (this.store === store) return
        this.store = store
        val cutoff = now() - TTL_MILLIS
        store.load()
            .filter { it.origin.taskId.isNotBlank() && it.origin.baseUrl.isNotBlank() && it.scope.isNotBlank() && it.rememberedAt >= cutoff }
            .groupBy { it.origin.baseUrl to it.scope }
            .forEach { (key, tasks) -> of(key.first, key.second).restore(tasks) }
        persist() // what expired does not stay on disk
    }

    private fun persist() {
        store?.save(ledgers.values.filter { it.scope != null }.flatMap { it.stored() })
    }

    private fun keyOf(baseUrl: String, scope: String?) = baseUrl.trimEnd('/') + "|" + scope.orEmpty()

    /** test hook */
    fun clear() {
        ledgers.clear()
        store = null
        now = System::currentTimeMillis
    }
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
