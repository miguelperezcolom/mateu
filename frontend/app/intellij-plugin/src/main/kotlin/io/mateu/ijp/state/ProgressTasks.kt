package io.mateu.ijp.state

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import java.util.Locale
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/**
 * An action offered by a message, a finished task or an inbox entry (`MessageActionDto`): a
 * [route] navigates, otherwise [actionId] (with [parameters]) runs. [style] is a hint
 * (primary | secondary | danger | undo).
 */
data class NoticeAction(
    val label: String?,
    val actionId: String?,
    val parameters: Map<String, Any?> = emptyMap(),
    val route: String? = null,
    val style: String? = null,
) {
    /**
     * What the button says: its label, or the platform's own word for an unlabelled undo. Data on a
     * Swing link/button: never live HTML ([io.mateu.ijp.ui.plain]).
     */
    fun labelFor(locale: Locale = Locale.getDefault()): String = io.mateu.ijp.ui.plain(
        label?.takeIf { it.isNotBlank() }
            ?: if (style == "undo") NoticeTexts.undo(locale) else (actionId ?: route ?: ""),
    )

    companion object {
        private val mapper = ObjectMapper()

        @Suppress("UNCHECKED_CAST")
        fun of(node: JsonNode): NoticeAction? {
            if (!node.isObject) return null
            val actionId = node.text("actionId").ifBlank { null }
            val route = node.text("route").ifBlank { null }
            if (actionId == null && route == null) return null
            val params = node.path("parameters").takeIf { it.isObject }
                ?.let { mapper.convertValue(it, Map::class.java) as Map<String, Any?> }
                ?: emptyMap()
            return NoticeAction(node.text("label").ifBlank { null }, actionId, params, route, node.text("style").ifBlank { null })
        }

        fun listOf(node: JsonNode?): List<NoticeAction> =
            if (node == null || !node.isArray) emptyList() else node.mapNotNull { of(it) }
    }
}

/** The plugin's own words around notices and tasks (en/es, like the web's chromeTexts). */
object NoticeTexts {
    private fun es(locale: Locale) = locale.language == "es"
    fun undo(locale: Locale) = if (es(locale)) "Deshacer" else "Undo"
    fun retry(locale: Locale) = if (es(locale)) "Reintentar" else "Retry"
    fun open(locale: Locale) = if (es(locale)) "Abrir" else "Open"
    fun details(locale: Locale) = if (es(locale)) "Detalles" else "Details"
    fun dismiss(locale: Locale) = if (es(locale)) "Descartar" else "Dismiss"
    fun failed(locale: Locale) = if (es(locale)) "Ha fallado" else "Failed"
    fun count(done: Int, total: Int, locale: Locale) = if (es(locale)) "$done de $total" else "$done of $total"
}

/** Where a task is in its life (`ProgressStateDto`). */
enum class TaskState {
    RUNNING, DONE, FAILED, CANCELLED;

    val terminal: Boolean get() = this != RUNNING

    companion object {
        fun of(text: String): TaskState = when (text) {
            "done" -> DONE
            "failed" -> FAILED
            "cancelled" -> CANCELLED
            else -> RUNNING
        }
    }
}

/** How the platform should run a task: modal, modal with "Background", or in the background. */
enum class TaskPresentation { MODAL, BACKGROUNDABLE, BACKGROUND }

/**
 * The whole current state of one long-running task — the data of a `Progress` command
 * (`ProgressDto`). Each command is self-contained: the task center upserts it by [taskId].
 */
data class ProgressTask(
    val taskId: String,
    val title: String,
    val text: String,
    val fraction: Double?,
    val done: Int?,
    val total: Int?,
    val state: TaskState,
    val blocking: Boolean,
    val backgroundable: Boolean,
    val cancellable: Boolean,
    val retryable: Boolean,
    val startedAt: Long?,
    val closeAfterSeconds: Int?,
    val error: String?,
    val resultActions: List<NoticeAction>,
) {
    val indeterminate: Boolean get() = fraction == null

    val presentation: TaskPresentation
        get() = when {
            !blocking -> TaskPresentation.BACKGROUND
            backgroundable -> TaskPresentation.BACKGROUNDABLE
            else -> TaskPresentation.MODAL
        }
}

/** Reads `Progress` commands and turns a task into what the platform's indicator shows. */
object ProgressTasks {
    const val COMMAND = "Progress"

    /** The reserved action that cancels a task the caller owns (parameters `{taskId}`). */
    const val CANCEL_ACTION = "_progress-cancel"

    fun of(data: JsonNode?): ProgressTask? {
        if (data == null || !data.isObject) return null
        val id = data.text("taskId").ifBlank { return null }
        fun intOrNull(field: String) = data.path(field).takeIf { it.isNumber }?.asInt()
        return ProgressTask(
            taskId = id,
            title = data.text("title"),
            text = data.text("text"),
            fraction = data.path("fraction").takeIf { it.isNumber }?.asDouble()?.coerceIn(0.0, 1.0),
            done = intOrNull("done"),
            total = intOrNull("total"),
            state = TaskState.of(data.text("state", "running")),
            blocking = data.bool("blocking"),
            backgroundable = data.bool("backgroundable"),
            cancellable = data.bool("cancellable"),
            retryable = data.bool("retryable"),
            startedAt = data.path("startedAt").takeIf { it.isNumber }?.asLong(),
            closeAfterSeconds = intOrNull("closeAfterSeconds"),
            error = data.text("error").ifBlank { null },
            resultActions = NoticeAction.listOf(data.path("resultActions")),
        )
    }

    /** The tasks an increment reports, in order. */
    fun commandsOf(increment: JsonNode?): List<ProgressTask> {
        val commands = increment?.path("commands") ?: return emptyList()
        if (!commands.isArray) return emptyList()
        return commands.filter { it.text("type") == COMMAND }.mapNotNull { of(it.path("data")) }
    }

    /**
     * The indicator's main line: what the task is. Shown by Swing labels (status bar, progress
     * dialog title), so data is never live HTML ([io.mateu.ijp.ui.plain]).
     */
    fun indicatorText(task: ProgressTask): String = io.mateu.ijp.ui.plain(task.title.ifBlank { task.text })

    /** The indicator's second line: the count ("12 of 300") and what it is doing now. */
    fun indicatorText2(task: ProgressTask, locale: Locale = Locale.getDefault()): String {
        val count = if (task.done != null && task.total != null && task.total > 0) {
            NoticeTexts.count(task.done, task.total, locale)
        } else {
            null
        }
        val now = task.text.takeIf { it.isNotBlank() && it != task.title }
        return io.mateu.ijp.ui.plain(listOfNotNull(count, now).joinToString(" · "))
    }

    /** The result notification's text: what was done, or what went wrong. */
    fun resultText(task: ProgressTask, locale: Locale = Locale.getDefault()): String = when (task.state) {
        TaskState.FAILED -> task.error ?: task.text.ifBlank { NoticeTexts.failed(locale) }
        else -> task.text
    }

    /**
     * Whether a finished task needs a result notification of its own. A cancel was the user's own
     * doing; a task that posted its inbox message (`notifyWhenDone`, key `task-<id>`) already has
     * one, with the same actions.
     */
    fun notifiesResult(task: ProgressTask, increment: JsonNode?): Boolean {
        if (task.state == TaskState.RUNNING || task.state == TaskState.CANCELLED) return false
        val messages = increment?.path("messages")
        val announced = messages != null && messages.isArray &&
            messages.any { it.text("key") == "task-${task.taskId}" }
        return !announced
    }

    fun cancelParameters(task: ProgressTask): Map<String, Any?> = mapOf("taskId" to task.taskId)
}

/**
 * The task center's state: running and recently finished tasks, upserted by id. An update for a
 * task that already finished is ignored (a cancel echo after the stream's own `cancelled`).
 */
class TaskCenter(private val keepFinished: Int = 10) {

    enum class Change { STARTED, UPDATED, FINISHED, IGNORED }

    private val tasks = LinkedHashMap<String, ProgressTask>()

    @Synchronized
    fun upsert(task: ProgressTask): Change {
        val previous = tasks[task.taskId]
        if (previous != null && previous.state.terminal) return Change.IGNORED
        tasks.remove(task.taskId)
        tasks[task.taskId] = task
        trim()
        return when {
            task.state.terminal -> Change.FINISHED
            previous == null -> Change.STARTED
            else -> Change.UPDATED
        }
    }

    @Synchronized fun get(taskId: String): ProgressTask? = tasks[taskId]

    @Synchronized fun running(): List<ProgressTask> = tasks.values.filter { !it.state.terminal }

    @Synchronized fun finished(): List<ProgressTask> = tasks.values.filter { it.state.terminal }

    private fun trim() {
        val finished = tasks.values.filter { it.state.terminal }
        if (finished.size <= keepFinished) return
        finished.take(finished.size - keepFinished).forEach { tasks.remove(it.taskId) }
    }
}

/**
 * Hands a task's updates from the stream (the EDT) to the platform task that shows it (its own
 * thread). Closed when the stream that carries the task ends.
 */
class TaskChannel {
    private val queue = LinkedBlockingQueue<ProgressTask>()

    @Volatile var isClosed = false
        private set

    fun offer(task: ProgressTask) {
        if (!isClosed) queue.offer(task)
    }

    fun close() {
        isClosed = true
    }

    /** The next update, waiting up to [timeoutMillis]; null when none came (or it is closed and drained). */
    fun next(timeoutMillis: Long): ProgressTask? =
        if (isClosed && queue.isEmpty()) null else queue.poll(timeoutMillis, TimeUnit.MILLISECONDS)

    /** Whether nothing more will come. */
    val drained: Boolean get() = isClosed && queue.isEmpty()
}
