import { safeSessionStorage } from '@infra/safeStorage.ts'

/**
 * The tasks this TAB's streams reported and that have not finished yet — so a reload can reattach
 * to them (design/progress-and-notifications.md "Reattach"). Session storage only: the task ids
 * are, for an anonymous caller, the capability to see the task, so they never outlive the tab nor
 * reach another one. Kept tiny and free of the transports so the boot path can read it eagerly.
 */
export const TASK_MEMORY_KEY = 'mateu-progress-tasks'

/** What a reload needs to find a task again. */
export interface RememberedTask {
    taskId: string
    baseUrl: string
    route?: string
    serverSideType?: string
}

/** How many tasks a tab remembers (the oldest are forgotten first). */
export const MAX_REMEMBERED = 50

export const rememberedTasks = (): RememberedTask[] => {
    const list = safeSessionStorage.getJson<unknown>(TASK_MEMORY_KEY, [])
    return Array.isArray(list)
        ? list.filter((t): t is RememberedTask => !!t && typeof (t as RememberedTask).taskId === 'string'
            && typeof (t as RememberedTask).baseUrl === 'string')
        : []
}

const save = (list: RememberedTask[]) => {
    if (list.length === 0) safeSessionStorage.remove(TASK_MEMORY_KEY)
    else safeSessionStorage.setJson(TASK_MEMORY_KEY, list.slice(-MAX_REMEMBERED))
}

export const rememberTask = (task: RememberedTask): void => {
    const list = rememberedTasks()
    if (list.some((t) => t.taskId === task.taskId)) return
    save([...list, {
        taskId: task.taskId,
        baseUrl: task.baseUrl,
        ...(task.route ? { route: task.route } : {}),
        ...(task.serverSideType ? { serverSideType: task.serverSideType } : {}),
    }])
}

export const forgetTask = (taskId: string): void => {
    const list = rememberedTasks()
    if (!list.some((t) => t.taskId === taskId)) return
    save(list.filter((t) => t.taskId !== taskId))
}
