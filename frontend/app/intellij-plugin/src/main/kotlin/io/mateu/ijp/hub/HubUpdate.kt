package io.mateu.ijp.hub

import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.project.Project
import io.mateu.ijp.ui.SafeHtml
import io.mateu.ijp.update.MateuUpdater
import io.mateu.ijp.update.UpdateResult

/**
 * "Update Mateu" from the hub, when a UI needs (or would like) a newer desktop app ([AppCompat]): the
 * updater checks the release feed NOW. A newer plugin is staged and offered with "Restart", or a
 * reinstall is offered with its download — the updater's own notifications. Here: the two answers it
 * keeps quiet about, said plainly.
 */
object HubUpdate {

    fun run(project: Project?) {
        MateuUpdater.checkNow { result ->
            when (result) {
                is UpdateResult.UpToDate -> notify(
                    project,
                    "No update yet",
                    "There is no newer version of the Mateu desktop app yet. Try again once a newer release is out.",
                    NotificationType.INFORMATION,
                )
                is UpdateResult.Disabled -> notify(
                    project,
                    "Update the Mateu plugin",
                    "Updates of this IDE's Mateu plugin come from Settings | Plugins.",
                    NotificationType.INFORMATION,
                )
                else -> Unit // ReadyToRestart / ReinstallNeeded / Failed: MateuUpdater already told the person
            }
        }
    }

    /** A notification for a UI ahead of this app (or out of its reach), with "Update Mateu" when it can help. */
    fun notifyCompat(project: Project?, title: String, message: String, type: NotificationType, updatable: Boolean) {
        val n = NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification(SafeHtml.escape(title), SafeHtml.escape(message), type)
        if (updatable) n.addAction(NotificationAction.createSimpleExpiring("Update Mateu") { run(project) })
        n.notify(project)
    }

    private fun notify(project: Project?, title: String, message: String, type: NotificationType) {
        NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
            .createNotification(SafeHtml.escape(title), SafeHtml.escape(message), type)
            .notify(project)
    }
}
