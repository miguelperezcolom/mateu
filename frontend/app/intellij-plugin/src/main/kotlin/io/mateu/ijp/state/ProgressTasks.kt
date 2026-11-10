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
    fun cancel(locale: Locale) = if (es(locale)) "Cancelar" else "Cancel"
    fun moveToBackground(locale: Locale) = if (es(locale)) "Pasar a segundo plano" else "Move to background"
    fun filterAll(locale: Locale) = if (es(locale)) "Todas" else "All"
    fun filterUnread(locale: Locale) = if (es(locale)) "Sin leer" else "Unread"
    fun filterResolved(locale: Locale) = if (es(locale)) "Resueltas" else "Resolved"
    fun filters(locale: Locale) = if (es(locale)) "Mostrar" else "Show"
    fun notifications(locale: Locale) = if (es(locale)) "Notificaciones" else "Notifications"
    fun noNotifications(locale: Locale) = if (es(locale)) "Sin notificaciones" else "No notifications"
    fun markAllRead(locale: Locale) = if (es(locale)) "Marcar todo como leído" else "Mark all read"
    fun resolved(locale: Locale) = if (es(locale)) "Resuelta" else "Resolved"
    fun openNotificationsWindow(locale: Locale) =
        if (es(locale)) "Abrir la ventana Notifications" else "Open the Notifications tool window"
    fun failed(locale: Locale) = if (es(locale)) "Ha fallado" else "Failed"
    fun count(done: Int, total: Int, locale: Locale) = if (es(locale)) "$done de $total" else "$done of $total"

    /**
     * A running task's ETA (`ProgressDto.etaSeconds`, estimated by the server), worded as
     * conformance/client/eta-format.json says; null when there is none (never a guess).
     */
    fun eta(etaSeconds: Int?, locale: Locale): String? {
        if (etaSeconds == null || etaSeconds <= 0) return null
        if (etaSeconds < 60) return if (es(locale)) "menos de un minuto" else "less than a minute left"
        // round half up, like Math.round; a rounded 60 minutes reads as hours
        val minutes = maxOf(1, Math.round(etaSeconds / 60.0).toInt())
        if (etaSeconds < 3600 && minutes < 60) {
            return if (es(locale)) "unos $minutes min restantes" else "about $minutes min left"
        }
        val hours = maxOf(1, Math.round(etaSeconds / 3600.0).toInt())
        return if (es(locale)) "unas $hours h restantes" else "about $hours h left"
    }
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

/**
 * What a task does to the screen that started it. EVERY task runs in the IDE's Background Tasks
 * (status bar + Background Tasks window) and never in a modal window, so the IDE stays usable; a
 * blocking one also covers the Mateu view that started it — that view only — until it ends
 * ([ViewBlock]), the desktop's equivalent of the web's blocking overlay.
 */
enum class TaskPresentation {
    /** Covers the view that started it until it ends. */
    BLOCKS_VIEW,

    /** Covers that view until the user moves it to the background (it keeps running there). */
    BLOCKS_VIEW_MOVABLE,

    /** Only in Background Tasks. */
    BACKGROUND;

    val blocksView: Boolean get() = this != BACKGROUND
    val movable: Boolean get() = this == BLOCKS_VIEW_MOVABLE
}

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
    /** The server's estimate of the time left (running, determinate tasks only); null = none. */
    val etaSeconds: Int? = null,
) {
    val indeterminate: Boolean get() = fraction == null

    val presentation: TaskPresentation
        get() = when {
            !blocking -> TaskPresentation.BACKGROUND
            backgroundable -> TaskPresentation.BLOCKS_VIEW_MOVABLE
            else -> TaskPresentation.BLOCKS_VIEW
        }
}

/** Reads `Progress` commands and turns a task into what the platform's indicator shows. */
object ProgressTasks {
    const val COMMAND = "Progress"

    /** The reserved action that cancels a task the caller owns (parameters `{taskId}`). */
    const val CANCEL_ACTION = "_progress-cancel"

    /** The reserved action that answers the caller's own tasks among `{taskIds}` (reattach). */
    const val TASKS_ACTION = "_progress-tasks"

    /** The reserved SSE action that streams one of the caller's tasks again (`{taskId}`). */
    const val RESUME_ACTION = "_progress-resume"

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
            etaSeconds = intOrNull("etaSeconds"),
        )
    }

    /** The tasks an increment reports, in order. */
    fun commandsOf(increment: JsonNode?): List<ProgressTask> {
        val commands = increment?.path("commands") ?: return emptyList()
        if (!commands.isArray) return emptyList()
        return commands.filter { it.text("type") == COMMAND }.mapNotNull { of(it.path("data")) }
    }

    /**
     * The indicator's main line: what the task is. Shown by Swing labels (status bar, Background
     * Tasks window, the view's overlay), so data is never live HTML ([io.mateu.ijp.ui.plain]).
     */
    fun indicatorText(task: ProgressTask): String = io.mateu.ijp.ui.plain(task.title.ifBlank { task.text })

    /** The indicator's second line: the count ("12 of 300"), what it is doing now and the ETA. */
    fun indicatorText2(task: ProgressTask, locale: Locale = Locale.getDefault()): String {
        val count = if (task.done != null && task.total != null && task.total > 0) {
            NoticeTexts.count(task.done, task.total, locale)
        } else {
            null
        }
        val now = task.text.takeIf { it.isNotBlank() && it != task.title }
        val eta = if (task.state == TaskState.RUNNING) NoticeTexts.eta(task.etaSeconds, locale) else null
        return io.mateu.ijp.ui.plain(listOfNotNull(count, now, eta).joinToString(" · "))
    }

    fun tasksParameters(taskIds: Collection<String>): Map<String, Any?> = mapOf("taskIds" to taskIds.toList())

    fun resumeParameters(taskId: String): Map<String, Any?> = mapOf("taskId" to taskId)

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
