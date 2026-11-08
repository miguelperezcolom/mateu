import type UICommand from '@mateu/shared/apiClients/dtos/UICommand.ts'
import type { NotificationsChanged, Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'
import { isFinished, taskStore, type TaskOrigin } from '@infra/progress/taskStore.ts'
import { forgetTask, rememberTask } from '@infra/progress/taskMemory.ts'
import { inboxStore } from '@infra/notify/inboxStore.ts'
import { ensureTaskCenter } from '@infra/progress/taskCenterMount.ts'

/**
 * The commands that belong to the PAGE, not to a component: a task's progress (the task center
 * shows it wherever the user is — tasks outlive the screen that started them) and a change of the
 * notification inbox (the bell). Every transport hands its commands here first; what is not
 * claimed goes to the components as before.
 */
export const PROGRESS_COMMAND = 'Progress'
export const NOTIFICATIONS_CHANGED_COMMAND = 'NotificationsChanged'

export const isGlobalCommand = (command: UICommand | undefined): boolean =>
    command?.type === PROGRESS_COMMAND || command?.type === NOTIFICATIONS_CHANGED_COMMAND

/** Applies a page-level command; true when it was one (the caller then skips it). */
export const applyGlobalCommand = (command: UICommand | undefined, origin?: TaskOrigin): boolean => {
    if (command?.type === PROGRESS_COMMAND) {
        const progress = command.data as Progress | undefined
        if (progress?.taskId) {
            ensureTaskCenter()
            taskStore.upsert(progress, origin)
            // a task a STREAM reports is remembered for the tab's session, so a reload reattaches
            // to it; once its end has been applied there is nothing left to reattach to
            if (isFinished(progress)) {
                forgetTask(progress.taskId)
            } else if (typeof origin?.baseUrl === 'string') {
                rememberTask({ taskId: progress.taskId, baseUrl: origin.baseUrl, route: origin.route,
                    serverSideType: origin.serverSideType })
            }
        }
        return true
    }
    if (command?.type === NOTIFICATIONS_CHANGED_COMMAND) {
        inboxStore.applyChange((command.data ?? {}) as NotificationsChanged)
        return true
    }
    return false
}

/** The task ids an increment reports progress for. */
export const taskIdsOf = (increment: { commands?: UICommand[] } | undefined): string[] =>
    (increment?.commands ?? [])
        .filter((c) => c?.type === PROGRESS_COMMAND)
        .map((c) => (c.data as Progress | undefined)?.taskId)
        .filter((id): id is string => !!id)

/**
 * A command sent with no target (a task's done commands: navigate, dispatch an event…) is for
 * the component that ran the action: it is addressed to it, as the server used to do by aiming
 * them at the progress dialog.
 */
export const addressed = (command: UICommand, initiator: HTMLElement | undefined): UICommand =>
    command.targetComponentId || !initiator?.id ? command : { ...command, targetComponentId: initiator.id }
