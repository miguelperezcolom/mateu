/**
 * Mounts the page's one `mateu-task-center` (the progress pattern's surface) the first time a task
 * reports. Inside the top app shell when there is one — its navigation events (a result action
 * that opens a route) must bubble up to mateu-ui through the shell, like the command center's —
 * else on the body.
 *
 * The element itself is loaded lazily (dynamic import): a page that never runs a task never pays
 * for it, and this module stays free of Lit so the transports can import it.
 */
let host: ParentNode | null = null
let element: HTMLElement | null = null

/** The top shell's render root (set by the shell's updated(), see appExtrasMount.ts). */
export const setTaskCenterHost = (root: ParentNode | null): void => {
    host = root
    // a task center mounted on the body before the shell existed moves into the shell
    if (element && root && element.parentNode !== root && (root as Node).isConnected) {
        root.appendChild(element)
    }
}

/** The element the task center navigates from (its own, in the shell's tree). */
export const taskCenterElement = (): HTMLElement | null => element

let loading: Promise<unknown> | null = null

export const ensureTaskCenter = (): void => {
    if (typeof document === 'undefined') return
    if (element?.isConnected) return
    if (!loading) loading = import('@infra/progress/mateu-task-center.ts').catch(() => undefined)
    element = document.createElement('mateu-task-center')
    const parent = host && (host as Node).isConnected ? host : document.body
    parent.appendChild(element)
}

/** test hook */
export const resetTaskCenterMount = (): void => {
    element?.remove()
    element = null
    host = null
}
