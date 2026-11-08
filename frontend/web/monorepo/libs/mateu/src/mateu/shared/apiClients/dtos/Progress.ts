/**
 * The wire shapes of the progress and notification patterns (design/progress-and-notifications.md):
 * the data of a `Progress` command, the actions a message / a finished task / an inbox entry offer,
 * an inbox entry and the data of a `NotificationsChanged` command.
 */

/** An action offered by a message, a finished task or an inbox entry. */
export interface MessageAction {
    label?: string | null
    actionId?: string | null
    parameters?: Record<string, unknown> | null
    /** navigates instead of running an action */
    route?: string | null
    /** primary | secondary | danger | undo (an unlabelled undo is the client's own "Undo") */
    style?: string | null
}

export type ProgressState = 'running' | 'done' | 'failed' | 'cancelled'

/** The whole current state of one task (the data of a `Progress` command). */
export interface Progress {
    taskId: string
    title?: string | null
    text?: string | null
    /** 0..1, or null = indeterminate */
    fraction?: number | null
    done?: number | null
    total?: number | null
    state?: ProgressState | null
    blocking?: boolean
    backgroundable?: boolean
    cancellable?: boolean
    retryable?: boolean
    /** server epoch millis */
    startedAt?: number | null
    closeAfterSeconds?: number | null
    error?: string | null
    resultActions?: MessageAction[] | null
    /** the server's estimate of the seconds left (running + determinate only; null = none) */
    etaSeconds?: number | null
}

/** One inbox entry. */
export interface AppNotification {
    id: string
    title: string
    text?: string | null
    route?: string | null
    unread: boolean
    when?: string | null
    category?: string | null
    variant?: string | null
    resolved?: boolean
    actions?: MessageAction[] | null
    hasDetail?: boolean
}

/** The data of a `NotificationsChanged` command: added/changed, removed, or (neither) refetch. */
export interface NotificationsChanged {
    notification?: AppNotification | null
    removedId?: string | null
}
