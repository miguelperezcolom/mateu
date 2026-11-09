import type UICommand from '@mateu/shared/apiClients/dtos/UICommand.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement.ts'
import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { sseService } from '@application/SSEService.ts'
import { applyGlobalCommand, PROGRESS_COMMAND } from '@infra/progress/globalCommands.ts'
import { isFinished, taskStore, type TaskOrigin } from '@infra/progress/taskStore.ts'
import { forgetTask, rememberedTasks, type RememberedTask } from '@infra/progress/taskMemory.ts'

/**
 * Reattach after a reload (design/progress-and-notifications.md "Reattach"): the tasks this tab's
 * streams reported are still running on the server for a grace period, so on boot the page asks
 * for them again —
 *
 * 1. `_progress-tasks {taskIds}` per base url: the server answers a `Progress` for each id that is
 *    a task OF THIS CALLER still running or just finished; anything else is absent and forgotten;
 * 2. each answer goes into the task center (as if its stream had just reported it);
 * 3. each RUNNING one gets a `_progress-resume {taskId}` stream: its progress, messages and inbox
 *    changes from here to its end.
 *
 * A reattached task has no screen behind it: no initiator, no Retry; a result action with a route
 * still navigates (runResultAction).
 */
export const TASKS_ACTION = '_progress-tasks'
export const RESUME_ACTION = '_progress-resume'
/** Any route reaches the reserved actions; this is the one the client uses for "no screen". */
const NO_ROUTE = '_no_route'
const INITIATOR_ID = 'mateu-task-center'

export interface ReattachDeps {
    /** the sync call (`_progress-tasks`) */
    list: (baseUrl: string, serverSideType: string | undefined, taskIds: string[]) => Promise<UIIncrement | undefined>
    /** opens a `_progress-resume` stream */
    resume: (task: RememberedTask) => void
}

const defaultDeps: ReattachDeps = {
    list: (baseUrl, serverSideType, taskIds) => mateuApiClient.runAction(
        baseUrl, NO_ROUTE, '', TASKS_ACTION, INITIATOR_ID, undefined, serverSideType ?? '', {},
        { taskIds }, document.body, true),
    resume: (task) => {
        void sseService.runAction(mateuApiClient, task.baseUrl, NO_ROUTE, '', RESUME_ACTION, INITIATOR_ID,
            {}, task.serverSideType ?? '', {}, { taskId: task.taskId }, document.body, true, undefined,
            false, '', { resumesTasks: [task.taskId] })
    },
}

let started = false

/** Groups the remembered tasks by the backend that runs them. */
export const byBaseUrl = (tasks: RememberedTask[]): Map<string, RememberedTask[]> => {
    const groups = new Map<string, RememberedTask[]>()
    for (const task of tasks) {
        const group = groups.get(task.baseUrl) ?? []
        group.push(task)
        groups.set(task.baseUrl, group)
    }
    return groups
}

/** Once per page: asks for the remembered tasks and resumes the running ones. */
export const reattachTasks = async (deps: ReattachDeps = defaultDeps): Promise<void> => {
    if (started) return
    started = true
    const groups = byBaseUrl(rememberedTasks())
    await Promise.all([...groups.entries()].map(async ([baseUrl, tasks]) => {
        let increment: UIIncrement | undefined
        try {
            increment = await deps.list(baseUrl, tasks[0]?.serverSideType, tasks.map((t) => t.taskId))
        } catch {
            // the backend is not reachable now: keep them, the next load tries again
            return
        }
        const answered = new Map<string, Progress>()
        for (const command of (increment?.commands ?? []) as UICommand[]) {
            const progress = command?.type === PROGRESS_COMMAND ? command.data as Progress | undefined : undefined
            if (progress?.taskId && tasks.some((t) => t.taskId === progress.taskId)) answered.set(progress.taskId, progress)
        }
        for (const task of tasks) {
            const progress = answered.get(task.taskId)
            if (!progress) {
                // unknown, expired or not ours: indistinguishable, and nothing to reattach to
                forgetTask(task.taskId)
                continue
            }
            // no initiator and no retry: the screen that started it is gone
            const origin: TaskOrigin = { baseUrl: task.baseUrl, route: task.route, serverSideType: task.serverSideType }
            applyGlobalCommand({ type: PROGRESS_COMMAND, data: progress } as UICommand, origin)
            if (!isFinished(progress)) deps.resume(task)
        }
    }))
}

/** How long a broken stream waits before each attempt to find its tasks again (the blip's length). */
export const RECOVERY_WAITS_MS = [1_000, 3_000, 8_000]

/**
 * A stream broke (or ended early) under tasks that were still running: the server keeps them alive
 * for its grace period, so before showing them as failed — with a Retry that would start the work a
 * second time — ask for them and follow the ones still running, as a reload does. The entries keep
 * their origin (Cancel, Retry). If the backend cannot be reached in time, they end failed.
 */
export const recoverBrokenTasks = async (baseUrl: string, serverSideType: string | undefined, taskIds: string[],
                                         error?: string, deps: ReattachDeps = defaultDeps,
                                         waits: number[] = RECOVERY_WAITS_MS): Promise<void> => {
    for (const wait of waits) {
        await new Promise((resolve) => setTimeout(resolve, wait))
        let increment: UIIncrement | undefined
        try {
            increment = await deps.list(baseUrl, serverSideType, taskIds)
        } catch {
            continue // still cut off: the next attempt
        }
        const answered = new Map<string, Progress>()
        for (const command of (increment?.commands ?? []) as UICommand[]) {
            const progress = command?.type === PROGRESS_COMMAND ? command.data as Progress | undefined : undefined
            if (progress?.taskId) answered.set(progress.taskId, progress)
        }
        for (const taskId of taskIds) {
            const progress = answered.get(taskId)
            if (!progress) {
                // the server no longer knows it: nothing to follow
                taskStore.failUnfinished([taskId], error)
                forgetTask(taskId)
                continue
            }
            applyGlobalCommand({ type: PROGRESS_COMMAND, data: progress } as UICommand, { baseUrl, serverSideType })
            if (!isFinished(progress)) deps.resume({ taskId, baseUrl, serverSideType })
        }
        return
    }
    taskStore.failUnfinished(taskIds, error)
}

/** test hook */
export const resetReattach = (): void => { started = false }
