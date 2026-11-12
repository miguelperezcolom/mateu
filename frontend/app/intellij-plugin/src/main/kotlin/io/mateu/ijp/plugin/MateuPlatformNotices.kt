package io.mateu.ijp.plugin

import com.intellij.notification.Notification
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.progress.PerformInBackgroundOption
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.openapi.wm.WindowManager
import com.intellij.openapi.wm.ex.StatusBarEx
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.InboxDiff
import io.mateu.ijp.state.InboxItem
import io.mateu.ijp.state.InboxPresenter
import io.mateu.ijp.state.InboxSync
import io.mateu.ijp.state.KeyedNotices
import io.mateu.ijp.state.MessageSpec
import io.mateu.ijp.state.NoticeAction
import io.mateu.ijp.state.NoticeTexts
import io.mateu.ijp.state.ProgressTask
import io.mateu.ijp.state.ProgressTasks
import io.mateu.ijp.state.TaskChannel
import io.mateu.ijp.state.TaskHost
import io.mateu.ijp.state.TaskState
import io.mateu.ijp.ui.MoneyValues
import io.mateu.ijp.ui.SafeHtml
import java.util.concurrent.ConcurrentHashMap

/**
 * Progress and notifications the IDE's way (design/progress-and-notifications.md): the server says
 * WHAT happens, the platform presents it.
 *
 * - A long-running task (`Progress`) is a PLATFORM background task — status bar and Background
 *   Tasks window, several at once, natively, each with the platform's Cancel (→ `_progress-cancel`)
 *   and NEVER a modal window: the IDE stays usable. A blocking one also covers the Mateu view that
 *   started it ([io.mateu.ijp.ui.blockable], [io.mateu.ijp.state.ViewBlock]), and the status bar's
 *   process popup opens so it is not missed. Its result is a notification with the task's result
 *   actions, and Retry when a failed task may run again.
 * - A message is a notification of the group its persistence names (toast / sticky / inbox), with
 *   its actions; a newer one with the same key expires the previous one.
 * - The inbox (`NotificationsSupplier`) lives in the Notifications tool window: entries fetched
 *   with the list go there quietly, entries pushed live also pop a balloon; read / resolved / gone
 *   ones are expired. An entry's actions run server-side, Open navigates (or asks for its detail),
 *   Dismiss removes it from the inbox. Clearing an entry in the tool window marks it READ (not
 *   dismissed: clearing the timeline must not delete the user's inbox on the server).
 */
object MateuPlatformNotices {

    fun install(project: Project, session: AppSession) {
        val keyed = KeyedNotices<Notification>()
        session.messagePresenter = { spec, run -> showMessage(project, spec, run, keyed) }
        session.tasks.host = PlatformTaskHost(project, session)
        // the IDE's status-bar progress while a request waits for its server (once per process)
        MateuServerProgress.install()
        // @App(osNotifications = true): SystemNotifications, which the platform itself gates on the
        // user's "Use system notifications" setting and on the IDE being in the background
        session.ideActive = { ApplicationManager.getApplication().isActive }
        session.osNotifier = { notice ->
            com.intellij.ui.SystemNotifications.getInstance().notify("Mateu", notice.title, notice.text)
        }
        session.inbox.presenter = PlatformInboxPresenter(project)
        session.openNotificationsView = {
            ToolWindowManager.getInstance(project).getToolWindow("Notifications")?.activate(null)
        }
    }

    internal fun typeOf(variant: String?): NotificationType = when (variant) {
        "error" -> NotificationType.ERROR
        "warning" -> NotificationType.WARNING
        else -> NotificationType.INFORMATION
    }

    private fun showMessage(
        project: Project,
        spec: MessageSpec,
        run: (NoticeAction) -> Unit,
        keyed: KeyedNotices<Notification>,
    ) {
        val notification = NotificationGroupManager.getInstance()
            .getNotificationGroup(MessageGroups.groupFor(spec.persistence))
            .createNotification(SafeHtml.escape(spec.title.ifBlank { "Mateu" }), SafeHtml.sanitize(spec.text), typeOf(spec.variant))
        addActions(notification, spec.actions, run)
        keyed.put(spec.key, notification)?.expire()
        notification.notify(project)
    }

    internal fun addActions(notification: Notification, actions: List<NoticeAction>, run: (NoticeAction) -> Unit) {
        val locale = MoneyValues.uiLocale()
        for (action in actions) {
            notification.addAction(NotificationAction.createSimpleExpiring(action.labelFor(locale)) { run(action) })
        }
    }
}

/** Runs each task as a platform task that follows its [TaskChannel]. */
private class PlatformTaskHost(private val project: Project, private val session: AppSession) : TaskHost {

    override fun start(first: ProgressTask, channel: TaskChannel, cancel: () -> Unit) {
        ApplicationManager.getApplication().invokeLater {
            val title = ProgressTasks.indicatorText(first).ifBlank { "Mateu" }
            // always in the background: a blocking task blocks its view, never the IDE
            val task = object : Task.Backgroundable(project, title, first.cancellable, PerformInBackgroundOption.ALWAYS_BACKGROUND) {
                override fun run(indicator: ProgressIndicator) = follow(indicator, first, channel, cancel)
            }
            ProgressManager.getInstance().run(task)
            if (first.presentation.blocksView) {
                (WindowManager.getInstance().getStatusBar(project) as? StatusBarEx)?.isProcessWindowOpen = true
            }
        }
    }

    private fun follow(indicator: ProgressIndicator, first: ProgressTask, channel: TaskChannel, cancel: () -> Unit) {
        val locale = MoneyValues.uiLocale()
        fun show(t: ProgressTask) {
            indicator.text = ProgressTasks.indicatorText(t)
            indicator.text2 = ProgressTasks.indicatorText2(t, locale)
            indicator.isIndeterminate = t.indeterminate
            t.fraction?.let { indicator.fraction = it }
        }
        show(first)
        var cancelAskedAt = 0L
        while (true) {
            if (indicator.isCanceled && cancelAskedAt == 0L) {
                cancelAskedAt = System.currentTimeMillis()
                cancel()
            }
            // the server answers a cancel at once; a stream that does not is not waited for forever
            if (cancelAskedAt != 0L && System.currentTimeMillis() - cancelAskedAt > CANCEL_WAIT_MILLIS) return
            val next = channel.next(POLL_MILLIS)
            if (next != null) {
                if (next.state.terminal) return
                show(next)
            } else if (channel.drained) {
                return
            }
        }
    }

    override fun finished(task: ProgressTask, runAction: (NoticeAction) -> Unit, retry: (() -> Unit)?) {
        // a background task that ended while the IDE is not in front: the OS too
        session.osNotice(io.mateu.ijp.state.OsNotices.Event.TaskFinished(task))
        ApplicationManager.getApplication().invokeLater {
            val locale = MoneyValues.uiLocale()
            val failed = task.state == TaskState.FAILED
            val notification = NotificationGroupManager.getInstance()
                .getNotificationGroup(MessageGroups.taskGroup(task))
                .createNotification(
                    SafeHtml.escape(task.title.ifBlank { "Mateu" }),
                    SafeHtml.escape(ProgressTasks.resultText(task, locale)),
                    if (failed) NotificationType.ERROR else NotificationType.INFORMATION,
                )
            MateuPlatformNotices.addActions(notification, task.resultActions, runAction)
            if (retry != null) {
                notification.addAction(NotificationAction.createSimpleExpiring(NoticeTexts.retry(locale)) { retry() })
            }
            notification.notify(project)
        }
    }

    companion object {
        const val POLL_MILLIS = 200L
        const val CANCEL_WAIT_MILLIS = 10_000L
    }
}

/** Posts inbox entries to the Notifications tool window and withdraws the settled ones. */
private class PlatformInboxPresenter(private val project: Project) : InboxPresenter {

    /** The notification shown for each entry id; expired by us (not the user) when it settles. */
    private val shown = ConcurrentHashMap<String, Notification>()
    private val expiringByUs = ConcurrentHashMap.newKeySet<Notification>()

    override fun present(diff: InboxDiff, live: Boolean, inbox: InboxSync) {
        diff.withdrawn.forEach { withdraw(it) }
        diff.shown.forEach { show(it, live, inbox) }
    }

    private fun withdraw(id: String) {
        shown.remove(id)?.let { expiringByUs.add(it); it.expire() }
    }

    private fun show(item: InboxItem, live: Boolean, inbox: InboxSync) {
        withdraw(item.id)
        val locale = MoneyValues.uiLocale()
        val title = listOfNotNull(item.category, item.title.ifBlank { null }).joinToString(" · ").ifBlank { "Mateu" }
        val content = listOfNotNull(item.text.ifBlank { null }, item.whenText).joinToString(" — ")
        val notification = NotificationGroupManager.getInstance()
            .getNotificationGroup(MessageGroups.inboxGroup(live))
            .createNotification(SafeHtml.escape(title), SafeHtml.escape(content), MateuPlatformNotices.typeOf(item.variant))
        if (item.hasDetail || item.route != null) {
            notification.addAction(
                NotificationAction.createSimpleExpiring(
                    if (item.hasDetail) NoticeTexts.details(locale) else NoticeTexts.open(locale),
                ) { inbox.open(item) },
            )
        }
        for (action in item.actions) {
            notification.addAction(NotificationAction.createSimpleExpiring(action.labelFor(locale)) { inbox.act(item, action) })
        }
        notification.addAction(NotificationAction.createSimpleExpiring(NoticeTexts.dismiss(locale)) { inbox.dismiss(listOf(item.id)) })
        // cleared by the user in the tool window (not by a settle of ours) → the entry was seen
        notification.whenExpired {
            if (!expiringByUs.remove(notification) && shown.remove(item.id, notification)) {
                inbox.model.get(item.id)?.takeIf { it.unread }?.let { inbox.markRead(listOf(it.id)) }
            }
        }
        shown[item.id] = notification
        notification.notify(project)
    }
}
