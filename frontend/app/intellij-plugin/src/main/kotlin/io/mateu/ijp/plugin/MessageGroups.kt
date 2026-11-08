package io.mateu.ijp.plugin

import io.mateu.ijp.state.Persistence
import io.mateu.ijp.state.ProgressTask
import io.mateu.ijp.state.TaskState

/**
 * The notification groups Mateu posts to (all declared in plugin.xml), chosen by what a notice
 * MEANS rather than how it looks:
 *
 * - a toast message → [MESSAGES]: a balloon that fades and is not kept in the tool window;
 * - a sticky message (an error, unless it says otherwise) → [STICKY]: stays until dismissed;
 * - an inbox message, or an inbox entry pushed live → [INBOX_NEW]: a balloon, kept in the
 *   Notifications tool window;
 * - an inbox entry from the fetched list → [INBOX]: the tool window only, no balloon (opening the
 *   app must not pop every unread entry);
 * - a finished task → [TASKS] (a failed one → [STICKY]).
 *
 * [DEFAULT] / [ERRORS] stay for the plugin's own notices (sign-in, updates, version skew).
 */
object MessageGroups {
    const val DEFAULT = "Mateu"
    const val ERRORS = "Mateu errors"
    const val MESSAGES = "Mateu messages"
    const val STICKY = "Mateu sticky"
    const val INBOX = "Mateu inbox"
    const val INBOX_NEW = "Mateu inbox (new)"
    const val TASKS = "Mateu tasks"

    /** The group of a message that carries only a severity (the plugin's own messages). */
    fun groupFor(variant: String?): String = if (variant == "error") ERRORS else DEFAULT

    fun groupFor(persistence: Persistence): String = when (persistence) {
        Persistence.TOAST -> MESSAGES
        Persistence.STICKY -> STICKY
        Persistence.INBOX -> INBOX_NEW
    }

    fun inboxGroup(live: Boolean): String = if (live) INBOX_NEW else INBOX

    fun taskGroup(task: ProgressTask): String = if (task.state == TaskState.FAILED) STICKY else TASKS
}
