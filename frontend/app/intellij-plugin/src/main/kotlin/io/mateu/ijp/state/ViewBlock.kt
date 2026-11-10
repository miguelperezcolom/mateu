package io.mateu.ijp.state

import java.util.Locale

/** What a view's overlay shows for the task covering it. */
data class ViewBlockOverlay(
    val taskId: String,
    val title: String,
    val detail: String,
    /** 0..1, null = indeterminate */
    val fraction: Double?,
    val cancellable: Boolean,
    /** Offers "Move to background". */
    val movable: Boolean,
)

/**
 * The blocking tasks covering ONE Mateu view — the desktop's equivalent of the web's blocking
 * overlay, which never freezes the IDE: the task itself runs in Background Tasks and only the view
 * that started it stops taking input, until the task ends, its stream goes away or the user moves
 * it to the background. Pure; [io.mateu.ijp.ui.blockable] paints it.
 */
class ViewBlock {
    private val blocking = LinkedHashMap<String, ProgressTask>()

    /** Moved to the background by the user: their later updates must not cover the view again. */
    private val released = HashSet<String>()

    @get:Synchronized val isBlocked: Boolean get() = blocking.isNotEmpty()

    @Synchronized fun task(taskId: String): ProgressTask? = blocking[taskId]

    /**
     * A task update. [fromStream] says whether a stream of this view carries it: a running task only
     * starts covering the view when one does (nothing else could end the block). Answers whether
     * what the view shows changed.
     */
    @Synchronized
    fun observe(task: ProgressTask, fromStream: Boolean = true): Boolean {
        if (task.state.terminal) {
            released.remove(task.taskId)
            return blocking.remove(task.taskId) != null
        }
        if (task.taskId in released) return false
        if (!task.presentation.blocksView) return blocking.remove(task.taskId) != null
        if (!fromStream && task.taskId !in blocking) return false
        return blocking.put(task.taskId, task) != task
    }

    /** The user's "Move to background": only a task that allows it. Answers whether it moved. */
    @Synchronized
    fun moveToBackground(taskId: String): Boolean {
        val task = blocking[taskId] ?: return false
        if (!task.presentation.movable) return false
        blocking.remove(taskId)
        released.add(taskId)
        return true
    }

    /** The stream that fed [taskIds] ended: whatever they still block is released. */
    @Synchronized
    fun release(taskIds: Collection<String>): Boolean {
        var changed = false
        for (id in taskIds) {
            released.remove(id)
            if (blocking.remove(id) != null) changed = true
        }
        return changed
    }

    /** What the overlay shows: the most recent blocking task, or null when the view is free. */
    @Synchronized
    fun overlay(locale: Locale = io.mateu.ijp.ui.MoneyValues.uiLocale()): ViewBlockOverlay? {
        val task = blocking.values.lastOrNull() ?: return null
        return ViewBlockOverlay(
            taskId = task.taskId,
            title = ProgressTasks.indicatorText(task),
            detail = ProgressTasks.indicatorText2(task, locale),
            fraction = task.fraction,
            cancellable = task.cancellable,
            movable = task.presentation.movable,
        )
    }
}
