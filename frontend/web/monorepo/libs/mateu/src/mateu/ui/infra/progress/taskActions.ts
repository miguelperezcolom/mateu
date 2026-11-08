import type { MessageAction } from '@mateu/shared/apiClients/dtos/Progress.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { notify } from '@application/Notifier.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { runMessageAction } from '@infra/notify/messageToast.ts'
import { navigateToRoute } from '@infra/ui/rowRoute.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { taskStore } from '@infra/progress/taskStore.ts'
import { applyGlobalCommand } from '@infra/progress/globalCommands.ts'
import { taskCenterElement } from '@infra/progress/taskCenterMount.ts'

/** The reserved action that cancels a running task (`_progress-cancel {taskId}`). */
export const CANCEL_ACTION = '_progress-cancel'

/**
 * Asks the server to cancel a task, through the same rail as the action that started it (its base
 * url, route and server-side type): the answer is the task, cancelled — and the task's own stream
 * ends with the same.
 */
export const cancelTask = async (taskId: string): Promise<void> => {
    const entry = taskStore.find(taskId)
    if (!entry) return
    const origin = entry.origin ?? {}
    try {
        const increment = await mateuApiClient.runAction(
            origin.baseUrl ?? '',
            origin.route || '_no_route',
            '',
            CANCEL_ACTION,
            'mateu-task-center',
            undefined,
            origin.serverSideType ?? '',
            {},
            { taskId },
            origin.initiator ?? document.body,
            true,
        )
        for (const command of increment?.commands ?? []) applyGlobalCommand(command, origin)
    } catch {
        notify({ text: chromeText('taskCancelFailed'), variant: 'error' }, document.body)
    }
}

/** Runs the action that started a failed task again (it starts a new task). */
export const retryTask = (taskId: string): void => {
    const entry = taskStore.find(taskId)
    if (!entry?.origin?.retry) return
    taskStore.dismiss(taskId)
    entry.origin.retry()
}

/**
 * A finished task's result action: on the component that started the task when it is still on
 * screen; a route opens from wherever the user is now.
 */
export const runResultAction = (taskId: string, action: MessageAction): void => {
    const initiator = taskStore.find(taskId)?.origin?.initiator
    if (initiator?.isConnected) {
        runMessageAction(action, initiator)
        return
    }
    if (action.route) {
        const from = taskCenterElement()
        if (from && dirtyGuard.confirmLeave()) navigateToRoute(from, action.route)
        return
    }
    console.debug?.('mateu: the screen that started the task is gone; its action cannot run there', action.actionId)
}
